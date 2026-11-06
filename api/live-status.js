
const SOOP_ID = "likey0u";

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "GET 요청만 허용됩니다."
    });
  }

  try {
    const response = await fetch(
      `https://chapi.sooplive.com/api/${SOOP_ID}/station`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0"
        },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      throw new Error(
        `SOOP 응답 오류: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data || !data.station) {
      throw new Error("방송국 정보를 확인할 수 없습니다.");
    }

    const isLive = Boolean(data.broad);

    res.setHeader(
      "Cache-Control",
      "s-maxage=15, stale-while-revalidate=15"
    );

    return res.status(200).json({
      success: true,
      isLive,
      url: isLive
        ? `https://play.sooplive.com/${SOOP_ID}`
        : null
    });

  } catch (error) {
    console.error("SOOP LIVE 상태 확인 오류:", error);

    return res.status(502).json({
      success: false,
      isLive: null,
      error: "방송 상태를 확인하지 못했습니다."
    });
  }
};
