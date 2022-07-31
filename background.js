// ONLY => used only for dev purposes

'use strict';


// ONLY force clear all in storage
// chrome.storage.local.clear(() => {
//     var error = chrome.runtime.lastError;
//     if (error) {
//         console.error(error);
//     } else {
//         console.log('cleared');
//     }
// });
// chrome.storage.local.clear();



// on extension installed, add right click event handler
chrome.runtime.onInstalled.addListener(() => {
    const clearAll = chrome.contextMenus.create({
        id:     'remove',
        title:  'Clear all'
    });
});



// get from storage using URL as key && clear if any changes saved
chrome.contextMenus.onClicked.addListener(() => {
    // NOTE: this is a different format to acquire current tab URL than content_script
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => { 
        const currentURL = tabs[0].url;
        const editTypes = ['h_', 'u_', 'd_', 'c_'];
        for (let i=0; i<editTypes.length; i++){
            if (editTypes[i]){
                chrome.storage.local.get([editTypes[i] + currentURL], result => {
                    if (Object.keys(result).length === 0){
                        console.log('nothing stored');
                        return;
                    } else if (Object.keys(result).length > 0) {
                        chrome.storage.local.remove([editTypes[i] + currentURL]);
                        // console.log(editTypes[i] + ' all cleared'); // ONLY
                    }
                })
            }
        }
    });
});



// remove change
function removeStorage(){
    // get full list of command + URL
    // check to see if selection is present in storage
    // if not, nothing to do
    // else create new array of object(s) to store
}
