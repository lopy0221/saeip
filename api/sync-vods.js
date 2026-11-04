
const SOOP_ID = "likey0u";

const SUPABASE_URL =
  "https://txwlwxldagplfhlgopyl.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

const SOOP_SYNC_TOKEN =
  process.env.SOOP_SYNC_TOKEN;

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
  "https://res.sooplive.com/images/thumb/vod/0082_480x270_light.png";

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
    // 1. GET 요청만 허용
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");

      return res.status(405).json({
        success: false,
        error: "허용되지 않은 요청 방식입니다."
      });
    }

    // 2. 비밀 토큰 설정 확인
    if (!SOOP_SYNC_TOKEN) {
      console.error(
        "SOOP_SYNC_TOKEN 환경변수가 없습니다."
      );

      return res.status(503).json({
        success: false,
        error: "동기화 인증 설정이 필요합니다."
      });
    }

    // 3. GitHub Actions 인증 확인
    const authorization =
      req.headers.authorization || "";

    const expectedAuthorization =
      `Bearer ${SOOP_SYNC_TOKEN}`;

    const crypto = require("node:crypto");

    const received =
      Buffer.from(authorization);

    const expected =
      Buffer.from(expectedAuthorization);

    const authorized =
      received.length === expected.length &&
      crypto.timingSafeEqual(
        received,
        expected
      );

    if (!authorized) {
      return res.status(401).json({
        success: false,
        error: "인증되지 않은 요청입니다."
      });
    }

    // 4. Supabase 설정 확인
    if (!SUPABASE_SECRET_KEY) {
      throw new Error(
        "SUPABASE_SECRET_KEY가 설정되지 않았습니다."
      );
    }

    // 5. 시작 페이지 확인
    const requestedPage =
      Number(req.query.page);

    const startPage =
      Number.isSafeInteger(requestedPage) &&
      requestedPage >= 1
        ? requestedPage
        : 1;

    let totalSaved = 0;
    let lastPage = startPage;
    let hasMore = true;

    const results = [];

    // 6. SOOP 영상 수집 및 저장
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

      // 세 종류 모두 마지막 페이지면 종료
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
