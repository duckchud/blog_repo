# Blogger Markdown CLI 구현 계획

## 문서 목적

이 문서는 코드 구현 전에 합의할 설계와 작업 순서를 정리한 계획서다.
현재 범위는 CLI와 공용 라이브러리이며, 데스크톱 앱은 구현하지 않는다.
다른 모델 또는 개발자가 이 문서를 기준으로 구현과 검증을 이어갈 수 있어야 한다.

## 목표와 비목표

### 목표

- 회사·개인 노트북이 Git으로 동일한 Markdown 게시글을 동기화한다.
- Markdown 파일 하나가 Blogger 게시글 하나와 안정적으로 연결된다.
- CLI에서 새 글 작성, HTML 미리보기, OAuth 인증, 초안 저장, 공개 발행,
  수정, 상태 확인, 블로그 목록 조회를 제공한다.
- Blogger 관련 로직은 UI와 분리된 blog-core에 두어 이후 Tauri 또는 Electron
  앱이 그대로 재사용한다.
- OAuth client secret, 토큰, 실제 .env는 Git에 절대 포함하지 않는다.

### 이번 범위에서 하지 않는 일

- Tauri/Electron 앱 구현
- 이미지 업로드와 Blogger 이미지 관리
- 다중 Blogger 계정 전환 UI
- 예약 발행 전용 CLI UX
- 원격 글을 Markdown으로 역변환하는 기능

## 권장 기술 결정

| 영역 | 결정 |
| --- | --- |
| 언어/런타임 | TypeScript, Node.js 20 이상 |
| 모노레포 | npm workspaces |
| CLI | Commander |
| Front matter | gray-matter |
| Markdown HTML 변환 | marked |
| Google/Blogger | googleapis 및 google-auth-library |
| 환경 설정 | dotenv |
| 패키지 형식 | ESM, TypeScript NodeNext 모듈 해석 |

pnpm을 사용해도 되지만, 첫 구현은 npm workspace 하나로 고정한다. 패키지
관리자를 섞지 않는다.

## 제안 디렉터리 구조

~~~
blog-workspace/
├─ apps/
│  ├─ cli/
│  │  ├─ src/commands/
│  │  │  ├─ auth.ts
│  │  │  ├─ blogs.ts
│  │  │  ├─ new.ts
│  │  │  ├─ preview.ts
│  │  │  ├─ publish.ts
│  │  │  ├─ status.ts
│  │  │  ├─ update.ts
│  │  │  └─ shared.ts
│  │  └─ src/index.ts
│  └─ desktop/                 # 후속 구현 예약
├─ packages/
│  └─ blog-core/
│     └─ src/
│        ├─ auth/
│        ├─ blogger/
│        ├─ config/
│        ├─ markdown/
│        └─ types/
├─ posts/
│  ├─ tech/
│  └─ daily/
├─ assets/
├─ credentials/                # .gitkeep만 추적
├─ docs/plans/
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
~~~

apps/desktop은 workspace로 등록하지 않고 예약 폴더로만 둔다. 실제
package.json을 추가하는 시점에 workspace 목록에 포함한다.

## 데이터 계약

### Markdown front matter

필수 필드:

- title: 표시할 Blogger 제목
- slug: 로컬 파일 식별자
- type: tech 또는 daily
- status: draft 또는 publish
- labels: 문자열 배열

자동 관리 필드:

- blogger_post_id: Blogger API가 반환한 ID
- published_at: 최초 공개 발행 시각
- updated_at: 마지막 성공 API 응답 시각

게시글 파일명은 다음 규칙을 따른다.

- 기술 글: posts/tech/YYYY-MM-DD-slug.md
- 일상 글: posts/daily/YYYY-MM-DD-slug.md

새 글 생성 시 제목을 Unicode 보존 slug로 바꾼다. 한국어 제목을 강제
로마자로 변환하지 않아 파일명 손실을 막는다. 공백과 구두점은 하이픈으로
정규화한다.

### 상태의 의미

로컬 status는 사용자의 의도를 나타낸다.

- draft: Blogger 초안으로 저장할 의도
- publish: Blogger 공개 글로 저장할 의도

원격 상태는 Blogger 응답을 draft, live, scheduled, deleted, unknown으로
정규화한다. status 명령은 두 상태를 함께 보여 준다.

## 공용 blog-core 설계

### config

loadBlogConfig은 프로젝트 루트의 .env와 환경 변수를 읽어 다음을 절대
경로로 정규화한다.

- BLOGGER_BLOG_ID
- GOOGLE_CLIENT_SECRET_PATH
- GOOGLE_TOKEN_PATH
- POSTS_DIR
- DEFAULT_POST_STATUS

publish, update, 원격 status 실행 시 BLOGGER_BLOG_ID가 없으면 명확한
오류를 낸다. blogs와 auth는 블로그 ID 없이도 실행 가능해야 한다.

### markdown

책임:

- 파일 읽기와 front matter 검증
- 새 글 템플릿 생성
- metadata를 원자적으로 다시 쓰기
- Markdown body를 HTML로 변환
- 임시 preview HTML 파일 생성

변환은 GFM을 활성화한 marked를 사용한다. fenced code block은 pre와 code
태그로 변환되며, 언어 정보는 language-javascript 같은 class로 유지되는지
테스트한다.

metadata 쓰기는 임시 파일을 만든 후 rename해, 쓰기 도중 중단되어도 원본
파일이 깨질 가능성을 줄인다.

### auth

Desktop app OAuth client JSON만 허용한다. 인증 흐름은 다음과 같다.

1. credentials/client_secret.json을 읽는다.
2. 127.0.0.1의 임의 포트에 loopback HTTP 서버를 연다.
3. state와 PKCE S256 verifier/challenge를 생성한다.
4. 기본 브라우저로 Google 동의 화면을 연다.
5. callback의 state와 authorization code를 검증한다.
6. code를 token으로 교환하고 credentials/token.json에 권한 0600으로 저장한다.
7. 이후 API 요청은 refresh token으로 access token을 자동 갱신한다.
8. 갱신된 token도 같은 로컬 파일에 다시 저장한다.

브라우저 자동 실행에 실패해도 로그인 URL을 터미널에 출력해 사용자가 직접
열 수 있게 한다.

계정 이메일을 출력하려면 userinfo.email 또는 OpenID 계열의 추가 scope가
필요할 수 있다. 요구사항의 Blogger scope만 유지할지, 이메일 출력용 최소
scope를 추가할지는 구현 전 Google OAuth 동작을 확인해 결정한다.

### blogger

공용 API는 다음 책임으로 나눈다.

- client.ts: OAuth2Client로 Blogger v3 client 생성
- blogs.ts: self 사용자의 블로그 목록 조회
- posts.ts: get, insert, update, publish, revert 및 상태 정규화

중복 방지 규칙은 반드시 공용 계층에서 보장한다.

1. blogger_post_id가 없으면 posts.insert를 호출한다.
2. blogger_post_id가 있으면 posts.get으로 존재와 상태를 확인한 뒤 update를
   호출한다.
3. 기존 초안을 공개할 때는 update 후 posts.publish를 호출한다.
4. 공개 글을 draft로 저장하라는 명령은 posts.revert 후 update한다.
5. 성공 응답의 post ID와 시간 정보를 호출자에게 반환한다.

API 성공 후에만 Markdown front matter를 갱신한다. 로컬 파일 기록이 실패한
경우는 중복 방지에 영향을 주므로, post ID를 콘솔에 강하게 출력하고 오류로
종료한다.

## CLI 명령 설계

| 명령 | 핵심 동작 |
| --- | --- |
| blog auth | OAuth 인증, token 저장, 인증 계정 및 접근 가능한 블로그 출력 |
| blog blogs | 관리 가능한 블로그의 이름, ID, URL 출력 |
| blog new tech "제목" | posts/tech에 초안 템플릿 생성 |
| blog new daily "제목" | posts/daily에 초안 템플릿 생성 |
| blog preview 파일 | HTML 임시 파일 생성 및 기본 브라우저 열기 |
| blog publish 파일 --draft | 새 글을 초안 생성하거나 기존 글을 초안으로 갱신 |
| blog publish 파일 --publish | 새 글 공개 생성 또는 기존 초안을 갱신 후 공개 |
| blog update 파일 | ID가 있는 원격 글의 본문/제목/라벨 수정, 원격 공개 상태 보존 |
| blog status 파일 | 로컬 front matter와 원격 상태를 함께 출력 |

publish에서 --draft와 --publish를 동시에 전달하면 오류다. 둘 다 없을 때만
DEFAULT_POST_STATUS를 사용한다.

## 구현 순서

### 1. 워크스페이스와 보안 경계

- 루트 package.json, TypeScript 설정, apps/cli와 packages/blog-core
  package.json을 만든다.
- .env.example, .gitignore, credentials/.gitkeep을 만든다.
- .gitignore에 .env, credentials 내부, token 파일, node_modules, dist를 넣는다.
- README에 설치와 Google Cloud 사전 설정을 문서화한다.

완료 기준: npm install과 TypeScript build가 가능하고 민감 파일이 git
status에 나타나지 않는다.

### 2. Markdown과 구성 모듈

- Front matter 파싱/검증 타입을 정의한다.
- 새 파일 생성, slug 처리, 날짜 기반 파일명, metadata 원자적 저장을 구현한다.
- marked HTML 변환 및 preview 문서를 구현한다.
- .env 기반 BlogConfig와 blog ID 검증을 구현한다.

완료 기준: 네트워크 없이 새 글, 파싱, preview, metadata 갱신을 테스트할 수
있다.

### 3. OAuth와 Blogger 저수준 모듈

- Desktop OAuth loopback + PKCE 인증을 구현한다.
- token 읽기/쓰기/갱신 저장을 구현한다.
- Blogger client, blogs.listByUser, post get/insert/update/publish/revert를
  구현한다.
- HTTP 404를 deleted 상태로 분류하는 오류 유틸리티를 만든다.

완료 기준: mock OAuth/Blogger client로 흐름을 단위 테스트하고, 실제 계정으로
auth와 blogs를 수동 검증할 수 있다.

### 4. CLI 조립

- Commander 진입점과 각 명령 모듈을 만든다.
- publish와 update가 공용 모듈만 사용하도록 한다.
- API 반환값으로 front matter를 갱신한다.
- 모든 사용자 오류를 짧고 실행 가능한 한국어 안내로 출력한다.

완료 기준: --help, new, preview는 OAuth 없이 작동하고, auth 이후 모든
원격 명령이 호출 경로를 가진다.

### 5. 테스트와 수동 E2E

- parser와 slug, front matter metadata, HTML code block 테스트
- publish 의사결정 표 테스트
- Blogger client mock을 이용한 create/update/publish/revert 순서 테스트
- 실제 Blogger 테스트 블로그에서 초안 생성, 공개, 수정, 재발행, 삭제 후
  status 확인
- Git ignore 검사와 npm run build/typecheck 검사

## publish 의사결정 표

| 로컬 ID | 요청 | 원격 상태 | API 동작 |
| --- | --- | --- | --- |
| 없음 | draft | 해당 없음 | insert(isDraft=true) |
| 없음 | publish | 해당 없음 | insert(isDraft=false) |
| 있음 | draft | draft | update |
| 있음 | draft | live/scheduled | revert 후 update |
| 있음 | publish | draft | update 후 publish |
| 있음 | publish | live | update |
| 있음 | 모든 값 | deleted/404 | 오류 안내; ID를 비운 뒤 명시적으로 새 글 발행 |

deleted 원격 글을 자동으로 새 글로 만들지 않는다. 사용자가 front matter의
ID를 의도적으로 비워야 새 Blogger 글이 생성된다.

## 검증 기준

구현 완료로 판단하려면 다음을 모두 만족해야 한다.

- npm run typecheck와 npm run build가 성공한다.
- blog new가 올바른 경로와 front matter를 만든다.
- blog preview가 HTML을 만들고 code block class를 보존한다.
- credentials/client_secret.json, credentials/token.json, .env가 Git에
  추적되지 않는다.
- blog auth가 토큰을 저장하고 이후 명령이 재로그인 없이 동작한다.
- 첫 publish가 ID를 파일에 기록한다.
- 같은 파일의 두 번째 publish가 새 post를 만들지 않고 update한다.
- draft와 publish 전환이 실제 Blogger 상태와 일치한다.
- status가 없는 ID, live/draft, 404 deleted를 각각 이해하기 쉽게 출력한다.

## 수동 설정 체크리스트

1. Google Cloud Console에서 Blogger API v3를 활성화한다.
2. OAuth consent screen을 설정한다.
3. OAuth client 유형을 Desktop app으로 생성한다.
4. 다운로드한 JSON을 credentials/client_secret.json에 둔다.
5. .env.example을 .env로 복사하고 BLOGGER_BLOG_ID를 설정한다.
6. npm install 후 blog auth를 실행한다.
7. blog blogs로 ID와 접근 권한을 확인한다.

## 노트북 동기화 운영 규칙

- Markdown 파일과 front matter는 Git으로 커밋한다.
- .env와 credentials 전체는 각 장비의 로컬 파일로 유지한다.
- 각 장비에서 별도로 blog auth를 실행한다.
- 다른 장비에서 수정하기 전 git pull을 먼저 실행해 최신
  blogger_post_id를 받는다.
- 같은 글의 front matter 충돌은 Blogger ID와 최신 updated_at을 보존하도록
  사람이 해결한다.

## 구현 전에 확인할 질문

1. 인증 계정 이메일 출력 때문에 추가 OAuth scope를 허용할 것인가?
2. 공개 글을 --draft로 실행했을 때 실제로 revert하는 동작을 기본값으로
   확정할 것인가?
3. DEFAULT_POST_STATUS가 publish여도 new 명령은 항상 draft를 유지할
   것인가? 이 계획은 안전을 위해 항상 draft로 제안한다.
4. Blogger API 테스트는 실제 운영 블로그가 아닌 별도 테스트 블로그에서
   수행할 수 있는가?
