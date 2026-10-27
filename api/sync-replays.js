const SUPABASE_URL = "https://txwlwxldagplfhlgopyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_L0rNucD4rLdHlte3wwWipg_sdl5j5WE";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

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

console.log("SOOP FIRST VOD:", soopData.data?.[0]);

const replays = await Promise.all(
  (soopData.data || []).map(async (vod) => {
    let broadStart = null;

    try {
      const detailResponse = await fetch(
        "https://api.m.sooplive.com/station/video/a/view",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": `https://vod.sooplive.com/player/${vod.title_no}`
          },
          body:
            `nTitleNo=${vod.title_no}` +
            `&nApiLevel=11` +
            `&nPlaylistIdx=0`
        }
      );

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();

        broadStart =
          detailData?.data?.broad_start || null;
      }
    } catch (error) {
      console.error(
        `VOD ${vod.title_no} 상세정보 오류:`,
        error
      );
    }

    return {
      id: vod.title_no,
      title: vod.title_name || "",
      url: `https://vod.sooplive.com/player/${vod.title_no}/`,
      reg_date: vod.reg_date || null,
      broad_start: broadStart
    };
  })
);

console.log(
  "SOOP BROAD START TEST:",
  replays.map((replay) => ({
    id: replay.id,
    title: replay.title,
    reg_date: replay.reg_date,
    broad_start: replay.broad_start
  }))
);

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

// 3. 실제 방송 시작 시간으로 일정별 다시보기 후보 만들기

function getBroadcastType(broadStart) {
  if (!broadStart) return null;

  const timePart = String(broadStart).split(" ")[1];

  if (!timePart) return null;

  const hour = Number(timePart.split(":")[0]);

  if (hour >= 0 && hour < 6) {
    return "dawn";
  }

  if (hour >= 6 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  return "evening";
}

const matches = schedules.map((schedule) => {
  // 휴방 / 기념일 / 합방은 자동 다시보기 매칭에서 제외
  if (
    schedule.type === "off" ||
    schedule.type === "etc" ||
    schedule.type === "collab"
  ) {
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
      if (!replay.broad_start || !schedule.date) {
        return false;
      }

      const replayDate =
        replay.broad_start.slice(0, 10);

      if (replayDate !== schedule.date) {
        return false;
      }

      const replayType =
        getBroadcastType(replay.broad_start);

      // 방송 예정은 같은 날짜의 방송을 우선 후보로 허용
      if (schedule.type === "planned") {
        return true;
      }

      // 이미 시간대가 정해진 기존 일정은
      // 실제 방송 시작 시간대와 같은 경우에만 연결
      return replayType === schedule.type;
    })
    .map((replay) => ({
      replay_id: replay.id,
      replay_title: replay.title,
      replay_url: replay.url,
      reg_date: replay.reg_date,
      broad_start: replay.broad_start,
      broadcast_type:
        getBroadcastType(replay.broad_start)
    }));

  return {
    schedule_id: schedule.id,
    date: schedule.date,
    time: schedule.time,
    title: schedule.title,
    type: schedule.type,
    candidates
  };
});
    // 같은 다시보기가 여러 방송 예정 일정에 잡힌 경우
// 등록된 일정 시간과 가장 가까운 일정 하나만 선택
const plannedReplayOwners = new Map();

for (const match of matches) {
  if (match.type !== "planned") continue;

  for (const candidate of match.candidates) {
    if (!candidate.broad_start || !match.time) continue;

    const replayTime =
      candidate.broad_start.split(" ")[1]?.slice(0, 5);

    if (!replayTime) continue;

    const [scheduleHour, scheduleMinute] =
      String(match.time).slice(0, 5).split(":").map(Number);

    const [replayHour, replayMinute] =
      replayTime.split(":").map(Number);

    const scheduleMinutes =
      scheduleHour * 60 + scheduleMinute;

    const replayMinutes =
      replayHour * 60 + replayMinute;

    const difference =
      Math.abs(scheduleMinutes - replayMinutes);

    // 예정 시간에서 3시간 이상 차이나는 방송은
// 자동 연결하지 않음
if (difference > 180) {
  continue;
}

    const current =
      plannedReplayOwners.get(candidate.replay_url);

    if (!current || difference < current.difference) {
      plannedReplayOwners.set(
        candidate.replay_url,
        {
          schedule_id: match.schedule_id,
          difference
        }
      );
    }
  }
}

for (const match of matches) {
  if (match.type !== "planned") continue;

  match.candidates =
    match.candidates.filter(candidate => {
      const owner =
        plannedReplayOwners.get(candidate.replay_url);

      return (
        owner &&
        owner.schedule_id === match.schedule_id
      );
    });
}

    // 방송 예정 일정에 다시보기가 연결되면
// 실제 방송 시작 시간에 맞춰 일정 종류 자동 변경
for (const match of matches) {
  if (
    match.type !== "planned" ||
    match.candidates.length === 0
  ) {
    continue;
  }

  // 연결된 다시보기 중 가장 처음 시작한 방송 기준
  const firstCandidate =
    [...match.candidates].sort((a, b) =>
      String(a.broad_start).localeCompare(
        String(b.broad_start)
      )
    )[0];

  const actualType =
    firstCandidate.broadcast_type;

  if (!actualType) continue;

  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/stream_schedule?id=eq.${match.schedule_id}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: actualType
      })
    }
  );

  if (!updateResponse.ok) {
    const updateError =
      await updateResponse.text();

    throw new Error(
      `일정 종류 변경 실패: ${updateResponse.status} ${updateError}`
    );
  }

  // 응답 확인용 matches에도 변경된 종류 반영
  match.type = actualType;
}
    
    const autoReplays = [];

for (const match of matches) {
  for (const candidate of match.candidates) {
    autoReplays.push({
      schedule_id: match.schedule_id,
      replay_url: candidate.replay_url,
      replay_title: candidate.replay_title,
      started_at: candidate.broad_start
  ? candidate.broad_start.replace(" ", "T") + "+09:00"
  : null,
      part_number: 1,
      source: "auto"
    });
  }
}

if (autoReplays.length > 0) {
  const saveResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/schedule_replays?on_conflict=schedule_id,replay_url`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates"
      },
      body: JSON.stringify(autoReplays)
    }
  );

  if (!saveResponse.ok) {
    const saveError = await saveResponse.text();
    throw new Error(
      `다시보기 저장 실패: ${saveResponse.status} ${saveError}`
    );
  }
}
    
    // 5. 자동 저장 결과 반환
    return res.status(200).json({
  success: true,
  mode: "auto-save",
  saved_count: autoReplays.length,
  secret_key_loaded: Boolean(SUPABASE_SECRET_KEY),
  streamer: SOOP_ID,
  schedule_count: schedules.length,
  replay_count: replays.length,

  // 확인용: SOOP에서 가져온 다시보기 전체 정보
  replay_debug: replays.map(replay => ({
    id: replay.id,
    title: replay.title,
    reg_date: replay.reg_date,
    broad_start: replay.broad_start,
    broadcast_type: getBroadcastType(replay.broad_start)
  })),

  matches
});

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
