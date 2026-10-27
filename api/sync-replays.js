const SUPABASE_URL = "https://txwlwxldagplfhlgopyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_L0rNucD4rLdHlte3wwWipg_sdl5j5WE";

export default async function handler(req, res) {
  try {
    const SOOP_ID = "likey0u";

    // 1. SOOP 다시보기 가져오기
    const soopUrl =
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
      `?page=1&per_page=20&orderby=reg_date`;

    const soopResponse = await fetch(soopUrl);

    if (!soopResponse.ok) {
      throw new Error(`SOOP 요청 실패: ${soopResponse.status}`);
    }

    const soopData = await soopResponse.json();

    const replays = (soopData.data || []).map((vod) => ({
      id: vod.title_no,
      title: vod.title_name || "",
      url: `https://vod.sooplive.com/player/${vod.title_no}/`,
      reg_date: vod.reg_date || null
    }));

    // 2. Supabase 방송 일정 가져오기
    const scheduleResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/stream_schedule?select=*&order=date.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!scheduleResponse.ok) {
      throw new Error(
        `일정 불러오기 실패: ${scheduleResponse.status}`
      );
    }

    const schedules = await scheduleResponse.json();

    // 날짜를 YYYY-MM-DD 형태로 변환
    function getReplayDate(regDate) {
      if (!regDate) return null;

      return String(regDate).slice(0, 10);
    }

    // 제목 비교용 정리
    function normalizeTitle(text) {
      return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|~`♡♥ㅋㅎㅠㅜㅁ^]/g, "");
    }

    // 제목 유사도 계산
    function getTitleScore(scheduleTitle, replayTitle) {
      const schedule = normalizeTitle(scheduleTitle);
      const replay = normalizeTitle(replayTitle);

      if (!schedule || !replay) {
        return 0;
      }

      // 한쪽 제목에 다른 제목이 그대로 포함되어 있으면 강한 후보
      if (replay.includes(schedule) || schedule.includes(replay)) {
        return 100;
      }

      // 공통 글자 비율
      const scheduleChars = [...new Set(schedule)];
      const replayChars = new Set(replay);

      const commonCount = scheduleChars.filter((char) =>
        replayChars.has(char)
      ).length;

      return Math.round(
        (commonCount / scheduleChars.length) * 100
      );
    }

    // 3. 일정별 다시보기 후보 만들기
    const matches = schedules.map((schedule) => {
      // 휴방은 다시보기 매칭 대상에서 제외
      if (schedule.type === "off") {
        return {
          schedule_id: schedule.id,
          date: schedule.date,
          time: schedule.time,
          title: schedule.title,
          type: schedule.type,
          candidates: []
        };
      }

      const candidates = replays
        .filter((replay) => {
          // 우선 같은 날짜의 VOD만 후보로 사용
          return getReplayDate(replay.reg_date) === schedule.date;
        })
        .map((replay) => ({
  replay_id: replay.id,
  replay_title: replay.title,
  replay_url: replay.url,
  reg_date: replay.reg_date,
  title_score: getTitleScore(
    schedule.title,
    replay.title
  )
}))
.filter((replay) => {
  if (replay.title_score < 40) {
    return false;
  }

  const scheduleWords = String(schedule.title || "")
    .toLowerCase()
    .split(/[\s&/+]+/)
    .map((word) => normalizeTitle(word))
    .filter((word) => word.length >= 2);

  const replayTitle = normalizeTitle(replay.replay_title);

  return scheduleWords.some((word) =>
    replayTitle.includes(word)
  );
})
.sort((a, b) => b.title_score - a.title_score);
      return {
        schedule_id: schedule.id,
        date: schedule.date,
        time: schedule.time,
        title: schedule.title,
        type: schedule.type,
        candidates
      };
    });

    // 4. 미리보기 결과만 반환
    return res.status(200).json({
      success: true,
      mode: "preview",
      streamer: SOOP_ID,
      schedule_count: schedules.length,
      replay_count: replays.length,
      matches
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
