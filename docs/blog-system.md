# Blogger 자동 발행 시스템

이 문서는 이 저장소를 두 대 이상의 컴퓨터에서 동기화하면서, Markdown으로
작성한 글을 Google Blogger에 안전하게 발행하는 방법을 설명합니다.

## 목표

- 개발 글과 일상 글의 원본을 Git으로 동기화한다.
- 글은 모두 Markdown 파일 하나로 관리한다.
- 같은 Markdown 파일을 다시 발행해도 Blogger 글이 중복 생성되지 않아야 한다.
- CLI와 추후 데스크톱 앱이 같은 Markdown 형식과 blog-core API를 사용한다.
- 별도 서버 없이 Google Blogger API v3만 사용한다.

## 구성

    apps/
      cli/                  현재 구현된 명령줄 앱
      desktop/              추후 Tauri plus React 앱 자리
    packages/
      blog-core/            OAuth, Blogger API, Markdown 변환 공용 모듈
    posts/
      tech/                 기술 글 원본
      daily/                일상 글 원본
    assets/                 추후 이미지 등 로컬 자산
    credentials/            이 컴퓨터에서만 쓰는 OAuth 파일, Git 제외

blog-core가 Markdown을 HTML로 바꾸고 Blogger API를 호출합니다. CLI는 입력,
파일 선택, 결과 출력만 담당합니다. 따라서 데스크톱 앱은 blog-core를 재사용해
동일한 발행 결과를 만들 수 있습니다.

## 최초 설정

### 1. Google Cloud

1. Google Cloud Console에서 프로젝트를 만든다.
2. Blogger API를 활성화한다.
3. OAuth 동의 화면을 설정한다.
4. OAuth 클라이언트를 Desktop app 유형으로 만든다.
5. 다운로드한 JSON을 credentials/client_secret.json에 둔다.

Desktop app OAuth는 브라우저와 로컬 loopback 주소를 사용합니다. Web
application 유형의 OAuth 클라이언트는 사용하지 않습니다.

### 2. 로컬 환경

    npm install
    cp .env.example .env

.env의 값을 채웁니다.

    BLOGGER_BLOG_ID=여기에_블로그_ID
    GOOGLE_CLIENT_SECRET_PATH=./credentials/client_secret.json
    GOOGLE_TOKEN_PATH=./credentials/token.json
    POSTS_DIR=./posts
    DEFAULT_POST_STATUS=draft

블로그 ID를 모르면 우선 BLOGGER_BLOG_ID를 비워 둔 채 OAuth 인증을 완료한
다음 blogs 명령으로 목록을 확인합니다.

### 3. 컴퓨터별 OAuth 인증

    npm run blog -- auth

명령이 브라우저를 열고 Google 로그인과 권한 승인을 요청합니다. 성공하면
credentials/token.json에 access token과 refresh token이 저장됩니다. 이후
명령은 refresh token으로 access token을 자동 갱신합니다.

client_secret.json, token.json, .env는 절대 Git에 커밋하지 않습니다. 회사
노트북과 개인 노트북에서는 각각 auth를 실행해 각자의 token.json을 만듭니다.

## 글 작성

새 기술 글:

    npm run blog -- new tech "AWS EC2 비용 줄이기"

새 일상 글:

    npm run blog -- new daily "서울 카페 방문 기록"

생성되는 파일 이름은 다음과 같습니다.

    posts/tech/YYYY-MM-DD-slug.md
    posts/daily/YYYY-MM-DD-slug.md

제목에 한글이 있으면 한글을 유지한 Unicode slug를 생성합니다. 이는 파일
식별자이며 Blogger 공개 URL을 직접 결정하지는 않습니다.

글 파일의 예시는 다음과 같습니다.

    ---
    title: AWS EventBridge Scheduler로 EC2 자동 종료하기
    slug: aws-eventbridge-scheduler
    type: tech
    status: draft
    labels:
      - AWS
      - EC2
      - EventBridge
    blogger_post_id:
    published_at:
    updated_at: 2026-07-10T12:00:00.000Z
    ---

    ## 개요

    본문을 작성합니다.

front matter의 blogger_post_id는 자동 관리 필드입니다. 사용자가 임의로
바꾸거나 지우면 같은 글이 중복 생성될 수 있습니다.

## 미리보기와 발행

브라우저 미리보기:

    npm run blog -- preview posts/tech/2026-07-10-example.md

미리보기 HTML만 만들기:

    npm run blog -- preview posts/tech/2026-07-10-example.md --no-open

Blogger 초안 저장:

    npm run blog -- publish posts/tech/2026-07-10-example.md --draft

공개 발행:

    npm run blog -- publish posts/tech/2026-07-10-example.md --publish

이미 Blogger ID가 있는 글만 수정:

    npm run blog -- update posts/tech/2026-07-10-example.md

로컬과 원격 상태 비교:

    npm run blog -- status posts/tech/2026-07-10-example.md

처음 publish할 때 API가 돌려준 게시글 ID와 발행 시각이 Markdown front
matter에 기록됩니다. 그 뒤 같은 파일을 publish하면 새 글을 만들지 않고 해당
ID의 기존 글을 갱신합니다.

--draft는 이미 공개된 글을 초안으로 되돌린 뒤 저장할 수 있으므로, 공개 글을
유지하면서 내용만 고치려면 update를 사용합니다.

## Markdown 변환 규칙

Blogger API에는 Markdown이 아니라 HTML이 전송됩니다.

    Markdown 파일 읽기
      -> front matter 분리
      -> 본문을 HTML로 변환
      -> Blogger API 요청
      -> 응답 ID와 시각을 같은 파일에 저장

코드 펜스는 pre와 code HTML 요소로 변환됩니다. 언어를 명시한 코드 펜스는
language-javascript와 같은 class를 유지합니다.

## 두 컴퓨터에서 안전하게 동기화하기

발행 후에는 Markdown 파일의 front matter가 바뀌므로 반드시 이를 Git으로
동기화합니다.

    git add posts
    git commit -m "Update blog post metadata"
    git push

다른 컴퓨터에서 글을 수정하기 전에는 다음을 실행합니다.

    git pull --rebase

특히 같은 글을 두 컴퓨터에서 동시에 발행하지 마세요. 최신
blogger_post_id가 없는 오래된 사본은 새 Blogger 글을 만들 수 있습니다.
충돌이 나면 blogger_post_id와 published_at 중 실제 원격 게시글에 해당하는
값을 보존한 뒤 다시 상태를 확인합니다.

## 데스크톱 앱 확장 규칙

추후 apps/desktop은 Markdown 파일을 직접 구현하거나 Blogger REST 호출을
중복하지 않습니다. packages/blog-core의 다음 역할을 재사용합니다.

- OAuth 인증과 저장 토큰 사용
- Markdown 파싱 및 HTML 변환
- Blogger 글 생성, 수정, 발행, 라벨 처리
- blogger_post_id 및 발행 시각 반영

사진 업로드 기능은 Blogger 게시글 본문에 사용할 공개 이미지 URL을 만든 뒤
Markdown 또는 HTML에 넣는 별도 자산 처리 계층으로 추가합니다. 이 규칙을
지키면 CLI와 데스크톱 앱이 서로 다른 게시글 ID 형식이나 발행 로직을 갖지
않습니다.
