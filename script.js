(function () {
    var links = document.querySelectorAll('a[href]:not([target]), a[href]:not([download])');

    const run = () => {        
        for (const link of links) {
            link.setAttribute('target', '_blank');
        }
    }

    const undo = () => {
        for (const link of links) {
            link.removeAttribute('target');
        }
    }

    chrome.storage.local.get('enabled', (keys) => {
        if(keys.enabled) {
            run();
        }
    });

    chrome.runtime.onMessage.addListener((request, sender) => {
        if(request === 'enabled') {
            run();
        }
        if(request === 'disabled') {
            undo();
        }
    })
})();
