/*chrome.tabs.goBack(integer tabId, function callback)
Since Chrome 72.*/

const icons = {
    on: 'icons/browser-orange.png',
    off: 'icons/browser-grayscale.png'
}

chrome.browserAction.onClicked.addListener(() => {
    chrome.storage.local.get('enabled', (keys) => {
        if (keys.enabled) {
            chrome.storage.local.set({ enabled: false });
            chrome.browserAction.setIcon({ path: icons.off });
            return;
        }
        chrome.storage.local.set({ enabled: true });
        chrome.browserAction.setIcon({ path: icons.on });
    })
});

var navigationSources = new Map();
var myTabs = new Set();

chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
    navigationSources.set(details.tabId, details.sourceTabId);
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const targetTabId = details.tabId;
    // && navigationSources.get(targetTabId) != undefined
    if (navigationSources.has(targetTabId)) {
        return;
    }
    chrome.tabs.query({ currentWindow: true, active: true },
        function (activeTabs) {
            const activeTab = activeTabs[0];
            if(!activeTab) {
                return;
            }
            navigationSources.set(targetTabId, activeTab && activeTab.id);
        }
    );
});

chrome.webNavigation.onCommitted.addListener((details) => {
    const tabId = details.tabId;
    const sourceTabId = navigationSources.get(tabId);
    const newTab = tabId !== sourceTabId;
    const myTab = myTabs.has(tabId);
    const url = details.url;
    const transitionType = details.transitionType;
    const transitionQualifiers = details.transitionQualifiers;
    const hasTransitionQualifiers = !!transitionQualifiers.length;

    if (newTab || myTab || !['link', 'auto_bookmark'].includes(transitionType) || hasTransitionQualifiers) {
        return;
    }

    chrome.storage.local.get('enabled', (keys) => {
        if (!keys.enabled) {
            return;
        }
        chrome.tabs.goBack(sourceTabId);
        chrome.tabs.create({ url: url, active: true }, (createdTab) => {
            myTabs.add(createdTab.id);
        });
    });
});

chrome.webNavigation.onCompleted.addListener((details) => {
    myTabs.delete(details.tabId);
    navigationSources.delete(details.tabId);
});

// chrome.history.onVisited.addListener((historyItem) => {
//     if (!historyItem.url) return;
//     var lastVisitTime = historyItem.lastVisitTime;
//     chrome.history.getVisits({ url: historyItem.url }, (visitItems) => {
//         var currentVisit = visitItems.find(v => v.visitTime === lastVisitTime);
//         /* https://developers.chrome.com/extensions/history#transition_types
//         "link"	The user got to this page by clicking a link on another page.
//         "auto_bookmark"	The user got to this page through a suggestion in the UI — for example, through a menu item.
//         */
//         if (['link', 'auto_bookmark'].includes(currentVisit.transition)) {
//             chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//                 var activeTab = tabs[0];
//                 var activeTabId = activeTab.id;           
//              });
//         }
//     });
// });


// https://developers.chrome.com/extensions/webNavigation#event-onCommitted
// openerTabId: 2201
// visitTime: 1556831792055.313
// lastVisitTime: 1556831963651.305
//chrome.tabs.create({ url: newURL });





/* check this:
https://developers.chrome.com/extensions/history
https://developers.chrome.com/extensions/history#type-HistoryItem
*/