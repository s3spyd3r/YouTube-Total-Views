document.addEventListener("DOMContentLoaded", () => {
    const resultEl = document.getElementById('result');
    const refreshBtn = document.getElementById('refresh');
    const languageSelect = document.getElementById('language');

    // Load saved language and set the dropdown
    chrome.storage.sync.get(['language'], (result) => {
        if (result.language) {
            languageSelect.value = result.language;
        }
        // Automatically start on popup open
        getTotalViews();
    });

    // Save language on change
    languageSelect.addEventListener('change', () => {
        chrome.storage.sync.set({ language: languageSelect.value });
    });

    async function getTotalViews() {
        refreshBtn.disabled = true;
        resultEl.innerText = "Calculating... Please wait while scrolling...";

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url || !tab.url.includes("youtube.com")) {
                resultEl.innerText = "Navigate to a YouTube page.";
                refreshBtn.disabled = false;
                return;
            }

            const selectedLanguage = languageSelect.value;
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "scrapeAllViews",
                language: selectedLanguage
            });

            if (response && response.error) {
                resultEl.innerText = `Error: ${response.error}`;
            } else if (response) {
                resultEl.innerText = `${response.totalViews.toLocaleString()} views`;
            } else {
                 resultEl.innerText = "Error: No response from content script.";
            }
        } catch (err) {
            console.error("Error in popup:", err);
            resultEl.innerText = "Error: Could not communicate with the page. Try refreshing the YouTube tab.";
        } finally {
            refreshBtn.disabled = false;
        }
    }

    refreshBtn.addEventListener("click", getTotalViews);
});
