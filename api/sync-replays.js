const SUPABASE_URL = "https://txwlwxldagplfhlgopyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_L0rNucD4rLdHlte3wwWipg_sdl5j5WE";

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
    
    const scheduleResponse = await fetch(
  `${SUPABASE_URL}/rest/v1/stream_schedule?select=*&order=date.asc`,
  {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  }
);

if (!scheduleResponse.ok) {
  throw new Error(`일정 불러오기 실패: ${scheduleResponse.status}`);
}

const schedules = await scheduleResponse.json();

    const replays = (data.data || []).map((vod) => ({
  id: vod.title_no,
  title: vod.title_name,
  url: `https://vod.sooplive.com/player/${vod.title_no}/`,
  reg_date: vod.reg_date,
  duration: vod.total_file_duration
}));
    return res.status(200).json({
      success: true,
      streamer: SOOP_ID,
      count: replays.length,
      schedules,
      replays
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
