let gridRows = 12;
let gridCols = 12;

let grid = document.querySelector('.grid');
let gridCnt = document.querySelector('.grid-container');
let gridDivs;

function createGrid(gridRows,gridCols){

    let gridAR = gridCols/gridRows;
    let gridCntAR = gridCnt.offsetWidth / gridCnt.offsetHeight;

    console.log(gridCnt);
console.log('GridAR: '+ gridAR);
//offsetWidth or clientWidth
console.log('GridCntAR: '+ gridCntAR + '('+ gridCnt.offsetWidth,gridCnt.offsetHeight+')');

    setAspectRatio(grid, gridRows,gridCols);
    if (gridAR>=gridCntAR){
        gridCnt.style.flexDirection =  'row';  
    }else{
        gridCnt.style.flexDirection =  'column';  
    }   


    /* delete current grid: todo*/

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

function setAspectRatio(elem, nRows,nCols){
    let ar = nCols/nRows;
    elem.style.aspectRatio = ar;
}

createGrid(gridRows,gridCols);