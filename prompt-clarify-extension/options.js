// options.js — the settings page.
//
// Stores the key and profile in chrome.storage.sync, which means they follow
// the user to any Chrome they are signed into. Same shape as the CLI's
// memory.json, so the two stay conceptually identical.

const PROFILE_FIELDS = ["work", "focus", "audience", "commonTasks", "style"];

const statusEl = document.getElementById("status");

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", !!isError);
  if (!isError) setTimeout(() => (statusEl.textContent = ""), 2500);
}

async function load() {
  const { apiKey, profile, model } = await chrome.storage.sync.get([
    "apiKey",
    "profile",
    "model",
  ]);

  if (apiKey) document.getElementById("apiKey").value = apiKey;
  if (model) document.getElementById("model").value = model;

  if (profile) {
    for (const field of PROFILE_FIELDS) {
      if (profile[field]) document.getElementById(field).value = profile[field];
    }
  }
}

async function save() {
  const apiKey = document.getElementById("apiKey").value.trim();
  const model = document.getElementById("model").value;

  // An empty key is valid — it means "use the shared pool".
  if (apiKey && (apiKey.length < 20 || apiKey.includes(" "))) {
    return setStatus("That does not look like a valid key.", true);
  }

  const profile = {};
  for (const field of PROFILE_FIELDS) {
    const value = document.getElementById(field).value.trim();
    if (!value) {
      return setStatus("Please fill in every question about you.", true);
    }
    profile[field] = value;
  }

  await chrome.storage.sync.set({ apiKey, profile, model });
  setStatus("Saved. Open ChatGPT and look for the Improve button.");
}

document.getElementById("save").addEventListener("click", save);
load();
