// ONLY => used for dev purposes, can && should delete
/* security error specific to Notion when manipulating DOM via extension, works via dev tools > Console
    NOTION WARNING: Reverting mutation of childList in component
    ...
    Mutation Record {type:"childList"...}
*/ 

// ONLY - clear all chrome.storage
// chrome.storage.local.clear(() => {
//     let error = chrome.runtime.lastError;
//     if (error) {
//         console.error(error);
//     } else {
//         console.log('cleared');
//     }
// });
// chrome.storage.local.clear();


// globals
const currentURL    =   window.location.href;
const head          =   document.head || document.getElementsByName('head')[0];
const body_div_ID   =   "#notion-app";
const editTypes     =   ['h_', 'u_', 'd_'];
let parentTag;
let divTagList      =   [];
const stickyMenu = 
    '<div class="sticky-toolbar-container">' +
        '<button type="button" class="open-toolbar toggle-toolbar">' +
            '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/arrow_left.png">' +
        '</button>' +
        '<div class="sticky-toolbar">' +
            '<button id="highlight">' +
                '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/highlighter.png">' +
            '</button>' +
            '<button id="underline">' +
                '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/underline.png">' +
            '</button>' +
            '<button id="delete">' +
                '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/delete.png">' +
            '</button>' +
            '<button id="summary">' +
                '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/summary.png">' +
            '</button>' +
            '<button type="button" class="close-toolbar toggle-toolbar">' +
                '<img src="chrome-extension://jmnggonelndondgnmoafagecppgfpdhp/Assets/arrow_right.png">' +
    '</button></div></div>';
const addCSS = 
    '.sticky-toolbar-container {' +
        'position: fixed;' +
        'top: 50%;' +
        'right: 0;' +
        'transform: translateY(-50%);' +
        'width: 30px;' +
        'z-index: 2;' +
        'text-align: center}' +
    '.sticky-toolbar-container .toggle-toolbar.open-toolbar {' +
        'position: absolute;' +
        'top: 50%;' +
        'right: 0;' +
        'transform: translateY(-50%)}' +
    '.sticky-toolbar-container .sticky-toolbar {' +
        'display: flex;' +
        'flex-direction: column;' +
        'transform: translateX(100%)}' +
    '.sticky-toolbar-container .toggle-toolbar.open-toolbar, .sticky-toolbar-container .sticky-toolbar {' +
        'transition: transform 0.2s;}' +
    '.sticky-toolbar-container .sticky-toolbar > *, .sticky-toolbar-container .toggle-toolbar.open-toolbar {' +
        'padding: 2px}' +
    '.sticky-toolbar-container .sticky-toolbar {' +
        'position: relative;' +
        'display: inline-block;' +
        'margin-bottom: 1px}' +
    '.sticky-toolbar-container .sticky-toolbar a::before, .sticky-toolbar-container .sticky-toolbar a::after {' +
        'position: absolute;' +
        'top: 50%;' +
        'transform: translateY(-50%);' +
        'opacity: 0;' +
        'pointer-events: none;' +
        'transition: opacity 0.2s}' +
    '.sticky-toolbar-container .sticky-toolbar a:hover::before, .sticky-toolbar-container .sticky-toolbar a:hover::after {' +
        'opacity: 1}' +
    '.sticky-toolbar-container.show-toolbar .open-toolbar {' +
        'transform: translateY(-50%) translateX(100%)}' +    
    '.sticky-toolbar-container.show-toolbar .sticky-toolbar {' +
        'transform: none}' +
    '.highlighted{' +
        'background-color: yellow}' +
    '.underlined{' +
        'text-decoration: underline red}' +
    '.deleted{' +
        'text-decoration: line-through}';

chrome.storage.local.get(null, data => console.info(data));
console.log([...document.getElementsByTagName('*')]);



// 1. add <style> to <head>
style       =   document.createElement('style');
style.type  =   'text/css';
head.appendChild(style);

// 2. add CSS content to <style>
if (style.styleSheet) {
    style.styleSheet.cssText = addCSS;
} else {
    style.appendChild(document.createTextNode(addCSS));
}





// 1. add toolbar to (mid-right of) DOM
document.body.insertAdjacentHTML('afterbegin', stickyMenu);

// 2. add toggle to toolbar
const toggleToolbar             =   document.querySelectorAll(".toggle-toolbar");
const stickyToolbarContainer    =   document.querySelector(".sticky-toolbar-container");
toggleToolbar.forEach((element) => {
    element.addEventListener("click", () => {
        stickyToolbarContainer.classList.toggle("show-toolbar");
    });
});

// 3. add command to toolbar>buttons
document.getElementById("highlight").addEventListener("click", () => {
    highlight();
})
document.getElementById("underline").addEventListener("click", () => {
    underline();
})
document.getElementById("delete").addEventListener("click", () => {
    lineThrough();
})
document.getElementById("summary").addEventListener("click", () => {
    addSummary();
})




// 0. call function
setDivTagList();


// get list of <div>s in page for iteration
// mutation observer as page contains dynamic elements
function setDivTagList() {

    parentTag = document.getElementsByClassName("notion-frame")[0];
    if (!parentTag) {
        setTimeout(setDivTagList, 500);
        return;
    } else {

        let observer = new MutationObserver(record => {
            // console.log(record); // ONLY
            parentTag = [...document.getElementsByClassName("notion-frame")][0];
            divTagList = [...parentTag.getElementsByTagName("div")];
            loadChanges();
            
            observer.disconnect();
        })

        observer.observe(parentTag, {
            childList:      true,
            attributes:     true,
            characterData:  true,
            subtree:        true
        })
    }
};





// load summary
function loadSummary() {
    chrome.storage.local.get(['c_' + currentURL], result => {
        // console.log(result); // ONLY        
        if (Object.keys(result).length > 0) {
            shortSummary.value  =   result['c_' + currentURL];
        }
    })
}


// load other changes
function loadChanges() {

    for (let i = 0; i < editTypes.length; i++) {
        chrome.storage.local.get([editTypes[i] + currentURL], result => {
            if (Object.keys(result).length > 0) {
                if (editTypes[i] === 'h_') {

                    // console.log(result); // ONLY
                    for (let j = 0; j < result['h_'  + currentURL].length; j++) {
                        reBuildChanges(
                            result['h_' + currentURL][j]['containerInnerText'],
                            result['h_' + currentURL][j]['containerTag'],
                            result['h_' + currentURL][j]['startOffset'],
                            result['h_' + currentURL][j]['endOffset']
                        );

                    }

                } else if (editTypes[i] === 'u_') {
                    for (let i = 0; i < Object.keys(result).length; i++) {
                        // コピペ
                    }
                } else if (editTypes[i] === 'd_') {                    
                    for (let i = 0; i < Object.keys(result).length; i++) {
                        // コピペ
                    }
                }
            }
        })
    }
}


// rebuild stored changes
function reBuildChanges(containerInnerText, containerTag, startOffset, endOffset) {

    if (containerTag === "DIV") { // reduce load
        for (let i = 0; i < divTagList.length; i++) {

            if (
                divTagList[i].innerText === containerInnerText &&
                divTagList[i].childElementCount === 0
                // [...divTagList[i].childNodes][0].firstChild === null
            ){
                let targetTag   =   divTagList[i];
                console.log([].indexOf.call(document.getElementsByTagName('*'), targetTag));
                // console.log(targetTag);
                // console.log([].indexOf.call(targetTag, containerInnerText));
                let range       =   document.createRange();
                console.log(targetTag.firstChild);
                range.setStart(targetTag.firstChild, 1);
                range.setEnd(targetTag.firstChild, 6);
                console.log(range);
                let newElement = document.createElement('span');
                newElement.classList.add('highlighted');
                range.surroundContents(newElement);
                console.log('highlighted');
            }

        }
    } else if (containerTag !== "DIV") {

        let targetTags = parentTag.getElementsByTagName(containerTag);
        targetTags = [...targetTags];
        
        for (let i = 0; i < targetTags.length; i++) {

            if (
                targetTags[i].childElementCount === 0 &&
                targetTags[i].innerText === containerInnerText
                // [...targetTags[i].childNodes][0].firstChild === null
            ){
                // コピペ
            }
        }
    }
}







// set range object
function getSelectedText() {
    let selected = window.getSelection();
    if (selected.rangeCount && selected.getRangeAt) {
        range = selected.getRangeAt(0);
        console.log(range);
        console.log(range.startOffset);
        console.log(range.endOffset);
    }
    if (range) {
        selected.removeAllRanges();
        selected.addRange(range);
    }
}


// surround selected text with new tag
function createSpan(addClass) {
    try {
        let newElement = document.createElement('span');
        newElement.classList.add(addClass);
        range.surroundContents(newElement);
    } catch (error) {
        if (error instanceof DOMException) {
            alert('overlapping edits are disallowed');
        }
    }
}


// store change made to chrome local
function storeChange(command) {
    let changesMade = {};
    chrome.storage.local.get([command + currentURL], result => {
        if (Object.keys(result).length === 0) {

            changesMade[command + currentURL] = [
                { 
                    'containerTag': range.startContainer.parentNode.tagName,
                    'containerInnerText': range.commonAncestorContainer.parentNode.innerText,
                    'startOffset': range.startOffset,
                    'endOffset': range.endOffset
                }
            ]

            chrome.storage.local.set(changesMade, () => {
                console.log(changesMade); // ONLY
            })

        } else {

            let addChange = {
                'containerTag': range.startContainer.parentNode.tagName,
                'containerInnerText': range.commonAncestorContainer.parentNode.innerText,
                'startOffset': range.startOffset,
                'endOffset': range.endOffset
            }
            result[command + currentURL].push(addChange);

            chrome.storage.local.set(result, () => {
                console.log(result); // ONLY
            })
        }
        // callback();
    })
    // chrome.storage.local.get(null, data => console.info(data)); // ONLY
}





// highlight selected text
function highlight() {
    try {
        getSelectedText();
        storeChange('h_').then(createSpan('highlighted'));
    } catch (error) {
        if (error instanceof DOMException) {
            alert('overlapping edits are disallowed');
        }
    }
}


// underline selected text
function underline() {
    getSelectedText();
    storeChange('u_').then(createSpan('underlined'));
}


// delete (line-through) selected text
function lineThrough() {
    getSelectedText();
    storeChange('d_').then(createSpan('deleted'));
}


// add summary to page
function addSummary() {
    let shortSummary = document.getElementById('shortSummary');

    if (!shortSummary) {

        const inputElmt = document.createElement('textarea');
            inputElmt.setAttribute('id', 'shortSummary');
            inputElmt.setAttribute('rows', '4');
            inputElmt.setAttribute('cols', '50');
            inputElmt.setAttribute('style', 'display: inline');
        document.body.prepend(inputElmt);
        loadSummary();

    } else if (shortSummary && shortSummary.style.display === 'inline') {

        if (shortSummary.value) {
            let changesMade = {};
            changesMade['c_' + currentURL] = shortSummary.value;
            chrome.storage.local.set(changesMade, () => {
                // console.log('logged summary'); // ONLY
            })
            // chrome.storage.local.get(null, data => console.info(data)); // ONLY
        }
        shortSummary.style.display = 'none';

    } else if (shortSummary && shortSummary.style.display === 'none') {
        shortSummary.style.display = 'inline';
    }
}