# Blog workspace

Markdown-first personal blogging for Google Blogger. The shared
packages/blog-core package owns OAuth, Markdown conversion, Blogger API calls,
and post ID handling. The apps/cli package is the first client; the future
desktop application will use the same core package and Markdown files.

For a Korean setup and operating guide, see docs/blog-system.md. For the
current local writing workflow, see docs/quickstart-write-and-publish.md.

## Prerequisites

- Node.js 20 or newer
- A Google account that can manage the target Blogger blog
- A Google Cloud project with the Blogger API enabled

In Google Cloud Console, create an OAuth client with the Desktop app
application type and download its JSON file. Save it locally as
credentials/client_secret.json. Do not use a Web application OAuth client.

## Setup

1. Install dependencies.

       npm install

2. Copy the environment template and set the target blog ID.

       cp .env.example .env

   Set BLOGGER_BLOG_ID in .env. If you do not know the ID yet, leave it blank,
   complete authentication, and run the blogs command.

3. Authenticate this computer.

       npm run blog -- auth

The command opens the system browser, receives the OAuth callback through a
localhost loopback address, and writes credentials/token.json. A separate
token is intentionally created on every computer.

## Commands

Run the CLI through the root workspace command:

       npm run blog -- auth
       npm run blog -- blogs
       npm run blog -- new tech "AWS EC2 비용 줄이기"
       npm run blog -- new daily "서울 카페 방문 기록"
       npm run blog -- preview posts/tech/2026-07-10-example.md
       npm run blog -- publish posts/tech/2026-07-10-example.md --draft
       npm run blog -- publish posts/tech/2026-07-10-example.md --publish
       npm run blog -- update posts/tech/2026-07-10-example.md
       npm run blog -- status posts/tech/2026-07-10-example.md

The preview command creates a temporary HTML file and opens it in the default
browser. If opening a browser is not available, it still prints the file path.

## Markdown format

Every post has front matter and a Markdown body.

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

The CLI sends rendered HTML, not Markdown, to Blogger. Marked renders fenced
code blocks as pre and code elements and preserves a language class such as
language-javascript.

The post file is the source of truth. After a successful Blogger call, the CLI
writes the returned blogger_post_id and timestamps back into the same front
matter. Re-running publish on a file with that ID updates the existing Blogger
post instead of creating a duplicate.

## Status behavior

- publish --draft creates a draft for a new file, or updates an existing post
  as a draft. A live post is first reverted to a draft.
- publish --publish creates a live post for a new file. For an existing draft,
  it updates content and then publishes it.
- update requires blogger_post_id and preserves the remote post's current
  publication state.

## Laptop synchronization

Commit and push Markdown files after publishing because their front matter
contains the Blogger post ID and timestamps.

On each computer:

1. Clone or pull this repository.
2. Run npm install.
3. Add that computer's own credentials/client_secret.json and .env.
4. Run npm run blog -- auth to create its local token.json.

The .env file, client secret, and OAuth token are ignored by Git. Before
editing the same post from another computer, pull the latest branch so its
blogger_post_id is present and a duplicate post cannot be created.
