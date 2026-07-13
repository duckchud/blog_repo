import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { CodeChallengeMethod, OAuth2Client } from "google-auth-library";
import type { Credentials } from "google-auth-library";
import { oauth2_v2 } from "googleapis/build/src/apis/oauth2/v2.js";
import type { Server } from "node:http";
import type { BlogConfig } from "../config/config.js";
import { ConfigError } from "../config/config.js";
import { openExternalUrl } from "./browser.js";

export const BLOGGER_SCOPE = "https://www.googleapis.com/auth/blogger";
export const EMAIL_SCOPE = "https://www.googleapis.com/auth/userinfo.email";
export const OPENID_SCOPE = "openid";

const CALLBACK_PATH = "/oauth2callback";
const AUTH_TIMEOUT_MS = 10 * 60 * 1000;

interface InstalledClientSecrets {
  client_id: string;
  client_secret?: string;
}

interface AuthenticationCallbacks {
  onAuthorizationUrl?: (url: string) => void;
  onBrowserOpenError?: (error: unknown) => void;
  openUrl?: (url: string) => Promise<void>;
}

export interface AuthenticationResult {
  oauthClient: OAuth2Client;
  email?: string;
}

export class AuthenticationRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function base64Url(value: Buffer): string {
  return value.toString("base64url");
}

function statesMatch(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

async function readInstalledClientSecrets(
  clientSecretPath: string,
): Promise<InstalledClientSecrets> {
  let source: string;
  try {
    source = await readFile(clientSecretPath, "utf8");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new ConfigError(
        "Google OAuth client secret file was not found at " + clientSecretPath + ".",
      );
    }

    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new ConfigError(
      "Google OAuth client secret file is not valid JSON: " + clientSecretPath + ".",
    );
  }

  if (!isRecord(parsed) || !isRecord(parsed.installed)) {
    throw new ConfigError(
      "Use an OAuth client of type Desktop app. Its JSON must contain an installed object.",
    );
  }

  const clientId = parsed.installed.client_id;
  const clientSecret = parsed.installed.client_secret;
  if (typeof clientId !== "string" || clientId.length === 0) {
    throw new ConfigError("The OAuth client secret JSON does not contain client_id.");
  }

  return {
    client_id: clientId,
    client_secret: typeof clientSecret === "string" ? clientSecret : undefined,
  };
}

async function createOAuthClient(
  config: BlogConfig,
  redirectUri?: string,
): Promise<OAuth2Client> {
  const secrets = await readInstalledClientSecrets(config.clientSecretPath);
  return new OAuth2Client(
    secrets.client_id,
    secrets.client_secret,
    redirectUri,
  );
}

async function readTokenFile(tokenPath: string): Promise<Credentials> {
  let source: string;
  try {
    source = await readFile(tokenPath, "utf8");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new AuthenticationRequiredError(
        "No OAuth token was found. Run blog auth first.",
      );
    }

    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new AuthenticationRequiredError(
      "The OAuth token file is not valid JSON. Run blog auth again.",
    );
  }

  if (!isRecord(parsed)) {
    throw new AuthenticationRequiredError(
      "The OAuth token file has an invalid shape. Run blog auth again.",
    );
  }

  const credentials = parsed as Credentials;
  if (!credentials.refresh_token && !credentials.access_token) {
    throw new AuthenticationRequiredError(
      "The OAuth token file has no usable token. Run blog auth again.",
    );
  }

  return credentials;
}

export async function writeTokenFile(
  tokenPath: string,
  credentials: Credentials,
): Promise<void> {
  await mkdir(dirname(tokenPath), { recursive: true });
  const temporaryPath =
    tokenPath + "." + String(process.pid) + "." + String(Date.now()) + ".tmp";
  await writeFile(temporaryPath, JSON.stringify(credentials, null, 2) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporaryPath, tokenPath);
  await chmod(tokenPath, 0o600).catch(() => undefined);
}

function attachTokenPersistence(
  oauthClient: OAuth2Client,
  tokenPath: string,
  initialCredentials: Credentials,
): void {
  let currentCredentials: Credentials = { ...initialCredentials };
  oauthClient.on("tokens", (tokens: Credentials) => {
    currentCredentials = { ...currentCredentials, ...tokens };
    void writeTokenFile(tokenPath, currentCredentials).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Could not persist refreshed Google token: " + message);
    });
  });
}

export async function getAuthenticatedClient(
  config: BlogConfig,
): Promise<OAuth2Client> {
  const oauthClient = await createOAuthClient(config);
  const credentials = await readTokenFile(config.tokenPath);
  oauthClient.setCredentials(credentials);
  attachTokenPersistence(oauthClient, config.tokenPath, credentials);
  return oauthClient;
}

function listenOnLoopback(server: Server): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine OAuth loopback port."));
        return;
      }

      resolve(address.port);
    });
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
}

function sendCallbackPage(
  response: import("node:http").ServerResponse,
  statusCode: number,
  title: string,
  message: string,
): void {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
  });
  response.end(
    "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><title>" +
      title +
      "</title></head><body><h1>" +
      title +
      "</h1><p>" +
      message +
      "</p></body></html>",
  );
}

function waitForAuthorizationCode(server: Server, expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = (callback: () => void): void => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      server.off("request", onRequest);
      callback();
    };

    const onRequest = (
      request: import("node:http").IncomingMessage,
      response: import("node:http").ServerResponse,
    ): void => {
      const requestUrl = new URL(
        request.url ?? "/",
        "http://127.0.0.1",
      );
      if (requestUrl.pathname !== CALLBACK_PATH) {
        sendCallbackPage(response, 404, "Not found", "Unknown OAuth callback path.");
        return;
      }

      const authorizationError = requestUrl.searchParams.get("error");
      if (authorizationError) {
        sendCallbackPage(
          response,
          400,
          "Authorization failed",
          "Google returned: " + authorizationError,
        );
        finish(() => reject(new AuthenticationRequiredError("Google authorization failed: " + authorizationError)));
        return;
      }

      const actualState = requestUrl.searchParams.get("state");
      if (!actualState || !statesMatch(expectedState, actualState)) {
        sendCallbackPage(response, 400, "Authorization failed", "The OAuth state did not match.");
        finish(() => reject(new AuthenticationRequiredError("OAuth state verification failed.")));
        return;
      }

      const code = requestUrl.searchParams.get("code");
      if (!code) {
        sendCallbackPage(response, 400, "Authorization failed", "No authorization code was returned.");
        finish(() => reject(new AuthenticationRequiredError("Google did not return an authorization code.")));
        return;
      }

      sendCallbackPage(
        response,
        200,
        "Authorization complete",
        "You can close this window and return to the terminal.",
      );
      finish(() => resolve(code));
    };

    const timeout = setTimeout(() => {
      finish(() =>
        reject(
          new AuthenticationRequiredError(
            "OAuth authorization timed out. Run blog auth again.",
          ),
        ),
      );
    }, AUTH_TIMEOUT_MS);

    server.on("request", onRequest);
  });
}

export async function authenticateWithBrowser(
  config: BlogConfig,
  callbacks: AuthenticationCallbacks = {},
): Promise<AuthenticationResult> {
  const server = createServer();
  const port = await listenOnLoopback(server);

  try {
    const redirectUri = "http://127.0.0.1:" + String(port) + CALLBACK_PATH;
    const oauthClient = await createOAuthClient(config, redirectUri);
    const state = base64Url(randomBytes(32));
    const codeVerifier = base64Url(randomBytes(64));
    const codeChallenge = base64Url(
      createHash("sha256").update(codeVerifier).digest(),
    );
    const authorizationUrl = oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [BLOGGER_SCOPE, EMAIL_SCOPE, OPENID_SCOPE],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    });
    const authorizationCode = waitForAuthorizationCode(server, state);

    callbacks.onAuthorizationUrl?.(authorizationUrl);
    try {
      await (callbacks.openUrl ?? openExternalUrl)(authorizationUrl);
    } catch (error) {
      callbacks.onBrowserOpenError?.(error);
    }

    const code = await authorizationCode;
    const tokenResponse = await oauthClient.getToken({
      code,
      codeVerifier,
    });
    const credentials = tokenResponse.tokens;
    oauthClient.setCredentials(credentials);
    await writeTokenFile(config.tokenPath, credentials);
    attachTokenPersistence(oauthClient, config.tokenPath, credentials);
    const email = await getAuthenticatedEmail(oauthClient).catch(() => undefined);

    return {
      oauthClient,
      email,
    };
  } finally {
    await closeServer(server);
  }
}

export async function getAuthenticatedEmail(
  oauthClient: OAuth2Client,
): Promise<string | undefined> {
  const oauth = new oauth2_v2.Oauth2({
    auth: oauthClient,
  });
  const response = await oauth.userinfo.get();
  return response.data.email ?? undefined;
}
