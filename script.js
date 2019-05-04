// (function () {
//     /**
//      * @param {string} url 
//      */
//     const isLocalUrl = (url) => {
//         const currentPage = window.location.protocol + '//' + window.location.hostname;

//         var relative = url.indexOf('http') !== 0;
//         var absolute = url.indexOf(currentPage) === 0;

//         return relative || absolute;
//     }

//     const links = document.querySelectorAll('a[href]');

//     const run = () => {
//         for (const link of links) {
//             //if(isLocalUrl(link.href)) {
//             //    continue;
//             //}
//             link.setAttribute('target', '_blank');
//         }
    
//         var navigationType = performance.getEntriesByType("navigation")[0].type;
    
//         if (navigationType == 'navigate' && history.length > 1) {
//             setTimeout(() => {
//                 console.log(navigationType);
//                 console.log(history)
//                 window.stop();
//                 const currentUrl = window.location.href;
//                 window.onbeforeunload = (e) => { window.open(currentUrl, '_blank'); return undefined; };
//                 history.back();
//             }, 5000);            
//         }
//     }

//     chrome.storage.local.get('enabled', (keys) => {
//         return;
//         if(keys.enabled) {
//             run();
//         }
//     });    
// })();

/*
performance.getEntriesByType("navigation")[0].type
"back_forward" "reload" "navigate"

history.length > 1
window.blur += () => history.back()
window.onbeforeunload = (e) => { window.open('http://abc.com', '_blank'); return undefined; }
*/