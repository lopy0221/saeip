/*
  새잎 팬사이트 설정
  공식 채널 URL을 links에 입력하고 노래 목록을 songs에 추가해 주세요.
*/
const links = {
  soop: "",
  youtube: "",
  sns: ""
};
const songs = [
  // { title: "곡명", artist: "가수 이름", url: "https://..." },
];
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
  const filtered = songs.filter(song => `${song.title} ${song.artist}`.toLowerCase().includes(query.toLowerCase()));
  if (!filtered.length) {
    songList.innerHTML = `<div class="empty-state"><span>♫</span><b>${songs.length ? "검색 결과가 없어요" : "노래 목록을 준비 중이에요"}</b><p>${songs.length ? "다른 곡명이나 가수 이름으로 검색해 보세요." : "script.js의 songs 배열에 실제 곡 정보를 추가해 주세요."}</p></div>`;
    return;
  }
  songList.innerHTML = filtered.map(song => `<article class="song-row"><span class="song-disc">♫</span><span class="song-meta"><b>${escapeHTML(song.title)}</b><small>${escapeHTML(song.artist)}</small></span>${song.url ? `<a href="${safeURL(song.url)}" target="_blank" rel="noopener noreferrer">듣기 ↗</a>` : ""}</article>`).join("");
}
renderSongs();
$("#songSearch").addEventListener("input", e => renderSongs(e.target.value));
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

// Supabase에서 불러온 일정이 저장되는 곳
const streamSchedule = {};

let calendarYear = 2026;
let calendarMonth = 9; // 0=1월, 9=10월
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

// 같은 날짜의 일정은 빠른 시간부터 정렬
Object.values(streamSchedule).forEach(events => {
  events.sort((a, b) => {
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
      typeElement.textContent = "-";
      timeElement.textContent = "-";
      return;
    }

    // 같은 날 여러 일정이 있으면 모두 표시
    typeElement.innerHTML = events
      .map(event => {
        let typeText = "방송";

if (event.type === "morning") {
  typeText = "아침 방송";
} else if (event.type === "afternoon") {
  typeText = "낮 방송";
} else if (event.type === "evening") {
  typeText = "저녁 방송";
} else if (event.type === "collab") {
  typeText = "합방";
} else if (event.type === "off") {
  typeText = "휴방";
} else if (event.type === "etc") {
  typeText = "기타";
}

        return escapeHTML(typeText);
      })
      .join("<br>");

    timeElement.innerHTML = events
      .map(event => escapeHTML(event.time || "-"))
      .join("<br>");
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

  if (events.some(event => event.type === "special")) {
    button.classList.add("special-event");
  }
}

    button.innerHTML = `
  <span class="day-number">${date}</span>
  ${
    events.length
      ? `<span class="event-label">
          ${events.map(event => escapeHTML(event.title)).join("<br>")}
        </span>`
      : ""
  }
`;

    button.addEventListener("click", () => {
  showCalendarDetail(key, events);
});

    days.appendChild(button);
  }

  // 2026년 10월보다 이전으로 이동 금지
  document.querySelector("#prevMonth").disabled =
    calendarYear === 2026 &&
    calendarMonth === 9;
}


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
                event.time
                  ? `· ${escapeHTML(event.time)}`
                  : ""
              }
            </h3>

            <p>
              ${escapeHTML(event.description || "방송 일정")}
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


// 처음 사이트를 열었을 때 Supabase에서 일정 가져오기
loadStreamSchedule();

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
