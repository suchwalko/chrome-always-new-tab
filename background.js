const icons = {
    on: 'icons/browser-orange.png',
    off: 'icons/browser-grayscale.png'
};

const navigationSources = new Map();
const myTabs = new Set();

const sendMessage = (message) => {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, message);
        });
    });
};

const enable = () => {
    chrome.storage.local.set({ enabled: true });
    chrome.browserAction.setIcon({ path: icons.on });
    sendMessage('enabled');
};

const disable = () => {
    chrome.storage.local.set({ enabled: false });
    chrome.browserAction.setIcon({ path: icons.off });
    sendMessage('disabled');
};

const isEnabled = () => {
    return new Promise(resolve => {
        chrome.storage.local.get('enabled', (keys) => {
            if (keys.enabled) {
                resolve(true);
                return;
            }
            resolve(false)
        })
    });
};

const initializeIcon = async () => {
    if (await isEnabled()) {
        chrome.browserAction.setIcon({ path: icons.on });
        return;
    }
    chrome.browserAction.setIcon({ path: icons.off });
};

const getActiveTabId = () => {
    return new Promise(resolve => {
        chrome.tabs.query({ currentWindow: true, active: true },
            function (activeTabs) {
                const activeTab = activeTabs[0];
                if (!activeTab || !activeTab.id) {
                    resolve(null);
                    return;
                }
                resolve(activeTab.id);
            }
        );
    });
};

chrome.browserAction.onClicked.addListener(async () => {
    const enabled = await isEnabled();
    if (enabled) {
        disable();
        return;
    }
    enable();
});

chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
    navigationSources.set(details.tabId, details.sourceTabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    const targetTabId = details.tabId;
    if (navigationSources.has(targetTabId)) {
        return;
    }

    const activeTabId = await getActiveTabId();
    if (activeTabId === null) {
        return;
    }
    navigationSources.set(targetTabId, activeTabId);
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
    const sourceTabId = navigationSources.get(details.tabId);
    const isNewTab = details.tabId !== sourceTabId;
    const isMyTab = myTabs.has(details.tabId);
    const hasTransitionQualifiers = !!details.transitionQualifiers.length;

    if (details.transitionType !== 'auto_bookmark'
        || isNewTab
        || isMyTab
        || hasTransitionQualifiers) {
        return;
    }

    if (!(await isEnabled())) {
        return;
    }

    chrome.tabs.goBack(sourceTabId);
    chrome.tabs.create({ url: details.url, active: true }, (createdTab) => {
        myTabs.add(createdTab.id);
    });
});

chrome.webNavigation.onCompleted.addListener((details) => {
    myTabs.delete(details.tabId);
    navigationSources.delete(details.tabId);
});

(async () => {
    await initializeIcon();
})();
