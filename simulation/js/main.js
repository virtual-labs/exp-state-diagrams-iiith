import * as gatejs from "./gate.js";
import { wireColours } from "./layout.js";
import * as clockjs from "./clock.js";
import * as flipflopjs from "./flipflop.js";

("use strict");

let num_wires = 0;

// Initialize global variables
window.numComponents = 0;

document.getScroll = function () {
  if (window.pageYOffset !== undefined) {
    return [pageXOffset, pageYOffset];
  } else {
    let sx,
      sy,
      d = document,
      r = d.documentElement,
      b = d.body;
    sx = r.scrollLeft || b.scrollLeft || 0;
    sy = r.scrollTop || b.scrollTop || 0;
    return [sx, sy];
  }
};
const workingArea = document.getElementById("working-area");
export const jsPlumbInstance = jsPlumbBrowserUI.newInstance({
  container: workingArea,
  maxConnections: -1,
  endpoint: {
    type: "Dot",
    options: { radius: 7 },
  },
  dragOptions: {
    containment: "parentEnclosed",
    containmentPadding: 5,
  },
  connector: "Flowchart",
  paintStyle: { strokeWidth: 4, stroke: "#888888" },
  connectionsDetachable: false,
});

// Add connection hover events for deletion
jsPlumbInstance.bind("connection", function (info) {
  const connection = info.connection;
  const connectorElement = connection.connector.canvas;

  if (connectorElement) {
    // Add hover class on mouse enter
    connectorElement.addEventListener("mouseenter", function () {
      connectorElement.classList.add("jtk-hover");
    });

    // Remove hover class on mouse leave
    connectorElement.addEventListener("mouseleave", function () {
      connectorElement.classList.remove("jtk-hover");
    });
  }
});

// Add gate function for HTML onclick handlers
window.addGate = function (event) {
  const gateType = event.target.classList[1].toUpperCase();
  let gate = new gatejs.Gate(gateType);
  const component = gate.generateComponent();
  const parent = document.getElementById("working-area");
  parent.insertAdjacentHTML("beforeend", component);
  gate.registerComponent("working-area");
};

// Add JK Flip-Flop function for HTML onclick handlers
window.addJKFlipFlop = function (event) {
  const jkff = new flipflopjs.JKFlipFlop();
  flipflopjs.flipFlops[jkff.id] = jkff;
  jkff.registerComponent("working-area");
};

// Returns the component (gate, input/output bit, clock or JK flip-flop) with the given id
function findComponent(id) {
  return gatejs.gates[id] || flipflopjs.flipFlops[id] || null;
}

function isFlipFlop(component) {
  return component && component.constructor.name === "JKFlipFlop";
}

// Returns the id of the label overlay of an endpoint (the pin name); it is empty for gates and input/output bits
function pinLabel(endpoint) {
  const keys = Object.keys(endpoint.overlays || {});
  return keys.length > 0 ? keys[0] : "";
}

// Tells which output of a component a wire starts from: "Q" or "Q'" for a flip-flop, "" for everything else
function outputPos(component, endpoint) {
  if (isFlipFlop(component)) {
    return pinLabel(endpoint).includes("qbarout") ? "Q'" : "Q";
  }
  return "";
}

// Returns the output endpoint and the input endpoint of a wire, whichever way it was drawn
function splitEndpoints(epA, epB) {
  return epA.uuid.startsWith("output") ? [epA, epB] : [epB, epA];
}

// Sets (or, with an empty list, clears) the component that drives an input pin of a flip-flop
function setFlipFlopPin(sink, pin, source) {
  if (pin.includes("jin")) {
    sink.setJ(source);
  } else if (pin.includes("kin")) {
    sink.setK(source);
  } else if (pin.includes("clk")) {
    sink.setClk(source);
  }
}

// Records a new wire in the circuit model. It works the same for gates, input/output bits, the clock and the
// flip-flops, and for both directions in which a wire can be dragged.
function linkEndpoints(fromEndpoint, toEndpoint) {
  const [outEp, inEp] = splitEndpoints(fromEndpoint, toEndpoint);
  const driver = findComponent(outEp.elementId);
  const sink = findComponent(inEp.elementId);
  if (!driver || !sink) {
    return;
  }
  const pos = outputPos(driver, outEp);

  // the component that drives the wire
  if (isFlipFlop(driver)) {
    if (pos === "Q") {
      driver.addqOutput(sink);
    } else {
      driver.addqbarOutput(sink);
    }
    driver.setConnected(true, pos);
  } else {
    driver.addOutput(sink);
    driver.setConnected(true);
  }

  // the component that receives the wire
  if (isFlipFlop(sink)) {
    setFlipFlopPin(sink, pinLabel(inEp), [driver, pos]);
  } else {
    sink.addInput(driver, pos);
  }
}

// Removes a single occurrence of item from list
function removeOne(list, item) {
  const index = list.indexOf(item);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

// Removes a deleted wire from the circuit model
function unlinkEndpoints(connection, epA, epB) {
  if (!epA || !epB || !epA.uuid || !epB.uuid) {
    return;
  }
  const [outEp, inEp] = splitEndpoints(epA, epB);
  if (!outEp.uuid.startsWith("output") || !inEp.uuid.startsWith("input")) {
    return;
  }
  const driver = findComponent(outEp.elementId);
  const sink = findComponent(inEp.elementId);
  if (!driver || !sink) {
    return;
  }
  const pos = outputPos(driver, outEp);
  // the driver stays connected only if it has another wire
  const lastWire = outEp.connections.filter((c) => c !== connection).length === 0;

  if (isFlipFlop(driver)) {
    removeOne(pos === "Q" ? driver.qOutputs : driver.qbarOutputs, sink);
  } else {
    removeOne(driver.outputs, sink);
  }
  if (lastWire) {
    driver.setConnected(false, pos);
  }

  if (isFlipFlop(sink)) {
    setFlipFlopPin(sink, pinLabel(inEp), []);
  } else {
    const index = sink.inputs.findIndex(
      (pair) => pair[0] === driver && pair[1] === pos
    );
    if (index !== -1) {
      sink.inputs.splice(index, 1);
    }
  }
}

// Keep the circuit model in sync when a wire is deleted
function bindDetach() {
  jsPlumbInstance.unbind("connection:detach");
  jsPlumbInstance.bind("connection:detach", function (info) {
    unlinkEndpoints(info.connection, info.sourceEndpoint, info.targetEndpoint);
  });
}
bindDetach();

// The wires of all the tasks are handled in the same way
const bindWires = function () {
  bindDetach();
  jsPlumbInstance.unbind("beforeDrop");
  jsPlumbInstance.bind("beforeDrop", function (data) {
    const fromEndpoint = data.connection.endpoints[0];
    const toEndpoint = data.dropEndpoint;

    const start_uuid = fromEndpoint.uuid.split(":")[0];
    const end_uuid = toEndpoint.uuid.split(":")[0];

    if (fromEndpoint.elementId === toEndpoint.elementId) {
      return false;
    }

    if (start_uuid === "input" && end_uuid === "input") {
      return false;
    } else if (start_uuid === "output" && end_uuid === "output") {
      return false;
    } else if (
      (end_uuid === "input" && toEndpoint.connections.length > 0) ||
      (start_uuid === "input" && fromEndpoint.connections.length > 1)
    ) {
      // An input pin takes one wire only
      return false;
    }
    jsPlumbInstance.connect({
      uuids: [fromEndpoint.uuid, toEndpoint.uuid],
      paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
    });
    num_wires++;
    num_wires = num_wires % wireColours.length;
    linkEndpoints(fromEndpoint, toEndpoint);
    // the wire has been drawn above, so the drop itself is cancelled
    return false;
  });
};
export const connectGate = bindWires;
export const connectRSFF = bindWires;
export const connectJKFF = bindWires;
export const connectDFlipFlopGate = bindWires;

export const unbindEvent = () => {
  jsPlumbInstance.unbind("beforeDrop");
};

export function registerGate(id, gate) {
  const element = document.getElementById(id);
  const gateType = id.split("-")[0];

  if (
    gateType === "AND" ||
    gateType === "OR" ||
    gateType === "XOR" ||
    gateType === "XNOR" ||
    gateType === "NAND" ||
    gateType === "NOR"
  ) {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, -9],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 10],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
      })
    );
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "ThreeIPNAND") {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.15, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.85, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:2:" + id,
      })
    );
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "NOT") {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "Input" || gateType === "Clock") {
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
      })
    );
  } else if (gateType === "Output") {
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
      })
    );
  } else if (gateType === "FullAdder") {
    // carry output
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:0:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Cout", id: "cout", location: [3, 0.2] },
          },
        ],
      })
    );
    // sum output
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 1, 0, 1, 0, 7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:1:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Sum", id: "sum", location: [0.3, -1.7] },
          },
        ],
      })
    );
    // input A0
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 0, 0, -1, -25, -7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "A0", id: "a0", location: [0.3, 1.7] },
          },
        ],
      })
    );
    // input B0
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.5, 0, 0, -1, 25, -7],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "B0", id: "b0", location: [0.3, 1.7] },
          },
        ],
      })
    );
    // carry input
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.5, 1, 0, 7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:2:" + id,
        overlays: [
          {
            type: "Label",
            options: { label: "Cin", id: "cin", location: [-1, 0.2] },
          },
        ],
      })
    );
  } else if (gateType === "RSFlipFlop") {
    // input s
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.7, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "rin", location: [3, 0.2] } },
        ],
      })
    );
    // input R
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.3, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          { type: "Label", options: { id: "sin", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
    // output Q'
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.7, 1, 0, 7, -1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:3:" + id,
        overlays: [
          { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } }, // qbar for q '
        ],
      })
    );
  } else if (gateType === "JKFlipFlop") {
    // input K
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.7, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "kin", location: [3, 0.2] } },
        ],
      })
    );
    // input J
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.3, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:0:" + id,
        overlays: [
          { type: "Label", options: { id: "jin", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.5, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
  } else if (gateType === "DFlipFlop") {
    // input D
    gate.addOutputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.31, -1, 0, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:1:" + id,
        overlays: [
          { type: "Label", options: { id: "din", location: [3, 0.2] } },
        ],
      })
    );
    // input clock
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0, 0.69, 0, 1, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:4:" + id,
        overlays: [
          { type: "Label", options: { id: "clk", location: [3, 0.2] } },
        ],
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.57, 0, 0, -1, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:5:" + id,
        overlays: [
          { type: "Label", options: { id: "pr", location: [-1, 0.2] } },
        ],
      })
    );
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [0.57, 1, 0, 1, -7, 0],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "input:6:" + id,
        overlays: [
          { type: "Label", options: { id: "clr", location: [3, 0.2] } },
        ],
      })
    );
    // output Q
    gate.addInputPoints(
      jsPlumbInstance.addEndpoint(element, {
        anchor: [1, 0.3, 1, 0, 7, 1],
        source: true,
        target: true,
        connectionsDetachable: false,
        uuid: "output:2:" + id,
        overlays: [
          { type: "Label", options: { id: "qout", location: [-1, 0.2] } },
        ],
      })
    );
  }
}

const inputButton = document.getElementById("input-button");
const promptFormContainer = document.getElementById("prompt-form-container");
const promptForm = document.getElementById("prompt-form");
const promptMessage = document.getElementById("prompt-message");
const errorMessage = document.getElementById("error-message");
const resultDiv = document.getElementById("result");

let inputString = "";

function parseInputString(str) {
  // Accepts 0/1 or true/false or T/F, returns boolean array, or null if invalid
  const arr = [];
  for (let c of str) {
    if (c === "0" || c.toLowerCase() === "f") arr.push(false);
    else if (c === "1" || c.toLowerCase() === "t") arr.push(true);
    else if (c === " ") continue;
    else return null;
  }
  return arr.length > 0 ? arr : null;
}

if (inputButton && promptFormContainer && promptForm && promptMessage) {
  inputButton.addEventListener("click", function () {
    promptMessage.textContent = "Enter input string (e.g. 01011):";
    errorMessage.textContent = "";
    promptForm.elements["text"].value = inputString;
    promptFormContainer.style.display = "block";
    promptForm.elements["text"].focus();
  });

  promptForm.onsubmit = function (e) {
    e.preventDefault();
    const value = promptForm.elements["text"].value.trim();
    if (value === "") {
      errorMessage.textContent = "Input string cannot be empty.";
      return;
    }
    const arr = parseInputString(value);
    if (!arr) {
      errorMessage.textContent = "Invalid input. Use only 0/1, T/F.";
      return;
    }
    inputString = value;
    window.inputString = inputString;
    gatejs.xValues.length = 0;
    arr.forEach((v) => gatejs.xValues.push(v));
    promptFormContainer.style.display = "none";
    errorMessage.textContent = "";
    // Optionally, show a message
    resultDiv.innerHTML = `Input string set: <b>${inputString}</b>`;
    resultDiv.className = "success-message";
  };

  promptForm.elements["cancel"].onclick = function (e) {
    e.preventDefault();
    promptFormContainer.style.display = "none";
    errorMessage.textContent = "";
  };
}

// The input string of the task: the default one, or the one typed with the Input button
export function setInputString(str) {
  const arr = parseInputString(str);
  if (!arr) {
    return false;
  }
  inputString = str;
  window.inputString = str;
  gatejs.xValues.length = 0;
  arr.forEach((v) => gatejs.xValues.push(v));
  return true;
}

// Every task starts with an input string, so that Simulate works at once
export function useDefaultInputString() {
  setInputString(window.currentTab === "task2" ? "101111000101101110" : "1011000010");
  resultDiv.innerHTML = `Input string: <b>${inputString}</b> (click on Input to change it)`;
  resultDiv.className = "success-message";
}

export function initStateDiagram() {
  const ids = ["Input-0", "Output-1", "Output-2"];
  const types = ["Input", "Output", "Output"];
  const names = ["X", "A", "B"];
  const positions = [
    { x: 40, y: 200 },
    { x: 820, y: 200 },
    { x: 820, y: 550 },
  ];
  for (let i = 0; i < ids.length; i++) {
    let gate = new gatejs.Gate(types[i]);
    gate.setId(ids[i]);
    gate.setName(names[i]);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML("beforeend", component);
    gate.registerComponent("working-area", positions[i].x, positions[i].y);
  }
  clockjs.addClock(0.5, 50, "working-area", 40, 400, "Clk", "Clock-0");
}

export function refreshWorkingArea() {
  jsPlumbInstance.reset();
  window.numComponents = 0;
  window.firstSimulation = true;
  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
}
refresh.addEventListener("click", function () {
  gatejs.stopSimulation();
  document.getElementById("table-body").innerHTML = "";
  document.getElementById("table-head").innerHTML = "";
  jsPlumbInstance.reset();
  window.numComponents = 0;
  window.firstSimulation = true;
  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
  bindWires();
  initStateDiagram();
  useDefaultInputString();
});

window.currentTab = "task1";
connectJKFF();
refreshWorkingArea();
initStateDiagram();
useDefaultInputString();
