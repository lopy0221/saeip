const SOOP_ID = "likey0u";

module.exports = async function handler(req, res) {
  try {
    const url =
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip` +
      `?page=1&per_page=60&orderby=reg_date`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SOOP API 오류: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      streamer: SOOP_ID,
      clips: data.data || []
    });

  } catch (error) {
    console.error("SOOP 클립 불러오기 오류:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
