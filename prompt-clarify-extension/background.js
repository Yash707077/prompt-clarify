// background.js — the right-click menu and keyboard shortcut.
//
// WHY THIS EXISTS
// The floating button only appears on AI chat sites, because that is where a
// "prompt" makes sense. But people write badly everywhere — Gmail, WhatsApp
// Web, LinkedIn, a Jira ticket.
//
// This gives them a second route: select text anywhere, right-click, Improve.
//
// WHY NOT JUST PUT THE BUTTON ON EVERY SITE
// It would need the <all_urls> permission, which Chrome shows to users as
// "read and change all your data on all websites". That frightens people and
// makes store review stricter.
//
// Instead the scripts are injected only at the moment the user picks Improve,
// using activeTab + scripting. Chrome grants access to that one tab, only
// because the user acted. Same reach, far less alarming — and honestly a
// better fit, since you ask for it rather than having a button follow you
// around the internet.

const INJECT_FILES = ["config.js", "prompt.js", "toast.js", "selection.js"];

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "pc-improve",
    title: "Improve this prompt",
    contexts: ["selection", "editable"],
  });

  // First run — open setup, so the first click does not simply fail.
  const { profile } = await chrome.storage.sync.get("profile");
  if (!profile) chrome.runtime.openOptionsPage();
});

async function improveInTab(tabId, selectionText) {
  try {
    // Safe to run repeatedly: every injected file guards against re-running.
    await chrome.scripting.executeScript({
      target: { tabId },
      files: INJECT_FILES,
    });
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["content.css"],
    });

    await chrome.tabs.sendMessage(tabId, {
      type: "pc-improve-selection",
      text: selectionText ?? "",
    });
  } catch {
    // Chrome blocks injection on its own pages (chrome://, the Web Store,
    // PDF viewer). Nothing we can do, and nothing worth alarming the user
    // about — the menu item simply does nothing there.
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "pc-improve" || !tab?.id) return;
  improveInTab(tab.id, info.selectionText);
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== "improve-selection" || !tab?.id) return;
  improveInTab(tab.id, "");
});
