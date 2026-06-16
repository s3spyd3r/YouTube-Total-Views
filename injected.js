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
