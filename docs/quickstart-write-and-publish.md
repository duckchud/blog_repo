# Blogger CLI 글 작성 빠른 시작

이 문서는 현재 로컬 프로젝트 상태를 기준으로, 첫 블로그 글을 작성하고
Blogger에 초안 저장 또는 공개 발행하는 절차를 정리합니다.

## 현재 로컬 설정

- 프로젝트 경로: `C:\Project\00. blog`
- OAuth 클라이언트 파일: `credentials.json`
- 토큰 저장 위치: `credentials/token.json`
- 글 저장 위치: `posts/tech`, `posts/daily`
- 기본 발행 상태: `draft`
- Git 원격 저장소: `https://github.com/duckchud/blog_repo.git`

`credentials.json`, `.env`, `credentials/token.json`은 비밀 정보 또는 개인
로컬 설정이므로 Git에 올리지 않습니다. 현재 `.gitignore`에 제외 규칙이
적용되어 있습니다.

## 1. Google OAuth 인증

처음 한 번은 Google 계정 인증을 해야 합니다.

```bash
npm run blog -- auth
```

브라우저가 열리면 Blogger를 사용할 Google 계정으로 로그인하고 권한을
승인합니다. 인증이 끝나면 접근 가능한 Blogger 블로그 목록이 출력됩니다.

인증 성공 후 `credentials/token.json`이 생성됩니다. 이 파일은 현재 컴퓨터에서만
사용합니다. 회사 노트북과 개인 노트북은 각각 따로 `auth`를 실행해야 합니다.

## 2. Blogger 블로그 ID 설정

블로그 목록을 다시 확인하려면 다음 명령을 실행합니다.

```bash
npm run blog -- blogs
```

출력된 블로그 중 사용할 블로그의 ID를 `.env`에 넣습니다.

```env
BLOGGER_BLOG_ID=여기에_블로그_ID
GOOGLE_CLIENT_SECRET_PATH=./credentials.json
GOOGLE_TOKEN_PATH=./credentials/token.json
POSTS_DIR=./posts
DEFAULT_POST_STATUS=draft
```

`BLOGGER_BLOG_ID`가 비어 있으면 발행 명령은 실행할 수 없습니다.

## 3. 새 글 생성

기술 글은 `tech` 타입으로 만듭니다.

```bash
npm run blog -- new tech "AWS EC2 비용 줄이기"
```

일상 글은 `daily` 타입으로 만듭니다.

```bash
npm run blog -- new daily "서울 카페 방문 기록"
```

생성 위치는 다음 규칙을 따릅니다.

```text
posts/tech/YYYY-MM-DD-slug.md
posts/daily/YYYY-MM-DD-slug.md
```

명령 실행 후 출력되는 파일 경로를 열어서 본문을 작성합니다.

## 4. Markdown 글 작성 형식

글 파일은 front matter와 본문으로 구성됩니다.

```markdown
---
title: AWS EC2 비용 줄이기
slug: aws-ec2
type: tech
status: draft
labels:
  - AWS
  - EC2
blogger_post_id:
published_at:
updated_at: 2026-07-10T00:00:00.000Z
---

# 개요

여기에 본문을 작성합니다.

## 설정 방법

본문을 계속 작성합니다.
```

주요 필드 의미는 다음과 같습니다.

- `title`: Blogger 게시글 제목
- `slug`: 로컬 파일 식별용 문자열
- `type`: `tech` 또는 `daily`
- `status`: `draft` 또는 `publish`
- `labels`: Blogger 라벨 목록
- `blogger_post_id`: Blogger 게시글 ID, 자동 관리
- `published_at`: 최초 공개 발행 시각, 자동 관리
- `updated_at`: 최근 업로드 또는 수정 시각, 자동 관리

`blogger_post_id`는 직접 수정하지 않는 것이 안전합니다. 이 값이 있어야 같은
Markdown 파일을 다시 발행할 때 새 글이 중복 생성되지 않습니다.

## 5. 미리보기

Blogger에 올리기 전에 HTML 변환 결과를 확인합니다.

```bash
npm run blog -- preview posts/tech/생성된파일.md
```

브라우저를 열지 않고 HTML 파일만 만들려면 다음 옵션을 사용합니다.

```bash
npm run blog -- preview posts/tech/생성된파일.md --no-open
```

## 6. Blogger 초안 업로드

처음에는 초안으로 올리는 흐름이 안전합니다.

```bash
npm run blog -- publish posts/tech/생성된파일.md --draft
```

이 명령은 다음 작업을 수행합니다.

- Markdown 본문을 HTML로 변환합니다.
- `blogger_post_id`가 없으면 Blogger에 새 초안을 만듭니다.
- Blogger API가 반환한 게시글 ID를 Markdown front matter에 저장합니다.
- `updated_at`을 현재 시각으로 갱신합니다.

## 7. 공개 발행

초안을 확인한 뒤 공개하려면 다음 명령을 실행합니다.

```bash
npm run blog -- publish posts/tech/생성된파일.md --publish
```

공개 발행 시 `published_at`과 `updated_at`이 Markdown front matter에
기록됩니다.

## 8. 발행한 글 수정

이미 `blogger_post_id`가 있는 글은 다음 명령으로 수정합니다.

```bash
npm run blog -- update posts/tech/생성된파일.md
```

상태를 확인하려면 다음 명령을 사용합니다.

```bash
npm run blog -- status posts/tech/생성된파일.md
```

## 9. 권장 작업 순서

첫 글은 아래 순서로 진행하면 됩니다.

```bash
npm run blog -- auth
npm run blog -- blogs
npm run blog -- new tech "첫 개발 블로그 글"
npm run blog -- preview posts/tech/생성된파일.md
npm run blog -- publish posts/tech/생성된파일.md --draft
npm run blog -- publish posts/tech/생성된파일.md --publish
```

글을 발행하거나 수정한 뒤에는 Markdown 파일의 front matter가 바뀝니다. 두
컴퓨터에서 같은 상태를 유지하려면 변경된 Markdown 파일을 Git으로 동기화해야
합니다.

```bash
git add posts
git commit -m "Update blog post"
git push
```

다른 컴퓨터에서 작업을 시작하기 전에는 먼저 최신 상태를 받습니다.

```bash
git pull --rebase
```

같은 글을 두 컴퓨터에서 동시에 발행하지 마세요. 오래된 파일에
`blogger_post_id`가 없으면 Blogger에 중복 글이 생성될 수 있습니다.
