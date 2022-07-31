// NOTES: TRIAL && ERROR CODES


// EXECCOMMAND OBSOLETE AS OF JUL18 2022
document.designMode = "on"; 
document.execCommand("foreColor", false, "yellow"); 
document.designMode = "off";

// NOTION NOW SAFEGUARDS MODIFICATION TO THE EXISTING DOM, NO SUBTRACTIONS SEEM TO BE ALLOWED
document.getElementById('commentOn').removeAttribute('id');

// ORIGINAL INTENT WAS TO CREATE AN INPUT FIELD PER SELECTED TEXT, BUT I OPTED FOR PAGE SUMMARY
// ALSO: "style.visibility" DOES NOT WORK
getSelectedText();
createSpan("commentOn");
let newInput = document.createElement('input');
newInput.setAttribute('type', 'text');
newInput.setAttribute('placeholder', 'add comment');
newInput.classList.add('commented');
let flag = document.getElementsByClassName('commentOn');
if (flag > 0) {
    for (let i = 0; i<flag.length; i++) {
        flag[i].appendChild(newInput);
    }
} else {
    flag[0].appendChild(newInput);
}

// A DUH ATTEMPT, BUT JUST GENERATING A NEW URL WITH NEW PARAM DIDNT SAVE CHANGES
// NOTION WILL ALSO REDIRECT TO INTENDED PAGE WITHOUT WHATEVER PARAM YOUVE SET
window.location.search += '&param=1';