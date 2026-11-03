const SOOP_ID = "likey0u";

const SUPABASE_URL =
  "https://txwlwxldagplfhlgopyl.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

const PAGES_PER_RUN = 5;

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `SOOP API 오류: ${response.status}`
    );
  }

  return response.json();
}

async function saveToSupabase(items) {
  if (!items.length) return;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/soop_vods?on_conflict=title_no,vod_type`,
    {
      method: "POST",

      headers: {
        apikey: SUPABASE_SECRET_KEY,

        Authorization:
          `Bearer ${SUPABASE_SECRET_KEY}`,

        "Content-Type":
          "application/json",

        Prefer:
          "resolution=merge-duplicates"
      },

      body: JSON.stringify(items)
    }
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      `Supabase 저장 오류: ${message}`
    );
  }
}

function normalizeItem(item, type) {
  const titleNo =
    item.title_no ||
    item.titleNo ||
    item.ucc?.title_no ||
    item.ucc?.titleNo;

  if (!titleNo) {
    return null;
  }

  const title =
    item.title_name ||
    item.titleName ||
    item.title ||
    "";

  let thumbnail =
    item.ucc?.thumb ||
    item.thumbnail ||
    item.thumb ||
    "";

  if (
    thumbnail &&
    thumbnail.startsWith("//")
  ) {
    thumbnail =
      `https:${thumbnail}`;
  }

  const viewCount =
    Number(
      item.count?.read_cnt ??
      item.count?.readCnt ??
      item.read_cnt ??
      item.readCnt ??
      0
    );

  const regDate =
    item.reg_date ||
    item.regDate ||
    null;

  return {
    title_no: String(titleNo),
    vod_type: type,
    title,
    thumbnail,
    view_count: viewCount,
    reg_date: regDate
  };
}

async function fetchPage(page) {
  const [
    replayData,
    clipData,
    catchData
  ] = await Promise.all([

    fetchJson(
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
      `?page=${page}` +
      `&per_page=60` +
      `&orderby=reg_date`
    ),

    fetchJson(
      `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip/all` +
      `?page=${page}` +
      `&per_page=60` +
      `&orderby=reg_date`
    ),

    fetchJson(
      `https://api-channel.sooplive.com/v1.3/channel/${SOOP_ID}/vod/catch` +
      `?startDate=` +
      `&endDate=` +
      `&keyword=` +
      `&orderBy=reg_date` +
      `&page=${page}` +
      `&perPage=60` +
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

  const items = [
    ...replays.map(item =>
      normalizeItem(item, "replay")
    ),

    ...clips.map(item =>
      normalizeItem(item, "clip")
    ),

    ...catches.map(item =>
      normalizeItem(item, "catch")
    )
  ].filter(Boolean);

  return {
    items,

    counts: {
      replay: replays.length,
      clip: clips.length,
      catch: catches.length
    },

    hasMore:
      replays.length === 60 ||
      clips.length === 60 ||
      catches.length === 60
  };
}

module.exports = async function handler(req, res) {
  try {
    if (!SUPABASE_SECRET_KEY) {
      throw new Error(
        "SUPABASE_SECRET_KEY가 설정되지 않았습니다."
      );
    }

    const startPage =
      Math.max(
        1,
        Number(req.query.page) || 1
      );

    let totalSaved = 0;
    let lastPage = startPage;
    let hasMore = true;

    const results = [];

    for (
      let i = 0;
      i < PAGES_PER_RUN;
      i++
    ) {
      const page =
        startPage + i;

      const result =
        await fetchPage(page);

      await saveToSupabase(
        result.items
      );

      totalSaved +=
        result.items.length;

      lastPage = page;
      hasMore = result.hasMore;

      results.push({
        page,
        saved:
          result.items.length,

        counts:
          result.counts
      });

      /*
        세 종류 모두 마지막 페이지라면
        여기서 종료
      */
      if (!hasMore) {
        break;
      }
    }

    return res.status(200).json({
      success: true,

      startPage,
      lastPage,

      totalSaved,

      pagesProcessed:
        results.length,

      results,

      hasMore,

      nextPage:
        hasMore
          ? lastPage + 1
          : null
    });

  } catch (error) {
    console.error(
      "SOOP 전체 동기화 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
