import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEasternAISystemPrompt, buildEasternAIUserContext } from "./easternai-context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnvFile(path.join(__dirname, ".env.local"));

const PORT = Number(process.env.PORT || 3000);
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/easternai") {
      const body = await readJsonBody(req);
      const payload = await handleEasternAIRequest(body);
      sendJson(res, payload.status, payload.body);
      return;
    }

    if (req.method === "GET") {
      await serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: "Server error", detail: error.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Eastern Auto Spares server running on http://127.0.0.1:${PORT}`);
});

async function handleEasternAIRequest(body) {
  if (!GROQ_API_KEY) {
    return {
      status: 503,
      body: {
        error: "EasternAI is not configured yet.",
        detail: "Add GROQ_API_KEY to .env.local before using EasternAI chat."
      }
    };
  }

  const message = String(body?.message || "").trim();
  if (!message) {
    return { status: 400, body: { error: "Message is required." } };
  }

  const userPrompt = buildEasternAIUserContext({
    message,
    history: Array.isArray(body?.history) ? body.history : [],
    uiContext: body?.uiContext || {}
  });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_completion_tokens: 500,
      messages: [
        { role: "system", content: buildEasternAISystemPrompt() },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error: "EasternAI request failed.",
        detail: data?.error?.message || "Unknown Groq error."
      }
    };
  }

  return {
    status: 200,
    body: {
      reply: data?.choices?.[0]?.message?.content || "EasternAI could not produce a reply.",
      model: data?.model || GROQ_MODEL
    }
  };
}

async function serveStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname) || !existsSync(filePath)) {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  const file = await readFile(filePath);
  res.writeHead(200, { "Content-Type": mimeType });
  res.end(file);
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  });
}
