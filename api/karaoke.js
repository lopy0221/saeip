const SUPABASE_URL =
  "https://txwlwxldagplfhlgopyl.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

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

const cacheKey =
  `karaoke-${type}|${artist}|${title}`
    .trim()
    .toLowerCase();

const cacheResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/youtube_search_cache` +
  `?cache_key=eq.${encodeURIComponent(cacheKey)}` +
  `&select=*` +
  `&limit=1`,
  {
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization:
        `Bearer ${SUPABASE_SECRET_KEY}`
    }
  }
);

if (cacheResponse.ok) {
  const cached = await cacheResponse.json();

  if (cached.length > 0) {
    const item = cached[0];

    const createdAt =
      new Date(item.created_at).getTime();

    const cacheAge =
      Date.now() - createdAt;

    const twentyFourHours =
      24 * 60 * 60 * 1000;

    if (cacheAge < twentyFourHours) {
      return {
        type,
        videoId: item.video_id,
        title: item.video_title || "",
        channelTitle:
          item.channel_title || "",
        thumbnail: item.thumbnail || "",
        cached: true
      };
    }
  }
}
      
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

  const selectedVideo = {
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

await fetch(
  `${SUPABASE_URL}/rest/v1/youtube_search_cache?on_conflict=cache_key`,
  {
    method: "POST",
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization:
        `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify({
      cache_key: cacheKey,
      video_id: selectedVideo.videoId,
      video_title: selectedVideo.title,
      channel_title:
        selectedVideo.channelTitle,
      thumbnail:
        selectedVideo.thumbnail || "",
      created_at:
        new Date().toISOString()
    })
  }
);

return selectedVideo;
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
