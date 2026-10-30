export default async function handler(req, res) {
  try {
    const { title, artist } = req.query;

    if (!title) {
      return res.status(400).json({
        error: "곡 제목이 필요합니다."
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "YouTube API Key가 없습니다."
      });
    }

    const cacheKey =
  `lyrics|${artist || ""}|${title}`
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

    return res.status(200).json({
  video: {
    videoId: item.video_id,
    title: item.video_title || "",
    channelTitle:
      item.channel_title || "",
    thumbnail: item.thumbnail || ""
  },
  cached: true
});
  }
}

    const query =
      `${artist || ""} ${title} 가사 lyrics`.trim();

    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "5",
      q: query,
      videoEmbeddable: "true",
      videoSyndicated: "true",
      key: apiKey
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
  error: "YouTube 검색에 실패했습니다.",
  details: data
});
    }

    const videos = (data.items || [])
      .map(item => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title || "",
        channelTitle:
          item.snippet?.channelTitle || "",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url || ""
      }))
      .filter(video => video.videoId);

    if (!videos.length) {
      return res.status(404).json({
        error: "가사 영상을 찾지 못했습니다."
      });
    }

    const selectedVideo = videos[0];

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

    return res.status(200).json({
  video: selectedVideo
});
    
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "가사 영상을 찾는 중 오류가 발생했습니다."
    });
  }
}
