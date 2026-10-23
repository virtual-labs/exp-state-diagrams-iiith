import {
  deleteElement,
  printErrors,
  clearResult,
  printSuccess,
  stopSimulation,
} from "./gate.js";
import {
  connectJKFF,
  unbindEvent,
  refreshWorkingArea,
  initStateDiagram,
  jsPlumbInstance,
  useDefaultInputString,
} from "./main.js";
import { deleteFF } from "./flipflop.js";
import { xValues } from "./gate.js";
("use strict");

// Wires
export const wireColours = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#bf6be3",
  "#ff00ff",
  "#00ffff",
  "#ff8000",
  "#00ff80",
  "#80ff00",
  "#ff0080",
  "#8080ff",
  "#c0c0c0",
];

// Contextmenu
const EMPTY = "";
const menu = document.querySelector(".menu");
const menuOptions = document.querySelectorAll(".menu-option");

export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.display = "block";
};

window.addEventListener("click", () => {
  menu.style.display = "none";
  window.selectedComponent = null;
  window.componentType = null;
  window.contextMenuTarget = null;
  window.isConnectionContext = false;
});

// Right click on a wire: the components have their own handlers, which also say which component it is
document.addEventListener("contextmenu", function (event) {
  const target = event.target;
  if (!target.closest("#working-area")) {
    return;
  }
  const connection = target.closest(".jtk-connector");
  window.isConnectionContext = connection !== null;
  window.contextMenuTarget = target;
  if (connection) {
    event.preventDefault();
    setPosition({ top: event.clientY, left: event.clientX });
  }
});

// Deletes the wire that was right clicked; the circuit model follows (see main.js)
function deleteConnection() {
  const connectorElement =
    window.contextMenuTarget && window.contextMenuTarget.closest(".jtk-connector");
  if (!connectorElement) {
    return;
  }
  const connection = jsPlumbInstance
    .getConnections()
    .find((c) => c.connector && c.connector.canvas === connectorElement);
  if (connection) {
    jsPlumbInstance.deleteConnection(connection);
  }
}

menuOptions.forEach((menuOption) => {
  menuOption.addEventListener("click", (e) => {
    if (e.target.innerHTML === "Delete") {
      if (window.isConnectionContext && window.contextMenuTarget) {
        deleteConnection();
      } else if (window.componentType === "gate") {
        deleteElement(window.selectedComponent);
      } else if (window.componentType === "flipFlop") {
        deleteFF(window.selectedComponent);
      }
    }
    window.selectedComponent = null;
    window.componentType = null;
    window.contextMenuTarget = null;
    window.isConnectionContext = false;
    menu.style.display = "none";
  });
});

// Tabs

export function changeTabs(e) {
  const task = e.target.parentNode.id;
  if (window.currentTab === task) {
    return;
  }

  if (window.currentTab !== null) {
    document.getElementById(window.currentTab).classList.remove("is-active");
  }
  window.currentTab = task;
  document.getElementById(task).classList.add("is-active");
  stopSimulation();
  unbindEvent();
  connectJKFF();
  refreshWorkingArea();
  initStateDiagram();
  clearObservations();
  useDefaultInputString();
  resize();
  changeInstructions();
}

function changeInstructions() {
  let instructions = "";
  if (window.currentTab == "task1")
    instructions = `Instructions<br>Implement a circuit for the given state diagram using JK Flip-Flops and the given gates.`;
  else if (window.currentTab == "task2")
    instructions = `Instructions<br>Draw a state diagram to identify a pattern of 3 or more 1's in a given sequence of inputs (the outputs A B are 1,1 while 3 or more 1's in a row have been found, otherwise they can be anything but 1,1), and implement it using the gates and flip flops given.`;
  document.getElementById("instructions").innerHTML = instructions;
}

window.changeTabs = changeTabs;

function showCover() {
  let coverDiv = document.createElement("div");
  coverDiv.id = "cover-div";

  // make the page unscrollable while the modal form is open
  document.body.style.overflowY = "hidden";

  document.body.append(coverDiv);
}

function hideCover() {
  document.getElementById("cover-div").remove();
  document.body.style.overflowY = "";
}

function showPrompt(text, callback) {
  showCover();
  let form = document.getElementById("prompt-form");
  let container = document.getElementById("prompt-form-container");
  document.getElementById("prompt-message").innerHTML = text;
  document.getElementById("prompt-message").style.fontSize = "1.5em";
  form.text.value = "";
  form.text.classList.remove("highlight");
  document.getElementById("error-message").innerHTML = EMPTY;
  function complete(value) {
    hideCover();
    container.style.display = "none";
    document.onkeydown = null;
    callback(value);
  }

  form.onsubmit = function () {
    let value = form.text.value;
    if (value == "" || !checkInputString(value)) {
      form.text.classList.add("highlight");
      document.getElementById("error-message").innerHTML =
        "Invalid input stream";
      return false;
    }
    complete(value);
    return false;
  };

  form.cancel.onclick = function () {
    complete(null);
  };

  document.onkeydown = function (e) {
    if (e.key == "Escape") {
      complete(null);
    }
  };

  let lastElem = form.elements[form.elements.length - 1];
  let firstElem = form.elements[0];

  lastElem.onkeydown = function (e) {
    if (e.key == "Tab" && !e.shiftKey) {
      firstElem.focus();
      return false;
    }
  };

  firstElem.onkeydown = function (e) {
    if (e.key == "Tab" && e.shiftKey) {
      lastElem.focus();
      return false;
    }
  };

  container.style.display = "block";
  form.elements.text.focus();
}

function checkInputString(inputString) {
  if (inputString.length <= 0) {
    return false;
  }
  for (let char of inputString) {
    if (char !== "1" && char !== "0") {
      return false;
    }
  }
  return true;
}

function changeToArray(inputString) {
  xValues.length = 0;
  for (let char of inputString) {
    if (char === "1") {
      xValues.push(true);
    } else {
      xValues.push(false);
    }
  }
}

function clearArray() {
  xValues.length = 0;
}

// Clear observations
function clearObservations() {
  document.getElementById("table-body").innerHTML = EMPTY;
  document.getElementById("table-head").innerHTML = EMPTY;
  document.getElementById("result").innerHTML = EMPTY;
  let heading = document.getElementById("stateDiagramHeading");

  // Check the value of window.currentTab
  if (window.currentTab === "task2") {
    // Get the div element by its ID
    var divElement = document.getElementById("stateDiagram");

    // Remove the image inside the div
    var imageElement = divElement.querySelector("img");
    if (imageElement) {
      imageElement.remove();
    }

    // Make the div empty
    divElement.innerHTML = "";
    heading.innerHTML = EMPTY;
  } else if (window.currentTab === "task1") {
    // Get the div element by its ID
    var divElement = document.getElementById("stateDiagram");

    // Check if the div is empty
    if (divElement.innerHTML === "") {
      // Re-insert the image inside the div
      var newImage = document.createElement("img");
      newImage.setAttribute("src", "images/practice-state-diagram2.png");
      newImage.setAttribute("alt", "state diagram");
      divElement.appendChild(newImage);
      heading.innerHTML = `State-Diagram`;
    }
  }
}

// Simulation

const simButton = document.getElementById("simulate-button");
const inputButton = document.getElementById("input-button");
const submitButton = document.getElementById("submit-button");
function toggleSimulation() {
  clearResult();
  if (window.simulationStatus === 0) {
    stopSimulation();
  } else {
    window.simulationStatus = 0;
    if (inputButton) inputButton.disabled = true;
    submitButton.disabled = true;
    simButton.innerHTML = "Stop";
    // the clock keeps running until Stop (or Reset, or a change of tab) is pressed
    if (!window.sim()) {
      stopSimulation();
    }
  }
}

simButton.addEventListener("click", toggleSimulation);

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
