const SUPABASE_URL =
  "https://txwlwxldagplfhlgopyl.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY;

const ITEMS_PER_PAGE = 60;

module.exports = async function handler(req, res) {
  try {
    if (!SUPABASE_SECRET_KEY) {
      throw new Error(
        "SUPABASE_SECRET_KEY가 설정되지 않았습니다."
      );
    }

    const page = Math.max(
      1,
      Number(req.query.page) || 1
    );

    const type =
      req.query.type || "all";

    const sort =
      req.query.sort || "latest";

    const period =
  req.query.period || "all";

const startDate =
  String(req.query.startDate || "");

const endDate =
  String(req.query.endDate || "");

const hideReplay =
  req.query.hideReplay === "true";

    /*
      Supabase 조회 범위

      page 1 = 0 ~ 59
      page 2 = 60 ~ 119
      page 3 = 120 ~ 179
    */
    const from =
      (page - 1) * ITEMS_PER_PAGE;

    const to =
      from + ITEMS_PER_PAGE - 1;

    const params =
      new URLSearchParams();

    params.set(
      "select",
      "title_no,vod_type,title,thumbnail,view_count,reg_date,auth_no"
    );

    /*
      종류 필터
    */
    if (
      type === "replay" ||
      type === "clip" ||
      type === "catch"
    ) {
      params.set(
        "vod_type",
        `eq.${type}`
      );
    }

    /*
      전체에서 다시보기 숨기기
    */
    if (
      type === "all" &&
      hideReplay
    ) {
      params.set(
        "vod_type",
        "neq.replay"
      );
    }

    /*
  기간 필터
  직접 입력한 날짜가 있으면 우선 적용
*/
const isValidDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

if (
  (startDate && !isValidDate(startDate)) ||
  (endDate && !isValidDate(endDate))
) {
  return res.status(400).json({
    success: false,
    error: "날짜 형식이 올바르지 않습니다."
  });
}

if (
  startDate &&
  endDate &&
  startDate > endDate
) {
  return res.status(400).json({
    success: false,
    error: "시작일이 종료일보다 늦을 수 없습니다."
  });
}

if (startDate || endDate) {
  const dateFilters = [];

  if (startDate) {
    dateFilters.push(
      `gte.${startDate}T00:00:00+09:00`
    );
  }

  if (endDate) {
    const nextDay = new Date(
      `${endDate}T00:00:00+09:00`
    );

    nextDay.setUTCDate(
      nextDay.getUTCDate() + 1
    );

    dateFilters.push(
      `lt.${nextDay.toISOString()}`
    );
  }

  if (dateFilters.length === 1) {
  params.set("reg_date", dateFilters[0]);
} else {
  params.set(
    "and",
    `(${dateFilters.map(filter => `reg_date.${filter}`).join(",")})`
  );
}

} else if (period !== "all") {
  const limitDate = new Date();

  if (period === "3month") {
    limitDate.setMonth(
      limitDate.getMonth() - 3
    );
  }

  if (period === "6month") {
    limitDate.setMonth(
      limitDate.getMonth() - 6
    );
  }

  if (period === "1year") {
    limitDate.setFullYear(
      limitDate.getFullYear() - 1
    );
  }

  params.set(
    "reg_date",
    `gte.${limitDate.toISOString()}`
  );
}
    /*
      정렬
    */
    if (sort === "oldest") {
      params.set(
        "order",
        "reg_date.asc.nullslast"
      );
    } else if (sort === "views") {
      params.set(
        "order",
        "view_count.desc,reg_date.desc.nullslast"
      );
    } else {
      params.set(
        "order",
        "reg_date.desc.nullslast"
      );
    }

    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/soop_vods?${params.toString()}`,
        {
          headers: {
            apikey:
              SUPABASE_SECRET_KEY,

            Authorization:
              `Bearer ${SUPABASE_SECRET_KEY}`,

            Range:
              `${from}-${to}`,

            Prefer:
              "count=exact"
          }
        }
      );

    if (!response.ok) {
      const message =
        await response.text();

      throw new Error(
        `Supabase 조회 오류: ${message}`
      );
    }

    const rows =
      await response.json();

    /*
      전체 개수
    */
    const contentRange =
      response.headers.get(
        "content-range"
      );

    let total = 0;

    if (contentRange) {
      const match =
        contentRange.match(
          /\/(\d+)$/
        );

      if (match) {
        total =
          Number(match[1]);
      }
    }

    const totalPages =
      total > 0
        ? Math.ceil(
            total / ITEMS_PER_PAGE
          )
        : 0;

    /*
      기존 script.js에서 사용하던
      SOOP 데이터 형태로 맞춰준다.
    */
    const items =
      rows.map(item => ({
        title_no:
          item.title_no,

        vod_type:
          item.vod_type,

        title_name:
          item.title || "",

        thumbnail:
          item.thumbnail || "",

        read_cnt:
          Number(
            item.view_count || 0
          ),

        reg_date:
  item.reg_date,

auth_no:
  item.auth_no
}));

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).json({
      success: true,

      page,
      perPage:
        ITEMS_PER_PAGE,

      total,
      totalPages,

      hasPrevious:
        page > 1,

      hasMore:
        page < totalPages,

      items
    });

  } catch (error) {
    console.error(
      "SOOP VOD 조회 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
