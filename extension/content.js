// content.js — runs inside ChatGPT / Claude / Gemini pages.
//
// Job: find the box you type in, put a button next to it, and when clicked,
// replace what you typed with the improved version.
//
// The fragile part is finding the input box. Each site uses different markup
// and changes it without warning. That is the known cost of this approach —
// see README. We try several selectors and give up gracefully.

const SITES = [
  {
    match: /chatgpt\.com|chat\.openai\.com/,
    selectors: ["#prompt-textarea", "div[contenteditable='true']", "textarea"],
  },
  {
    match: /claude\.ai/,
    selectors: ["div[contenteditable='true']", "textarea"],
  },
  {
    match: /gemini\.google\.com/,
    selectors: ["div[contenteditable='true']", "textarea"],
  },
];

function findInput() {
  const site = SITES.find((s) => s.match.test(location.hostname));
  if (!site) return null;

  for (const selector of site.selectors) {
    const elements = [...document.querySelectorAll(selector)];
    // The real input is the biggest visible one — sites often have hidden
    // or tiny decoy fields.
    const visible = elements
      .filter((el) => el.offsetParent !== null)
      .sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth);
    if (visible[0]) return visible[0];
  }
  return null;
}

function readInput(el) {
  return el.tagName === "TEXTAREA" ? el.value : el.innerText;
}

function writeInput(el, text) {
  if (el.tagName === "TEXTAREA") {
    // React ignores plain .value assignment, so we go through the native
    // setter and then fire the event React is listening for.
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    ).set;
    setter.call(el, text);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    el.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
  }
}

let button = null;
let toast = null;

/**
 * A random per-install id, so the proxy can count usage per person without
 * knowing who anyone is. No account, no email, no tracking — just a number
 * that lets the daily limit mean something.
 */
async function getInstallId() {
  const { installId } = await chrome.storage.local.get("installId");
  if (installId) return installId;

  const fresh = crypto.randomUUID();
  await chrome.storage.local.set({ installId: fresh });
  return fresh;
}

function showToast(message, isError) {
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "pc-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("pc-toast-error", !!isError);
  toast.classList.add("pc-toast-visible");
  setTimeout(() => toast.classList.remove("pc-toast-visible"), 3500);
}

async function handleClick() {
  const input = findInput();
  if (!input) return showToast("Could not find the text box.", true);

  const original = readInput(input).trim();
  if (!original) return showToast("Type something first.", true);

  const { apiKey, profile, model } = await chrome.storage.sync.get([
    "apiKey",
    "profile",
    "model",
  ]);

  if (!profile) {
    return showToast("Open the extension settings and finish setup.", true);
  }

  // A personal key beats the shared pool — it has its own quota and never
  // runs into other people's usage.
  const useOwnKey = !!apiKey;

  if (!useOwnKey && !PROXY_URL) {
    return showToast("Add your API key in the extension settings.", true);
  }

  const label = button.querySelector(".pc-label");
  button.classList.add("pc-loading");
  label.textContent = "Thinking...";

  try {
    const improved = useOwnKey
      ? await improvePrompt(original, profile, apiKey, model || "gemini-flash-latest")
      : await improveViaProxy(original, profile, await getInstallId());

    if (!isMeaningfullyDifferent(original, improved)) {
      showToast("Already good — nothing worth changing.");
    } else {
      writeInput(input, improved);
      showToast("Improved.");
    }
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.classList.remove("pc-loading");
    label.textContent = "Improve";
  }
}

/**
 * Two googly eyes that track the cursor.
 *
 * Not decoration for its own sake — the whole product is "it already knows
 * about you", and eyes that follow you say that faster than any tagline.
 * They also make the button findable on a busy page.
 */
function makeEyes() {
  const wrap = document.createElement("div");
  wrap.className = "pc-eyes";
  wrap.innerHTML = `
    <div class="pc-eye"><div class="pc-pupil"></div></div>
    <div class="pc-eye"><div class="pc-pupil"></div></div>
  `;

  const pupils = [...wrap.querySelectorAll(".pc-pupil")];

  // Throttled to animation frames — a naive mousemove handler on these sites
  // fires hundreds of times a second and makes typing feel laggy.
  let pending = false;
  let lastEvent = null;

  function update() {
    pending = false;
    if (!lastEvent) return;

    for (const pupil of pupils) {
      const eye = pupil.parentElement.getBoundingClientRect();
      const cx = eye.left + eye.width / 2;
      const cy = eye.top + eye.height / 2;

      const angle = Math.atan2(lastEvent.clientY - cy, lastEvent.clientX - cx);

      // Move less when the cursor is close, so the eyes don't snap to the
      // rim the moment you approach the button. Feels like looking, not
      // like a dial being turned.
      const dx = lastEvent.clientX - cx;
      const dy = lastEvent.clientY - cy;
      const distance = Math.hypot(dx, dy);
      const closeness = Math.min(1, distance / 90);
      const reach = eye.width * 0.2 * closeness;

      pupil.style.transform =
        `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px)`;
    }
  }

  document.addEventListener(
    "mousemove",
    (e) => {
      lastEvent = e;
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  return wrap;
}

function mountButton() {
  if (document.querySelector(".pc-button")) return;
  if (!findInput()) return;

  button = document.createElement("button");
  button.className = "pc-button";
  button.title = "prompt-clarify — rewrite this using what it knows about you";

  button.appendChild(makeEyes());

  const label = document.createElement("span");
  label.className = "pc-label";
  label.textContent = "Improve";
  button.appendChild(label);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleClick();
  });

  document.body.appendChild(button);
}

// These sites rebuild the DOM constantly, so re-check rather than mount once.
mountButton();
setInterval(mountButton, 2000);
