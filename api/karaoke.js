export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const title = String(req.query.title || "").trim();
  const artist = String(req.query.artist || "").trim();

  if (!title) {
    return res.status(400).json({
      error: "곡 제목이 필요합니다."
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "YouTube API 키가 설정되지 않았습니다."
    });
  }

  try {
    async function searchKaraoke(type) {
  const keyword =
    type === "tj"
      ? `${artist} ${title} TJ 노래방`
      : `${artist} ${title} 금영 노래방`;

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "5",
    q: keyword.trim(),
    videoEmbeddable: "true",
    videoSyndicated: "true",
    key: apiKey
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      `YouTube ${type} 검색 오류:`,
      data
    );

    return null;
  }

  const items =
  (data.items || []).filter(
    item => item.id?.videoId
  );

const item =
  type === "tj"
    ? items.find(item => {
        const text =
          `${item.snippet?.title || ""} ` +
          `${item.snippet?.channelTitle || ""}`
            .toLowerCase();

        return (
          text.includes("tj") ||
          text.includes("태진")
        );
      })
    : items.find(item => {
        const text =
          `${item.snippet?.title || ""} ` +
          `${item.snippet?.channelTitle || ""}`
            .toLowerCase();

        return (
          text.includes("금영") ||
          text.includes("ky")
        );
      });

  if (!item) {
    return null;
  }

  return {
    type,
    videoId: item.id.videoId,
    title: item.snippet?.title || "",
    channelTitle:
      item.snippet?.channelTitle || "",
    thumbnail:
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      ""
  };
}

const requestedType =
  String(req.query.type || "")
    .toLowerCase();

const tjVideo =
  requestedType === "ky"
    ? null
    : await searchKaraoke("tj");

const kyVideo =
  requestedType === "tj"
    ? null
    : await searchKaraoke("ky");

const videos = [
  tjVideo,
  kyVideo
].filter(Boolean);

if (!videos.length) {
  return res.status(404).json({
    error: "노래방 영상을 찾지 못했습니다."
  });
}

return res.status(200).json({
  video: videos[0],
  videos
});

  } catch (error) {
    console.error("karaoke API 오류:", error);

    return res.status(500).json({
      error: "노래방 영상을 찾는 중 오류가 발생했습니다."
    });
  }
}
