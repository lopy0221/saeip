# 새잎의 페이지 · Saeip's Page

한 화면에 한 섹션씩 보이도록 구성한 반응형 팬페이지 템플릿입니다. 상단 메뉴 또는 마우스 휠/터치 스크롤로 소개, 프로필, 방송 규칙, 일정표, 노래책, 다시보기, 바로가기 섹션을 이동합니다.

## 파일
- `index.html`: 페이지 내용
- `style.css`: 디자인과 반응형 레이아웃
- `script.js`: 노래 검색, 외부 링크, 현재 섹션 표시

## 수정
1. `index.html`에서 소개글과 프로필 내용을 편집합니다.
2. `script.js`의 `links`에 공식 SOOP, YouTube, SNS 주소를 입력합니다.
3. `songs` 배열에 곡 정보를 `{ title: "곡명", artist: "가수", url: "https://..." }` 형태로 추가합니다.

## GitHub Pages 배포
1. GitHub 저장소 최상위에 `index.html`, `style.css`, `script.js`를 올립니다.
2. Settings → Pages → Deploy from a branch → `main` / `/(root)`를 선택하고 저장합니다.
3. 배포가 완료되면 Pages에 표시되는 URL로 접속합니다.

실제 방송 일정·공식 계정 주소는 확인되지 않아 임의로 작성하지 않았습니다. 사이트는 비공식 팬페이지이며, 캐릭터 이미지와 로고 사용 시 권리자의 정책을 확인하세요.
