import type { ExtensionMessage } from "@logiq/shared";
import { pendingKey } from "@/lib/pending";

export default defineBackground(() => {
  // Clicking the toolbar icon (or Alt+L) opens the side panel.
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

  // Messages from the logiQ web app (http://localhost:3000), see externally_connectable.
  chrome.runtime.onMessageExternal.addListener((raw, sender, sendResponse) => {
    const message = raw as ExtensionMessage;

    if (message?.type === "ping") {
      sendResponse({ ok: true, version: chrome.runtime.getManifest().version });
      return;
    }

    if (message?.type === "open-solution") {
      const windowId = sender.tab?.windowId;
      // Chrome only opens the panel in response to a user gesture. Try right away (before any
      // await) while the click is fresh; if Chrome refuses, the badge asks for one click.
      const opened =
        windowId !== undefined
          ? chrome.sidePanel.open({ windowId }).then(
              () => true,
              () => false,
            )
          : Promise.resolve(false);

      void (async () => {
        const tab = await chrome.tabs.create({ url: message.url, windowId });
        if (tab.id === undefined) return;
        await chrome.storage.session.set({ [pendingKey(tab.id)]: message.ref });
        if (!(await opened)) {
          await chrome.action.setBadgeBackgroundColor({ color: "#5B4BFF", tabId: tab.id });
          await chrome.action.setBadgeText({ text: "1", tabId: tab.id });
          await chrome.action.setTitle({
            title: "logiQ: click to see your saved solution",
            tabId: tab.id,
          });
        }
        sendResponse({ ok: true, panelOpened: await opened });
      })();
      return true; // keep the channel open for the async response
    }

    sendResponse({ ok: false, error: "Unknown message" });
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    void chrome.storage.session.remove(pendingKey(tabId));
  });
});
