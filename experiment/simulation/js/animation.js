import { setCoordinates, fillInputDots, objectDisappear, objectAppear, fillColor, setColor, unsetColor } from "./animation-utility.js";
'use strict';

window.simulationStatus = simulationStatus;
window.restartCircuit = restartCircuit;
window.setSpeed = setSpeed;
// Dimensions of working area
const circuitBoard = document.getElementById("circuit-board");
const sidePanels = document.getElementsByClassName("v-datalist-container");

// Distance of working area from top
const circuitBoardTop = circuitBoard.offsetTop;

// Full height of window
const windowHeight = window.innerHeight;
const width = window.innerWidth;
const instructionBox = document.getElementsByClassName("instructions-box")[0];
const svg = document.querySelector(".svg");
const svgns = "http://www.w3.org/2000/svg";

const EMPTY = "";
const STATUS = document.getElementById("play-or-pause");
const OBSERV = document.getElementById("observations");
const SPEED = document.getElementById("speed");

let currPos = 0;

const OBJECTS = [document.getElementById("x"), document.getElementById("y"), document.getElementById("clock"), document.getElementById("a")];
const ARRAYX = [document.getElementById("x1"), document.getElementById("x2"), document.getElementById("x3"), document.getElementById("x4"), document.getElementById("x5"), document.getElementById("x6"), document.getElementById("x7"), document.getElementById("x8")];
const ARRAYY = [document.getElementById("y1"), document.getElementById("y2"), document.getElementById("y3"), document.getElementById("y4"), document.getElementById("y5"), document.getElementById("y6"), document.getElementById("y7"), document.getElementById("y8")];
const TEXTINPUT = [document.createElementNS(svgns, "text"), document.createElementNS(svgns, "text")];
const TEXTCLOCK = [document.createElementNS(svgns, "text")];
const TEXTOUTPUT = [document.createElementNS(svgns, "text")];
const INPUTDOTS = [document.createElementNS(svgns, "circle"), document.createElementNS(svgns, "circle"), document.createElementNS(svgns, "circle")];

const inputStream = [[0, 0, 1, 1, 0, 0, 1, 1], [0, 1, 0, 1, 0, 1, 0, 1]];
const outputStream = [0, 1, 0, 0, 0, 1, 0, 0];


let timeline = gsap.timeline({ repeat: 0, repeatDelay: 0 });
let decide = 0;
let circuitStarted = 0;

function demoWidth() {
    if (width < 1024) {
        circuitBoard.style.height = "600px";
    } else {
        circuitBoard.style.height = `${windowHeight - circuitBoardTop - 20}px`;
    }
    sidePanels[0].style.height = circuitBoard.style.height;
}
// Instruction box
function instructionBoxInit() {
    instructionBox.addEventListener("click", () => {
        instructionBox.classList.toggle("expand");
    });
}

function setActive(i) {
    if (i === 0) {
        ARRAYX[i].style.fill = "#eeeb22";
        ARRAYY[i].style.fill = "#eeeb22";
    }
    else {
        ARRAYX[i - 1].style.fill = "#29e";
        ARRAYY[i - 1].style.fill = "#29e";
        ARRAYX[i].style.fill = "#eeeb22";
        ARRAYY[i].style.fill = "#eeeb22";
    }
}

//initialise input text
function textIOInit() {
    for (const text of TEXTINPUT) {
        text.textContent = 2;
    }
}
//initialise clock text
function textClockInit() {
    for (const text of TEXTCLOCK) {
        text.textContent = 2;
    }
}

function outputCoordinates() {

    let xcor = 895;
    let ycor = 455;

    for (const text of TEXTOUTPUT) {
        setCoordinates(xcor, ycor, text);
        svg.append(text);
    }
}


function inputDots() {
    //sets the coordinates of the input dots
    for (const inputDot of INPUTDOTS) {
        fillInputDots(inputDot, 200, 200, 15, "#FF0000");
        svg.append(inputDot);
    }
}
function dotsDisappear() {
    for (const inputDot of INPUTDOTS) {
        objectDisappear(inputDot);
    }
}
function dotsAppear() {
    for (const inputDot of INPUTDOTS) {
        objectAppear(inputDot);
    }
}

function computeXorOne() {
    if (inputStream[0][currPos] === inputStream[1][currPos]) {
        fillColor(INPUTDOTS[1], "#eeeb22");
    }
    else {
        fillColor(INPUTDOTS[1], "#29e");
    }
}

function computeXorTwo() {
    if (currPos === 0) {
        fillColor(INPUTDOTS[2], "#eeeb22");
    }
    else {
        if (inputStream[1][currPos] === outputStream[currPos-2]) {
            fillColor(INPUTDOTS[2], "#eeeb22");
        }
        else {
            fillColor(INPUTDOTS[2], "#29e");
        }
    }
}


function xDotDisappear() {
    objectDisappear(INPUTDOTS[0]);
}

function yDotDisappear() {
    objectDisappear(INPUTDOTS[1]);
}

function ffDotDisapper() {
    objectDisappear(INPUTDOTS[2]);
}

// function to disappear the output text
function outputDisappear() {
    for (const text of TEXTOUTPUT) {
        objectDisappear(text);
    }
}
// function to appear the input text
function outputVisible() {
    for (const text of TEXTOUTPUT) {
        objectAppear(text);
    }
}
function xTextDisappear() {
    objectDisappear(TEXTINPUT[0]);
}
function xTextAppear() {
    objectAppear(TEXTINPUT[0]);
}
function yTextDisappear() {
    objectDisappear(TEXTINPUT[1]);
}
function yTextAppear() {
    objectAppear(TEXTINPUT[1]);
}
function clockDisappear() {
    objectDisappear(TEXTCLOCK[0]);
}
function clockAppear() {
    objectAppear(TEXTCLOCK[0]);
}
function clearObservation() {
    OBSERV.innerHTML = EMPTY;
}
function allDisappear() {
    dotsDisappear();
    xTextDisappear();
    yTextDisappear();
    clockDisappear();
    outputDisappear();
    for (const object of OBJECTS) {
        fillColor(object, "#008000");
    }
}
function outputHandler() {
    let state = currPos;
    TEXTOUTPUT[0].textContent = outputStream[state];
    setter(TEXTOUTPUT[0].textContent,OBJECTS[3]);
    setter(outputStream[state], INPUTDOTS[2]);
}
function changeInput() {
    let state = currPos;
    TEXTINPUT[0].textContent = inputStream[0][state];
    TEXTINPUT[1].textContent = inputStream[1][state];
    setCoordinates(45, 440, TEXTINPUT[0]);
    setCoordinates(45, 490, TEXTINPUT[1]);
    svg.append(TEXTINPUT[0]);
    svg.append(TEXTINPUT[1]);
    setActive(state);
    setter(TEXTINPUT[0].textContent, OBJECTS[0]);
    setter(TEXTINPUT[1].textContent, OBJECTS[1]);
    if (inputStream[0][state] === 1) {
        fillColor(INPUTDOTS[0], "#29e");
    }
    else {
        fillColor(INPUTDOTS[0], "#eeeb22");
    }
    if (inputStream[1][state] === 1) {
        fillColor(INPUTDOTS[1], "#29e");
    }
    else {
        fillColor(INPUTDOTS[1], "#eeeb22");
    }
    if (state === 0) {
        console.log("here")
        fillColor(INPUTDOTS[2], "#eeeb22");
    }
}

function clockToZero() {
    TEXTCLOCK[0].textContent = 0;
    svg.appendChild(TEXTCLOCK[0]);
    setCoordinates(598, 704, TEXTCLOCK[0]);
    fillColor(OBJECTS[2], "#eeeb22");
    OBSERV.innerHTML = "Clock set to 0";
}
function clockToOne() {
    TEXTCLOCK[0].textContent = 1;
    svg.appendChild(TEXTCLOCK[0]);
    setCoordinates(598, 704, TEXTCLOCK[0]);
    fillColor(OBJECTS[2], "#29e");
    OBSERV.innerHTML = "Clock set to 1";
}

function increaseCurrPos() {
    currPos++;
}

function reboot() {
    for (const elements of ARRAYX) {
        elements.style.fill = "#29e";
    }
    for (const elements of ARRAYY) {
        elements.style.fill = "#29e";
    }
    for (const text of TEXTINPUT) {
        text.textContent = 2;
    }
    for (const text of TEXTCLOCK) {
        text.textContent = 2;
    }
}
function display() {
    OBSERV.innerHTML = "Simulation has finished. Press Reset to start again";
    OBSERV.innerHTML += "<br />";
    let img = document.createElement("img");
    img.src = "./images/state-table.png";
    OBSERV.appendChild(img);
}
function setter(value, component) {
    //toggles the text content a of input/output component b
    if (value === "1") {
        unsetColor(component);

    }
    else if (value === "0") {
        setColor(component);
    }
}


function changeSpeed(newSpeed) {

    if (TEXTINPUT[0].textContent !== "2" && TEXTINPUT[1].textContent !== "2"  && timeline.progress() !== 1) {
        timeline.resume();
        timeline.timeScale(newSpeed);
        OBSERV.innerHTML = newSpeed + "x speed";
        decide = 1;
        STATUS.innerHTML = "Pause";
    }
}
function setSpeed(speed) {
    if (circuitStarted != 0) {


        if (speed === "1") {
            startCircuit();
        }
        else if (speed === "2") {
            changeSpeed(2);
        }
        else if (speed === "4") {
            changeSpeed(4);
        }
    }


}
function restartCircuit() {
    if (circuitStarted === 0) {
        circuitStarted = 1;
    }
    timeline.seek(0);
    timeline.pause();
    allDisappear();
    reboot();
    currPos = 0;
    clearObservation();
    decide = 0;
    STATUS.innerHTML = "Start";
    OBSERV.innerHTML = "Successfully restored";
    SPEED.selectedIndex = 0;
}

function simulationStatus() {
    if (decide === 0) {
        startCircuit();

    }
    else if (decide === 1) {
        stopCircuit();

    }
}
function stopCircuit() {
    if (timeline.time() !== 0 && timeline.progress() !== 1) {
        timeline.pause();
        OBSERV.innerHTML = "Simulation has been stopped.";
        decide = 0;
        STATUS.innerHTML = "Start";
        SPEED.selectedIndex = 0;
    }
    else if (timeline.progress() === 1) {
        OBSERV.innerHTML = "Please Restart the simulation";
    }
}
// need to fix this up a bit
function startCircuit() {
    console.log("start");
    if (circuitStarted === 0) {
        circuitStarted = 1;
    }
    timeline.play();
    timeline.timeScale(1);
    OBSERV.innerHTML = "Simulation has started.";
    decide = 1;
    STATUS.innerHTML = "Pause";
    SPEED.selectedIndex = 0;
    if (timeline.progress() === 1) {
        OBSERV.innerHTML = "Please Restart the simulation";
    }
}

function simulator() {
    timeline.to(INPUTDOTS[0], {
        motionPath: {
            path: "#path3",
            align: "#path3",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },
    
        duration: 4,
        delay: 12*currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,
    
    }, 0);
    timeline.to(INPUTDOTS[1], {
        motionPath: {
            path: "#path4",
            align: "#path4",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },
    
        duration: 4,
        delay: 12*currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,
    
    }, 0);
    timeline.to(INPUTDOTS[2], {
        motionPath: {
            path: "#path7",
            align: "#path7",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },
    
        duration: 8,
        delay: 12*currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,
    
    }, 0);
    
    timeline.to(INPUTDOTS[1], {
        motionPath: {
            path: "#path5",
            align: "#path5",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },
    
        duration: 4,
        delay: 12*currPos+4,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,
    
    }, 0);
    
    timeline.to(INPUTDOTS[2], {
        motionPath: {
            path: "#path6",
            align: "#path6",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },
    
        duration: 4,
        delay: 12*currPos+8,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,
    
    }, 0);
}

//execution starts here
gsap.registerPlugin(MotionPathPlugin);
demoWidth();
instructionBoxInit();
textIOInit();
textClockInit();
outputCoordinates();
inputDots();
outputDisappear();
// calling all the functions that are going to initialise 
timeline.add(clockToZero, 0);
timeline.add(clockAppear, 0);
timeline.add(xTextAppear, 0);
timeline.add(yTextAppear, 0);

for(let i=0;i<96;i+=12){
    timeline.add(changeInput, 0+i);
    if(i%24==0)
    {
        timeline.add(clockToZero, 0+i);
    }
    else{
        timeline.add(clockToOne, 0+i);
    }
    timeline.add(dotsAppear, 0+i);
    timeline.add(simulator, 0+i);
    timeline.add(xDotDisappear, 4+i);
    timeline.add(computeXorOne,4+i);
    timeline.add(yDotDisappear, 8+i);
    timeline.add(computeXorTwo, 8+i);
    timeline.add(dotsDisappear, 12+i);
    timeline.add(outputHandler, 12+i);
    timeline.add(outputVisible, 12+i);
    timeline.add(increaseCurrPos, 12+i);
}
timeline.add(display, 98);
timeline.eventCallback("onComplete", outputVisible);
timeline.eventCallback("onComplete", display);
timeline.pause();
dotsDisappear();
