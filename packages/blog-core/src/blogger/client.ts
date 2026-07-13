import type { OAuth2Client } from "google-auth-library";
import { blogger_v3 } from "googleapis/build/src/apis/blogger/v3.js";

export type BloggerClient = blogger_v3.Blogger;

export function createBloggerClient(auth: OAuth2Client): BloggerClient {
  return new blogger_v3.Blogger({
    auth,
  });
}
