const SOOP_ID = "likey0u";

const REPLAY_PER_PAGE = 60;
const CLIP_PER_PAGE = 60;
const CATCH_PER_PAGE = 40;

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

    /*
      같은 페이지의 다시보기 / 클립 / CATCH를
      동시에 가져온다.
    */
    const [
      replayData,
      clipData,
      catchData
    ] = await Promise.all([

      fetchJson(
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
        `?page=${page}` +
        `&per_page=${REPLAY_PER_PAGE}` +
        `&orderby=reg_date`
      ),

      fetchJson(
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip/all` +
        `?page=${page}` +
        `&per_page=${CLIP_PER_PAGE}` +
        `&orderby=reg_date`
      ),

      fetchJson(
        `https://api-channel.sooplive.com/v1.3/channel/${SOOP_ID}/vod/catch` +
        `?startDate=` +
        `&endDate=` +
        `&keyword=` +
        `&orderBy=reg_date` +
        `&page=${page}` +
        `&perPage=${CATCH_PER_PAGE}` +
        `&field=title,contents,user_nick,user_id`
      )

    ]);

    const replays =
      Array.isArray(replayData.data)
        ? replayData.data
        : [];

    const clips =
      Array.isArray(clipData.data)
        ? clipData.data
        : [];

    const catches =
      Array.isArray(catchData.contents)
        ? catchData.contents
        : [];

    /*
      짧게 캐시해서 같은 페이지를 다시 열 때
      SOOP API를 매번 호출하지 않도록 한다.
    */
    res.setHeader(
      "Cache-Control",
      "s-maxage=120, stale-while-revalidate=300"
    );

    return res.status(200).json({
      success: true,
      streamer: SOOP_ID,
      page,

      replays,
      clips,
      catches,

      counts: {
        replays: replays.length,
        clips: clips.length,
        catches: catches.length
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
