let gridRows = 12;
let gridCols = 12;
let keepAR   = false;
let idealAR  = 1;
let penColor = thisAsFcn('black');
let backgroundColor = 'white';

let toFadeColor = [255,0,0];
let fromFadeColor = [0,255,0];
let fracFade = 0.25;
let currentFadeIndex;
let updateCurrentFadeColor; /* function set by the setFadeColorFunctions()*/
let setCurrentFadeColor;/* function set by the setFadeColorFunctions()*/


/* DOM elements ---------------------------------------- */

let oneColorBtn    = document.querySelector('#oneColorBtn');
let randomColorBtn = document.querySelector('#randomColorBtn');
let fadeColorBtn   = document.querySelector('#fadeColorBtn');
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

function setBackgroundColor(elem,color){
    elem.style.backgroundColor = color;
}

function getBackgroundColor(elem){
    return elem.style.backgroundColor;
}

function setAspectRatio(elem, ar){
    elem.style.aspectRatio = ar;
}

function computeAspectRatio(elem){
    return elem.offsetWidth / elem.offsetHeight;
}

function setPenColor(colorFcn){
    // colorFcn is a function that returns a color array
    penColor = colorFcn;
}

function randomIntegerInRange(min=0,max=100){
    // Math.random() returns a number between 0 (inclusive) and 1 (exclusive)
    /* here min and max are assumed integer */
    //min = Math.ceil(min);
    //max = Math.floor(max);   
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function thisAsFcn(variable){
    // This is used to transform a variable to an anonymous function
    // which only returns that variable.
    // This will be used to select the color to use, which can be 
    // selected only once (onecolor mode, where the color is indeed a
    // variable, and thisAsFcn is used), or change at every grid cell
    // (randomcolor mode, where the color is generated by an anonymous
    // function).
    return ()=>variable;
}

function cssRGBColor(rgbArray){
    return `rgb(${rgbArray})`;
}

function cssHSLColor(hslArray){
    return `hsl(${hslArray[0]},${hslArray[1]}%,${hslArray[2]}%)`;
}

function setHSLBackgroundColor(elem,hslArray){
    setBackgroundColor(elem,cssHSLColor(hslArray));
}

function setHSLBackgroundGradient(elem,hslStartArray,hslEndArray){
    elem.style.background = cssHSLGradient(hslStartArray,hslEndArray);
}

function cssHSLGradient(hslStartArray,hslEndArray, numOfIntervals = 20, angle = 90){
    // hsl: the current color point
    let hsl = hslStartArray;
    let deltaHsl  =  hslEndArray.map((itm,idx) => (itm-hslStartArray[idx])/numOfIntervals);
    // p: position in the gradient in %
    let p=0;
    let deltaP = 100/numOfIntervals;

    let str = `linear-gradient(${angle}deg`;
    for (let i=0; i<numOfIntervals; i++){
        let IntegerHsl = hsl.map(itm=>Math.round(itm));
        str += `, ${cssHSLColor(IntegerHsl)} ${p}%`;
        hsl = hsl.map ((itm,idx) => itm+deltaHsl[idx]);
        p   += deltaP
    }
    // The last color point is hslEndArray at 100%
    str += `, ${cssHSLColor(hslEndArray)} 100%)`;

    return str;
}


/* Grid creation */

function createGrid(gridRows,gridCols){

    deleteGrid();

    let gridAR = gridCols/gridRows;
    let gridCntAR = computeAspectRatio(gridCnt);

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
            let cell = document.createElement('div');
            cell.classList.add('cellOfGrid');
            cell.classList.add('unselectable');
            setBackgroundColor(cell,backgroundColor);
            cell.currentColor = backgroundColor;

            cell.addEventListener("pointerdown",pointerDownCallback);
            cell.addEventListener('pointerenter',pointerEnterCallback);
            cell.addEventListener('pointerleave',pointerLeaveCallback);

            row.appendChild(cell);
        }
        grid.appendChild(row);
    }

    gridDivs = document.querySelectorAll('.cellOfGrid');

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

/* Grid Functions */
function clearGrid(){
    gridDivs.forEach(itm =>{
        itm.currentColor = backgroundColor;
        setBackgroundColor(itm,backgroundColor);
    });
}

function deleteGrid(){
    removeDescendants(grid);
    gridDivs = [];
}

/* Drawing functionality --------------------------------------------------- */

// The following behaviour is imposed:
//
// - If the user is using a mouse, hovering on an cell just temporarly set the 
//   color of the cell to the selected one. The change is permanent only if a 
//   left click occurs in such cell, or the left mouse button is pressed when 
//   the pointer either enters  or leaves it. Otherwise, the previous color 
//   (cell.currentColor) is restored once the mouse leaves.
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
// must be added to the .cellOfGrid elements, in order to avoid default 
// touch iterations and selections of such cells.
//
// See the buttons code here: https://w3c.github.io/pointerevents/#the-buttons-property
// In particular, a touch event/sliding or a mouse moving with left buttons pressed 
// are coded by event.buttons=='1'. There is no need to test for event.pointerType
//
// .colorSetOnEnterOrDown  is a property of each grid cell needed when the 
// applied color varies  as the pointer moves. In particular,
// - touch: at each tap or when sliding in, a new color is generated, and
//          permanently applied. In fade mode, however, the color is just reset
//          at each tap.
// - mouse: a new color is generated, and permanently applied at each right
//          click on the cell, provided that a new color has already been
//          permanentely applied since the mouse entered the cell. Otherwise,
//          the the background color is permanently applied.
// .colorSetOnEnterOrDown is set to true when the color is permanent applied
// to a cell, and restored to false when the mouse leaves it.
//
// The updateCurrentFadeColor() and setCurrentFadeColor() functions are needeed
// to update the current color when the fade mode is active. Note that the rest
// of the code is written so that these are empty functions when not in the fade 
// mode (see functions setFadeColorFunctions and fadeColorBtn).
// The behaviour is the following: the starting color (fromFadeColor) is reset 
// each time the mouse leaves a cell without holding the left mouse button or 
// when the touch sliding ends, or a new non-mouse down is done.
// Otherwise, if the the mouse leaves a cell holding the left mouse button or 
// there is a touch sliding, the next color in the gradient is generated, 
// toward the goal color (toFadeColor). The color of the gradient at step k is 
// computed by mixing fromFadeColor with toFadeColor with a percentage of 
// min(fracFade*k,1)
// Todo: In fade mode, multitouch is currently not tested, but should be broken.
//       currentFadeIndex should be defined for every different e.pointerId.

function pointerDownCallback(e){

    let cell = e.target;
    cell.releasePointerCapture(e.pointerId); // Important! (see above)
    console.log('down ',currentFadeIndex,e.pointerId);
    if (cell.colorSetOnEnterOrDown){
        if (e.pointerType === 'mouse'){
            updateCurrentFadeColor();
        } else {
            setCurrentFadeColor();
        }
        cell.currentColor = penColor();
    } else {
        setCurrentFadeColor();
        cell.currentColor = getBackgroundColor(cell);
        cell.colorSetOnEnterOrDown = true;    
    }
    setBackgroundColor(cell,cell.currentColor);
}

function pointerEnterCallback(e){
    console.log('enter',currentFadeIndex,e.pointerId);    
    let cell = e.target;
    let color = penColor();
    if (e.buttons=='1'){
        // mouse enters with (only) left button pressed or touch slide-in
        cell.currentColor = color;
        cell.colorSetOnEnterOrDown = true;
    } else {
        // mouse enter without (only) left button pressed 
        cell.colorSetOnEnterOrDown = false;
    }
    setBackgroundColor(cell,color); 
}

function pointerLeaveCallback(e){
    let cell = e.target;
    console.log('leave',currentFadeIndex,e.pointerId);
    cell.colorSetOnEnterOrDown = false;
    setBackgroundColor(cell,cell.currentColor);
    if (e.buttons!='1'){
        setCurrentFadeColor();
    } else {
        updateCurrentFadeColor();
    }

    console.log('');    
}

/* Mode Buttons Functions -------------------------------------------------- */

function selectBtn(btn){
    currentBtn.classList.remove('activeBtn');
    currentBtn = btn;
    currentBtn.classList.add('activeBtn');
    // the next function set setCurrentFadeColor() and updateCurrentFadeColor() 
    // depending on the mode (they are non-empty only in fade mode)
    setFadeColorFunctions();
}

function clickBtnCallback(e){
    selectBtn(e.target);
}

/* One color mode ---------------------------------------------------------- */
function oneColorBtnCallback(e){
    setPenColor(thisAsFcn(oneColorSel.value));
}

function oneColorSelCallback(e){
    setPenColor(thisAsFcn(oneColorSel.value));
}

/* Random color mode */
function cssHSLRandomColor(){
    let hslArray = randomColorRanges.ranges.map(itm => randomIntegerInRange(...itm));
    return cssHSLColor(hslArray);
}

function randomColorBtnCallback(e){
    setPenColor(cssHSLRandomColor);
}

/* Fade color mode */

// The next function specifies updateCurrentFadeColor and setCurrentFadeColor
//  when the current mode is 'fade', i.e., when currentBtn===fadeColorBtn.
//  These functions will be used in:
//  - pointerDownCallback
//  - pointerEnterCallback 
//  - pointerLeaveCallback
//  As they are not needed in the other modes, they are disabled in that case, by 
//  setting them equal to an empty function, to improve performance and avoid 
//  useless computations.
//  This function will be called when a new mode is set, e.g., in  selectBtn(btn)
function setFadeColorFunctions(){
    if (currentBtn===fadeColorBtn){
        updateCurrentFadeColor = updateCurrentFadeColor_enabled;
        setCurrentFadeColor = setCurrentFadeColor_enabled;
    } else {
        updateCurrentFadeColor = () => {};
        setCurrentFadeColor = () => {};
    }
}

function setCurrentFadeColor_enabled(){
    currentFadeIndex = 0;
    console.log('   (RESET IDX TO ', currentFadeIndex,')'); /* debug */   
}

function updateCurrentFadeColor_enabled(){
    currentFadeIndex++;
    console.log('   (UPDATE IDX TO ', currentFadeIndex,')'); /* debug */   
}

function cssFadeColor(){
    // This adds to the current fade color the same amout at every step
    let currentFrac = Math.min(currentFadeIndex*fracFade,1);

    let currentFadeColor = fromFadeColor.map((itm,idx) =>
        Math.round(itm*(1-currentFrac) + toFadeColor[idx]*currentFrac)
    );

    //console.log(currentFadeColor,currentFadeIndex); /* debug */     

    return cssRGBColor(currentFadeColor);
}

function fadeColorBtnCallback(e){
    setCurrentFadeColor_enabled();
    setPenColor(cssFadeColor);
}


/* Eraser mode */
function eraserBtnCallback(e){
    setPenColor(thisAsFcn(backgroundColor));
}

/* Clear grid  */
function clearGridBtnCallback(e){
    clearGrid();
}


/* Add event listeners --------------------------------- */

document.querySelectorAll("button.mutuallyExclusiveBtn").forEach(itm => {
    itm.addEventListener("click", clickBtnCallback)
});


oneColorBtn.addEventListener("click", oneColorBtnCallback);
oneColorSel.addEventListener('input', oneColorSelCallback);

randomColorBtn.addEventListener("click", randomColorBtnCallback);

fadeColorBtn.addEventListener("click", fadeColorBtnCallback);

eraserBtn.addEventListener("click", eraserBtnCallback);

clearGridBtn.addEventListener("click", clearGridBtnCallback);






// TODO     
//  newGridBtn     




/* Initialization -------------------------------------- */
let currentBtn = oneColorBtn;
selectBtn(oneColorBtn);

createGrid(gridRows,gridCols);
















/* NoUISliders ----------------------------------------- */

// Helper function from:
// https://refreshless.com/nouislider/examples/#section-merging-tooltips*/
/**
 * @param slider HtmlElement with an initialized slider
 * @param threshold Minimum proximity (in percentages) to merge tooltips
 * @param separator String joining tooltips
 */
function mergeTooltips(slider, threshold, separator) {

    let textIsRtl = getComputedStyle(slider).direction === 'rtl';
    let isRtl = slider.noUiSlider.options.direction === 'rtl';
    let isVertical = slider.noUiSlider.options.orientation === 'vertical';
    let tooltips = slider.noUiSlider.getTooltips();
    let origins = slider.noUiSlider.getOrigins();

    // Move tooltips into the origin element. The default stylesheet handles this.
    tooltips.forEach(function (tooltip, index) {
        if (tooltip) {
            origins[index].appendChild(tooltip);
        }
    });

    slider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {

        let pools = [[]];
        let poolPositions = [[]];
        let poolValues = [[]];
        let atPool = 0;

        // Assign the first tooltip to the first pool, if the tooltip is configured
        if (tooltips[0]) {
            pools[0][0] = 0;
            poolPositions[0][0] = positions[0];
            poolValues[0][0] = values[0];
        }

        for (let i = 1; i < positions.length; i++) {
            if (!tooltips[i] || (positions[i] - positions[i - 1]) > threshold) {
                atPool++;
                pools[atPool] = [];
                poolValues[atPool] = [];
                poolPositions[atPool] = [];
            }

            if (tooltips[i]) {
                pools[atPool].push(i);
                poolValues[atPool].push(values[i]);
                poolPositions[atPool].push(positions[i]);
            }
        }

        pools.forEach(function (pool, poolIndex) {
            let handlesInPool = pool.length;

            for (let j = 0; j < handlesInPool; j++) {
                let handleNumber = pool[j];

                if (j === handlesInPool - 1) {
                    let offset = 0;

                    poolPositions[poolIndex].forEach(function (value) {
                        offset += 1000 - value;
                    });

                    let direction = isVertical ? 'bottom' : 'right';
                    let last = isRtl ? 0 : handlesInPool - 1;
                    let lastOffset = 1000 - poolPositions[poolIndex][last];
                    offset = (textIsRtl && !isVertical ? 100 : 0) + (offset / handlesInPool) - lastOffset;

                    // Center this tooltip over the affected handles
                    tooltips[handleNumber].innerHTML = poolValues[poolIndex].join(separator);
                    tooltips[handleNumber].style.display = 'block';
                    tooltips[handleNumber].style[direction] = offset + '%';
                } else {
                    // Hide this tooltip
                    tooltips[handleNumber].style.display = 'none';
                }
            }
        });
    });
}

function IntegerToAngle(number){
    return Math.round(number) + '°';
}

function AngleToInteger(string){
    return Number(string.replace('°', ''));
}

function IntegerToPercentage(number){
    return Math.round(number) + '%';
}

function PercentageToInteger(string){
    return Number(string.replace('%', ''));
}

function setConnectForCircularData(rangeConnectDivArray,selectedRange){
    //rangeConnect is a 3-element array
    if (selectedRange[0]<=selectedRange[1]){
        rangeConnectDivArray[0].classList.add('noUi-connect');
        rangeConnectDivArray[1].classList.remove('noUi-connect');
        rangeConnectDivArray[2].classList.add('noUi-connect');
    } else {
        rangeConnectDivArray[0].classList.remove('noUi-connect');
        rangeConnectDivArray[1].classList.add('noUi-connect');
        rangeConnectDivArray[2].classList.remove('noUi-connect');
    }
}

function setSliderHandlesColor(rangeHandleDivArray,selectedRange,componentIdx){
    rangeHandleDivArray.forEach((itm,idx) => {
        itm.color[componentIdx] = selectedRange[idx];
        setHSLBackgroundColor(itm,itm.color);
    });
}

function updateRandomRangeSamples(){
    let RandomRangeSamples = document.querySelector('#randomColorBtnSettings > .range-preview');

    removeDescendants(RandomRangeSamples);
    let minH = randomColorRanges.ranges[0][0];
    let maxH = randomColorRanges.ranges[0][1];
    let minS = randomColorRanges.ranges[1][0];
    let maxS = randomColorRanges.ranges[1][1];
    let minL = randomColorRanges.ranges[2][0];
    let maxL = randomColorRanges.ranges[2][1];

    let deltaH = Math.max(Math.floor((maxH-minH)/12),1);
    let deltaS = Math.max(Math.floor((maxS-minS)/5),1);

    let sampleRow;

    for(let h=minH; h<=maxH; h+=deltaH){
        h = Math.round(h);
        for(let s=minS;s<=maxS; s+=deltaS){
            s = Math.round(s);
            sampleRow = document.createElement('div');
            sampleRow.classList.add('rowOfGrid');
            sampleRow.style.background=cssHSLGradient(
                [h,s,minL],[h,s,maxL],20,180);
            RandomRangeSamples.appendChild(sampleRow);
        }
        // overwrite last row with maximum s value
        sampleRow.style.background=cssHSLGradient(
            [h,maxS,minL],[h,maxS,maxL],20,180);
    }
    // overwrite last row with maximum h value
    sampleRow.style.background=cssHSLGradient(
        [maxH,maxS,minL],[maxH,maxS,maxL],20,180);
}


/* Callbacks */
/* https://refreshless.com/nouislider/events-callbacks/ */

function setSliderHandlesColorCallback(values, handle, unencoded){
    let slider = this.target;
    setSliderHandlesColor(slider.handleDivs,unencoded,slider.componentIdx);
}

function setConnectForCircularDataCallback(values, handle, unencoded){
    let slider = this.target;
    setConnectForCircularData(slider.connectDivs,unencoded);
}

function setRandomColorRangeCallback(values, handle, unencoded){
    let slider = this.target;
    let processedUnencoded = [...unencoded];
    if (processedUnencoded[0]>processedUnencoded[1])
        processedUnencoded[1] += 360;
    randomColorRanges.ranges[slider.componentIdx] = processedUnencoded;
    updateRandomRangeSamples();
}

/* Initializaton Function and data */

const colorInfo = {
    hsl: {
        name:    'HSL',
        labels:  ['Hue',    'Saturation',   'Lightness' ],
        type:    ['angle',  'percentage',   'percentage'],
        default: [200,      100,            50          ],
        circular:[true,     false,          false       ]
    }
}

let randomColorRanges = {
    type:    'hsl',
    // each component in limits refers to an 'hsl' component
    // as described in colorInfo.hsl, e.g., hue, saturation
    // and lightness, and is an array with the corresponding 
    // minimum and maximum values
    ranges:  [[0,359], [50,100], [20,80]]
};

let angleRangeOption = {
    start: [0,359],
    // Circular data: temporarly connect all the segments
    // Function setConnectForCircularData set the correct 
    // connect class depending on the values of the two handles 
    // Here connect interval is styled as non-selected 
    connect: [true, true, true],
    behaviour: 'unconstrained-tap',
    step: 1,
    range: {
        'min': 0,
        'max': 360
    },
    padding: [0, 1], // exclude 360===0, as it is circular data
    format: {
        to: IntegerToAngle,
        from: AngleToInteger
    },
    tooltips: true
};

let percentageRangeOption = {
    start: [20,80], 
    // Here connect interval is styled as non-selected 
    connect: [true, false, true],
    behaviour: 'tap',
    step: 1,
    range: {
        'min': 0,
        'max': 100
    },
    format: {
        to: IntegerToPercentage,
        from: PercentageToInteger
    },
    tooltips: true
}

function getSliderOptions(initialValue,type){
    let options;

    switch (type){
        case 'angleRange':
            options = {...angleRangeOption};
            break;
        case 'percentageRange':
            options = {...percentageRangeOption};
            break;
    }

    // Here you can modify the hardcoded default options
    options['start'] = initialValue;

    return options;
}

function initRandomColorSettings(){
    let compInfo = colorInfo[randomColorRanges.type];
    let settingsDiv = document.querySelector('#randomColorBtnSettings > .selectors');

    for (let i=0;i<compInfo.labels.length; i++){
        let newLbl = document.createElement('div');
        newLbl.textContent = compInfo.labels[i];
        newLbl.classList.add('unselectable');
        newLbl.classList.add('noUi-label');
    
        let newSlider = document.createElement('div');
        let sliderOptions = getSliderOptions(randomColorRanges.ranges[i],compInfo.type[i]+'Range');
        noUiSlider.create(newSlider, sliderOptions);

        // Set target (full slider bar) background color as a gradient
        let hslStartArray = [...compInfo.default]; // deep copy
        let hslEndArray   = [...compInfo.default];
        hslStartArray[i]  = sliderOptions.range.min;
        hslEndArray[i]    = sliderOptions.range.max;
        setHSLBackgroundGradient(newSlider,hslStartArray,hslEndArray);

        newSlider.componentIdx = i;
        newSlider.connectDivs = newSlider.querySelectorAll('.noUi-connect');
        newSlider.handleDivs  = newSlider.querySelectorAll('.noUi-handle');

        // Display the correct selected interval with circular data (e.g. angles)
        if (compInfo.circular[i]){
            setConnectForCircularData(newSlider.connectDivs,sliderOptions.start);
            newSlider.noUiSlider.on('slide',setConnectForCircularDataCallback);
        }   
        
        // Display the correct handle color
        newSlider.handleDivs.forEach((handle,idx)=>{
            handle.color = [...compInfo.default];
        });
        setSliderHandlesColor(newSlider.handleDivs,sliderOptions.start,newSlider.componentIdx);
        newSlider.noUiSlider.on('slide',setSliderHandlesColorCallback);

        // Update the range of the components to generate a random color
        newSlider.noUiSlider.on('set',setRandomColorRangeCallback);

        // Add the merge tooltips functionality
        mergeTooltips(newSlider, 35, ' - ');       
     
        let newInput = document.createElement('div');
        newInput.classList.add('noUi-input');
        newInput.appendChild(newSlider);
        newInput.appendChild(newLbl);
        settingsDiv.appendChild(newInput);
    }

    // Update the color preview for the selected initial range
    updateRandomRangeSamples();
}


/* Initialization ----------------------------------------------------------- */

initRandomColorSettings();
