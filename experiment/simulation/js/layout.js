import { simulate, deleteElement, printErrors, clearResult, printSuccess } from "./gate.js";
import { connectJKFF, unbindEvent, refreshWorkingArea } from "./main.js";
import { deleteFF } from "./flipflop.js";
import { xValues } from "./gate.js";
'use strict';

// Wires
export const wireColours = ["#ff0000", "#00ff00", "#0000ff", "#bf6be3", "#ff00ff", "#00ffff", "#ff8000", "#00ff80", "#80ff00", "#ff0080", "#8080ff", "#c0c0c0"];

// Contextmenu
const menu = document.querySelector(".menu");
const menuOption = document.querySelector(".menu-option");
let menuVisible = false;

const toggleMenu = command => {
  menu.style.display = command === "show" ? "block" : "none";
  menuVisible = !menuVisible;
};

export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  toggleMenu("show");
};

window.addEventListener("click", e => {
  if (menuVisible) toggleMenu("hide");
  window.selectedComponent = null;
  window.componentType = null;
});

menuOption.addEventListener("click", e => {
  if (e.target.innerHTML === "Delete") {
    if (window.componentType === "gate") {
      deleteElement(window.selectedComponent);
    }
    else if (window.componentType === "flipFlop") {
      deleteFF(window.selectedComponent);
    }
  }
  window.selectedComponent = null;
  window.componentType = null;
});

// Tabs

function changeTabs(e) {
  const task = e.target.parentNode.id;
  if (window.currentTab === task) {
    return;
  }

  if (window.currentTab !== null) {
    document.getElementById(window.currentTab).classList.remove("is-active");
  }
  window.currentTab = task;
  document.getElementById(task).classList.add("is-active");
  unbindEvent();
  connectJKFF();
  refreshWorkingArea();
  initStateDiagram();
  window.simulate = 1;
  simButton.innerHTML = "Simulate";  
  clearObservations();
  resize();
}

window.changeTabs = changeTabs;

function showCover() {
  let coverDiv = document.createElement('div');
  coverDiv.id = 'cover-div';

  // make the page unscrollable while the modal form is open
  document.body.style.overflowY = 'hidden';

  document.body.append(coverDiv);
}

function hideCover() {
  document.getElementById('cover-div').remove();
  document.body.style.overflowY = '';
}

function showPrompt(text, callback) {
  showCover();
  let form = document.getElementById('prompt-form');
  let container = document.getElementById('prompt-form-container');
  document.getElementById('prompt-message').innerHTML = text;
  document.getElementById('prompt-message').style.fontSize = "1.5em";
  form.text.value = '';
  form.text.classList.remove("highlight");
  document.getElementById('error-message').innerHTML = "";
  function complete(value) {
    hideCover();
    container.style.display = 'none';
    document.onkeydown = null;
    callback(value);
  }

  form.onsubmit = function() {
    let value = form.text.value;
    if(value == '' || !checkInputString(value)){
      form.text.classList.add("highlight");
      document.getElementById('error-message').innerHTML = "Invalid input stream";
      return false;
    }
    complete(value);
    return false;
  };

  form.cancel.onclick = function() {
    complete(null);
  };

  document.onkeydown = function(e) {
    if (e.key == 'Escape') {
      complete(null);
    }
  };

  let lastElem = form.elements[form.elements.length - 1];
  let firstElem = form.elements[0];

  lastElem.onkeydown = function(e) {
    if (e.key == 'Tab' && !e.shiftKey) {
      firstElem.focus();
      return false;
    }
  };

  firstElem.onkeydown = function(e) {
    if (e.key == 'Tab' && e.shiftKey) {
      lastElem.focus();
      return false;
    }
  };

  container.style.display = 'block';
  form.elements.text.focus();
}

function checkInputString(inputString){
  if(inputString.length<=0){
    return false;
  }
  for(let char of inputString){
    if(char!== '1' && char!=='0'){
      return false;
    }
  }
  return true;
}

function changeToArray(inputString){
  xValues.length = 0;
  for(let char of inputString){
    if(char === '1'){
      xValues.push(true);
    }
    else{
      xValues.push(false);
    }
  }
}

function clearArray(){
  xValues.length = 0;
}

document.getElementById('input-button').onclick = function() {
  showPrompt("Enter the input stream in binary form", function(value) {
    if(checkInputString(value)){
      changeToArray(value);
      printSuccess(value);
    }
    else{
      clearArray();
      printErrors("Invalid input stream",null);
    }
  });
};

// Clear observations
function clearObservations() {

  document.getElementById("table-body").innerHTML = "";
  let head = ''
  document.getElementById("table-head").innerHTML = head;
  document.getElementById('result').innerHTML = "";

}

// Simulation

const simButton = document.getElementById("simulate-button");
const inputButton=document.getElementById("input-button");
const submitButton=document.getElementById("submit-button");
function toggleSimulation() {
  clearResult();
  if (window.simulate === 0) {
    window.simulate = 1;
    inputButton.disabled=false;
    submitButton.disabled=false;
    simButton.innerHTML = "Simulate";
  }
  else {
    window.simulate = 0;
    inputButton.disabled=true;
    submitButton.disabled=true;
    simButton.innerHTML = "Stop";
    if(!window.sim())
    {
      window.simulate = 1;
      simButton.innerHTML = "Simulate";
      inputButton.disabled=false;
      submitButton.disabled=false;
    }
  }
}

simButton.addEventListener("click", toggleSimulation);



// Instruction box
const instructionBox = document.getElementsByClassName("instructions-box")[0];
instructionBox.addEventListener("click", (e) => {
  instructionBox.classList.toggle("expand");
});

// Making webpage responsive

// Dimensions of working area
const circuitBoard = document.getElementById("circuit-board");
// Distance of working area from top
const circuitBoardTop = circuitBoard.offsetTop;
// Full height of window
const windowHeight = window.innerHeight;
const width = window.innerWidth;
if (width < 1024) {
  circuitBoard.style.height = "600px";
} else {
  circuitBoard.style.height = windowHeight - circuitBoardTop - 20 + "px";
}

function resize() {
  const circuitBoard = document.getElementById("circuit-board");
  const sidePanels = document.getElementsByClassName("v-datalist-container");

  if (width >= 1024) {
    for (let i = 0; i < sidePanels.length; i++) {
      sidePanels[i].style.height = circuitBoard.style.height;
    }
  }
}

resize();


