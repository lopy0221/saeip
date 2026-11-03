const SOOP_ID = "likey0u";

/* ========================================
   SOOP 페이지 전체 불러오기
======================================== */

async function fetchAllPages({
  makeUrl,
  getItems,
  perPage = 60,
  maxPages = 100
}) {
  const allItems = [];

  for (let page = 1; page <= maxPages; page++) {
    const url = makeUrl(page, perPage);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `SOOP API 오류 (${response.status}) / page=${page}`
      );
    }

    const data = await response.json();

    const items = getItems(data);

    if (!Array.isArray(items) || items.length === 0) {
      break;
    }

    allItems.push(...items);

    // 마지막 페이지
    if (items.length < perPage) {
      break;
    }
  }

  return allItems;
}


/* ========================================
   API
======================================== */

module.exports = async function handler(req, res) {
  try {

    /* ------------------------------------
       다시보기 전체
    ------------------------------------ */

    const replays = await fetchAllPages({
      perPage: 60,

      makeUrl: (page, perPage) =>
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/review` +
        `?page=${page}` +
        `&per_page=${perPage}` +
        `&orderby=reg_date`,

      getItems: data =>
        Array.isArray(data.data)
          ? data.data
          : []
    });


    /* ------------------------------------
       클립 전체
    ------------------------------------ */

    const clips = await fetchAllPages({
      perPage: 60,

      makeUrl: (page, perPage) =>
        `https://chapi.sooplive.com/api/${SOOP_ID}/vods/clip/all` +
        `?page=${page}` +
        `&per_page=${perPage}` +
        `&orderby=reg_date`,

      getItems: data =>
        Array.isArray(data.data)
          ? data.data
          : []
    });


    /* ------------------------------------
       CATCH 전체
    ------------------------------------ */

    const catches = await fetchAllPages({
      perPage: 40,

      makeUrl: (page, perPage) =>
        `https://api-channel.sooplive.com/v1.3/channel/${SOOP_ID}/vod/catch` +
        `?startDate=` +
        `&endDate=` +
        `&keyword=` +
        `&orderBy=reg_date` +
        `&page=${page}` +
        `&perPage=${perPage}` +
        `&field=title,contents,user_nick,user_id`,

      getItems: data =>
        Array.isArray(data.contents)
          ? data.contents
          : []
    });


    /* ====================================
       결과 반환
    ==================================== */

    return res.status(200).json({
      success: true,

      streamer: SOOP_ID,

      replays,
      clips,
      catches,

      counts: {
        replays: replays.length,
        clips: clips.length,
        catches: catches.length,

        total:
          replays.length +
          clips.length +
          catches.length
      }
    });

  } catch (error) {

    console.error(
      "SOOP 전체 VOD 불러오기 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
