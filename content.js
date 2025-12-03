console.log("Content script loaded!");

function parseViews(viewStr, lang) {
    if (!viewStr) return 0;
    
    let text = viewStr.toLowerCase().trim();
    
    // Language-specific parsing for suffixes
    if (lang === 'pt') {
        text = text.replace(/\./g, '').replace(',', '.'); // Handle thousand separators
        if (text.includes('mil')) {
            return parseFloat(text.replace('mil', '')) * 1e3;
        }
         if (text.includes('mi')) {
            return parseFloat(text.replace('mi', '')) * 1e6;
        }
    }

    const num = parseFloat(text.replace(/,/g, ''));

    if (isNaN(num)) return 0;

    if (text.includes('k')) {
        return num * 1e3;
    } else if (text.includes('m')) {
        return num * 1e6;
    } else if (text.includes('b')) {
        return num * 1e9;
    }
    
    return num;
}

async function scrapeAllViewsWithScrolling(language, sendResponse) {
    const processedElements = new Set();
    let totalViews = 0;
    
    const viewKeywords = {
        en: "views",
        pt: "visualizações"
    };
    const keyword = viewKeywords[language] || "views";
    const keywordRegex = new RegExp(keyword, 'i');


    try {
        let lastHeight = 0;
        let noNewVideosCount = 0;
        const NO_NEW_VIDEOS_THRESHOLD = 3; // Stop after 3 scrolls with no new videos

        while (noNewVideosCount < NO_NEW_VIDEOS_THRESHOLD) {
            window.scrollTo(0, document.documentElement.scrollHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const currentHeight = document.documentElement.scrollHeight;
            if (currentHeight > lastHeight) {
                noNewVideosCount = 0; // Reset counter if we scrolled
            } else {
                noNewVideosCount++; // Increment if no scroll happened
            }
            lastHeight = currentHeight;

            const spans = Array.from(
                document.querySelectorAll('span.inline-metadata-item.style-scope.ytd-video-meta-block')
            ).filter(el => !processedElements.has(el) && keywordRegex.test(el.innerText));

            if (spans.length === 0 && noNewVideosCount > 0) {
                 // If there are no spans at all, maybe we are at the end of a short list.
                 break;
            }

            for (const el of spans) {
                processedElements.add(el);
                const viewsText = el.innerText.split(keywordRegex)[0];
                totalViews += parseViews(viewsText, language);
            }
        }
        
        sendResponse({ totalViews });

    } catch (err) {
        console.error("Error scraping views:", err);
        sendResponse({ error: err.message });
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "scrapeAllViews") {
        scrapeAllViewsWithScrolling(msg.language || 'en', sendResponse);
        return true; // Keep channel open for async response
    }
});
