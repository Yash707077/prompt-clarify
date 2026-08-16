// toast.js — the little message that appears bottom-right.
//
// Shared by both entry points: the floating button on AI sites, and the
// right-click feature that works anywhere. Kept separate so neither has to
// depend on the other being loaded.

window.PC = window.PC || {};

(function (PC) {
  if (PC.showToast) return; // already injected into this page

  let toast = null;
  let hideTimer = null;

  PC.showToast = function (message, isError) {
    if (!toast || !document.body.contains(toast)) {
      toast = document.createElement("div");
      toast.className = "pc-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.toggle("pc-toast-error", !!isError);

    // Force a reflow so the transition runs even if the toast was already
    // visible with different text.
    void toast.offsetWidth;
    toast.classList.add("pc-toast-visible");

    clearTimeout(hideTimer);
    hideTimer = setTimeout(
      () => toast.classList.remove("pc-toast-visible"),
      3500,
    );
  };
})(window.PC);
