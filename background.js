// background.js
chrome.action.onClicked.addListener(async (tab) => {
  // Make sure we can inject into this tab
  if (!tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
    try {
      // Try to send message to content script
      await chrome.tabs
        .sendMessage(tab.id, { action: "toggle" })
        .catch(async () => {
          // If content script is not loaded, inject it first
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
          // Then try sending the message again
          await chrome.tabs.sendMessage(tab.id, { action: "toggle" });
        });
    } catch (error) {
      console.error("Failed to toggle element finder:", error);
    }
  }
});
