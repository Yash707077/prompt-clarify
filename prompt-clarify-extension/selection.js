// selection.js — "improve the text I selected", on any website.
//
// Injected on demand by background.js when the user picks Improve from the
// right-click menu. Not present on pages until then, which is why this
// extension only needs activeTab rather than access to every site you visit.

window.PC = window.PC || {};

(function (PC) {
  if (PC.selectionReady) return; // already injected into this page
  PC.selectionReady = true;

  async function readInstallId() {
    const { installId } = await chrome.storage.local.get("installId");
    if (installId) return installId;
    const fresh = crypto.randomUUID();
    await chrome.storage.local.set({ installId: fresh });
    return fresh;
  }

  /** Replaces the selection in a form field or a contenteditable. */
  function replaceSelection(text) {
    const el = document.activeElement;

    if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? el.value.length;

      // React and similar frameworks ignore a plain .value assignment, so we
      // go through the native setter and fire the event they listen for.
      const proto =
        el.tagName === "TEXTAREA"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;

      setter.call(el, el.value.slice(0, start) + text + el.value.slice(end));
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.selectionStart = el.selectionEnd = start + text.length;
      return true;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      // execCommand is deprecated but remains the only reliable way to edit a
      // contenteditable while keeping the site's own undo history working.
      if (document.execCommand("insertText", false, text)) return true;
    }

    return false;
  }

  async function copyOut(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  PC.handleSelection = async function (fromMenu) {
    const selected = (window.getSelection()?.toString() || fromMenu || "").trim();

    if (!selected) {
      return PC.showToast("Select some text first, then right-click.", true);
    }

    const { apiKey, profile, model } = await chrome.storage.sync.get([
      "apiKey",
      "profile",
      "model",
    ]);

    if (!profile) {
      return PC.showToast("Open the extension settings and finish setup.", true);
    }

    const useOwnKey = !!apiKey;
    if (!useOwnKey && !PC.PROXY_URL) {
      return PC.showToast("Add your API key in the extension settings.", true);
    }

    PC.showToast("Improving...");

    try {
      const improved = useOwnKey
        ? await PC.improvePrompt(selected, profile, apiKey, model || "gemini-flash-latest")
        : await PC.improveViaProxy(selected, profile, await readInstallId());

      if (!PC.isMeaningfullyDifferent(selected, improved)) {
        return PC.showToast("Already good — nothing worth changing.");
      }

      if (replaceSelection(improved)) {
        PC.showToast("Improved.");
      } else if (await copyOut(improved)) {
        PC.showToast("Can't edit here — copied to your clipboard instead.");
      } else {
        PC.showToast("Could not replace or copy the text.", true);
      }
    } catch (error) {
      PC.showToast(error.message, true);
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "pc-improve-selection") {
      PC.handleSelection(message.text);
    }
  });
})(window.PC);
