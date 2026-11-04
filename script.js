/*
  새잎 팬사이트 설정
  공식 채널 URL을 links에 입력하고 노래 목록을 songs에 추가해 주세요.
*/
const links = {
  soop: "",
  youtube: "",
  sns: ""
};

let songs = [];
let selectedCountry = "all";
let selectedGenre = "all";
let titleSortDirection = "none";
let artistSortDirection = "none";
let proficiencySortDirection = "none";

const $ = selector => document.querySelector(selector);
const songList = $("#songList");
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function safeURL(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : "#"; }
  catch { return "#"; }
}
function renderSongs(query = "") {
  const filtered = songs.filter(song => {
  const matchesSearch =
    `${song.title} ${song.artist}`
      .toLowerCase()
      .includes(query.toLowerCase());

  const matchesCountry =
  selectedCountry === "all" ||
  song.category === selectedCountry;

const matchesGenre =
  selectedGenre === "all" ||
  song.genre === selectedGenre;

return matchesSearch && matchesCountry && matchesGenre;
});

if (titleSortDirection === "asc") {
  filtered.sort((a, b) =>
    (a.title || "").localeCompare(b.title || "", "ko")
  );
} else if (titleSortDirection === "desc") {
  filtered.sort((a, b) =>
    (b.title || "").localeCompare(a.title || "", "ko")
  );
}

  if (artistSortDirection === "asc") {
  filtered.sort((a, b) =>
    (a.artist || "").localeCompare(b.artist || "", "ko")
  );
} else if (artistSortDirection === "desc") {
  filtered.sort((a, b) =>
    (b.artist || "").localeCompare(a.artist || "", "ko")
  );
}

  if (proficiencySortDirection === "asc") {
  filtered.sort((a, b) =>
    Number(a.proficiency || 0) - Number(b.proficiency || 0)
  );
} else if (proficiencySortDirection === "desc") {
  filtered.sort((a, b) =>
    Number(b.proficiency || 0) - Number(a.proficiency || 0)
  );
}
  
  if (!filtered.length) {
    songList.innerHTML = `<div class="empty-state"><span>♫</span><b>${songs.length ? "검색 결과가 없어요" : "노래 목록을 준비 중이에요"}</b><p>${songs.length ? "다른 곡명이나 가수 이름으로 검색해 보세요." : "script.js의 songs 배열에 실제 곡 정보를 추가해 주세요."}</p></div>`;
    return;
  }
  songList.innerHTML = `
  <div class="song-table">
    <div class="song-table-header">
      <span>번호</span>
      <button type="button" id="songTitleSort">
  <button type="button" id="songTitleSort">
  곡 제목
  <span class="sort-arrow">
    ${titleSortDirection === "asc" ? "↑" : titleSortDirection === "desc" ? "↓" : "↕"}
  </span>
</button>
</button>
      <button type="button" id="songArtistSort">
  가수
  <span class="sort-arrow">
    ${artistSortDirection === "asc" ? "↑" : artistSortDirection === "desc" ? "↓" : "↕"}
  </span>
</button>
      <span class="song-genre-header">장르</span>
      <button type="button" id="songProficiencySort">
  <button type="button" id="songProficiencySort">
  숙련도
  <span class="sort-arrow">
    ${proficiencySortDirection === "asc" ? "↑" : proficiencySortDirection === "desc" ? "↓" : "↕"}
  </span>
</button>
</button>
    </div>

    <div class="song-table-body">
      ${filtered.map((song, index) => {
        const genreNames = {
          ballad: "발라드",
          dance: "댄스",
          band: "밴드",
          hiphop: "힙합/랩",
          rnb: "R&B",
          ost: "OST",
          homework: "숙제곡"
        };

        const proficiency = Number(song.proficiency ?? 3);

        return `
          <div class="song-table-row">
            <span class="song-number">${index + 1}</span>

            <button
  type="button"
  class="song-title karaoke-button"
  data-karaoke-title="${escapeHTML(song.title)}"
  data-karaoke-artist="${escapeHTML(song.artist)}"
  data-lyrics-url="${escapeHTML(song.lyrics_url || "")}"
  data-tj-karaoke-url="${escapeHTML(song.tj_karaoke_url || "")}"
data-ky-karaoke-url="${escapeHTML(song.ky_karaoke_url || "")}"
>
  ${escapeHTML(song.title)}
</button>
            <span class="song-artist">
              ${escapeHTML(song.artist)}
            </span>

            <span class="song-genre">
              ${escapeHTML(genreNames[song.genre] || song.genre || "-")}
            </span>

            <span class="song-proficiency">
              ${"★".repeat(proficiency)}
            </span>
          </div>
        `;
      }).join("")}
    </div>
  </div>
`;
  const titleSortButton =
  document.querySelector("#songTitleSort");

if (titleSortButton) {
  titleSortButton.addEventListener("click", () => {
    titleSortDirection =
      titleSortDirection === "asc"
        ? "desc"
        : "asc";

    artistSortDirection = "none";
    proficiencySortDirection = "none";

    renderSongs($("#songSearch").value);
  });
}
  const artistSortButton =
  document.querySelector("#songArtistSort");

if (artistSortButton) {
  artistSortButton.addEventListener("click", () => {
    artistSortDirection =
      artistSortDirection === "asc"
        ? "desc"
        : "asc";

    titleSortDirection = "none";
    proficiencySortDirection = "none";

    renderSongs($("#songSearch").value);
  });
}
  const proficiencySortButton =
  document.querySelector("#songProficiencySort");

if (proficiencySortButton) {
  proficiencySortButton.addEventListener("click", () => {
    proficiencySortDirection =
      proficiencySortDirection === "asc"
        ? "desc"
        : "asc";

    titleSortDirection = "none";
artistSortDirection = "none";
    renderSongs($("#songSearch").value);
  });
}
}
document
  .querySelectorAll(".song-filter-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      selectedCountry = button.dataset.country;

      document
        .querySelectorAll(".song-filter-btn")
        .forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

      renderSongs(
        $("#songSearch").value
      );
    });
  });
document
  .querySelectorAll(".song-genre-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      selectedGenre = button.dataset.genre;

      document
        .querySelectorAll(".song-genre-btn")
        .forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

      renderSongs(
        $("#songSearch").value
      );
    });
  });
document.querySelectorAll("[data-link]").forEach(anchor => {
  const key = anchor.dataset.link;
  if (links[key]) {
    anchor.href = safeURL(links[key]); anchor.target = "_blank"; anchor.rel = "noopener noreferrer";
  } else {
    anchor.href = "#";
    anchor.addEventListener("click", e => { e.preventDefault(); alert("script.js 파일의 links." + key + "에 공식 채널 URL을 입력해 주세요."); });
  }
});
$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));


// 방송 일정 달력 + Supabase --------------------------------------------

// Supabase 설정
const SUPABASE_URL = "https://txwlwxldagplfhlgopyl.supabase.co";
const SUPABASE_KEY = "sb_publishable_L0rNucD4rLdHlte3wwWipg_sdl5j5WE";

// Supabase에서 노래 목록 불러오기
async function loadSongs() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?select=*&order=title.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`노래 불러오기 실패: ${response.status}`);
    }

    songs = await response.json();

    renderSongs();
  } catch (error) {
    console.error("노래 목록을 불러오지 못했습니다.", error);
  }
}

loadSongs();

// Supabase에서 불러온 일정이 저장되는 곳
const streamSchedule = {};

const scheduleReplays = {};

// Supabase에서 다시보기 불러오기
async function loadScheduleReplays() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/schedule_replays?select=*&disabled=eq.false&order=part_number.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`다시보기 불러오기 실패: ${response.status}`);
    }

    const replays = await response.json();

    Object.keys(scheduleReplays).forEach(key => {
      delete scheduleReplays[key];
    });

    replays.forEach(replay => {
      if (!scheduleReplays[replay.schedule_id]) {
        scheduleReplays[replay.schedule_id] = [];
      }

      scheduleReplays[replay.schedule_id].push(replay);
    });

    console.log("다시보기 불러오기 완료:", scheduleReplays);

  } catch (error) {
    console.error("다시보기를 불러오지 못했습니다.", error);
  }
}

const calendarToday = new Date();

let calendarYear = calendarToday.getFullYear();
let calendarMonth = calendarToday.getMonth();
let selectedCalendarKey = "";

// Supabase에서 방송 일정 불러오기
async function loadStreamSchedule() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/stream_schedule?select=*&order=date.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`일정 불러오기 실패: ${response.status}`);
    }

    const schedules = await response.json();

    // 기존 데이터 초기화
    Object.keys(streamSchedule).forEach(key => {
      delete streamSchedule[key];
    });

    // Supabase 데이터를 기존 달력 형식으로 변환
    schedules.forEach(item => {
  if (!streamSchedule[item.date]) {
    streamSchedule[item.date] = [];
  }

  streamSchedule[item.date].push({
    id: item.id,
    title: item.title || "방송",
    time: item.time ? String(item.time).slice(0, 5) : "",
    type: item.type || "live",
    description: item.description || ""
  });
});

// 휴방은 항상 맨 위,
// 나머지 일정은 빠른 시간부터 정렬
Object.values(streamSchedule).forEach(events => {
  events.sort((a, b) => {
    if (a.type === "off" && b.type !== "off") {
      return -1;
    }

    if (a.type !== "off" && b.type === "off") {
      return 1;
    }

    const timeA = a.time || "23:59";
    const timeB = b.time || "23:59";

    return timeA.localeCompare(timeB);
  });
});

    renderCalendar();
renderWeeklySchedule();

  } catch (error) {
    console.error("방송 일정을 불러오지 못했습니다.", error);

    const detail = document.querySelector("#calendarDetail");

    if (detail) {
      detail.innerHTML = `
        <span class="detail-date">SCHEDULE</span>
        <h3>일정을 불러오지 못했어요.</h3>
        <p>잠시 후 새로고침해 주세요.</p>
      `;
    }

    renderCalendar();
  }
}

// 메인화면 주간 일정표 --------------------------------------------

function renderWeeklySchedule() {
  const weeklyItems = document.querySelectorAll(".weekly-day");

  if (!weeklyItems.length) return;

  // 오늘 날짜
  const today = new Date();

  // 이번 주 월요일 구하기
  const day = today.getDay();
  const monday = new Date(today);

  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diff);

 weeklyItems.forEach((item, index) => {
  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + index);

  // 오늘 요일 강조
  const isToday =
    targetDate.getFullYear() === today.getFullYear() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getDate() === today.getDate();

  item.classList.toggle("today", isToday);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const date = String(targetDate.getDate()).padStart(2, "0");

    const key = `${year}-${month}-${date}`;
    const events = streamSchedule[key] || [];

    const typeElement = item.querySelector(".weekly-type");
    const timeElement = item.querySelector(".weekly-time");

    if (!typeElement || !timeElement) return;

    // 일정 없음
    if (!events.length) {
      typeElement.innerHTML = "-";
      timeElement.innerHTML = "";
      return;
    }

    // 일정 종류와 시간을 한 묶음으로 표시
    typeElement.innerHTML = events
      .map(event => {
        let typeText = "방송";

        if (event.type === "planned") {
  typeText = "방송 예정";
} else if (
  event.type === "broadcast" ||
  event.type === "dawn" ||
  event.type === "morning" ||
  event.type === "afternoon" ||
  event.type === "evening"
) {
  typeText = "방송";
} else if (event.type === "collab") {
  typeText = "합방";
} else if (event.type === "off") {
  typeText = "휴방";
} else if (event.type === "etc") {
  typeText = "기념일";
}

        return `
          <span class="weekly-event">
            <strong>${escapeHTML(typeText)}</strong>
            ${event.type === "off" ? "" : `<span>${escapeHTML(event.time || "-")}</span>`}
          </span>
        `;
      })
      .join("");

    timeElement.innerHTML = "";
  });
}


function renderCalendar() {
  const firstDay = new Date(
    calendarYear,
    calendarMonth,
    1
  ).getDay();

  const lastDate = new Date(
    calendarYear,
    calendarMonth + 1,
    0
  ).getDate();

  const days = document.querySelector("#calendarDays");

  document.querySelector("#calendarYear").textContent =
    calendarYear;

  document.querySelector("#calendarMonth").textContent =
    `${calendarMonth + 1}월`;

  days.innerHTML = "";

  // 앞쪽 빈 날짜
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    blank.className = "calendar-day empty";
    days.appendChild(blank);
  }

  const now = new Date();

  for (let date = 1; date <= lastDate; date++) {

    const key =
      `${calendarYear}-` +
      `${String(calendarMonth + 1).padStart(2, "0")}-` +
      `${String(date).padStart(2, "0")}`;

    const events = streamSchedule[key] || [];
    
    const weekday =
      new Date(calendarYear, calendarMonth, date).getDay();

    const button = document.createElement("button");

    button.type = "button";
    button.className = "calendar-day";

    // 일요일
    if (weekday === 0) {
      button.classList.add("sunday");
    }

    // 토요일
    if (weekday === 6) {
      button.classList.add("saturday");
    }

    // 오늘 날짜
    if (
      now.getFullYear() === calendarYear &&
      now.getMonth() === calendarMonth &&
      now.getDate() === date
    ) {
      button.classList.add("today");
    }

    // 선택한 날짜
    if (key === selectedCalendarKey) {
      button.classList.add("selected");
    }

// 일정 존재
if (events.length) {
  button.classList.add("has-event");

  // 같은 날짜에 여러 일정이 있을 때 점 색상 우선순위
  // 기념일 > 합방 > 휴방 > 방송
  if (events.some(event => event.type === "etc")) {
    button.classList.add("event-anniversary");

  } else if (events.some(event => event.type === "collab")) {
    button.classList.add("event-collab");

  } else if (events.some(event => event.type === "off")) {
    button.classList.add("event-off");

  } else {
    button.classList.add("event-live");
  }
}

const groupedEvents = {};

events.forEach(event => {
  const title = event.title || "방송";

  if (!groupedEvents[title]) {
    groupedEvents[title] = [];
  }

  groupedEvents[title].push(event);
});

    // 달력 칸에서는 합방 일정을
// 바로 앞 방송 일정과 같은 줄에 표시
for (const [title, titleEvents] of Object.entries(groupedEvents)) {
  const collabs =
    titleEvents.filter(event => event.type === "collab");

  if (!collabs.length) continue;

  for (const collab of collabs) {
    const previousEntry =
      Object.entries(groupedEvents)
        .flatMap(([groupTitle, groupEvents]) =>
          groupEvents
            .filter(event =>
              event.type !== "collab" &&
              (event.time || "00:00") <
                (collab.time || "23:59")
            )
            .map(event => ({
              groupTitle,
              event
            }))
        )
        .sort((a, b) =>
          (b.event.time || "")
            .localeCompare(a.event.time || "")
        )[0];

    if (!previousEntry) continue;

    // 원래 합방 그룹에서 해당 합방 제거
if (groupedEvents[title]) {
  groupedEvents[title] =
    groupedEvents[title].filter(
      event => String(event.id) !== String(collab.id)
    );

  // 합방 그룹에 남은 일정이 없으면 그룹 자체 삭제
  if (groupedEvents[title].length === 0) {
    delete groupedEvents[title];
  }
}

    

    groupedEvents[previousEntry.groupTitle]
      .push(collab);
  }

  if (groupedEvents[title]?.length === 0) {
    delete groupedEvents[title];
  }
}

    const groupedEntries =
  Object.entries(groupedEvents);

const eventHTML = groupedEntries
  .map(([title, titleEvents]) => {

    const eventInfo = titleEvents
      .map(event => {
        let typeText = "방송";

        if (event.type === "planned") {
  typeText = "방송 예정";
} else if (
  event.type === "broadcast" ||
  event.type === "dawn" ||
  event.type === "morning" ||
  event.type === "afternoon" ||
  event.type === "evening"
) {
  typeText = "방송";
} else if (event.type === "collab") {
  typeText = "합방";
} else if (event.type === "off") {
  typeText = "휴방";
} else if (event.type === "etc") {
  typeText = "기념일";
}
        const time = event.time || "";

        return `${escapeHTML(time)} ${escapeHTML(typeText)}`.trim();
      })
      .join(" · ");

    const isOff =
  titleEvents.every(event => event.type === "off");

if (isOff) {
  return `
    <span class="calendar-event-item calendar-off-item">
      <strong>${escapeHTML(title)}</strong>
    </span>
  `;
}

return `
  <span class="calendar-event-item">
    <strong>${escapeHTML(title)}</strong>
    <small>${eventInfo}</small>
  </span>
`;
  })
  .join("");

button.innerHTML = `
  <span class="day-number">${date}</span>
  ${
    events.length
      ? `<span class="event-label">
          ${eventHTML}
        </span>`
      : ""
  }
`;

button.addEventListener("click", () => {
  if (events.length) {
    openSchedulePopup(key, events);
  }
});

    days.appendChild(button);
  }

  // 2026년 10월보다 이전으로 이동 금지
document.querySelector("#prevMonth").disabled =
  calendarYear === 2026 &&
  calendarMonth === 9;
}

  function openSchedulePopup(key, events) {
  const oldPopup =
    document.querySelector(".schedule-view-popup");

  if (oldPopup) {
    oldPopup.remove();
  }

  const groupedEvents = {};

  events.forEach(event => {
    const title = event.title || "방송";

    if (!groupedEvents[title]) {
      groupedEvents[title] = [];
    }

    groupedEvents[title].push(event);
  });

    // 같은 날 합방 일정은 바로 앞 방송 일정에 같이 표시
const collabEvents =
  events.filter(event => event.type === "collab");

const normalEvents =
  events.filter(event => event.type !== "collab");

if (
  collabEvents.length > 0 &&
  normalEvents.length > 0
) {
  for (const collab of collabEvents) {
    // 기존 합방 단독 그룹 제거
    const collabTitle = collab.title || "방송";

    if (groupedEvents[collabTitle]) {
      groupedEvents[collabTitle] =
        groupedEvents[collabTitle].filter(
          event => event.id !== collab.id
        );

      if (groupedEvents[collabTitle].length === 0) {
        delete groupedEvents[collabTitle];
      }
    }

    // 합방 시간보다 앞에 있는 방송 중 가장 가까운 일정 찾기
    const previousEvent =
      normalEvents
        .filter(event =>
          (event.time || "00:00") <
          (collab.time || "23:59")
        )
        .sort((a, b) =>
          (b.time || "").localeCompare(a.time || "")
        )[0];

    if (!previousEvent) continue;

    const previousTitle =
      previousEvent.title || "방송";

    if (!groupedEvents[previousTitle]) {
      groupedEvents[previousTitle] = [previousEvent];
    }

    groupedEvents[previousTitle].push(collab);
  }
}

  const eventHTML =
    Object.entries(groupedEvents)
      .map(([title, titleEvents]) => {

        const info = titleEvents
          .map(event => {
            let typeText = "방송";

            if (event.type === "planned") {
  typeText = "방송 예정";
} else if (
  event.type === "broadcast" ||
  event.type === "dawn" ||
  event.type === "morning" ||
  event.type === "afternoon" ||
  event.type === "evening"
) {
  typeText = "방송";
} else if (event.type === "collab") {
  typeText = "합방";
} else if (event.type === "off") {
  typeText = "휴방";
} else if (event.type === "etc") {
  typeText = "기념일";
}

            const time = event.time || "";

            return `${escapeHTML(time)} ${escapeHTML(typeText)}`.trim();
          })
          .join(" · ");

        const replays = titleEvents
  .flatMap(event => scheduleReplays[event.id] || [])
  .filter(
    (replay, index, array) =>
      array.findIndex(
        item => item.replay_url === replay.replay_url
      ) === index
  );

const replayHTML = replays
  .map((replay, index) => `
    <button
      type="button"
      class="schedule-replay-link"
      data-vod-url="${safeURL(replay.replay_url)}"
    >
      ▶ 다시보기${replays.length > 1 ? ` ${index + 1}` : ""}
    </button>
  `)
  .join("");

        const description = titleEvents
  .map(event => event.description || "")
  .filter(Boolean)
  .join(" · ");

return `
  <div class="schedule-view-item">
    <div class="schedule-view-main">
      <strong>${escapeHTML(title)}</strong>
      <small>${info}</small>

      ${replayHTML}
    </div>

    ${
      description
        ? `<div class="schedule-view-description">
            ${escapeHTML(description)}
          </div>`
        : ""
    }
  </div>
`;
      })
      .join("");

  const popup = document.createElement("div");

  popup.className = "schedule-view-popup";

  popup.innerHTML = `
    <div class="schedule-view-box">

      <button
        type="button"
        class="schedule-view-close"
        aria-label="닫기"
      >
        ×
      </button>

      <h3>${Number(key.split("-")[1])}월 ${Number(key.split("-")[2])}일 방송 일정</h3>

      <div class="schedule-view-list">
        ${eventHTML}
      </div>

    </div>
  `;

  document.body.appendChild(popup);

  popup
    .querySelector(".schedule-view-close")
    .addEventListener("click", () => {
      popup.remove();
    });

  popup.addEventListener("click", event => {
    if (event.target === popup) {
      popup.remove();
    }
  });
}
// 다시보기 VOD 팝업 --------------------------------------------

function openVodModal(replayURL) {
  const vodModal = document.querySelector("#vodModal");
  const vodPlayer = document.querySelector("#vodPlayer");

  if (!vodModal || !vodPlayer) return;

  const match = replayURL.match(/\/player\/(\d+)/);

  if (!match) {
    alert("다시보기 주소를 확인할 수 없어요.");
    return;
  }

  const titleNo = match[1];

  vodPlayer.src =
    `https://vod.sooplive.com/player/${titleNo}/embed`;

  vodModal.classList.add("is-open");
  vodModal.setAttribute("aria-hidden", "false");
}

function closeVodModal() {
  const vodModal = document.querySelector("#vodModal");
  const vodPlayer = document.querySelector("#vodPlayer");

  if (!vodModal || !vodPlayer) return;

  vodModal.classList.remove("is-open");
  vodModal.setAttribute("aria-hidden", "true");

  // 닫았을 때 영상도 정지
  vodPlayer.src = "";
}

document.addEventListener("click", event => {
  const replayButton =
    event.target.closest("[data-vod-url]");

  if (replayButton) {
    event.preventDefault();

    openVodModal(
      replayButton.dataset.vodUrl
    );

    return;
  }

  if (
    event.target.id === "vodModalClose" ||
    event.target.id === "vodModal"
  ) {
    closeVodModal();
  }
});
function showCalendarDetail(key, events) {
  selectedCalendarKey = key;

  const detail = document.querySelector("#calendarDetail");
  const [year, month, date] = key.split("-");

  if (events && events.length) {
    detail.innerHTML = `
      <span class="detail-date">
        ${year}.${month}.${date}
      </span>

      <div class="detail-events">
        ${events.map(event => `
          <div class="detail-event-item">
            <h3>
              ${escapeHTML(event.title)}
              ${
  event.type !== "off" && event.time
    ? `· ${escapeHTML(event.time)}`
    : ""
}
            </h3>

            <p>
              ${escapeHTML(event.description || "")}
            </p>
          </div>
        `).join("")}
      </div>
    `;
  } else {
    detail.innerHTML = `
      <span class="detail-date">
        ${year}.${month}.${date}
      </span>

      <h3>등록된 일정이 없어요.</h3>

      <p>
        방송 일정이 등록되면 이곳에 표시돼요.
      </p>
    `;
  }

  renderCalendar();
}


// 이전 달
document
  .querySelector("#prevMonth")
  .addEventListener("click", () => {

    if (
      calendarYear === 2026 &&
      calendarMonth === 9
    ) {
      return;
    }

    calendarMonth--;

    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear--;
    }

    selectedCalendarKey = "";

    renderCalendar();
  });


// 다음 달
document
  .querySelector("#nextMonth")
  .addEventListener("click", () => {

    calendarMonth++;

    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear++;
    }

    selectedCalendarKey = "";

    renderCalendar();
  });


// 처음 사이트를 열었을 때
// 다시보기를 먼저 불러온 뒤 방송 일정을 표시
async function loadSchedulePage() {
  await loadScheduleReplays();
  await loadStreamSchedule();
}

loadSchedulePage();

// ==================================================
// 상단 메뉴 클릭 방식 페이지 전환
// ==================================================

const sections = [...document.querySelectorAll(".page-section")];
const navLinks = [...document.querySelectorAll('#mainNav a[href^="#"]')];
const dots = [...document.querySelectorAll("#pageDots a")];

function showPage(hash, updateURL = true) {
  let targetHash = hash;

  // 잘못된 주소거나 #가 없으면 메인 화면
  if (!targetHash || targetHash === "#") {
    targetHash = "#home";
  }

  let targetIndex = sections.findIndex(
    section => "#" + section.id === targetHash
  );

  if (targetIndex === -1) {
    targetIndex = 0;
    targetHash = "#home";
  }

  // 모든 화면 숨기기
  sections.forEach(section => {
    section.classList.remove("active-page");
  });

  // 선택한 화면만 표시
  sections[targetIndex].classList.add("active-page");

  if (
  targetHash === "#clips" &&
  !soopClipsLoaded
) {
  soopClipsLoaded = true;
  loadSoopClips();
}

  // 오른쪽 점 표시
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === targetIndex);
  });

  // 상단 메뉴 현재 위치 표시
  navLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === targetHash
    );
  });

  // 모바일 메뉴 닫기
  document.querySelector("#mainNav")?.classList.remove("open");

  // 주소의 #profile 같은 부분 변경
  if (updateURL) {
    history.replaceState(null, "", targetHash);
  }

  // 혹시 이전 스크롤 위치가 남아 있으면 맨 위로
  window.scrollTo(0, 0);
}


// 상단 메뉴 + 내부 이동 버튼 + 오른쪽 점
document.addEventListener("click", event => {
  const link = event.target.closest('a[href^="#"]');

  if (!link) return;

  const hash = link.getAttribute("href");

  if (!hash || hash === "#") return;

  const exists = sections.some(
    section => "#" + section.id === hash
  );

  if (!exists) return;

  event.preventDefault();

  showPage(hash);
});


// 브라우저 뒤로가기/앞으로가기 대응
window.addEventListener("popstate", () => {
  showPage(location.hash || "#home", false);
});


// 사이트 처음 열었을 때
window.addEventListener("load", () => {
  showPage(location.hash || "#home", false);
});

// 다크모드 ----------------------------------------------------

const darkModeToggle = document.querySelector("#darkModeToggle");

function setDarkMode(enabled) {
  document.body.classList.toggle("dark-mode", enabled);

  if (darkModeToggle) {
    darkModeToggle.textContent = enabled ? "☀" : "☾";
    darkModeToggle.setAttribute(
      "aria-label",
      enabled ? "밝은 모드로 변경" : "어두운 모드로 변경"
    );
  }

  localStorage.setItem(
    "saeip-dark-mode",
    enabled ? "dark" : "light"
  );
}

const savedTheme = localStorage.getItem("saeip-dark-mode");

setDarkMode(savedTheme === "dark");

darkModeToggle?.addEventListener("click", () => {
  setDarkMode(
    !document.body.classList.contains("dark-mode")
  );
});

// 방송 시작일부터 오늘까지의 날짜 자동 계산
function updateBroadcastDays() {
  const startDate = new Date(2024, 8, 5); // 2024년 9월 5일

  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const broadcastDays = document.getElementById("broadcastDays");

  if (broadcastDays) {
    broadcastDays.textContent = `+${diffDays}일`;
  }
}

updateBroadcastDays();

/* =========================
   관리자 로그인 팝업
========================= */

const adminLoginLink =
  document.querySelector("#adminLoginLink");

const adminLoginModal =
  document.querySelector("#adminLoginModal");

const adminLoginClose =
  document.querySelector("#adminLoginClose");

const adminLoginPassword =
  document.querySelector("#adminLoginPassword");

adminLoginLink?.addEventListener("click", (event) => {
  event.preventDefault();

  adminLoginModal.classList.add("show");

  adminLoginPassword.value = "";

  document.querySelector("#adminLoginStatus").textContent = "";

  setTimeout(() => {
    adminLoginPassword.focus();
  }, 50);
});

adminLoginClose?.addEventListener("click", () => {
  adminLoginModal.classList.remove("show");
});

adminLoginModal?.addEventListener("click", (event) => {
  if (event.target === adminLoginModal) {
    adminLoginModal.classList.remove("show");
  }
});

/* =========================
   관리자 Supabase 로그인
========================= */

const ADMIN_SUPABASE_URL =
  "https://txwlwxldagplfhlgopyl.supabase.co";

const ADMIN_SUPABASE_KEY =
  "sb_publishable_L0rNucD4rLdHlte3wwWipg_sdl5j5WE";

const ADMIN_EMAIL =
  "jkui1109@gmail.com";

const adminSupabase =
  window.supabase.createClient(
    ADMIN_SUPABASE_URL,
    ADMIN_SUPABASE_KEY
  );

const adminLoginSubmit =
  document.querySelector("#adminLoginSubmit");

const adminLoginStatus =
  document.querySelector("#adminLoginStatus");

async function submitAdminLogin() {
  const password =
    adminLoginPassword.value;

  if (!password) {
    adminLoginStatus.textContent =
      "비밀번호를 입력해 주세요.";
    return;
  }

  adminLoginStatus.textContent =
    "로그인 중...";

  const { data, error } =
    await adminSupabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password
    });

  if (error) {
    adminLoginStatus.textContent =
      "비밀번호가 올바르지 않아요.";
    return;
  }

  if (
    !data.user ||
    data.user.email !== ADMIN_EMAIL
  ) {
    await adminSupabase.auth.signOut();

    adminLoginStatus.textContent =
      "관리자 계정이 아닙니다.";
    return;
  }

  adminLoginStatus.textContent = "";

  window.location.href =
    "/admin.html";
}

adminLoginSubmit?.addEventListener(
  "click",
  submitAdminLogin
);

adminLoginPassword?.addEventListener(
  "keydown",
  event => {
    if (event.key === "Enter") {
      submitAdminLogin();
    }
  }
);

/* =========================
   노래방 영상 팝업
========================= */

const karaokeModal =
  document.querySelector("#karaokeModal");

const karaokePlayer =
  document.querySelector("#karaokePlayer");

const karaokeLoading =
  document.querySelector("#karaokeLoading");

const karaokeStatus =
  document.querySelector("#karaokeStatus");

const karaokeModalTitle =
  document.querySelector("#karaokeModalTitle");

const karaokeModalArtist =
  document.querySelector("#karaokeModalArtist");

const karaokeModalClose =
  document.querySelector("#karaokeModalClose");

const karaokeNextButton =
  document.querySelector("#karaokeNextButton");

const karaokeYoutubeLink =
  document.querySelector("#karaokeYoutubeLink");

const karaokeTjLink =
  document.querySelector("#karaokeTjLink");

const karaokeBackButton =
  document.querySelector("#karaokeBackButton");

let karaokeVideos = [];
let karaokeVideoIndex = 0;
let karaokeYouTubePlayer = null;

let openedFromRandomSong = false;

function openKaraokeModal(
  title,
  artist,
  lyricsUrl,
  tjKaraokeUrl,
  kyKaraokeUrl
) {
  if (!karaokeModal) return;

  karaokeModalTitle.textContent = title;
  karaokeModalArtist.textContent = artist;

  karaokeModal.dataset.songTitle = title;
  karaokeModal.dataset.songArtist = artist;
  karaokeModal.dataset.lyricsUrl = lyricsUrl;

  karaokeModal.dataset.tjKaraokeUrl =
  tjKaraokeUrl;

karaokeModal.dataset.kyKaraokeUrl =
  kyKaraokeUrl;

  karaokeStatus.textContent = "";
  karaokeLoading.style.display = "none";
  karaokeNextButton.style.display = "none";

  if (karaokeYoutubeLink) {
  karaokeYoutubeLink.href = "#";
  karaokeYoutubeLink.style.display = "none";
}

  if (karaokeTjLink) {
  karaokeTjLink.href = "#";
  karaokeTjLink.style.display = "none";
}

  karaokeModal.classList.add("choice-mode");
  karaokeModal.classList.remove("video-mode");

  karaokeModal.classList.add("is-open");
  karaokeModal.setAttribute("aria-hidden", "false");
}

const lyricsVersionButton =
  document.querySelector("#lyricsVersionButton");

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname
        .slice(1)
        .split("/")[0];
    }

    const watchId =
      parsed.searchParams.get("v");

    if (watchId) {
      return watchId;
    }

    const parts =
      parsed.pathname
        .split("/")
        .filter(Boolean);

    const markerIndex =
      parts.findIndex(part =>
        ["embed", "shorts", "live"].includes(part)
      );

    if (
      markerIndex !== -1 &&
      parts[markerIndex + 1]
    ) {
      return parts[markerIndex + 1];
    }

  } catch (error) {
    console.error(
      "YouTube URL 확인 오류:",
      error
    );
  }

  return "";
}

karaokeBackButton?.addEventListener("click", () => {

    if (openedFromRandomSong) {
    if (karaokeYouTubePlayer) {
      karaokeYouTubePlayer.destroy();
      karaokeYouTubePlayer = null;
    }

    karaokeModal.classList.remove("is-open");
    karaokeModal.setAttribute("aria-hidden", "true");

    randomSongModal.classList.add("is-open");
    randomSongModal.setAttribute("aria-hidden", "false");

    openedFromRandomSong = false;

    return;
  }
  
  karaokeModal.classList.remove("video-mode");
  karaokeModal.classList.add("choice-mode");

  if (karaokeYouTubePlayer) {
  karaokeYouTubePlayer.destroy();
  karaokeYouTubePlayer = null;
}

  karaokeStatus.textContent = "";

  if (karaokeTjLink) {
    karaokeTjLink.href = "#";
    karaokeTjLink.style.display = "none";
  }

  if (karaokeYoutubeLink) {
    karaokeYoutubeLink.href = "#";
    karaokeYoutubeLink.style.display = "none";
  }
});

lyricsVersionButton?.addEventListener(
  "click",
  async () => {
    const title =
      karaokeModal.dataset.songTitle || "";

    const artist =
      karaokeModal.dataset.songArtist || "";

    const lyricsUrl =
      karaokeModal.dataset.lyricsUrl || "";

    karaokeModal.classList.remove("choice-mode");
    karaokeModal.classList.add("video-mode");

    if (karaokeTjLink) {
  karaokeTjLink.href = "#";
  karaokeTjLink.style.display = "none";
}

    karaokeStatus.textContent = "";

    karaokeLoading.style.display = "flex";
    karaokeLoading.textContent =
      "가사 영상을 찾고 있어요...";

    try {
      let videoId = "";

      if (lyricsUrl) {
        videoId =
          getYouTubeVideoId(lyricsUrl);

        if (!videoId) {
          throw new Error(
            "등록된 가사 영상 URL을 확인할 수 없습니다."
          );
        }

      } else {
        const params =
          new URLSearchParams({
            title,
            artist
          });

        const response =
          await fetch(`/api/lyrics?${params}`);

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.video?.videoId
        ) {
          throw new Error(
            data.error ||
            "가사 영상을 찾지 못했습니다."
          );
        }

        videoId =
          data.video.videoId;
      }

      karaokeLoading.style.display = "none";

      karaokeVideos = [
        {
          videoId
        }
      ];

      karaokeVideoIndex = 0;

      playKaraokeVideo();

      karaokeNextButton.style.display =
        "none";

    } catch (error) {
      console.error(
        "가사 영상 검색 오류:",
        error
      );

      karaokeLoading.style.display = "none";

      karaokeStatus.textContent =
        "가사 영상을 찾지 못했어요.";
    }
  }
);

const karaokeVersionButton =
  document.querySelector("#karaokeVersionButton");

karaokeVersionButton?.addEventListener(
  "click",
  async () => {
    const title =
      karaokeModal.dataset.songTitle || "";

    const artist =
      karaokeModal.dataset.songArtist || "";

    const tjKaraokeUrl =
  karaokeModal.dataset.tjKaraokeUrl || "";

const kyKaraokeUrl =
  karaokeModal.dataset.kyKaraokeUrl || "";

    karaokeModal.classList.remove("choice-mode");
    karaokeModal.classList.add("video-mode");

    karaokeStatus.textContent = "";

    karaokeLoading.style.display = "flex";
    karaokeLoading.textContent =
      "노래방 영상을 찾고 있어요...";

    try {
      const manualTjVideoId =
  getYouTubeVideoId(tjKaraokeUrl);

      if (karaokeTjLink) {
  karaokeTjLink.href =
    manualTjVideoId
      ? tjKaraokeUrl
      : "#";

  karaokeTjLink.style.display =
    manualTjVideoId
      ? "inline-flex"
      : "none";
}

const manualKyVideoId =
  getYouTubeVideoId(kyKaraokeUrl);

if (
  manualTjVideoId &&
  manualKyVideoId
) {
  karaokeLoading.style.display = "none";

 karaokeVideos = [
  {
    type: "ky",
    videoId: manualKyVideoId
  },
  {
    type: "tj",
    videoId: manualTjVideoId
  }
];
  karaokeVideoIndex = 0;

  playKaraokeVideo();

  karaokeNextButton.style.display =
    "block";

  return;
}
      const params = new URLSearchParams({
  title,
  artist
});

if (manualTjVideoId && !manualKyVideoId) {
  params.set("type", "ky");
}

if (!manualTjVideoId && manualKyVideoId) {
  params.set("type", "tj");
}

      const response =
        await fetch(`/api/karaoke?${params}`);

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.video?.videoId
      ) {
        throw new Error(
          data.error ||
          "노래방 영상을 찾지 못했습니다."
        );
      }

      karaokeLoading.style.display = "none";

      const autoVideos =
  Array.isArray(data.videos) &&
  data.videos.length
    ? data.videos
    : [data.video];

const autoTjVideo =
  autoVideos.find(
    video => video.type === "tj"
  );

      if (
  karaokeTjLink &&
  !manualTjVideoId &&
  autoTjVideo?.videoId
) {
  karaokeTjLink.href =
    `https://www.youtube.com/watch?v=${autoTjVideo.videoId}`;

  karaokeTjLink.style.display =
    "inline-flex";
}

const autoKyVideo =
  autoVideos.find(
    video => video.type === "ky"
  );

const tjVideo =
  manualTjVideoId
    ? {
        type: "tj",
        videoId: manualTjVideoId
      }
    : autoTjVideo;

const kyVideo =
  manualKyVideoId
    ? {
        type: "ky",
        videoId: manualKyVideoId
      }
    : autoKyVideo;

karaokeVideos = [
  kyVideo,
  tjVideo
].filter(Boolean);

      karaokeVideoIndex = 0;

      playKaraokeVideo();

      karaokeNextButton.style.display =
        karaokeVideos.length > 1
          ? "block"
          : "none";

    } catch (error) {
      console.error(
        "노래방 영상 검색 오류:",
        error
      );

      karaokeLoading.style.display = "none";

      karaokeStatus.textContent =
        "";
    }
  }
);

function playKaraokeVideo() {
  const video =
    karaokeVideos[karaokeVideoIndex];

  if (!video?.videoId) return;

  if (karaokeYoutubeLink) {
  karaokeYoutubeLink.href =
    `https://www.youtube.com/watch?v=${video.videoId}`;

  karaokeYoutubeLink.style.display =
    "inline-flex";
}

  karaokeStatus.textContent = "";

  if (karaokeYouTubePlayer) {
    karaokeYoutubePlayer.cueVideoById(
  video.videoId
);

    return;
  }

  karaokeYouTubePlayer =
    new YT.Player("karaokePlayer", {
      videoId: video.videoId,

      playerVars: {
        autoplay: 0,
        rel: 0
      },

      events: {

        onError: () => {
          playNextKaraokeVideoAutomatically();
        }
      }
    });
}

function playNextKaraokeVideoAutomatically() {
  if (karaokeVideos.length <= 1) {
    karaokeStatus.textContent =
      "재생 가능한 노래방 영상을 찾지 못했어요.";

    return;
  }

  if (
    karaokeVideoIndex >=
    karaokeVideos.length - 1
  ) {
    karaokeStatus.textContent =
      "재생 가능한 노래방 영상을 찾지 못했어요.";

    return;
  }

  karaokeVideoIndex++;

  karaokeStatus.textContent =
    "다른 노래방 영상을 찾고 있어요...";

  setTimeout(() => {
    playKaraokeVideo();
  }, 500);
}

function closeKaraokeModal() {
  if (!karaokeModal) return;

  karaokeModal.classList.remove("is-open");
  karaokeModal.setAttribute("aria-hidden", "true");

  /* 닫았을 때 플레이어 완전 초기화 */
if (karaokeYouTubePlayer) {
  karaokeYouTubePlayer.destroy();
  karaokeYouTubePlayer = null;
}

  karaokeStatus.textContent = "";

  if (karaokeYoutubeLink) {
  karaokeYoutubeLink.href = "#";
  karaokeYoutubeLink.style.display = "none";
}
}

karaokeNextButton?.addEventListener(
  "click",
  () => {
    if (karaokeVideos.length <= 1) return;

    karaokeVideoIndex =
      (karaokeVideoIndex + 1) %
      karaokeVideos.length;

    playKaraokeVideo();
  }
);


document.addEventListener("click", event => {
  const button =
    event.target.closest(".karaoke-button");

  if (button) {
    event.preventDefault();

    openKaraokeModal(
  button.dataset.karaokeTitle || "",
  button.dataset.karaokeArtist || "",
  button.dataset.lyricsUrl || "",
  button.dataset.tjKaraokeUrl || "",
  button.dataset.kyKaraokeUrl || ""
);
    return;
  }

  if (
    event.target === karaokeModal ||
    event.target === karaokeModalClose
  ) {
    closeKaraokeModal();
  }
});

const randomSongButton =
  document.querySelector("#randomSongButton");

const randomSongModal =
  document.querySelector("#randomSongModal");

const randomSongClose =
  document.querySelector("#randomSongClose");

const randomSlotText =
  document.querySelector("#randomSlotText");

const randomSongResult =
  document.querySelector("#randomSongResult");

const randomRerollButton =
  document.querySelector("#randomRerollButton");

const randomSingButton =
  document.querySelector("#randomSingButton");

let selectedRandomSong = null;
let randomSongRunning = false;

function runRandomSongSlot() {
  if (!songs.length || randomSongRunning) return;

  randomSongRunning = true;
  selectedRandomSong = null;

  randomSongResult.textContent =
    "노래를 고르는 중... 🎲";

  randomRerollButton.disabled = true;
  randomSingButton.disabled = true;

  let count = 0;
  const totalCount = 24;

  function spin() {
    const previewSong =
      songs[Math.floor(Math.random() * songs.length)];

    randomSlotText.textContent =
      previewSong.title || "???";

    count++;

    if (count < totalCount) {
      // 뒤로 갈수록 점점 느려지는 슬롯머신
      const delay =
        45 + Math.pow(count / totalCount, 3) * 300;

      setTimeout(spin, delay);
      return;
    }

    selectedRandomSong =
      songs[Math.floor(Math.random() * songs.length)];

    randomSlotText.textContent =
      selectedRandomSong.title || "???";

    randomSongResult.textContent =
      selectedRandomSong.artist || "";

    randomSongRunning = false;

    randomRerollButton.disabled = false;
    randomSingButton.disabled = false;
  }

  spin();
}

randomSongButton?.addEventListener("click", () => {
  if (!songs.length) return;

  randomSongModal.classList.add("is-open");
  randomSongModal.setAttribute(
    "aria-hidden",
    "false"
  );

  runRandomSongSlot();
});

randomRerollButton?.addEventListener("click", () => {
  runRandomSongSlot();
});

randomSongClose?.addEventListener("click", () => {
  if (randomSongRunning) return;

  randomSongModal.classList.remove("is-open");
  randomSongModal.setAttribute(
    "aria-hidden",
    "true"
  );
});

randomSongModal?.addEventListener("click", event => {
  if (
    event.target === randomSongModal &&
    !randomSongRunning
  ) {
    randomSongModal.classList.remove("is-open");
    randomSongModal.setAttribute(
      "aria-hidden",
      "true"
    );
  }
});

randomSingButton?.addEventListener("click", () => {
  if (!selectedRandomSong) return;

  randomSongModal.classList.remove("is-open");
  randomSongModal.setAttribute(
    "aria-hidden",
    "true"
  );

  openedFromRandomSong = true;

openKaraokeModal(
  selectedRandomSong.title || "",
  selectedRandomSong.artist || "",
  selectedRandomSong.lyrics_url || "",
  selectedRandomSong.tj_karaoke_url || "",
  selectedRandomSong.ky_karaoke_url || ""
);

karaokeVersionButton?.click();
});

/* =========================
   SOOP VOD
========================= */

let soopClips = [];
let soopClipsLoaded = false;

let selectedVodType = "all";
let selectedSoopSort = "latest";
let selectedPeriod = "all";

// 직접 선택한 날짜 범위
let selectedSoopStartDate = "";
let selectedSoopEndDate = "";

let soopCurrentPage = 1;
let soopTotalPages = 0;
let soopTotalItems = 0;
let soopLoading = false;

const SOOP_ITEMS_PER_PAGE = 60;

/*
  같은 조건 / 같은 페이지를 다시 열었을 때
  API를 다시 호출하지 않도록 캐시
*/
const soopPageCache = new Map();


/* =========================
   공통 함수
========================= */

function getSoopCacheKey(page) {
  const hideReplay =
    document.querySelector(
      "#hideReplayCheckbox"
    )?.checked || false;

  return [
    selectedVodType,
    selectedSoopSort,
    selectedPeriod,
    selectedSoopStartDate,
    selectedSoopEndDate,
    hideReplay,
    page
  ].join(":");
}

function getSoopDate(item) {
  const rawDate =
    item.reg_date ||
    item.regDate ||
    "";

  if (!rawDate) return "";

  const datePart =
    String(rawDate).slice(0, 10);

  return datePart.replace(
    /-/g,
    "."
  );
}

function getSoopViews(item) {
  return Number(
    item.count?.read_cnt ??
    item.count?.readCnt ??
    item.read_cnt ??
    item.readCnt ??
    item.view_count ??
    0
  );
}


/* =========================
   SOOP 데이터 불러오기
========================= */

async function loadSoopClips(
  page = 1,
  force = false
) {
  if (soopLoading) return;

  page = Math.max(
    1,
    Number(page) || 1
  );

  const hideReplay =
    document.querySelector(
      "#hideReplayCheckbox"
    )?.checked || false;

  const cacheKey =
    getSoopCacheKey(page);

  /*
    이미 받은 데이터면 캐시 사용
  */
  if (
    !force &&
    soopPageCache.has(cacheKey)
  ) {
    const cached =
      soopPageCache.get(cacheKey);

    soopClips =
      cached.items;

    soopCurrentPage =
      cached.page;

    soopTotalPages =
      cached.totalPages;

    soopTotalItems =
      cached.total;

    renderSoopClips();
    return;
  }

  soopLoading = true;

  const grid =
    document.querySelector(
      "#soopClipsGrid"
    );

  if (grid) {
    grid.innerHTML = `
      <div class="soop-clips-empty">
        불러오는 중...
      </div>
    `;
  }

  try {
    const params =
  new URLSearchParams({
    page: String(page),
    type: selectedVodType,
    sort: selectedSoopSort,
    period: selectedPeriod,
    hideReplay:
      String(hideReplay)
  });

// 직접 선택한 시작일과 종료일 전달
if (selectedSoopStartDate) {
  params.set(
    "startDate",
    selectedSoopStartDate
  );
}

if (selectedSoopEndDate) {
  params.set(
    "endDate",
    selectedSoopEndDate
  );
}

    const response =
      await fetch(
        `/api/clips?${params.toString()}`
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
        "VOD를 불러오지 못했습니다."
      );
    }

    soopClips =
      Array.isArray(data.items)
        ? data.items
        : [];

    soopCurrentPage =
      Number(data.page) || page;

    soopTotalPages =
      Number(data.totalPages) || 0;

    soopTotalItems =
      Number(data.total) || 0;

    /*
      현재 조건 + 현재 페이지 저장
    */
    soopPageCache.set(
      cacheKey,
      {
        items: soopClips,
        page: soopCurrentPage,
        totalPages:
          soopTotalPages,
        total:
          soopTotalItems
      }
    );

    renderSoopClips();

  } catch (error) {
    console.error(
      "SOOP VOD 불러오기 오류:",
      error
    );

    if (grid) {
      grid.innerHTML = `
        <div class="soop-clips-empty">
          VOD를 불러오지 못했어요.
        </div>
      `;
    }

  } finally {
    soopLoading = false;
  }
}

/* =========================
   SOOP 썸네일 종류 배지
========================= */

function getSoopVodTypeBadge(type) {
  const value = String(type || "").toLowerCase();

  let badgeType = "";

  if (["replay", "review", "vod", "normal"].includes(value)) {
    badgeType = "vod";
  } else if (["clip", "clips"].includes(value)) {
    badgeType = "clip";
  } else if (["catch", "catchstory"].includes(value)) {
    badgeType = "catch";
  } else {
    return "";
  }

  const labels = {
    vod: "다시보기",
    clip: "클립",
    catch: "캐치"
  };

  const icons = {
    vod: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="5"/><path d="m10 8 6 4-6 4z"/></svg>`,

    clip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 8V4a2 2 0 0 1 2-2h14l2 6"/><path d="m7 2 4 6M14 2l4 6"/></svg>`,

    catch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5a9 9 0 1 0 0 14"/><path d="m11 8 6 4-6 4z"/></svg>`
  };

  return `
    <span class="soop-vod-type-badge ${badgeType}">
      ${icons[badgeType]}
      ${labels[badgeType]}
    </span>
  `;
}

/* =========================
   SOOP 카드 표시
========================= */

function renderSoopClips() {
  const grid =
    document.querySelector(
      "#soopClipsGrid"
    );

  const count =
    document.querySelector(
      "#clipCount"
    );

  if (!grid) return;

  /*
    이제 서버에서 정확히 60개를
    보내주기 때문에 slice 필요 없음
  */
  if (count) {
    count.textContent =
      `${soopTotalItems.toLocaleString()}개`;
  }

  if (!soopClips.length) {
    grid.innerHTML = `
      <div class="soop-clips-empty">
        조건에 맞는 VOD가 없어요.
      </div>
    `;

    renderSoopPagination();
    return;
  }

  grid.innerHTML =
    soopClips
      .map(item => {

        const title =
          item.title_name ||
          item.titleName ||
          item.title ||
          "제목 없는 VOD";

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

        const views =
          getSoopViews(item);

        const date =
          getSoopDate(item);

        const titleNo =
          item.title_no ||
          item.titleNo ||
          "";

        return `
          <article
            class="soop-clip-card"
            data-title-no="${escapeHTML(
              String(titleNo)
            )}"
            data-vod-type="${escapeHTML(
              item.vod_type || ""
            )}"
          >

            <div class="soop-clip-thumbnail" style="position: relative;">

  ${getSoopVodTypeBadge(item.vod_type)}

  ${item.is_subplus === true
  ? `<span class="soop-subplus-badge">구독+</span>`
  : ""}

  ${
    thumbnail
      ? `
        <img
          src="${escapeHTML(thumbnail)}"
          alt="${escapeHTML(title)}"
          loading="lazy"
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='flex';
          "
        >
        <div
          class="soop-clip-no-image"
          style="display:none;"
        >
          ${item.vod_type === "replay" ? "다시보기" : "SOOP VOD"}
        </div>
      `
      : `
        <div class="soop-clip-no-image">
          ${item.vod_type === "replay" ? "다시보기" : "SOOP VOD"}
        </div>
      `
  }

</div>

            <div class="soop-clip-info">

              <strong
                class="soop-clip-title"
              >
                ${escapeHTML(title)}
              </strong>

              <div
                class="soop-clip-meta"
              >

                <span>
                  조회
                  ${views.toLocaleString()}
                </span>

                <span>
                  ${escapeHTML(date)}
                </span>

              </div>

            </div>

          </article>
        `;
      })
      .join("");

  renderSoopPagination();
}


/* =========================
   페이지네이션
========================= */

function renderSoopPagination() {
  let pagination =
    document.querySelector(
      "#soopPagination"
    );

  if (!pagination) {
    pagination =
      document.createElement("div");

    pagination.id =
      "soopPagination";

    pagination.className =
      "soop-pagination";

    const grid =
      document.querySelector(
        "#soopClipsGrid"
      );

    grid?.insertAdjacentElement(
      "afterend",
      pagination
    );
  }

  if (!pagination) return;

  if (soopTotalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = "";

  /*
    이전 버튼
  */
  if (soopCurrentPage > 1) {
    html += `
      <button
        type="button"
        class="soop-page-button soop-page-arrow"
        data-page="${soopCurrentPage - 1}"
        aria-label="이전 페이지"
      >
        ‹
      </button>
    `;
  }

  /*
    첫 페이지
  */
  html += createSoopPageButton(1);

  /*
    현재 페이지 기준
    앞뒤 2페이지 표시
  */
  let startPage =
    Math.max(
      2,
      soopCurrentPage - 2
    );

  let endPage =
    Math.min(
      soopTotalPages - 1,
      soopCurrentPage + 2
    );

  /*
    앞쪽 ...
  */
  if (startPage > 2) {
    html += `
      <button
  type="button"
  class="soop-page-dots soop-page-jump"
  aria-label="페이지 바로 이동"
>
  ...
</button>
    `;
  }

  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {
    html +=
      createSoopPageButton(page);
  }

  /*
    뒤쪽 ...
  */
  if (
    endPage <
    soopTotalPages - 1
  ) {
    html += `
      <button
  type="button"
  class="soop-page-dots soop-page-jump"
  aria-label="페이지 바로 이동"
>
  ...
</button>
    `;
  }

  /*
    마지막 페이지
  */
  if (soopTotalPages > 1) {
    html +=
      createSoopPageButton(
        soopTotalPages
      );
  }

  /*
    다음 버튼
  */
  if (
    soopCurrentPage <
    soopTotalPages
  ) {
    html += `
      <button
        type="button"
        class="soop-page-button soop-page-arrow"
        data-page="${soopCurrentPage + 1}"
        aria-label="다음 페이지"
      >
        ›
      </button>
    `;
  }

  pagination.innerHTML = html;
}

function createSoopPageButton(page) {
  return `
    <button
      type="button"
      class="soop-page-button ${
        page === soopCurrentPage
          ? "active"
          : ""
      }"
      data-page="${page}"
    >
      ${page}
    </button>
  `;
}


/* =========================
   페이지 이동
========================= */

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        ".soop-page-button"
      );

    if (!button) return;

    const page =
      Number(
        button.dataset.page
      );

    if (
      !page ||
      page === soopCurrentPage ||
      soopLoading
    ) {
      return;
    }

    await loadSoopClips(page);

    document
      .querySelector("#clips")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  }
);


/* =========================
   VOD 종류 필터
========================= */

document
  .querySelectorAll(
    ".soop-filter-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const type =
          button.dataset.type ||
          "all";

        if (
          type === selectedVodType
        ) {
          return;
        }

        selectedVodType = type;
        soopCurrentPage = 1;

        document
          .querySelectorAll(
            ".soop-filter-button"
          )
          .forEach(item => {

            item.classList.toggle(
              "active",
              item === button
            );

          });

        await loadSoopClips(1);
      }
    );

  });


/* =========================
   다시보기 숨기기
========================= */

const hideReplayCheckbox =
  document.querySelector(
    "#hideReplayCheckbox"
  );

hideReplayCheckbox
  ?.addEventListener(
    "change",
    async () => {

      soopCurrentPage = 1;

      await loadSoopClips(1);

    }
  );


/* =========================
   정렬
========================= */

document
  .querySelectorAll(
    ".soop-sort-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const sort =
          button.dataset.sort ||
          "latest";

        if (
          sort === selectedSoopSort
        ) {
          return;
        }

        selectedSoopSort = sort;
        soopCurrentPage = 1;

        document
          .querySelectorAll(
            ".soop-sort-button"
          )
          .forEach(item => {

            item.classList.toggle(
              "active",
              item === button
            );

          });

        await loadSoopClips(1);
      }
    );

  });


/* =========================
   기간 필터
========================= */

document
  .querySelectorAll(".soop-period-button")
  .forEach(button => {
    button.addEventListener("click", async () => {
      const period = button.dataset.period || "all";

      if (
        period === selectedPeriod &&
        !selectedSoopStartDate &&
        !selectedSoopEndDate
      ) {
        return;
      }

      selectedPeriod = period;
      selectedSoopStartDate = "";
      selectedSoopEndDate = "";
      soopCurrentPage = 1;

      const startInput = document.querySelector("#soopStartDate");
      const endInput = document.querySelector("#soopEndDate");

      if (startInput) startInput.value = "";
      if (endInput) endInput.value = "";

      document
        .querySelectorAll(".soop-period-button")
        .forEach(item => {
          item.classList.toggle("active", item === button);
        });

      await loadSoopClips(1);
    });
  });


/* =========================
   날짜 직접 선택
========================= */

const soopStartDateInput =
  document.querySelector("#soopStartDate");

const soopEndDateInput =
  document.querySelector("#soopEndDate");

const soopDateApply =
  document.querySelector("#soopDateApply");

const soopDateReset =
  document.querySelector("#soopDateReset");

// 날짜 적용
soopDateApply?.addEventListener("click", () => {
  const startDate = soopStartDateInput?.value || "";
  const endDate = soopEndDateInput?.value || "";

  if (!startDate || !endDate) {
    alert("시작일과 종료일을 모두 선택해 주세요.");
    return;
  }

  if (startDate > endDate) {
    alert("시작일이 종료일보다 늦을 수 없어요.");
    return;
  }

  selectedSoopStartDate = startDate;
  selectedSoopEndDate = endDate;
  selectedPeriod = "all";
  soopCurrentPage = 1;

  document
    .querySelectorAll(".soop-period-button")
    .forEach(button => {
      button.classList.remove("active");
    });

  soopPageCache.clear();
  loadSoopClips(1);
});

// 날짜 초기화
soopDateReset?.addEventListener("click", () => {
  if (soopStartDateInput) soopStartDateInput.value = "";
  if (soopEndDateInput) soopEndDateInput.value = "";

  selectedSoopStartDate = "";
  selectedSoopEndDate = "";
  selectedPeriod = "all";
  soopCurrentPage = 1;

  document
    .querySelectorAll(".soop-period-button")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.period === "all"
      );
    });

  soopPageCache.clear();
  loadSoopClips(1);
  });  

  /* =========================
   새잎 커스텀 날짜 달력
========================= */

const prettyCalendar =
  document.querySelector("#soopPrettyCalendar");

const prettyCalendarTitle =
  document.querySelector("#soopCalendarTitle");

const prettyCalendarDays =
  document.querySelector("#soopCalendarDays");

const prettyStartInput =
  document.querySelector("#soopStartDate");

const prettyEndInput =
  document.querySelector("#soopEndDate");

const prettyMinDate = "2024-09-05";

let prettyActiveInput = null;
let prettyViewDate = new Date();

/* =========================
   VOD 종류별 배지
========================= */

function getSoopVodTypeBadge(type) {
  const value = String(type ?? "").toLowerCase();

  // SOOP API의 유형 값에 맞게 분류
  let badgeType = "";

  if (["review", "vod", "replay", "normal"].includes(value)) {
    badgeType = "vod";
  } else if (["clip", "clips"].includes(value)) {
    badgeType = "clip";
  } else if (["catch", "catchstory"].includes(value)) {
    badgeType = "catch";
  } else {
    return "";
  }

  const icons = {
    vod: `
      <svg viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="5"/>
        <path d="m10 8 6 4-6 4z"/>
      </svg>
    `,

    clip: `
      <svg viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="8" width="18" height="13" rx="2"/>
        <path d="M3 8V4a2 2 0 0 1 2-2h14l2 6"/>
        <path d="m7 2 4 6M14 2l4 6"/>
      </svg>
    `,

    catch: `
      <svg viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 5a9 9 0 1 0 0 14"/>
        <path d="m11 8 6 4-6 4z"/>
      </svg>
    `
  };

  const labels = {
    vod: "다시보기",
    clip: "클립",
    catch: "캐치"
  };

  return `
    <span class="soop-vod-type-badge ${badgeType}">
      ${icons[badgeType]}
      ${labels[badgeType]}
    </span>
  `;
}

function prettyFormatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function prettyRenderCalendar() {
  if (!prettyCalendar || !prettyCalendarDays) return;

  const year = prettyViewDate.getFullYear();
  const month = prettyViewDate.getMonth();

  prettyCalendarTitle.textContent =
    `${year}년 ${month + 1}월`;

  prettyCalendarDays.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // 첫 번째 날짜 앞의 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("span");
    prettyCalendarDays.appendChild(empty);
  }

  const today = prettyFormatDate(new Date());

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dateString = prettyFormatDate(date);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;

    // 일요일 / 토요일 색상
    if (date.getDay() === 0) {
      button.style.color = "#ef91a7";
    } else if (date.getDay() === 6) {
      button.style.color = "#79a7e8";
    }

    if (dateString === today) {
      button.classList.add("today");
    }

    if (dateString === prettyActiveInput?.value) {
      button.classList.add("selected");
    }

    if (dateString < prettyMinDate) {
      button.disabled = true;
    }

    button.addEventListener("click", () => {
      if (!prettyActiveInput) return;

      prettyActiveInput.value = dateString;
      prettyCalendar.hidden = true;
    });

    prettyCalendarDays.appendChild(button);
  }
}

// 날짜 입력창 클릭 시 달력 열기
function prettyOpenCalendar(input) {
  if (!prettyCalendar) return;

  prettyActiveInput = input;

  if (input.value) {
    const [year, month] = input.value.split("-").map(Number);
    prettyViewDate = new Date(year, month - 1, 1);
  } else {
    prettyViewDate = new Date();
  }

  prettyRenderCalendar();

  const rect = input.getBoundingClientRect();

  prettyCalendar.hidden = false;

  const calendarWidth = prettyCalendar.offsetWidth;
  const calendarHeight = prettyCalendar.offsetHeight;

  const left = Math.max(
    8,
    Math.min(rect.left, window.innerWidth - calendarWidth - 8)
  );

  const top =
    rect.bottom + calendarHeight + 8 <= window.innerHeight
      ? rect.bottom + 8
      : Math.max(8, rect.top - calendarHeight - 8);

  prettyCalendar.style.left = `${left}px`;
  prettyCalendar.style.top = `${top}px`;
}

prettyStartInput?.addEventListener("click", () => {
  prettyOpenCalendar(prettyStartInput);
});

prettyEndInput?.addEventListener("click", () => {
  prettyOpenCalendar(prettyEndInput);
});

// 이전 달
document
  .querySelector("#soopCalendarPrev")
  ?.addEventListener("click", () => {
    prettyViewDate.setMonth(prettyViewDate.getMonth() - 1);
    prettyRenderCalendar();
  });

// 다음 달
document
  .querySelector("#soopCalendarNext")
  ?.addEventListener("click", () => {
    prettyViewDate.setMonth(prettyViewDate.getMonth() + 1);
    prettyRenderCalendar();
  });

// 오늘 선택
document
  .querySelector("#soopCalendarToday")
  ?.addEventListener("click", () => {
    if (!prettyActiveInput) return;

    prettyActiveInput.value = prettyFormatDate(new Date());
    prettyCalendar.hidden = true;
  });

// 선택한 날짜 삭제
document
  .querySelector("#soopCalendarClear")
  ?.addEventListener("click", () => {
    if (!prettyActiveInput) return;

    prettyActiveInput.value = "";
    prettyCalendar.hidden = true;
  });

// 달력 바깥 클릭 시 닫기
document.addEventListener("click", event => {
  if (!prettyCalendar || prettyCalendar.hidden) return;

  const clickedInput =
    event.target === prettyStartInput ||
    event.target === prettyEndInput;

  if (
    !clickedInput &&
    !prettyCalendar.contains(event.target)
  ) {
    prettyCalendar.hidden = true;
  }
});


/* =========================
   VOD 모달
========================= */

const clipModal =
  document.querySelector(
    "#clipModal"
  );

const clipPlayer =
  document.querySelector(
    "#clipPlayer"
  );

const clipModalClose =
  document.querySelector(
    "#clipModalClose"
  );

document.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".soop-clip-card"
      );

    if (!card) return;

    const titleNo =
      card.dataset.titleNo;

    if (
      !titleNo ||
      !clipModal ||
      !clipPlayer
    ) {
      return;
    }

    clipPlayer.src =
  `https://vod.sooplive.com/player/${titleNo}/embed?showWater=false&autoPlay=true&mutePlay=false`;

    clipModal.classList.add(
      "show"
    );

    clipModal.setAttribute(
      "aria-hidden",
      "false"
    );
  }
);

function closeClipModal() {
  if (
    !clipModal ||
    !clipPlayer
  ) {
    return;
  }

  clipModal.classList.remove(
    "show"
  );

  clipModal.setAttribute(
    "aria-hidden",
    "true"
  );

  clipPlayer.src = "";
}

clipModalClose
  ?.addEventListener(
    "click",
    closeClipModal
  );

clipModal
  ?.addEventListener(
    "click",
    event => {

      if (
        event.target === clipModal
      ) {
        closeClipModal();
      }

    }
  );

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      clipModal
        ?.classList
        .contains("show")
    ) {
      closeClipModal();
    }

  }
);

/* =====================================
   새잎 VOD 페이지 이동 팝업
===================================== */

document.addEventListener("click", async (event) => {
  const jumpButton = event.target.closest(".soop-page-jump");

  if (!jumpButton) return;

  // 기존 팝업이 있다면 닫기
  document.querySelector(".saeip-page-popup")?.remove();

  const total = soopTotalPages;

  // 팝업 생성
  const popup = document.createElement("div");
  popup.className = "saeip-page-popup";

  popup.innerHTML = `
    <div class="saeip-page-popup-header">
      <span>🩵 페이지 바로 이동</span>
      <button type="button" class="saeip-page-close">×</button>
    </div>

    <p class="saeip-page-description">
      1 ~ ${total}페이지 중 원하는 페이지를 선택해 주세요.
    </p>

    <div class="saeip-page-input-row">
      <input
        type="number"
        class="saeip-page-input"
        min="1"
        max="${total}"
        value="${soopCurrentPage}"
      >
      <button type="button" class="saeip-page-go">이동</button>
    </div>

    <div class="saeip-page-quick">
      ${[10, 20, 30, 40, 50]
        .filter(page => page <= total)
        .map(page => `
          <button type="button" data-page="${page}">
            ${page}페이지
          </button>
        `).join("")}
    </div>

    <p class="saeip-page-error" hidden></p>
  `;

  document.body.appendChild(popup);

  // 팝업 위치: ... 버튼 위
  const rect = jumpButton.getBoundingClientRect();

  popup.style.position = "fixed";
  popup.style.left = `${Math.max(
    12,
    Math.min(rect.left, window.innerWidth - popup.offsetWidth - 12)
  )}px`;

  // 팝업을 ... 버튼 아래쪽에 표시
popup.style.top = `${rect.bottom + 12}px`;

  const input = popup.querySelector(".saeip-page-input");
  const error = popup.querySelector(".saeip-page-error");

  async function goToPage(page) {
    if (!Number.isInteger(page) || page < 1 || page > total) {
      error.hidden = false;
      error.textContent = `1~${total} 사이의 페이지를 입력해 주세요.`;
      return;
    }

    if (soopLoading) return;

    popup.remove();

    if (page === soopCurrentPage) return;

    await loadSoopClips(page);

    document.querySelector("#clips")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  popup.querySelector(".saeip-page-go").addEventListener("click", () => {
    goToPage(Number(input.value));
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      goToPage(Number(input.value));
    }
  });

  popup.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      goToPage(Number(button.dataset.page));
    });
  });

  popup.querySelector(".saeip-page-close").addEventListener("click", () => {
    popup.remove();
  });

  input.focus();
});

// 팝업 밖을 클릭하면 닫기
document.addEventListener("click", (event) => {
  const popup = document.querySelector(".saeip-page-popup");

  if (
    popup &&
    !popup.contains(event.target) &&
    !event.target.closest(".soop-page-jump")
  ) {
    popup.remove();
  }
});
