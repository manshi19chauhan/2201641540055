// Evaluation server endpoints 
const AUTH_API_ENDPOINT = "http://20.244.56.144/evaluation-service/auth";
const LOG_API_ENDPOINT = "http://20.244.56.144/evaluation-service/logs";

const AUTH_PAYLOAD = {
  "email": "chauhanmanshi207@gmail.com",
  "name": "manshi chauhan",
  "rollNo": "2201641540055",
  "accessCode": "sAWTuR",
  "clientID": "7b379886-4881-402b-aec4-47a2a81cb95c",
  "clientSecret": "FvYKqYcbZFxMMVtY"
};

let currentAccessToken = null;
let tokenExpiry = 0;

/**
 * Ensure we have a valid bearer token.
 */
async function ensureValidToken() {
  const stillValid =
    currentAccessToken && Date.now() < tokenExpiry - 60 * 1000; // 1 min buffer

  if (stillValid) return currentAccessToken;

  try {
    const res = await fetch(AUTH_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(AUTH_PAYLOAD)
    });

    if (!res.ok) {
      console.error("Auth failed:", res.status, res.statusText);
      currentAccessToken = null;
      return null;
    }

    const data = await res.json();
    currentAccessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return currentAccessToken;
  } catch (e) {
    console.error("Auth request error", e);
    currentAccessToken = null;
    return null;
  }
}

/**
 * Normalize values into evaluation server's required schema
 */
function normalizeLevel(level) {
  return "error"; // server only accepts "error"
}

function normalizePackage(pkg) {
  return "handler"; // server only accepts "handler"
}

/**
 * Main log function: only pushes to eval server.
 */
async function Log(stack, level, pkg, message, extras = {}) {
  const token = await ensureValidToken();
  if (!token) {
    console.error("Skipping log: no valid token.");
    return;
  }

  const payload = {
    stack: "backend",                // force backend
    level: normalizeLevel(level),    // normalize
    package: normalizePackage(pkg),  // normalize
    message: message
  };

  try {
    const res = await fetch(LOG_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Failed to send log:", res.status, res.statusText, payload);
    }
  } catch (e) {
    console.error("Error while sending log", e);
  }
}

module.exports = { Log };
