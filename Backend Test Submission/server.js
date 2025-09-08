const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { nanoid } = require("nanoid");
const validUrl = require("valid-url");
const { Log } = require("../logging-middleware/log");

const PORT = process.env.PORT || 4000;
const app = express();

// Trust proxy for real IPs behind reverse proxies
app.set("trust proxy", true);

app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: "http://localhost:3000" }));
app.use(helmet());

// Basic rate limit for API
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 120 }));

// Storage
const DB_FILE = path.join(__dirname, "data", "urls.json");
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({}), "utf8");

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8") || "{}");
  } catch (e) {
    Log("backend", "error", "db", "read failed", { error: e.message });
    return {};
  }
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    Log("backend", "error", "db", "write failed", { error: e.message });
  }
}

// helper to normalize URL with default scheme
function normalizeUrl(u) {
  if (!/^https?:\/\//i.test(u)) return "http://" + u;
  return u;
}

function minutesFromNow(min) {
  return new Date(Date.now() + min * 60 * 1000);
}

// API: create short URL
app.post("/shorturls", (req, res) => {
  const { url, validity, shortcode } = req.body || {};
  Log("backend", "info", "create", "incoming /shorturls", { body: req.body });

  if (!url || typeof url !== "string") {
    Log("backend", "warn", "create", "missing url");
    return res.status(400).json({ error: "url is required" });
  }

  const normalized = normalizeUrl(url.trim());
  if (!validUrl.isWebUri(normalized)) {
    Log("backend", "warn", "create", "invalid url", { url });
    return res.status(400).json({ error: "invalid url format" });
  }

  const db = loadDb();

  // shortcode validation if provided
  let code = (shortcode || "").trim();
  if (code) {
    if (!/^[A-Za-z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({ error: "shortcode must be 3-30 alphanumeric, -, _" });
    }
    if (db[code]) {
      Log("backend", "warn", "create", "shortcode collision", { code });
      return res.status(409).json({ error: "shortcode already exists" });
    }
  } else {
    // auto-generate unique code
    do { code = nanoid(6); } while (db[code]);
  }

  const validMinutes = Number.isInteger(validity) ? validity : 30; // default 30 mins
  const now = new Date();
  const expiry = minutesFromNow(validMinutes);

  db[code] = {
    url: normalized,
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    clicks: 0,
    events: [] // {ts, referrer, ip, location}
  };
  saveDb(db);

  const host = req.get("host");
  const shortLink = `${req.protocol}://${host}/${code}`;
  Log("backend", "info", "create", "short url created", { code, url: normalized });
  return res.status(201).json({ shortLink, expiry: expiry.toISOString() });
});

// API: get stats for one shortcode
app.get("/shorturls/:code", (req, res) => {
  const code = req.params.code;
  const db = loadDb();
  const item = db[code];
  if (!item) {
    return res.status(404).json({ error: "shortcode not found" });
  }
  return res.json({
    shortcode: code,
    url: item.url,
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
    clicks: item.clicks,
    events: item.events
  });
});

// API: list all (for stats page)
app.get("/shorturls", (req, res) => {
  const db = loadDb();
  const list = Object.entries(db).map(([code, v]) => ({
    shortcode: code,
    ...v
  }));
  res.json(list);
});

// Endpoint to receive frontend logs and funnel via middleware
app.post("/api/client-log", (req, res) => {
  const { stack, level, pkg, message, extras } = req.body || {};
  Log(stack || "frontend", level || "info", pkg || "client", message || "", extras || {});
  return res.json({ ok: true });
});

// Redirect handler
app.get("/:code", (req, res, next) => {
  const code = req.params.code;
  const db = loadDb();
  const item = db[code];
  if (!item) return next();

  // expiry check
  const now = new Date();
  if (item.expiresAt && now > new Date(item.expiresAt)) {
    Log("backend", "warn", "redirect", "expired access", { code });
    return res.status(410).send("This short link has expired.");
  }

  // click analytics
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
  const referrer = req.get("referer") || "direct";
  const location = coarseFromIp(ip);

  item.clicks += 1;
  item.events.push({
    ts: now.toISOString(),
    referrer,
    ip,
    location
  });
  saveDb(db);

  Log("backend", "info", "redirect", "redirecting", { code, to: item.url, ip, referrer });
  res.redirect(302, item.url);
});

// very coarse IP -> location without external calls
function coarseFromIp(ip) {
  if (!ip) return { label: "unknown" };
  if (ip.startsWith("127.") || ip === "::1") return { label: "local" };
  const parts = ip.replace("::ffff:", "").split(".");
  if (parts.length >= 2) return { label: `${parts[0]}.${parts[1]}.x.x` };
  return { label: "unknown" };
}

app.use((req, res) => res.status(404).json({ error: "not found" }));

app.listen(PORT, () => {
  Log("backend", "info", "startup", `listening on ${PORT}`);
  console.log(`URL Shortener running at http://localhost:${PORT}`);
});
