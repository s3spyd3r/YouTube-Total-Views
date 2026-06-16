document.addEventListener("DOMContentLoaded", async () => {
    const channelEl = document.getElementById('channel');
    const resultEl = document.getElementById('result');
    const refreshBtn = document.getElementById('refresh');

    try {
        const stored = await chrome.storage.sync.get(['channel']);
        if (stored.channel) channelEl.value = stored.channel;
    } catch (e) {
        console.error('Failed to load saved channel:', e);
    }

    channelEl.addEventListener('input', () => {
        chrome.storage.sync.set({ channel: channelEl.value.trim() }).catch(err => {
            console.error('Failed to save channel:', err);
        });
    });

    function waitForTabLoad(tabId, timeoutMs = 10000) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }, timeoutMs);
            const listener = (updatedTabId, changeInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    clearTimeout(timeoutId);
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            };
            chrome.tabs.onUpdated.addListener(listener);
        });
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function sendMessageWithRetry(tabId, message) {
        for (let i = 0; i < 5; i++) {
            try {
                const response = await chrome.tabs.sendMessage(tabId, message);
                if (response) return response;
            } catch (e) {
                // Content script not ready yet, retry
            }
            await sleep(300);
        }
        return null;
    }

    async function getTotalViews() {
        const channel = channelEl.value.trim();
        if (!channel) {
            resultEl.innerText = "Enter a channel handle.";
            return;
        }

        refreshBtn.disabled = true;
        resultEl.innerText = "Calculating...";

        let win = null;
        try {
            const aboutUrl = `https://www.youtube.com/@${encodeURIComponent(channel)}/about`;
            win = await chrome.windows.create({
                url: aboutUrl,
                type: 'normal',
                focused: false,
                state: 'minimized'
            });
            const tab = win.tabs[0];
            await waitForTabLoad(tab.id);

            const response = await sendMessageWithRetry(tab.id, { action: "scrapeChannel" });

            if (response && response.error) {
                resultEl.innerText = `Error: ${response.error}`;
            } else if (response && typeof response.totalViews === 'number') {
                resultEl.innerText = `${response.totalViews.toLocaleString()} views`;
            } else {
                resultEl.innerText = "Error: No response from content script.";
            }
        } catch (err) {
            console.error("Error in popup:", err);
            resultEl.innerText = "Error: Could not fetch channel.";
        } finally {
            if (win) {
                try {
                    await chrome.windows.remove(win.id);
                } catch (e) {
                    // Window already closed
                }
            }
            refreshBtn.disabled = false;
        }
    }

    refreshBtn.addEventListener("click", getTotalViews);
});
