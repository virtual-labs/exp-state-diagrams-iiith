import { setCoordinates, fillInputDots, objectDisappear, objectAppear, fillColor, setColor, unsetColor, getXor } from "./animation-utility.js";
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
const svg = document.querySelector(".svg");
const svgns = "http://www.w3.org/2000/svg";

const EMPTY = "";
const status = document.getElementById("play-or-pause");
const observ = document.getElementById("observations");
const speed = document.getElementById("speed");

let currPos = 0;

const objects = [
    document.getElementById("x"), 
    document.getElementById("y"), 
    document.getElementById("clock"), 
    document.getElementById("a")
];
const arrayX = [
    document.getElementById("x1"), 
    document.getElementById("x2"), 
    document.getElementById("x3"), 
    document.getElementById("x4"), 
    document.getElementById("x5"), 
    document.getElementById("x6"), 
    document.getElementById("x7"), 
    document.getElementById("x8"), 
    document.getElementById("x9"), 
    document.getElementById("x10"), 
    document.getElementById("x11"), 
    document.getElementById("x12")
];
const arrayY = [
    document.getElementById("y1"),
    document.getElementById("y2"), 
    document.getElementById("y3"), 
    document.getElementById("y4"), 
    document.getElementById("y5"), 
    document.getElementById("y6"), 
    document.getElementById("y7"), 
    document.getElementById("y8"), 
    document.getElementById("y9"), 
    document.getElementById("y10"), 
    document.getElementById("y11"), 
    document.getElementById("y12")
];
const textInput = [
    document.createElementNS(svgns, "text"), 
    document.createElementNS(svgns, "text")
];
const textClock = [ document.createElementNS(svgns, "text")];
const textOutput = [document.createElementNS(svgns, "text")];
const inputDots = [
    document.createElementNS(svgns, "circle"), 
    document.createElementNS(svgns, "circle"), 
    document.createElementNS(svgns, "circle")
];

const inputStream = [[0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0], [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1]];
const outputStream = [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0];

let decide = false;
let circuitStarted = false;

function demoWidth() {
    if (width < 1024) {
        circuitBoard.style.height = "600px";
    } else {
        circuitBoard.style.height = `${windowHeight - circuitBoardTop - 20}px`;
    }
    sidePanels[0].style.height = circuitBoard.style.height;
}

function setActive(i) {
    if (i === 0) {
        arrayX[i].style.fill = "#eeeb22";
        arrayY[i].style.fill = "#eeeb22";
    }
    else {
        arrayX[i - 1].style.fill = "#29e";
        arrayY[i - 1].style.fill = "#29e";
        arrayX[i].style.fill = "#eeeb22";
        arrayY[i].style.fill = "#eeeb22";
    }
}

//initialise input text
function textIOInit() {
    for (const text of textInput) {
        text.textContent = 2;
    }
}
//initialise clock text
function textClockInit() {
    for (const text of textClock) {
        text.textContent = 2;
    }
}

function outputCoordinates() {

    let xcor = 895;
    let ycor = 455;

    for (const text of textOutput) {
        setCoordinates(xcor, ycor, text);
        svg.append(text);
    }
}


function InitInputDots() {
    //sets the coordinates of the input dots
    for (const inputDot of inputDots) {
        fillInputDots(inputDot, 200, 200, 15, "#FF0000");
        svg.append(inputDot);
    }
}
function dotsDisappear() {
    for (const inputDot of inputDots) {
        objectDisappear(inputDot);
    }
}
function dotsAppear() {
    for (const inputDot of inputDots) {
        objectAppear(inputDot);
    }
}

function calculateXorOne() {
    if (inputStream[0][currPos] === inputStream[1][currPos]) {
        fillColor(inputDots[1], "#eeeb22");
    }
    else {
        fillColor(inputDots[1], "#29e");
    }
}

function calculateXorTwo() {
    if (currPos === 0) {
        fillColor(inputDots[2], "#eeeb22");
    }
    else {
        if (getXor(inputStream[0][currPos],inputStream[1][currPos]) === outputStream[currPos - 1]) {
            fillColor(inputDots[2], "#eeeb22");
        }
        else {
            fillColor(inputDots[2], "#29e");
        }
    }
}


function xDotDisappear() {
    objectDisappear(inputDots[0]);
}

function yDotDisappear() {
    objectDisappear(inputDots[1]);
}


// function to disappear the output text
function outputDisappear() {
    for (const text of textOutput) {
        objectDisappear(text);
    }
}
// function to appear the input text
function outputVisible() {
    for (const text of textOutput) {
        objectAppear(text);
    }
}
function xTextDisappear() {
    objectDisappear(textInput[0]);
}
function xTextAppear() {
    objectAppear(textInput[0]);
}
function yTextDisappear() {
    objectDisappear(textInput[1]);
}
function yTextAppear() {
    objectAppear(textInput[1]);
}
function clockDisappear() {
    objectDisappear(textClock[0]);
}
function clockAppear() {
    objectAppear(textClock[0]);
}
function clearObservation() {
    observ.innerHTML = EMPTY;
}
function allDisappear() {
    dotsDisappear();
    xTextDisappear();
    yTextDisappear();
    clockDisappear();
    outputDisappear();
    for (const object of objects) {
        fillColor(object, "#008000");
    }
}
function outputHandler() {
    let state = currPos;
    textOutput[0].textContent = outputStream[state];
    setter(textOutput[0].textContent, objects[3]);
    setter(outputStream[state], inputDots[2]);
}
function changeInput() {
    let state = currPos;
    textInput[0].textContent = inputStream[0][state];
    textInput[1].textContent = inputStream[1][state];
    setCoordinates(45, 440, textInput[0]);
    setCoordinates(45, 490, textInput[1]);
    svg.append(textInput[0]);
    svg.append(textInput[1]);
    setActive(state);
    setter(textInput[0].textContent, objects[0]);
    setter(textInput[1].textContent, objects[1]);
    if (inputStream[0][state] === 1) {
        fillColor(inputDots[0], "#29e");
    }
    else {
        fillColor(inputDots[0], "#eeeb22");
    }
    if (inputStream[1][state] === 1) {
        fillColor(inputDots[1], "#29e");
    }
    else {
        fillColor(inputDots[1], "#eeeb22");
    }
    if (state === 0) {
        fillColor(inputDots[2], "#eeeb22");
    }
}

function clockToZero() {
    textClock[0].textContent = 0;
    svg.appendChild(textClock[0]);
    setCoordinates(598, 704, textClock[0]);
    fillColor(objects[2], "#eeeb22");
    observ.innerHTML = "Clock set to 0";
}
function clockToOne() {
    textClock[0].textContent = 1;
    svg.appendChild(textClock[0]);
    setCoordinates(598, 704, textClock[0]);
    fillColor(objects[2], "#29e");
    observ.innerHTML = "Clock set to 1";
}

function increaseCurrPos() {
    currPos++;
}

function reboot() {
    for (const elements of arrayX) {
        elements.style.fill = "#29e";
    }
    for (const elements of arrayY) {
        elements.style.fill = "#29e";
    }
    for (const text of textInput) {
        text.textContent = 2;
    }
    for (const text of textClock) {
        text.textContent = 2;
    }
}
function display() {
    observ.innerHTML = "Simulation has finished. Press Reset to start again";
    let img = document.createElement("img");
    img.src = "./images/state-table.png";
    observ.appendChild(img);
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

function setSpeed(speed) {
    if (circuitStarted) {
        timeline.timeScale(parseInt(speed));
        observ.innerHTML = `${speed}x speed`;
    }
}

function restartCircuit() {
    if (!circuitStarted) {
        circuitStarted = true;
    }
    timeline.seek(0);
    timeline.pause();
    allDisappear();
    reboot();
    currPos = 0;
    clearObservation();
    decide = false;
    status.innerHTML = "Start";
    observ.innerHTML = "Successfully restored";
    speed.selectedIndex = 0;
}

function simulationStatus() {
    if (!decide) {
        startCircuit();

    }
    else if (decide) {
        stopCircuit();

    }
}
function stopCircuit() {
    if (timeline.time() !== 0 && timeline.progress() !== 1) {
        timeline.pause();
        observ.innerHTML = "Simulation has been Paused. Please click on the 'Start' button to Resume.";
        decide = false;
        status.innerHTML = "Start";
        speed.selectedIndex = 0;
    }
    else if (timeline.progress() === 1) {
        observ.innerHTML = "Please Restart the simulation";
    }
}
// need to fix this up a bit
function startCircuit() {
    if (!circuitStarted) {
        circuitStarted = true;
    }
    timeline.play();
    timeline.timeScale(1);
    observ.innerHTML = "Simulation has started.";
    decide = true;
    status.innerHTML = "Pause";
    speed.selectedIndex = 0;
    if (timeline.progress() === 1) {
        observ.innerHTML = "Please Restart the simulation";
    }
}

function simulator() {
    timeline.to(inputDots[0], {
        motionPath: {
            path: "#path3",
            align: "#path3",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },

        duration: 4,
        delay: 12 * currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,

    }, 0);
    timeline.to(inputDots[1], {
        motionPath: {
            path: "#path4",
            align: "#path4",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },

        duration: 4,
        delay: 12 * currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,

    }, 0);
    timeline.to(inputDots[2], {
        motionPath: {
            path: "#path7",
            align: "#path7",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },

        duration: 8,
        delay: 12 * currPos,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,

    }, 0);

    timeline.to(inputDots[1], {
        motionPath: {
            path: "#path5",
            align: "#path5",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },

        duration: 4,
        delay: 12 * currPos + 4,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,

    }, 0);

    timeline.to(inputDots[2], {
        motionPath: {
            path: "#path6",
            align: "#path6",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        },

        duration: 4,
        delay: 12 * currPos + 8,
        repeat: 0,
        repeatDelay: 3,
        yoyo: true,
        ease: "none",
        paused: false,

    }, 0);
}

//execution starts here
let timeline = gsap.timeline({ repeat: 0, repeatDelay: 0 });
gsap.registerPlugin(MotionPathPlugin);
demoWidth();
textIOInit();
textClockInit();
outputCoordinates();
InitInputDots();
outputDisappear();
// calling all the functions that are going to initialise 
timeline.add(clockToZero, 0);
timeline.add(clockAppear, 0);
timeline.add(xTextAppear, 0);
timeline.add(yTextAppear, 0);

for (let i = 0; i < 144; i += 12) {
    timeline.add(changeInput, 0 + i);
    if (i % 24 === 0) {
        timeline.add(clockToZero, 0 + i);
    }
    else {
        timeline.add(clockToOne, 0 + i);
    }
    timeline.add(dotsAppear, 0 + i);
    timeline.add(simulator, 0 + i);
    timeline.add(xDotDisappear, 4 + i);
    timeline.add(calculateXorOne, 4 + i);
    timeline.add(yDotDisappear, 8 + i);
    timeline.add(calculateXorTwo, 8 + i);
    timeline.add(dotsDisappear, 12 + i);
    timeline.add(outputHandler, 12 + i);
    timeline.add(outputVisible, 12 + i);
    timeline.add(increaseCurrPos, 12 + i);
}
timeline.add(display, 146);
timeline.eventCallback("onComplete", outputVisible);
timeline.eventCallback("onComplete", display);
timeline.pause();
dotsDisappear();
