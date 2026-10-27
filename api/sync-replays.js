export default async function handler(req, res) {
  try {
    const SOOP_ID = "likey0u";

    const url =
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
      `?page=1&per_page=10&orderby=reg_date`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SOOP 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    const replays = (data.data || []).map((vod) => ({
  id: vod.title_no,
  title: vod.title_name,
  url: `https://vod.sooplive.com/player/${vod.title_no}/`,

  reg_date: vod.reg_date,
  start_date: vod.start_date,
  start_time: vod.start_time,
  duration: vod.duration,

  raw: vod
}));
    return res.status(200).json({
      success: true,
      streamer: SOOP_ID,
      count: replays.length,
      replays
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
