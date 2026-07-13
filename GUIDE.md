# 블로그 작성·발행 가이드 (Node Note)

이 문서는 **마크다운으로 글을 써서 Blogger(노드노트)에 올리는 전체 과정**을
따라 하기만 하면 되도록 정리한 실전 가이드입니다.

- 블로그: 노드노트 · https://nodenote-note.blogspot.com/
- 글 저장 위치: `posts/<주제>/YYYY-MM-DD-제목.md`
- 명령은 모두 프로젝트 루트(`C:\Project\00. blog`)에서 `npm run blog -- <명령>` 형태로 실행

---

## 0. 한눈에 보는 흐름

```
new (글 파일 생성)  →  파일 편집 (본문 작성)  →  preview (미리보기)
   →  publish --draft (초안 업로드)  →  [웹에서 확인·공개]  →  git 커밋/푸시
```

공개(게시)는 **직접** 합니다. 이 가이드는 초안까지 올리고, 공개는 본인이 결정합니다.

---

## 1. 주제(type) 고르기

글은 주제별 폴더에 저장됩니다. 현재 주제는 3개입니다.

| type  | 폴더          | 용도                         |
| ----- | ------------- | ---------------------------- |
| `ai`    | `posts/ai/`    | AI 기술, 모델 구현, 실습, 개념 정리 |
| `paper` | `posts/paper/` | 논문 리뷰                     |
| `etc`   | `posts/etc/`   | 잡담, 회고, 기록               |

> 세부 분류(예: LLM, Transformer)는 폴더가 아니라 각 글의 `labels`로 합니다.
> 주제를 더 추가하려면 `packages/blog-core/src/types/post.ts`의 `POST_TYPES`
> 한 줄만 고치면 됩니다.

---

## 2. 새 글 만들기

```bash
npm run blog -- new <type> "<제목>"
```

예시:

```bash
npm run blog -- new ai "LLM 파인튜닝 첫 실습"
npm run blog -- new paper "Attention Is All You Need 리뷰"
npm run blog -- new etc "이번 주 회고"
```

실행하면 `posts/<type>/2026-07-13-제목.md` 파일이 만들어지고 경로가 출력됩니다.
그 파일을 열어서 본문을 작성합니다.

---

## 3. 글 파일 구조

파일 위쪽 `---` 사이는 **설정(front matter)**, 아래는 **본문(마크다운)**입니다.

```markdown
---
title: LLM 파인튜닝 첫 실습     # 블로그에 표시될 제목
slug: llm-...                  # 파일 식별용, 건드릴 필요 없음
type: ai                       # ai / paper / etc
status: draft                  # draft(초안) / publish(공개)
labels:                        # 블로그에서 태그/카테고리 역할
  - LLM
  - 파인튜닝
blogger_post_id: ''            # 자동 관리 — 직접 수정 금지
published_at: ''               # 자동 관리
updated_at: '2026-07-13...'    # 자동 관리
---

## 개요

여기부터 본문을 마크다운으로 작성합니다.
```

- **직접 쓰는 것:** `title`, `labels`, 그리고 본문
- **자동 관리(손대지 말 것):** `blogger_post_id`, `published_at`, `updated_at`
  - 특히 `blogger_post_id`는 "이 파일 = Blogger의 그 글" 연결고리입니다.
    이게 있어야 다시 올려도 **새 글이 중복 생성되지 않고 기존 글이 수정**됩니다.

---

## 4. 미리보기

올리기 전에 HTML로 어떻게 보일지 확인합니다.

```bash
npm run blog -- preview "posts/ai/2026-07-13-제목.md"
```

- 브라우저가 열립니다. 열지 않고 파일만 만들려면 뒤에 `--no-open`을 붙입니다.

---

## 5. 초안 업로드

먼저 **초안**으로 올려서 실제 블로그 화면에서 확인하는 흐름이 안전합니다.

```bash
npm run blog -- publish "posts/ai/2026-07-13-제목.md" --draft
```

이 명령이 하는 일:
- 본문을 HTML로 변환해 Blogger에 초안으로 올림
- 처음이면 새 초안 생성 후 `blogger_post_id`를 파일에 자동 저장
- 이미 `blogger_post_id`가 있으면 기존 초안을 수정(중복 안 생김)

---

## 6. 공개(게시) — 두 가지 방법

### 방법 A. Blogger 웹에서 클릭 (직접)
1. https://www.blogger.com 에서 로그인
2. 초안 글 열어서 확인
3. **"게시(Publish)"** 클릭

> 주의: 웹에서 공개하면 로컬 `.md`의 `status`는 `draft` 그대로 남습니다.
> (동작엔 문제없지만 로컬 기록과 실제 상태가 어긋남)

### 방법 B. CLI로 공개
```bash
npm run blog -- publish "posts/ai/2026-07-13-제목.md" --publish
```
- Blogger에서 공개 + 로컬 `.md`의 `status`, `published_at`도 자동 갱신(상태 일치)

> 웹(A)으로 공개했다면, 나중에 CLI로 한 번 `--publish`나 `update`를 돌려
> 로컬 상태를 맞춰주면 깔끔합니다.

---

## 7. 이미 올린 글 수정하기

`blogger_post_id`가 있는 글은 파일을 고친 뒤 아래로 다시 반영합니다.

```bash
npm run blog -- update "posts/ai/2026-07-13-제목.md"   # 내용 재업로드
npm run blog -- status "posts/ai/2026-07-13-제목.md"   # 현재 상태 확인
```

---

## 8. Git으로 백업/동기화

글을 올리면 파일의 front matter(자동 필드)가 바뀝니다. 변경분을 커밋해 둡니다.

```bash
git add posts
git commit -m "post: 새 글 추가"
git push
```

다른 컴퓨터에서 작업을 시작하기 전엔 먼저 최신 상태를 받습니다.

```bash
git pull --rebase
```

> 같은 글을 두 컴퓨터에서 동시에 발행하지 마세요.
> 오래된 파일에 `blogger_post_id`가 없으면 Blogger에 중복 글이 생길 수 있습니다.

---

## 9. 자주 쓰는 명령 모음 (치트시트)

```bash
npm run blog -- blogs                       # 내 블로그 목록/ID 확인
npm run blog -- new ai "제목"               # 새 글 생성
npm run blog -- preview "<파일>"            # 미리보기
npm run blog -- preview "<파일>" --no-open  # 미리보기(브라우저 안 열기)
npm run blog -- publish "<파일>" --draft    # 초안 업로드
npm run blog -- publish "<파일>" --publish  # 공개 발행
npm run blog -- update "<파일>"             # 기존 글 수정 반영
npm run blog -- status "<파일>"             # 상태 확인
```

---

## 10. 문제 해결 (Troubleshooting)

**`BLOGGER_BLOG_ID is required`**
→ `.env`의 `BLOGGER_BLOG_ID`가 비어 있음. `npm run blog -- blogs`로 ID를 확인해 넣기.

**`The caller does not have permission` (blogs 실행 시)**
→ 인증한 Google 계정에 Blogger 블로그가 없거나, 다른 계정으로 인증됨.
   blogger.com에서 같은 계정으로 블로그를 만들었는지 확인. 계정이 다르면
   `npm run blog -- auth`로 재인증.

**`Requested entity was not found` (초안 재발행 시)**
→ 초안은 관리자 권한 조회가 필요. (코드에서 처리 완료된 이슈)
   재발생하면 `blogger_post_id`가 올바른지, 그 글이 아직 존재하는지 확인.

**중복 글이 생겼을 때**
→ 로컬 `.md`에 `blogger_post_id`가 비어 있는 채로 두 번 발행하면 중복 생성됨.
   Blogger 웹에서 잘못된 글을 지우고, 남길 글의 ID를 `.md`에 넣어 맞추기.

---

## 11. 글 꾸미기 (디자인 스니펫)

마크다운 본문 안에 **HTML을 그대로 써서** 박스·강조 등을 넣을 수 있습니다.
쓰는 방법은 두 가지이고, **똑같은 디자인**이 나옵니다.

- **방법 ①(바로 사용):** 아래 "인라인 버전"을 본문에 복붙. 테마와 무관하게 작동.
- **방법 ②(짧게 사용):** 아래 "CSS 클래스 적용"을 한 번 해두면, 긴 인라인 대신
  `class="..."`짧은 형태로 사용. (권장 — 글이 깔끔해짐)

> ⚠️ `preview`에 보이는 스타일과 실제 블로그가 다를 수 있습니다. 실제 반영은
> 초안으로 올려 **블로그 화면에서** 확인하세요.

### CSS 클래스 적용 (한 번만) — 방법 ②
1. Blogger → **테마(Theme)** → **맞춤설정(Customize)**
2. **고급(Advanced)** → **CSS 추가(Add CSS)**
3. `assets/blogger-styles.css` 파일 내용 전체를 붙여넣고 저장

이걸 해두면 아래 각 항목의 "클래스 버전"을 쓸 수 있습니다. 안 했으면 "인라인 버전"을 쓰면 됩니다.

### 정보/팁/경고/주의 박스

인라인 버전 (색만 바꾸면 4종):
```html
<div style="margin:16px 0; padding:12px 16px; border-left:4px solid #3b82f6; border-radius:8px; background:#eff6ff; color:#1f2937; line-height:1.6;">
💡 <strong>참고:</strong> 정보 박스입니다.
</div>
```
- 팁(초록): `border-left`색 `#10b981`, `background` `#ecfdf5`, 이모지 ✅
- 경고(주황): `#f59e0b` / `#fffbeb`, 이모지 ⚠️
- 주의(빨강): `#ef4444` / `#fef2f2`, 이모지 🚫

클래스 버전:
```html
<div class="callout callout-info">💡 <strong>참고:</strong> 정보 박스입니다.</div>
<div class="callout callout-tip">✅ 팁 박스</div>
<div class="callout callout-warn">⚠️ 경고 박스</div>
<div class="callout callout-danger">🚫 주의 박스</div>
```

### 형광펜 강조
```html
<!-- 인라인 -->
문장 중 <span style="background:#fef08a; color:#1f2937; padding:0.1em 0.3em; border-radius:3px;">이 부분</span>을 강조.
<!-- 클래스 -->
문장 중 <span class="hl">이 부분</span>을 강조.
```

### 키보드 키
```html
<!-- 인라인 -->
<kbd style="font-family:monospace; background:#f3f4f6; border:1px solid #d1d5db; border-bottom-width:2px; border-radius:4px; padding:1px 6px; color:#111827; font-size:0.9em;">Ctrl</kbd> + <kbd style="font-family:monospace; background:#f3f4f6; border:1px solid #d1d5db; border-bottom-width:2px; border-radius:4px; padding:1px 6px; color:#111827; font-size:0.9em;">C</kbd>
<!-- 클래스 (CSS 적용 시 kbd 태그만 써도 됨) -->
<kbd>Ctrl</kbd> + <kbd>C</kbd>
```

### 도입부 큰 문단
```html
<!-- 인라인 -->    <p style="font-size:1.15em; color:#4b5563;">글의 도입부를 조금 크게.</p>
<!-- 클래스 -->    <p class="lead">글의 도입부를 조금 크게.</p>
```

### 버튼형 링크
```html
<!-- 인라인 -->
<a href="https://example.com" style="display:inline-block; padding:8px 16px; background:#6366f1; color:#fff; border-radius:6px; text-decoration:none;">자세히 보기 →</a>
<!-- 클래스 -->
<a class="btn" href="https://example.com">자세히 보기 →</a>
```

### 접기/펼치기 (긴 코드나 부연 설명 숨기기)
```html
<details style="margin:16px 0; padding:8px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#f9fafb;">
  <summary style="cursor:pointer; font-weight:600;">클릭해서 펼치기</summary>
  <div style="margin-top:8px;">여기에 숨길 내용을 씁니다.</div>
</details>
```
클래스 버전: `<details class="foldbox">...</details>`

### 이미지 + 설명(캡션), 가운데 정렬
```html
<figure style="margin:16px 0; text-align:center;">
  <img src="이미지_URL" alt="설명" style="max-width:100%; border-radius:8px;">
  <figcaption style="color:#6b7280; font-size:0.9em; margin-top:6px;">그림 1. 설명 문구</figcaption>
</figure>
```
> 이미지는 Blogger 편집기에서 업로드해 URL을 얻거나, 외부 이미지 URL을 넣습니다.

> **전체 톤(폰트·색·레이아웃)** 은 스니펫이 아니라 Blogger **테마 맞춤설정**에서 바꿉니다(6번 방법 A 참고 위치와 동일 경로).

---

## 참고: 처음 1회 준비 (이미 완료됨)

새 컴퓨터에서 시작할 때만 필요합니다.

```bash
npm install                      # 의존성 설치
npm run blog -- auth             # Google 인증 (브라우저 로그인)
npm run blog -- blogs            # 블로그 ID 확인 → .env의 BLOGGER_BLOG_ID에 입력
```

`credentials.json`, `.env`, `credentials/token.json`은 비밀/개인 설정이라
Git에 올리지 않습니다(`.gitignore`로 제외됨). 인증 토큰은 컴퓨터마다 따로 만듭니다.
