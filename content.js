function parseViews(viewStr) {
    if (!viewStr) return 0;
    const text = viewStr.toLowerCase().trim();
    const num = parseFloat(text.replace(/[,\s\u00A0]/g, ''));
    if (isNaN(num)) return 0;
    if (text.includes('k')) return num * 1e3;
    if (text.includes('m')) return num * 1e6;
    if (text.includes('b')) return num * 1e9;
    return num;
}

function findViewCountInBrowseResponse(data) {
    if (!data || typeof data !== 'object') return null;
    if (typeof data.viewCountText === 'string') {
        return data.viewCountText;
    }
    for (const key of Object.keys(data)) {
        const result = findViewCountInBrowseResponse(data[key]);
        if (result) return result;
    }
    return null;
}

(function injectFetchBridge() {
    if (window.__yttvBridgeInjected) return;
    window.__yttvBridgeInjected = true;
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            if (window.__yttvFetchWrapped) return;
            window.__yttvFetchWrapped = true;
            const originalFetch = window.fetch;
            window.fetch = function() {
                const args = arguments;
                return Promise.resolve(originalFetch.apply(this, args)).then(function(response) {
                    try {
                        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url);
                        if (url && url.indexOf('/youtubei/v1/browse') !== -1) {
                            const cloned = response.clone();
                            cloned.json().then(function(data) {
                                document.dispatchEvent(new CustomEvent('YTTV_BROWSE_RESPONSE', { detail: { data: data } }));
                            }).catch(function() {});
                        }
                    } catch (e) {}
                    return response;
                });
            };
        })();
    `;
    const target = document.head || document.documentElement || document;
    target.appendChild(script);
    script.remove();
})();

let interceptedViewCountText = null;
const viewCountWaiters = [];

document.addEventListener('YTTV_BROWSE_RESPONSE', (event) => {
    if (!event.detail || !event.detail.data) return;
    const text = findViewCountInBrowseResponse(event.detail.data);
    if (!text) return;
    interceptedViewCountText = text;
    const waiters = viewCountWaiters.splice(0);
    waiters.forEach(w => w(text));
});

function waitForViewCountText(timeoutMs = 8000) {
    if (interceptedViewCountText) return Promise.resolve(interceptedViewCountText);
    return new Promise(resolve => {
        const timeoutId = setTimeout(() => resolve(null), timeoutMs);
        viewCountWaiters.push(text => {
            clearTimeout(timeoutId);
            resolve(text);
        });
    });
}

const VIEWS_PATTERN = /^[\s\u00A0]*[\d,. \u00A0]+[\s\u00A0]*[KMB]?[\s\u00A0]*(views|visualizações|visualizaciones|vues|visualizzazioni)[\s\u00A0]*$/i;
const VIDEO_CARD_SELECTOR = [
    'ytd-rich-item-renderer',
    'ytd-grid-video-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-reel-item-renderer',
    'ytm-rich-item-renderer',
    'ytm-video-renderer',
    'ytd-shelf-renderer',
    'ytd-reel-shelf-renderer',
    'ytd-rich-shelf-renderer',
    'ytd-horizontal-card-renderer',
    'ytd-grid-shelf-renderer',
    'ytd-playlist-renderer',
    'ytd-compact-playlist-renderer',
    'ytm-shelf-renderer',
    'ytm-reel-shelf-renderer',
    'ytm-rich-shelf-renderer',
    'ytm-horizontal-card-renderer',
    'ytm-compact-video-renderer',
    'ytm-compact-playlist-renderer',
].join(', ');

function findViewsInDescriptionItems() {
    const items = document.querySelectorAll('.description-item.style-scope.ytd-about-channel-renderer');
    for (let i = items.length - 1; i >= 0; i--) {
        const text = items[i].textContent.trim();
        if (VIEWS_PATTERN.test(text)) return text;
    }
    return null;
}

function findViewsInMobileAbout() {
    const values = document.querySelectorAll('span.YtmAboutChannelRendererChannelDetailValue');
    for (let i = values.length - 1; i >= 0; i--) {
        const text = values[i].textContent.trim();
        if (VIEWS_PATTERN.test(text)) return text;
    }
    return null;
}

function findByBruteForce() {
    const root = document.body;
    if (!root) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => {
            if (node.closest(VIDEO_CARD_SELECTOR)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    let node;
    let bestText = null;
    let bestValue = 0;
    while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (VIEWS_PATTERN.test(text)) {
            const value = parseViews(text);
            if (value > bestValue) {
                bestValue = value;
                bestText = text;
            }
        }
    }
    return bestText;
}

function findViewsInPage() {
    return findViewsInDescriptionItems() || findViewsInMobileAbout() || findByBruteForce();
}

async function scrapeChannelViews(sendResponse) {
    const apiText = await waitForViewCountText();
    if (apiText) {
        sendResponse({ totalViews: parseViews(apiText), source: 'api' });
        return;
    }
    const domText = findViewsInPage();
    if (domText) {
        sendResponse({ totalViews: parseViews(domText), source: 'dom' });
    } else {
        sendResponse({ error: "Could not find channel total views. Make sure the handle is correct." });
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "scrapeChannel") {
        scrapeChannelViews(sendResponse);
        return true;
    }
});
