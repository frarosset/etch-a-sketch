let gridRows = 12;
let gridCols = 12;

let grid = document.querySelector('.grid');
let gridCnt = document.querySelector('.grid-container');

let nRowsSel = document.querySelector('#nRowsSel');
let nColsSel = document.querySelector('#nColsSel');
let nRowsLbl = document.querySelector('#nRowsLbl');
let nColsLbl = document.querySelector('#nColsLbl');


let gridDivs;

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

    gridDivs = document.querySelector('.elemOfGrid');;
}

function setAspectRatio(elem, ar){
    elem.style.aspectRatio = ar;
}

createGrid(gridRows,gridCols);

nRowsSel.addEventListener('input',(e) => {
    gridRows = e.target.value;
    nRowsLbl.textContent = gridRows;
    createGrid(gridRows,gridCols);  
})
nColsSel.addEventListener('input',(e) => {
    gridCols = e.target.value;
    nColsLbl.textContent = gridCols;
    createGrid(gridRows,gridCols); 
})

