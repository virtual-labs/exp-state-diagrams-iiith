import * as gatejs from "./gate.js";
import { wireColours } from "./layout.js";
import * as clockjs from "./clock.js";
import * as flipflopjs from "./flipflop.js";

'use strict';

let num_wires = 0;

document.getScroll = function () {
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        let sx, sy, d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
}
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
        } else {
            jsPlumbInstance.connect({ uuids: [fromEndpoint.uuid, toEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            if (start_uuid === "output") {
                const input = gatejs.gates[fromEndpoint.elementId];
                input.isConnected = true;
                gatejs.gates[toEndpoint.elementId].addInput(input, "");
            } else if (end_uuid === "output") {
                const input = gatejs.gates[toEndpoint.elementId];
                input.isConnected = true;
                gatejs.gates[fromEndpoint.elementId].addInput(input, "");
            }

        }
    });
}

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
        } else {
            jsPlumbInstance.connect({ uuids: [fromEndpoint.uuid, toEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            const start_type = fromEndpoint.elementId.split("-")[0];
            let end_type = toEndpoint.elementId.split("-")[0];
            if(end_type === "Clock"){
                end_type = "Input";
            }
            if (start_type === "RSFlipFlop" && end_type === "RSFlipFlop") {
                if (start_uuid === "output") {
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                } else if (end_uuid === "output") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type === "RSFlipFlop" && end_type === "Input") {
                if (end_uuid === "output") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(fromEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type === "Input" && end_type === "RSFlipFlop") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            else if (start_type === "RSFlipFlop" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            else if (start_type === "Output" && end_type === "RSFlipFlop") {
                if (start_uuid === "input") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            else if (start_type === "Input" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (start_type === "Output" && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (start_type === "RSFlipFlop" && toEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of r-s flipflop
                if (start_uuid === "output") {
                    // connection will end at the input of the gate
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
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
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }

                }
            }
            else if (end_type === "RSFlipFlop" && fromEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of gate
                if (start_uuid === "output") {
                    // connection will end at the input of r-s flipflop
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("rin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setR([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("sin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setS([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }


                }
                // connection is started from the inputs of gate
                else if (start_uuid === "input") {
                    // connection will end at the output of the r-s flip flop

                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);

                }
            }
            else if (start_type === "Input" && toEndpoint.elementId in gatejs.gates) {

                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");

                }
            }
            else if (start_type === "Output" && toEndpoint.elementId in gatejs.gates) {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            
            else if (fromEndpoint.elementId in gatejs.gates && toEndpoint.elementId in gatejs.gates) {

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
}


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
        } else {
            jsPlumbInstance.connect({ uuids: [fromEndpoint.uuid, toEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
            num_wires++;
            num_wires = num_wires % wireColours.length;
            const start_type = fromEndpoint.elementId.split("-")[0];
            let end_type = toEndpoint.elementId.split("-")[0];
            if(end_type === "Clock"){
                end_type = "Input";
            }
            
            if (start_type === "JKFlipFlop" && end_type === "JKFlipFlop") {
                if (start_uuid === "output") {
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                } else if (end_uuid === "output") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            
            else if (start_type === "JKFlipFlop" && end_type === "Input") {
                if (end_uuid === "output") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            
            else if (start_type === "Input" && end_type === "JKFlipFlop") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                }
            }
            
            else if (start_type === "JKFlipFlop" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            
            else if (start_type === "Output" && end_type === "JKFlipFlop") {
                if (start_uuid === "input") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            
            else if (start_type === "Input" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (start_type === "Output" && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
           
            else if (start_type === "JKFlipFlop" && toEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of r-s flipflop
                if (start_uuid === "output") {
                    // connection will end at the input of the gate
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
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
                    if (Object.keys(fromEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }

                }
            }
            else if (end_type === "JKFlipFlop" && fromEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of gate
                if (start_uuid === "output") {
                    // connection will end at the input of r-s flipflop
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("kin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setK([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("jin")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setJ([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }


                }
                // connection is started from the inputs of gate
                else if (start_uuid === "input") {
                    // connection will end at the output of the r-s flip flop

                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);

                }
            }
            else if (start_type === "Input" && toEndpoint.elementId in gatejs.gates) {

                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");

                }
            }
            else if (start_type === "Output" && toEndpoint.elementId in gatejs.gates) {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // need to check
            else if (fromEndpoint.elementId in gatejs.gates && toEndpoint.elementId in gatejs.gates) {

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
            // return true;
        }
    });
}

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
            jsPlumbInstance.connect({ uuids: [fromEndpoint.uuid, toEndpoint.uuid], paintStyle: { stroke: wireColours[num_wires], strokeWidth: 4 } });
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
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
                    }
                } else if (end_uuid === "output") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
                    }
                }
            }
            else if (start_type === "DFlipFlop" && end_type === "Input") {
                if (end_uuid === "output") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(fromEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
                    }
                }
            }
            else if (start_type === "Input" && end_type === "DFlipFlop") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
                    }
                }
            }
            else if (start_type === "DFlipFlop" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            else if (start_type === "Output" && end_type === "DFlipFlop") {
                if (start_uuid === "input") {
                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);
                }
            }
            else if (start_type === "Input" && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (start_type === "Output" && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (start_type === "DFlipFlop" && toEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of r-s flipflop
                if (start_uuid === "output") {
                    // connection will end at the input of the gate
                    const input = flipflopjs.flipFlops[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(fromEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("qbarout")) {
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
                    }
                    else if (Object.keys(fromEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(fromEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[fromEndpoint.elementId].setClr([input, pos]);
                    }

                }
            }
            else if (end_type === "DFlipFlop" && fromEndpoint.elementId in gatejs.gates) {
                // connection is started from the outputs of gate
                if (start_uuid === "output") {
                    // connection will end at the input of r-s flipflop
                    const input = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    let pos = "";
                    if (Object.keys(toEndpoint.overlays)[0].includes("din")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setD([input, pos]);
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("clk")) {
                        flipflopjs.flipFlops[toEndpoint.elementId].setClk([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("pr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setPr([input, pos]);
                    }
                    else if(Object.keys(toEndpoint.overlays)[0].includes("clr")){
                        flipflopjs.flipFlops[toEndpoint.elementId].setClr([input, pos]);
                    }

                }
                // connection is started from the inputs of gate
                else if (start_uuid === "input") {
                    // connection will end at the output of the r-s flip flop

                    const input = flipflopjs.flipFlops[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    let pos = ""
                    if (Object.keys(toEndpoint.overlays)[0].includes("qout")) {
                        pos = "Q";
                    }
                    else if (Object.keys(toEndpoint.overlays)[0].includes("qbarout")) {
                        pos = "Q'";
                    }
                    input.setConnected(true, pos);
                    output.addInput(input, pos);

                }
            }
            else if (start_type === "Input" && toEndpoint.elementId in gatejs.gates) {

                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Input") {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");

                }
            }
            else if (start_type === "Output" && toEndpoint.elementId in gatejs.gates) {
                if (start_uuid === "input") {
                    const input = gatejs.gates[toEndpoint.elementId];
                    const output = gatejs.gates[fromEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            else if (fromEndpoint.elementId in gatejs.gates && end_type === "Output") {
                if (start_uuid === "output") {
                    const input = gatejs.gates[fromEndpoint.elementId];
                    const output = gatejs.gates[toEndpoint.elementId];
                    input.setConnected(true);
                    output.addInput(input, "");
                }
            }
            // need to check
            else if (fromEndpoint.elementId in gatejs.gates && toEndpoint.elementId in gatejs.gates) {

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
}

export const unbindEvent = () => {
    jsPlumbInstance.unbind("beforeDrop");
}


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
    }
    else if (gateType === "ThreeIPNAND") {
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
    }
    else if (gateType === "NOT") {
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
    }
    else if (gateType === "FullAdder") {
        // carry output
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.5, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "output:0:" + id,
                overlays: [
                    { type: "Label", options: { label: "Cout", id: "cout", location: [3, 0.2] } }
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
                    { type: "Label", options: { label: "Sum", id: "sum", location: [0.3, -1.7] } }
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
                    { type: "Label", options: { label: "A0", id: "a0", location: [0.3, 1.7] } }
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
                    { type: "Label", options: { label: "B0", id: "b0", location: [0.3, 1.7] } }
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
                    { type: "Label", options: { label: "Cin", id: "cin", location: [-1, 0.2] } }
                ],
            })
        );
    }
    else if (gateType === "RSFlipFlop") {
        // input s
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.7, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "rin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "sin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
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
                    { type: "Label", options: { id: "qbarout", location: [-1, 0.2] } } // qbar for q '
                ],
            })
        );
    }
    else if (gateType === "JKFlipFlop") {
        // input K
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.7, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "kin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "jin", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
                ],
            })
        );
    }
    else if (gateType === "DFlipFlop") {
        // input D
        gate.addOutputPoints(
            jsPlumbInstance.addEndpoint(element, {
                anchor: [0, 0.31, -1, 0, -7, 0],
                source: true,
                target: true,
                connectionsDetachable: false,
                uuid: "input:1:" + id,
                overlays: [
                    { type: "Label", options: { id: "din", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "clk", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "pr", location: [-1, 0.2] } }
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
                    { type: "Label", options: { id: "clr", location: [3, 0.2] } }
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
                    { type: "Label", options: { id: "qout", location: [-1, 0.2] } }
                ],
            })
        );
        
    }
}

export function initRSFlipFlop() {
    const ids = ["Input-0", "Input-1", "Output-2", "Output-3"]; // [A B Sum Carry Out]
    const types = ["Input", "Input", "Output", "Output"];
    const names = ["S", "R", "Q", "Q'"];
    const positions = [
        { x: 40, y: 650 },
        { x: 40, y: 150 },
        { x: 820, y: 275 },
        { x: 820, y: 525 },
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);;
    }
    clockjs.addClock(0.5, 50, "working-area", 40, 400, "Clk", "Clock-0");
}

export function initJKFlipFlop() {
    const ids = ["Input-0", "Input-1", "Output-2", "Output-3"]; // [A B Sum Carry Out]
    const types = ["Input", "Input", "Output", "Output"];
    const names = ["J", "K", "Q", "Q'"];
    const positions = [
        { x: 40, y: 150 },
        { x: 40, y: 650 },
        { x: 820, y: 275 },
        { x: 820, y: 525 },
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);;
    }
    clockjs.addClock(0.5, 50, "working-area", 40, 400, "Clk", "Clock-0");
}


export function initDFlipFlop() {
    const ids = ["Input-0", "Output-1", "Output-2","Output-3"]; // [A B Sum Carry Out]
    const types = ["Input", "Output", "Output","Output"];
    const names = ["Ori", "QA", "QB","QC"];
    const positions = [
        { x: 40, y: 200 },
        { x: 820, y: 150 },
        { x: 820, y: 400 },
        { x: 820, y: 700 }
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
        gate.registerComponent("working-area", positions[i].x, positions[i].y);
    }
    clockjs.addClock(0.5, 50, "working-area", 40, 400, "Clk", "Clock-0");
}

export function initStateDiagram() {
    const ids = ["Input-0","Output-1","Output-2"];
    const types = ["Input","Output", "Output"];
    const names = ["X","A", "B"];
    const positions = [
        { x: 40, y: 200 },
        { x: 820, y: 200 },
        { x: 820, y: 550 }
    ];
    for (let i = 0; i < ids.length; i++) {
        let gate = new gatejs.Gate(types[i]);
        gate.setId(ids[i]);
        gate.setName(names[i]);
        const component = gate.generateComponent();
        const parent = document.getElementById("working-area");
        parent.insertAdjacentHTML('beforeend', component);
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

window.currentTab = "task1";
connectJKFF();
refreshWorkingArea();
initStateDiagram();
