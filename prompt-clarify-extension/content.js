// content.js — the floating Improve button on AI chat sites.
//
// Job: find the box you type in, put a button near it, and when clicked,
// replace what you typed with the improved version.
//
// The fragile part is finding the input box. Each site uses different markup
// and changes it without warning. That is the known cost of this approach —
// we try several selectors and give up gracefully rather than breaking a page.

window.PC = window.PC || {};

(function (PC) {
  if (PC.buttonReady) return;
  PC.buttonReady = true;

  const SITES = [
    {
      match: /chatgpt\.com|chat\.openai\.com/,
      selectors: ["#prompt-textarea", "div[contenteditable='true']", "textarea"],
    },
    { match: /claude\.ai/, selectors: ["div[contenteditable='true']", "textarea"] },
    { match: /gemini\.google\.com/, selectors: ["div[contenteditable='true']", "textarea"] },
  ];

  let button = null;

  function findInput() {
    const site = SITES.find((s) => s.match.test(location.hostname));
    if (!site) return null;

    for (const selector of site.selectors) {
      const elements = [...document.querySelectorAll(selector)];
      // The real input is the biggest visible one — these sites often have
      // hidden or tiny decoy fields.
      const visible = elements
        .filter((el) => el.offsetParent !== null)
        .sort(
          (a, b) =>
            b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth,
        );
      if (visible[0]) return visible[0];
    }
    return null;
  }

  function readInput(el) {
    return el.tagName === "TEXTAREA" ? el.value : el.innerText;
  }

  function writeInput(el, text) {
    if (el.tagName === "TEXTAREA") {
      // React ignores a plain .value assignment, so go through the native
      // setter and fire the event React is actually listening for.
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

  async function getInstallId() {
    const { installId } = await chrome.storage.local.get("installId");
    if (installId) return installId;
    const fresh = crypto.randomUUID();
    await chrome.storage.local.set({ installId: fresh });
    return fresh;
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
    wrap.innerHTML =
      '<div class="pc-eye"><div class="pc-pupil"></div></div>' +
      '<div class="pc-eye"><div class="pc-pupil"></div></div>';

    const pupils = [...wrap.querySelectorAll(".pc-pupil")];

    // Throttled to animation frames — a naive mousemove handler on these
    // sites fires hundreds of times a second and makes typing feel laggy.
    let pending = false;
    let lastEvent = null;

    function update() {
      pending = false;
      if (!lastEvent) return;

      for (const pupil of pupils) {
        const eye = pupil.parentElement.getBoundingClientRect();
        const cx = eye.left + eye.width / 2;
        const cy = eye.top + eye.height / 2;

        const dx = lastEvent.clientX - cx;
        const dy = lastEvent.clientY - cy;
        const angle = Math.atan2(dy, dx);

        // Move less when the cursor is close, so the eyes don't snap to the
        // rim the moment you approach. Feels like looking, not like a dial.
        const closeness = Math.min(1, Math.hypot(dx, dy) / 90);
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

  async function handleClick() {
    const input = findInput();
    if (!input) return PC.showToast("Could not find the text box.", true);

    const original = readInput(input).trim();
    if (!original) return PC.showToast("Type something first.", true);

    const { apiKey, profile, model } = await chrome.storage.sync.get([
      "apiKey",
      "profile",
      "model",
    ]);

    if (!profile) {
      return PC.showToast("Open the extension settings and finish setup.", true);
    }

    // A personal key beats the shared pool — its own quota, never contended.
    const useOwnKey = !!apiKey;

    if (!useOwnKey && !PC.PROXY_URL) {
      return PC.showToast("Add your API key in the extension settings.", true);
    }

    const label = button.querySelector(".pc-label");
    button.classList.add("pc-loading");
    label.textContent = "Thinking...";

    try {
      const improved = useOwnKey
        ? await PC.improvePrompt(original, profile, apiKey, model || "gemini-flash-latest")
        : await PC.improveViaProxy(original, profile, await getInstallId());

      if (!PC.isMeaningfullyDifferent(original, improved)) {
        PC.showToast("Already good — nothing worth changing.");
      } else {
        writeInput(input, improved);
        PC.showToast("Improved.");
      }
    } catch (error) {
      PC.showToast(error.message, true);
    } finally {
      button.classList.remove("pc-loading");
      label.textContent = "Improve";
    }
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
})(window.PC);
