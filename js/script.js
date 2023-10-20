let gridRows = 12;
let gridCols = 12;
let keepAR   = false;
let idealAR  = 1;
let penColor = 'black';
let backgroundColor = 'white';

/* DOM elements ---------------------------------------- */

let oneColorBtn    = document.querySelector('#oneColorBtn');
let randomColorBtn = document.querySelector('#randomColorBtn');
let gradientBtn    = document.querySelector('#gradientBtn');
let eraserBtn      = document.querySelector('#eraserBtn');
let clearGridBtn   = document.querySelector('#clearGridBtn');
let newGridBtn     = document.querySelector('#newGridBtn');

let nRowsSel = document.querySelector('#nRowsSel');
let nColsSel = document.querySelector('#nColsSel');
let nRowsLbl = document.querySelector('#nRowsLbl');
let nColsLbl = document.querySelector('#nColsLbl');

let keepARSel   = document.querySelector('#keepARSel');
let showGridSel = document.querySelector('#showGridSel');
let fixedARInfo = document.querySelector('#fixedARInfo');
let gridInfo    = document.querySelector('#gridInfo');

let oneColorSel = document.querySelector('#oneColorSel');

let grid     = document.querySelector('.grid');
let gridCnt  = document.querySelector('.grid-container');
let gridDivs; /* Array, generated dynamically */

/* Helper functions */
function removeDescendants(elem){
    while (elem.hasChildNodes()) {
        removeDescendants(elem.lastChild)
        elem.removeChild(elem.lastChild);
    }
}

/* Grid creation */

function setAspectRatio(elem, ar){
    elem.style.aspectRatio = ar;
}

function createGrid(gridRows,gridCols){

    deleteGrid();

    let gridAR = gridCols/gridRows;
    let gridCntAR = gridCnt.offsetWidth / gridCnt.offsetHeight;

    setAspectRatio(grid, gridAR);

    if (gridAR>=gridCntAR){
        gridCnt.style.flexDirection =  'row';  
    }else{
        gridCnt.style.flexDirection =  'column';  
    }   

    for (let i=0;i<gridRows;i++){
        let row = document.createElement('div');
        row.classList.add('rowOfGrid');
        for (let j=0; j<gridCols; j++){
            let elem = document.createElement('div');
            elem.classList.add('elemOfGrid');
            elem.classList.add('unselectable');
            elem.style.backgroundColor = 'white';
            elem.currentColor = elem.style.backgroundColor;

            elem.addEventListener("pointerdown",pointerDownCallback);
            elem.addEventListener('pointerenter',pointerEnterCallback);
            elem.addEventListener('pointerleave',pointerLeaveCallback);

            row.appendChild(elem);
        }
        grid.appendChild(row);
    }

    gridDivs = document.querySelectorAll('.elemOfGrid');

    if (showGridSel.value=='1'){
        showGrid();
    }

    updateGridInfo();
}


/* Settings interface*/

nRowsSel.addEventListener('input',(e) => {
    if (keepAR){
        gridRows = e.target.value;
        gridCols = Math.round(idealAR*gridRows);

        if (gridCols>e.target.max){
            gridCols=e.target.max;
            gridRows = Math.round(gridCols/idealAR);
            nRowsSel.value = gridRows;
        } else if (gridCols<e.target.min){
            gridCols=e.target.min;
            gridRows = Math.round(gridCols/idealAR);
            nRowsSel.value = gridRows;
        }

        nColsLbl.textContent = gridCols;
        nRowsLbl.textContent = gridRows;
        nColsSel.value = gridCols; 
    } else {  
        gridRows = e.target.value;
        nRowsLbl.textContent = gridRows;   
    }

    createGrid(gridRows,gridCols); 
});

nColsSel.addEventListener('input',(e) => {
    if (keepAR){
        gridCols = e.target.value;
        gridRows = Math.round(gridCols/idealAR);

        if (gridRows>e.target.max){
            gridRows=e.target.max;
            gridCols = Math.round(idealAR*gridRows);
            nColsSel.value = gridCols; 
        } else if (gridRows<e.target.min){
            gridRows=e.target.min;
            gridCols = Math.round(idealAR*gridRows);
            nColsSel.value = gridCols; 
        }

        nColsLbl.textContent = gridCols;
        nRowsLbl.textContent = gridRows;
        nRowsSel.value = gridRows; 
    } else {  
        gridCols = e.target.value;
        nColsLbl.textContent = gridCols;   
    }
    createGrid(gridRows,gridCols);  
});
   
keepARSel.addEventListener('input',(e) => {
    idealAR = gridCols/gridRows;
    keepAR = e.target.value=='1';

    updateFixedARInfo();
});


showGridSel.addEventListener('input',(e) => {
    if (e.target.value=='1'){
        showGrid();
    } else {
        hideGrid();
    }
});

function showGrid(){
    gridDivs.forEach(itm =>{
        itm.classList.add('showGrid');
    });    
}

function hideGrid(){
    gridDivs.forEach(itm =>{
        itm.classList.remove('showGrid');
    });    
}

function updateFixedARInfo(){
    let idealARToPrec = idealAR.toPrecision(2);
    let isApprox = idealAR != idealARToPrec;
    let strAR = keepAR?(isApprox?'∼':'') + idealARToPrec + ' ('+gridCols + ':' + gridRows + ')': 'none';
    fixedARInfo.textContent = strAR;
}

function updateGridInfo(){
    let gridAR = gridCols/gridRows;
    let gridARToPrec = gridAR.toPrecision(2);
    let isApprox = gridAR != gridARToPrec;
    let strAR = gridCols + 'x' + gridRows + ' (AR: ' + (isApprox?'∼':'') + gridARToPrec + ')';
    gridInfo.textContent = strAR;
}

/* One color mode ---------------------------------------------------------- */

// The following behaviour is imposed:
//
// - If the user is using a mouse, hovering on an element just temporarly set the 
//   color of the element to the selected one. The change is permanent only if a 
//   left click occurs in such element, or the left mouse button is pressed when 
//   the pointer either enters  or leaves it. Otherwise, the previous color 
//   (element.currentColor) is restored once the mouse leaves.
//
// - If the user is using touch, the changes are always permanent when
//   a touch or a slide occur.
// 
// To implement this behaviour, the 'pointerenter' and 'pointerleave' events can 
// be used.
// See https://stackoverflow.com/questions/27908339/js-touch-equivalent-for-mouseenter
//
// Note that PointerDown events are fired when a left/right/middle mouse buttons 
// are pressed or a touch occurs. This causes the element to 'capture' the pointer, 
// preventing further pointerleave/enter events unless the capture is explicitly 
// released. Then, it is necessary to call the method releasePointerCapture(e.pointerId)
// when a pointerdown event occurs.
//
// The CSS attributes 'touch-action: none;' and 'user-select: none;' 
// must be added to the .elemOfGrid elements, in order to avoid default 
// touch iterations and selections of such elements.
//
// See the buttons code here: https://w3c.github.io/pointerevents/#the-buttons-property
// In particular, a touch event/sliding or a mouse moving with left buttons pressed 
// are coded by event.buttons=='1'. There is no need to test for event.pointerType

oneColorSel.addEventListener('input',(e)=>{
    penColor = oneColorSel.value;
});

function colorElement(itm,color){
    itm.style.backgroundColor = color;
}

function pointerDownCallback(e){
    //console.log("down - release implicit capture");
    e.target.currentColor = penColor;
    e.target.releasePointerCapture(e.pointerId); // Important! (see above)
}

function pointerEnterCallback(e){
    //console.log(e.pointerType);
    if (e.buttons=='1'){
        e.target.currentColor = penColor;
    }
    colorElement(e.target,penColor);
}

function pointerLeaveCallback(e){
    if (e.buttons=='1'){
        e.target.currentColor = penColor;
    }
    colorElement(e.target,e.target.currentColor);
}


/* Grid Functions*/
function clearGrid(){
    gridDivs.forEach(itm =>{
        itm.currentColor = backgroundColor;
        colorElement(itm,backgroundColor);
    });
}

function deleteGrid(){
    removeDescendants(grid);
    gridDivs = [];
}

/* Mode Buttons Functions */

function selectBtn(btn){
    currentBtn.classList.remove('activeBtn');
    currentBtn = btn;
    currentBtn.classList.add('activeBtn');
}

function clickBtnCallback(e){
    selectBtn(e.target);
}

function clearGridBtnCallback(e){
    clearGrid();
}






/* Add event listeners --------------------------------- */

document.querySelectorAll("button.mutuallyExclusiveBtn").forEach(itm => {
    itm.addEventListener("click", clickBtnCallback)
});

clearGridBtn.addEventListener("click", clearGridBtnCallback);


// TODO
//  oneColorBtn    
//  randomColorBtn 
//  gradientBtn    
//  eraserBtn      
//  clearGridBtn   
//  newGridBtn     




/* Initialization -------------------------------------- */
let currentBtn = oneColorBtn;
selectBtn(oneColorBtn);

createGrid(gridRows,gridCols);