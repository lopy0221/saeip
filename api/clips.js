const SOOP_ID = "likey0u";

module.exports = async function handler(req, res) {
  try {
    const url =
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip/all` +
      `?page=1&per_page=60&orderby=reg_date`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SOOP API 오류: ${response.status}`);
    }

    const data = await response.json();

    const catchUrl =
  `https://api-channel.sooplive.com/v1.3/channel/${SOOP_ID}/vod/catch` +
  `?startDate=&endDate=&keyword=&orderBy=reg_date&page=1&perPage=40` +
  `&field=title,contents,user_nick,user_id`;

const catchResponse = await fetch(catchUrl);

if (!catchResponse.ok) {
  throw new Error(
    `SOOP Catch API 오류: ${catchResponse.status}`
  );
}

const catchData = await catchResponse.json();

    const replayUrl =
  `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
  `?page=1&per_page=60&orderby=reg_date`;

const replayResponse = await fetch(replayUrl);

if (!replayResponse.ok) {
  throw new Error(
    `SOOP 다시보기 API 오류: ${replayResponse.status}`
  );
}

const replayData = await replayResponse.json();

    return res.status(200).json({
  success: true,
  streamer: SOOP_ID,

  replays: replayData.data || [],

  clips: data.data || [],

  catches: catchData.contents || []
});

  } catch (error) {
    console.error("SOOP 클립 불러오기 오류:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
