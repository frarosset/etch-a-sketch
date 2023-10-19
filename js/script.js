let gridRows = 12;
let gridCols = 12;
let keepAR = false;
let idealAR;

let grid = document.querySelector('.grid');
let gridCnt = document.querySelector('.grid-container');

let nRowsSel = document.querySelector('#nRowsSel');
let nColsSel = document.querySelector('#nColsSel');
let nRowsLbl = document.querySelector('#nRowsLbl');
let nColsLbl = document.querySelector('#nColsLbl');

let keepARSel = document.querySelector('#keepARSel');
let fixedARInfo = document.querySelector('#fixedARInfo');
let gridInfo = document.querySelector('#gridInfo');

gridInfo

let gridDivs;

/* Grid creation */
function clearGrid(){
    removeDescendants(grid);
    gridDivs = [];
}

function removeDescendants(elem){
    while (elem.hasChildNodes()) {
        removeDescendants(elem.lastChild)
        elem.removeChild(elem.lastChild);
    }
}

function setAspectRatio(elem, ar){
    elem.style.aspectRatio = ar;
}

function createGrid(gridRows,gridCols){

    clearGrid();

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
            elem.classList.add('showGrid');
            row.appendChild(elem);
        }
        grid.appendChild(row);
    }

    gridDivs = document.querySelector('.elemOfGrid');

    updateGridInfo();
}



createGrid(gridRows,gridCols);


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