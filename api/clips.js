const SOOP_ID = "likey0u";
const ITEMS_PER_PAGE = 60;

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `SOOP API 오류: ${response.status}`
    );
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  try {
    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const type =
      req.query.type || "all";

    let replays = [];
    let clips = [];
    let catches = [];

    // =========================
    // 다시보기
    // =========================
    if (
      type === "all" ||
      type === "replay"
    ) {
      const replayData = await fetchJson(
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
        `?page=${page}` +
        `&per_page=${ITEMS_PER_PAGE}` +
        `&orderby=reg_date`
      );

      replays =
        Array.isArray(replayData.data)
          ? replayData.data
          : [];
    }

    // =========================
    // 클립
    // =========================
    if (
      type === "all" ||
      type === "clip"
    ) {
      const clipData = await fetchJson(
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip/all` +
        `?page=${page}` +
        `&per_page=${ITEMS_PER_PAGE}` +
        `&orderby=reg_date`
      );

      clips =
        Array.isArray(clipData.data)
          ? clipData.data
          : [];
    }

    // =========================
    // CATCH
    // =========================
    if (
      type === "all" ||
      type === "catch"
    ) {
      const catchData = await fetchJson(
        `https://api-channel.sooplive.com/v1.3/channel/${SOOP_ID}/vod/catch` +
        `?startDate=` +
        `&endDate=` +
        `&keyword=` +
        `&orderBy=reg_date` +
        `&page=${page}` +
        `&perPage=${ITEMS_PER_PAGE}` +
        `&field=title,contents,user_nick,user_id`
      );

      catches =
        Array.isArray(catchData.contents)
          ? catchData.contents
          : [];
    }

    // =========================
    // 타입 표시
    // =========================

    replays = replays.map(item => ({
      ...item,
      vod_type: "replay"
    }));

    clips = clips.map(item => ({
      ...item,
      vod_type: "clip"
    }));

    catches = catches.map(item => ({
      ...item,
      vod_type: "catch"
    }));

    // =========================
    // 전체일 경우 합치기
    // =========================

    let items = [
      ...replays,
      ...clips,
      ...catches
    ];

    // 최신순
    items.sort((a, b) => {
      const dateA =
        a.reg_date ||
        a.regDate ||
        "";

      const dateB =
        b.reg_date ||
        b.regDate ||
        "";

      return (
        new Date(dateB) -
        new Date(dateA)
      );
    });

    /*
      type이 하나만 선택되어 있으면 최대 60개.
      all이면 각 종류에서 최대 60개씩 들어올 수 있음.

      all의 정확한 전역 페이지네이션은
      별도의 데이터 저장소가 있어야 가장 안정적임.
    */

    res.setHeader(
      "Cache-Control",
      "s-maxage=120, stale-while-revalidate=300"
    );

    return res.status(200).json({
      success: true,

      streamer: SOOP_ID,

      page,
      type,

      items,

      counts: {
        replay: replays.length,
        clip: clips.length,
        catch: catches.length,
        loaded: items.length
      },

      hasMore: {
        replay:
          replays.length === ITEMS_PER_PAGE,

        clip:
          clips.length === ITEMS_PER_PAGE,

        catch:
          catches.length === ITEMS_PER_PAGE
      }
    });

  } catch (error) {
    console.error(
      "SOOP VOD 불러오기 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
