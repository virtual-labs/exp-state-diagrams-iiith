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

// Context menu functionality
const menu = document.querySelector(".menu");
const menuOption = document.querySelector(".menu-option");
let menuVisible = false;

const toggleMenu = (command) => {
  menu.style.display = command === "show" ? "block" : "none";
  menuVisible = !menuVisible;
};

export const setPosition = ({ top, left }) => {
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  toggleMenu("show");
};

window.addEventListener("click", () => {
  if (menuVisible) toggleMenu("hide");
  window.selectedComponent = null;
  window.componentType = null;
});

document.addEventListener("contextmenu", function (event) {
  // Only show custom context menu for specific elements
  const target = event.target;
  const isComponent =
    target.closest(".drag-drop") ||
    target.closest(".logic-gate") ||
    target.closest(".high") ||
    target.closest(".low") ||
    target.closest(".output") ||
    target.closest(".jkflipflop");
  const isConnection = target.closest(".jtk-connector");
  const isWorkingArea =
    target.closest("#working-area") && !isComponent && !isConnection;

  // Only prevent default context menu for our interactive elements
  if (isComponent || isConnection || isWorkingArea) {
    event.preventDefault(); // Prevent the default context menu from appearing
    menu.style.display = "block";
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    // Store the target element and check if it's a connection
    window.contextMenuTarget = event.target;
    window.isConnectionContext =
      event.target.closest(".jtk-connector") !== null;

    toggleMenu("show");
  }
});

// Menu option click handler
menuOption.addEventListener("click", (e) => {
  if (e.target.innerHTML === "Delete") {
    if (window.componentType === "gate") {
      gatejs.deleteElement(window.selectedComponent);
    } else if (window.componentType === "flipflop") {
      flipflopjs.deleteJKFlipFlop(window.selectedComponent);
    } else {
      // Delete wire connections
      let connectionDeleted = false;

      // Try to delete connection that was right-clicked
      if (window.isConnectionContext && window.contextMenuTarget) {
        const connectorElement =
          window.contextMenuTarget.closest(".jtk-connector");
        if (connectorElement) {
          try {
            // Method 1: Try JSPlumb's select and check entries
            if (jsPlumbInstance.select) {
              const allConnections = jsPlumbInstance.select();
              if (allConnections.entries && allConnections.entries.length > 0) {
                for (let i = 0; i < allConnections.entries.length; i++) {
                  const connection = allConnections.entries[i];
                  if (
                    connection.connector &&
                    connection.connector.canvas === connectorElement
                  ) {
                    jsPlumbInstance.deleteConnection(connection);
                    connectionDeleted = true;
                    break;
                  }
                }
              }
            }

            // Method 2: Use the connections property directly
            if (!connectionDeleted && jsPlumbInstance.connections) {
              for (let i = 0; i < jsPlumbInstance.connections.length; i++) {
                const connection = jsPlumbInstance.connections[i];
                if (
                  connection.connector &&
                  connection.connector.canvas === connectorElement
                ) {
                  jsPlumbInstance.deleteConnection(connection);
                  connectionDeleted = true;
                  break;
                }
              }
            }

            // Method 3: Fallback to DOM removal
            if (!connectionDeleted && connectorElement.parentNode) {
              connectorElement.parentNode.removeChild(connectorElement);
              connectionDeleted = true;
            }
          } catch (error) {
            console.log("Error deleting connection:", error);
          }
        }
      }

      // Fallback: delete hovered connections
      if (!connectionDeleted) {
        const elementsToDelete = document.querySelectorAll(
          ".jtk-connector.jtk-hover"
        );

        if (elementsToDelete.length > 0) {
          elementsToDelete.forEach(function (connectorElement) {
            try {
              // Method 1: Try JSPlumb's select and check entries
              if (jsPlumbInstance.select && !connectionDeleted) {
                const allConnections = jsPlumbInstance.select();
                if (
                  allConnections.entries &&
                  allConnections.entries.length > 0
                ) {
                  for (let i = 0; i < allConnections.entries.length; i++) {
                    const connection = allConnections.entries[i];
                    if (
                      connection.connector &&
                      connection.connector.canvas === connectorElement
                    ) {
                      jsPlumbInstance.deleteConnection(connection);
                      connectionDeleted = true;
                      break;
                    }
                  }
                }
              }

              // Method 2: Use the connections property directly
              if (!connectionDeleted && jsPlumbInstance.connections) {
                for (let i = 0; i < jsPlumbInstance.connections.length; i++) {
                  const connection = jsPlumbInstance.connections[i];
                  if (
                    connection.connector &&
                    connection.connector.canvas === connectorElement
                  ) {
                    jsPlumbInstance.deleteConnection(connection);
                    connectionDeleted = true;
                    break;
                  }
                }
              }

              // Method 3: Fallback to DOM removal
              if (!connectionDeleted && connectorElement.parentNode) {
                connectorElement.parentNode.removeChild(connectorElement);
                connectionDeleted = true;
              }
            } catch (error) {
              console.log("Error deleting hovered connection:", error);
            }
          });
        }
      }
    }
  }
  // Reset context variables
  window.contextMenuTarget = null;
  window.isConnectionContext = false;
  toggleMenu("hide"); // Hide menu after selection
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

export const connectGate = function () {
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
      // If it already has a connection, do not establish a new connection
      return false;
    } else {
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });
      num_wires++;
      num_wires = num_wires % wireColours.length;
      if (start_uuid === "output") {
        const input = gatejs.gates[fromEndpoint.elementId];
        input.isConnected = true;
        gatejs.gates[toEndpoint.elementId].addInput(input, "");
        input.addOutput(gatejs.gates[toEndpoint.elementId]);
      } else if (end_uuid === "output") {
        const input = gatejs.gates[toEndpoint.elementId];
        input.isConnected = true;
        gatejs.gates[fromEndpoint.elementId].addInput(input, "");
        input.addOutput(gatejs.gates[fromEndpoint.elementId]);
      }
    }
  });
};

export const connectRSFF = function () {
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
      // If it already has a connection, do not establish a new connection
      return false;
    } else {
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });
      num_wires++;
      num_wires = num_wires % wireColours.length;
      const start_type = fromEndpoint.elementId.split("-")[0];
      let end_type = toEndpoint.elementId.split("-")[0];
      if (end_type === "Clock") {
        end_type = "Input";
      }
      if (start_type === "RSFlipFlop" && end_type === "RSFlipFlop") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        } else if (end_uuid === "output") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "RSFlipFlop" && end_type === "Input") {
        if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "Input" && end_type === "RSFlipFlop") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "RSFlipFlop" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Output" && end_type === "RSFlipFlop") {
        if (start_uuid === "input") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Input" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (start_type === "Output" && end_type === "Input") {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "RSFlipFlop" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of r-s flipflop
        if (start_uuid === "output") {
          // connection will end at the input of the gate
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
        // connection is started from the inputs of r-s flipflop
        else if (start_uuid === "input") {
          // connection will end at the output of the gate
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (
        end_type === "RSFlipFlop" &&
        fromEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of gate
        if (start_uuid === "output") {
          // connection will end at the input of r-s flipflop
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        }
        // connection is started from the inputs of gate
        else if (start_uuid === "input") {
          // connection will end at the output of the r-s flip flop

          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (
        start_type === "Input" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Input"
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "Output" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Output"
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        } else if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      }
    }
  });
};

export const connectJKFF = function () {
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
      // If it already has a connection, do not establish a new connection
      return false;
    } else {
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });
      num_wires++;
      num_wires = num_wires % wireColours.length;
      const start_type = fromEndpoint.elementId.split("-")[0];
      let end_type = toEndpoint.elementId.split("-")[0];
      if (end_type === "Clock") {
        end_type = "Input";
      }

      if (start_type === "JKFlipFlop" && end_type === "JKFlipFlop") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
            input.addqbarOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
          }
          input.setConnected(true, pos);
          if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
        } else if (end_uuid === "output") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
            input.addqbarOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
          }
          input.setConnected(true, pos);
          if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
        }
      } else if (start_type === "JKFlipFlop" && end_type === "Input") {
        if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
          input.addOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
        }
      } else if (start_type === "Input" && end_type === "JKFlipFlop") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
          input.addOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
        }
      } else if (start_type === "JKFlipFlop" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(gatejs.gates[toEndpoint.elementId]);
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
            input.addqbarOutput(gatejs.gates[toEndpoint.elementId]);
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Output" && end_type === "JKFlipFlop") {
        if (start_uuid === "input") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(gatejs.gates[fromEndpoint.elementId]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
            input.addqbarOutput(output);
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Input" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      } else if (start_type === "Output" && end_type === "Input") {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      } else if (
        start_type === "JKFlipFlop" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of r-s flipflop
        if (start_uuid === "output") {
          // connection will end at the input of the gate
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(output);
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
            input.addqbarOutput(output);
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
        // connection is started from the inputs of r-s flipflop
        else if (start_uuid === "input") {
          // connection will end at the output of the gate
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          }
          input.addOutput(flipflopjs.flipFlops[fromEndpoint.elementId]);
        }
      } else if (
        end_type === "JKFlipFlop" &&
        fromEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of gate
        if (start_uuid === "output") {
          // connection will end at the input of r-s flipflop
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          }
          input.addOutput(flipflopjs.flipFlops[toEndpoint.elementId]);
        }
        // connection is started from the inputs of gate
        else if (start_uuid === "input") {
          // connection will end at the output of the r-s flip flop

          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
            input.addqOutput(output);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
            input.addqbarOutput(output);
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (
        start_type === "Input" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Input"
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      } else if (
        start_type === "Output" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Output"
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      }
      // need to check
      else if (
        fromEndpoint.elementId in gatejs.gates &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        } else if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
          input.addOutput(output);
        }
      }
      // return true;
    }
  });
};

// D Flip Flop and gates
export const connectDFlipFlopGate = function () {
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
    } else {
      jsPlumbInstance.connect({
        uuids: [fromEndpoint.uuid, toEndpoint.uuid],
        paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 },
      });
      num_wires++;
      num_wires = num_wires % wireColours.length;
      const start_type = fromEndpoint.elementId.split("-")[0];
      let end_type = toEndpoint.elementId.split("-")[0];
      if (end_type === "Clock") {
        end_type = "Input";
      }
      if (start_type === "DFlipFlop" && end_type === "DFlipFlop") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
          }
        } else if (end_uuid === "output") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
          }
        }
      } else if (start_type === "DFlipFlop" && end_type === "Input") {
        if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
          }
        }
      } else if (start_type === "Input" && end_type === "DFlipFlop") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
          }
        }
      } else if (start_type === "DFlipFlop" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Output" && end_type === "DFlipFlop") {
        if (start_uuid === "input") {
          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (start_type === "Input" && end_type === "Output") {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (start_type === "Output" && end_type === "Input") {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "DFlipFlop" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of r-s flipflop
        if (start_uuid === "output") {
          // connection will end at the input of the gate
          const input = flipflopjs.flipFlops[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (
            Object.keys(fromEndpoint.overlays)[0].includes("qbarout")
          ) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
        // connection is started from the inputs of r-s flipflop
        else if (start_uuid === "input") {
          // connection will end at the output of the gate
          const input = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(fromEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
          }
        }
      } else if (
        end_type === "DFlipFlop" &&
        fromEndpoint.elementId in gatejs.gates
      ) {
        // connection is started from the outputs of gate
        if (start_uuid === "output") {
          // connection will end at the input of r-s flipflop
          const input = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("pr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
          } else if (Object.keys(toEndpoint.overlays)[0].includes("clr")) {
            flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
          }
        }
        // connection is started from the inputs of gate
        else if (start_uuid === "input") {
          // connection will end at the output of the r-s flip flop

          const input = flipflopjs.flipFlops[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          let pos = "";
          if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
            pos = "Q";
          } else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
            pos = "Q'";
          }
          input.setConnected(true, pos);
          output.addInput(input, pos);
        }
      } else if (
        start_type === "Input" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Input"
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        start_type === "Output" &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "input") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      } else if (
        fromEndpoint.elementId in gatejs.gates &&
        end_type === "Output"
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      }
      // need to check
      else if (
        fromEndpoint.elementId in gatejs.gates &&
        toEndpoint.elementId in gatejs.gates
      ) {
        if (start_uuid === "output") {
          const input = gatejs.gates[fromEndpoint.elementId];
          const output = gatejs.gates[toEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        } else if (end_uuid === "output") {
          const input = gatejs.gates[toEndpoint.elementId];
          const output = gatejs.gates[fromEndpoint.elementId];
          input.setConnected(true);
          output.addInput(input, "");
        }
      }
    }
  });
};

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

// Simulate button logic: use user input if present
const simulateButton = document.getElementById("simulate-button");
if (simulateButton) {
  simulateButton.addEventListener("click", function () {
    // If no input string, show error
    if (!gatejs.xValues || gatejs.xValues.length === 0) {
      resultDiv.innerHTML =
        "<span>&#9888;</span> Please enter input string using the Input button.";
      resultDiv.className = "failure-message";
      return;
    }
    // Run simulation
    const ok = gatejs.simulate();
    if (ok) {
      resultDiv.innerHTML = "Simulation complete. Check circuit outputs.";
      resultDiv.className = "success-message";
    }
    // If simulate() prints errors, they will appear in resultDiv
  });
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
  jsPlumbInstance.reset();
  window.numComponents = 0;
  window.firstSimulation = true;
  gatejs.clearGates();
  flipflopjs.clearFlipFlops();
  initStateDiagram();
});

window.currentTab = "task1";
connectJKFF();
refreshWorkingArea();
initStateDiagram();
