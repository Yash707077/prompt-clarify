// app.js — the web version.
//
// Deliberately does very little. All the actual logic — the meta-prompt, the
// relevance rules, the rate limits — lives in the Cloudflare worker. This page
// collects five answers, stores them locally, and posts text.
//
// Nothing here is secret. There is no API key in this file, and there never
// should be: anything shipped to a browser is public, no matter how it is
// obfuscated. The key lives on the worker.

const PROXY_URL = "https://prompt-clarify-api.yashraj707077.workers.dev";

const FIELDS = ["work", "focus", "audience", "commonTasks", "style"];

const $ = (id) => document.getElementById(id);

/* ---------- googly eyes, same as the extension ---------- */

(function eyes() {
  const pupils = [...document.querySelectorAll("#eyes .pupil")];
  let pending = false;
  let last = null;

  function move(x, y) {
    for (const pupil of pupils) {
      const r = pupil.parentElement.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const angle = Math.atan2(dy, dx);
      const closeness = Math.min(1, Math.hypot(dx, dy) / 140);
      const reach = r.width * 0.2 * closeness;
      pupil.style.transform =
        `translate(${(Math.cos(angle) * reach).toFixed(2)}px, ${(Math.sin(angle) * reach).toFixed(2)}px)`;
    }
  }

  function onMove(e) {
    last = e.touches ? e.touches[0] : e;
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (last) move(last.clientX, last.clientY);
      });
    }
  }

  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("touchmove", onMove, { passive: true });
})();

/* ---------- profile, kept in this browser only ---------- */

function loadProfile() {
  try {
    const raw = localStorage.getItem("pc-profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem("pc-profile", JSON.stringify(profile));
}

function installId() {
  let id = localStorage.getItem("pc-install");
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) ||
      String(Date.now()) + Math.random().toString(36).slice(2);
    localStorage.setItem("pc-install", id);
  }
  return id;
}

/* ---------- screens ---------- */

function showApp() {
  $("setup").classList.add("hidden");
  $("app").classList.remove("hidden");
}

function showSetup() {
  const profile = loadProfile();
  if (profile) for (const f of FIELDS) $(f).value = profile[f] ?? "";
  $("app").classList.add("hidden");
  $("setup").classList.remove("hidden");
}

$("save").addEventListener("click", () => {
  const profile = {};
  for (const f of FIELDS) {
    const value = $(f).value.trim();
    if (!value) {
      $("setupMsg").textContent = "Please answer all five.";
      $("setupMsg").className = "msg err";
      return;
    }
    // Keep answers short — long ones bloat every prompt and cost quota.
    profile[f] = value.slice(0, 200);
  }
  saveProfile(profile);
  $("setupMsg").textContent = "";
  showApp();
});

$("edit").addEventListener("click", showSetup);

$("again").addEventListener("click", () => {
  $("input").value = "";
  $("result").classList.add("hidden");
  $("msg").textContent = "";
  $("input").focus();
});

$("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("output").textContent);
    $("msg").textContent = "Copied.";
    $("msg").className = "msg ok";
  } catch {
    $("msg").textContent = "Couldn't copy — select the text above instead.";
    $("msg").className = "msg err";
  }
});

/* ---------- the actual request ---------- */

$("go").addEventListener("click", async () => {
  const prompt = $("input").value.trim();
  const profile = loadProfile();

  if (!prompt) {
    $("msg").textContent = "Type something first.";
    $("msg").className = "msg err";
    return;
  }

  if (prompt.length > 4000) {
    $("msg").textContent = "That's too long. Keep it under 4000 characters.";
    $("msg").className = "msg err";
    return;
  }

  if (!profile) return showSetup();

  $("go").disabled = true;
  $("go").textContent = "Thinking...";
  $("msg").textContent = "";
  $("result").classList.add("hidden");

  try {
    const response = await fetch(PROXY_URL + "/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, profile, installId: installId() }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || "Something went wrong.");

    // textContent, never innerHTML — the response is text from a model and
    // must never be interpreted as markup.
    $("output").textContent = data.improved;
    $("result").classList.remove("hidden");

    if (typeof data.usedToday === "number") {
      $("msg").textContent = `${data.usedToday} of ${data.dailyLimit} used today.`;
      $("msg").className = "msg";
    }
  } catch (error) {
    $("msg").textContent = error.message;
    $("msg").className = "msg err";
  } finally {
    $("go").disabled = false;
    $("go").textContent = "Improve";
  }
});

/* ---------- start ---------- */

if (loadProfile()) showApp();
else showSetup();
