import { registerGate, jsPlumbInstance } from "./main.js";
import { setPosition } from "./layout.js";
import { computeAnd, computeNand, computeNor, computeOr, computeXnor, computeXor, testBasicCounter, testRingCounter } from "./validator.js";
import { checkConnectionsJK, simulateFFJK, testSimulateFFJK, simulateFFDD, checkConnectionsDD, testSimulateDD } from "./flipflop.js";

'use strict';
const EMPTY = "";
export let gates = {}; // Array of gates
// const xValues = [false,false, true,true, false,false, true,true, false,false, true,true, false,false, true,true];
window.xValues = [];
let xIndex = 0;
window.numComponents = 0;
export function clearGates() {

    for (let gateId in gates) {
        delete gates[gateId];
    }

    gates = {};
}

export class Gate {
    constructor(type) {
        this.type = type;
        this.id = type + "-" + window.numComponents++;
        this.positionX = 0;
        this.positionY = 0;
        this.isConnected = false;
        this.inputPoints = [];
        this.outputPoints = [];
        this.inputs = []; // List of input gates
        this.output = null; // Output value
        this.isInput = false;
        this.isOutput = false;
        this.name = null;
    }
    setId(id) {
        this.id = id;
    }
    addInput(gate, pos) {
        this.inputs.push([gate, pos]);
    }
    removeInput(gate) {
        let index = -1;
        let i = 0;
        for (let input in this.inputs) {
            if (this.inputs[input][0] === gate) {
                index = i;
                break;
            }
            i++;
        }

        if (index > -1) {
            this.inputs.splice(index, 1);
        }
    }
    updatePosition(id) {
        this.positionY = window.scrollY + document.getElementById(id).getBoundingClientRect().top // Y

        this.positionX = window.scrollX + document.getElementById(id).getBoundingClientRect().left // X
    }
    setName(name) {
        this.name = name;
    }

    generateComponent() {
        let component = EMPTY;

        switch (this.type) {
            case "Input":
                component = `<div class="high" id= ${this.id} ><a></a><p> ${this.name}  </p></div>`;
                this.output = true;
                this.isInput = true;
                break;
            case "Output":
                component = `<div class="output" id= ${this.id}><a></a><p>  ${this.name}  </p></div>`;
                this.isOutput = true;
                break;
            default:
                component = `<div class="drag-drop logic-gate ${this.type.toLowerCase()}" id= ${this.id}></div>`;
        }
        return component;

    }

    // Adds element to the circuit board, adds event listeners and generates its endpoints.
    registerComponent(workingArea, x = 0, y = 0) {
        // get width of working area
        const width = document.getElementById(workingArea).offsetWidth;
        const height = document.getElementById(workingArea).offsetHeight;
        let scale = 900;
        let yScale = 800;
        x = (x / scale) * width;
        y = (y / yScale) * height;

        const el = document.getElementById(this.id);
        el.style.left = x + "px";
        el.style.top = y + "px";

        if (this.type != "Input" && this.type != "Output") {

            el.addEventListener(
                "contextmenu",
                function (ev) {
                    ev.preventDefault();
                    const origin = {
                        left: ev.pageX - document.getScroll()[0],
                        top: ev.pageY - document.getScroll()[1],
                    };
                    setPosition(origin);
                    window.selectedComponent = this.id;
                    window.componentType = "gate";
                    return false;
                },
                false
            );
        }
        gates[this.id] = this;
        registerGate(this.id, this);

        this.updatePosition(this.id);
    }

    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }


    generateOutput() {
        switch (this.type) {
            case "AND":
                this.output = computeAnd(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "OR":
                this.output = computeOr(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "NOT":
                this.output = !getOutput(this.inputs[0]);
                break;
            case "NAND":
                this.output = computeNand(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "NOR":
                this.output = computeNor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "XOR":
                this.output = computeXor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "XNOR":
                this.output = computeXnor(getOutput(this.inputs[0]), getOutput(this.inputs[1]));
                break;
            case "ThreeIPNAND":
                this.output = !(getOutput(this.inputs[0]) && getOutput(this.inputs[1]) && getOutput(this.inputs[2]));
                break;
            case "Output":
                this.output = getOutput(this.inputs[0]);
                break;
        }
    }

    setOutput(val) {
        this.output = val;
    }
    setConnected(val) {
        this.isConnected = val;
    }
}

function getOutput(input) {
    let gate = input[0];
    let pos = input[1];

    if (pos === EMPTY) {
        return gate.output;
    }
    else if (pos === "Q") {
        return gate.Qbefore;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
}


function addGate(event) {
    let type = event.target.innerHTML;
    if (type === "3-NAND")
        type = "ThreeIPNAND";
    const gate = new Gate(type);
    const component = gate.generateComponent();
    const parent = document.getElementById("working-area");
    parent.insertAdjacentHTML('beforeend', component);
    gate.registerComponent("working-area");
}

window.addGate = addGate;

export function getResult(gate) {
    if (gate.output != null) {
        return;
    }
    for (let i = 0; i < gate.inputs.length; i++) {

        // changes made to get result for all gates
        if (getOutput(gate.inputs[i]) == null) {
            getResult(gate.inputs[i]);
        }
    }
    gate.generateOutput();
    return;
}


function setInput(event) {
    let parentElement = event.target.parentElement;
    let element = event.target;
    let type = parentElement.className.split(" ")[0];
    let gate = gates[parentElement.id];
    if (type === "high") {
        // change class high to low
        parentElement.classList.replace("high", "low");
        element.innerHTML = "0";
        gate.setOutput(false);
    }
    else if (type === "low") {
        parentElement.classList.replace("low", "high");
        element.innerHTML = "1";
        gate.setOutput(true);
    }
}

window.setInput = setInput;

export function printErrors(message, objectId) {
    const result = document.getElementById('result');
    result.innerHTML += message;
    result.className = "failure-message";
    if (objectId !== null) {
        objectId.classList.add("highlight")
        setTimeout(function () { objectId.classList.remove("highlight") }, 2000);
    }
}

export function checkConnections() {
    let correctConnection = true;
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.inputPoints.length != gate.inputs.length) {
            printErrors(gate.name + " not connected.\n", null);
            correctConnection = false;
        }
        else if (!gate.isConnected && !gate.isOutput) {
            printErrors("Input " + gate.name + " not connected" + ".\n", null);
            correctConnection = false;
        }
    }
    if (correctConnection) {
        return true;
    }
    else {
        //printErrors("Connections are not correct.\n")
        // alert("Connections are not correct");
        return false;
    }
}

export function simulate() {

    window.simulate = 0; // status store of infinte clock ulte naming
    // change binary string to array
    if (!checkConnections()) {
        return false;
    }

    if (window.currentTab === "task2") {
        if (!checkConnectionsDD()) {
            return false;
        }
    }
    else if (window.currentTab === "task1") {
        if (!checkConnectionsJK()) {
            return false;
        }
    }
    xIndex = 0;
    // handling ori for task 2
    if (window.currentTab === "task2") {
        for (let gateId in gates) {
            const gate = gates[gateId];
            if (gate.type === "Input") {
                if (gate.output === false) {
                    simulate2();
                }
                gate.output = true;
                let element = document.getElementById(gate.id)
                element.className = "high";
                element.childNodes[0].innerHTML = "1";
            }
        }
    }

    let circuitHasClock = false;

    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.type === "Clock") {
            circuitHasClock = true;
            gate.simulate();
        }
    }
    if (!circuitHasClock) {
        simulate2();
    }

    return true;
}

function simulate2() {
    // change input bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.type === "Input") {
            gate.output = xValues[xIndex];
            if (gate.output === false) {
                let element = document.getElementById(gate.id)
                element.className = "low";
                element.childNodes[0].innerHTML = "0";
            }
            else{
                let element = document.getElementById(gate.id)
                element.className = "high";
                element.childNodes[0].innerHTML = "1";
            }
        }
    }
    xIndex++;
    xIndex %= window.xValues.length;

    // input bits

    for (let gateId in gates) {
        const gate = gates[gateId];

        for (let index in gate.inputs) {
            let input = gate.inputs[index][0];

            if (input.isInput) {
                let val = input.output;
                if (gate.type === "OR" && val === true) {
                    gate.setOutput(true);
                }
                if (gate.type === "AND" && val === false) {
                    gate.setOutput(false);
                }
                if (gate.type === "NOR" && val === true) {
                    gate.setOutput(false);
                }
                if (gate.type === "NAND" && val === false) {
                    gate.setOutput(true);
                }
                if (gate.type === "ThreeIPNAND" && val === false) {
                    gate.setOutput(true);
                }
            }
        }
    }



    // logic gates and flip flop
    for (let iterations = 0; iterations < 4; iterations++) {
        for (let gateId in gates) {
            const gate = gates[gateId];
            if (gate.isOutput === false && gate.isInput === false && gate.type != "NOT" && gate.type != "ThreeIPNAND") {
                // console.log(gate.inputs[0]);
                // console.log(gate.inputs[1]);
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                if (val1 == null || val2 == null) {
                    let val = null;
                    if (val1 == null && val2 == null) {
                        continue;
                    }
                    else if (val1 == null) {
                        val = val2;
                    }
                    else if (val2 == null) {
                        val = val1;
                    }

                    if (gate.type === "OR" && val === true) {
                        gate.setOutput(true);
                    }
                    if (gate.type === "AND" && val === false) {
                        gate.setOutput(false);
                    }
                    if (gate.type === "NOR" && val === true) {
                        gate.setOutput(false);
                    }
                    if (gate.type === "NAND" && val === false) {
                        gate.setOutput(true);
                    }
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput === false && gate.isInput === false && gate.type === "NOT") {
                const val1 = getOutput(gate.inputs[0]);
                if (val1 == null) {
                    continue;
                }
                else {
                    gate.generateOutput();
                }
            }
            else if (gate.isOutput === false && gate.isInput === false && gate.type === "ThreeIPNAND") {
                const val1 = getOutput(gate.inputs[0]);
                const val2 = getOutput(gate.inputs[1]);
                const val3 = getOutput(gate.inputs[2]);
                const val = [];
                if (val1 != null)
                    val.push(val1);
                if (val2 != null)
                    val.push(val2);
                if (val3 != null)
                    val.push(val3);
                if (val.length === 0) {
                    continue;
                }
                else if (val.length === 3) {
                    gate.generateOutput();
                }
                else {
                    for (let value in val) {
                        if (val[value] === false) {
                            gate.setOutput(true);
                            break;
                        }
                    }
                }
            }
        }
        if (window.currentTab === "task2") {
            simulateFFDD();
        }

    }
    if (window.currentTab === "task1") {
        simulateFFJK();
    }
    // output bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isOutput) {
            let input = gate.inputs[0];
            let element = document.getElementById(gate.id)
            if (getOutput(input)) {
                element.className = "high";
                element.childNodes[0].innerHTML = "1";
            }
            else if (getOutput(input) === false) {
                element.className = "low";
                element.childNodes[0].innerHTML = "0";
            }
        }
    }
    // for(let gateID in gates)
    // {
    //     const gate = gates[gateID];
    //     console.log(gate);
    // }
}

window.sim = simulate;
window.sim2 = simulate2;

export function testSimulation(gates, flipFlops) {
    if (!checkConnections()) {
        return false;
    }

    if (window.currentTab === "task2") {
        if (!checkConnectionsDD()) {
            return false;
        }
    }
    else if (window.currentTab === "task1") {
        if (!checkConnectionsJK()) {
            return false;
        }
    }


    // input bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        for (let index in gate.inputs) {
            let input = gate.inputs[index][0];
            if (input.isInput) {
                let val = input.output;
                if (gate.type === "OR" && val === true) {
                    gate.setOutput(true);
                }
                if (gate.type === "AND" && val === false) {
                    gate.setOutput(false);
                }
                if (gate.type === "NOR" && val === true) {
                    gate.setOutput(false);
                }
                if (gate.type === "NAND" && val === false) {
                    gate.setOutput(true);
                }
                if (gate.type === "ThreeIPNAND" && val === false) {
                    gate.setOutput(true);
                }
            }
        }
    }
    // logic gates and flip flop
    if (window.currentTab === "task1") {
        for (let iterations = 0; iterations < 4; iterations++) {
            for (let gateId in gates) {
                const gate = gates[gateId];
                if (gate.isOutput === false && gate.isInput === false && gate.type != "NOT" && gate.type != "ThreeIPNAND") {
                    const val1 = getOutput(gate.inputs[0]);
                    const val2 = getOutput(gate.inputs[1]);
                    if (val1 == null || val2 == null) {
                        let val = null;
                        if (val1 == null && val2 == null) {
                            continue;
                        }
                        else if (val1 == null) {
                            val = val2;
                        }
                        else if (val2 == null) {
                            val = val1;
                        }

                        if (gate.type === "OR" && val === true) {
                            gate.setOutput(true);
                        }
                        if (gate.type === "AND" && val === false) {
                            gate.setOutput(false);
                        }
                        if (gate.type === "NOR" && val === true) {
                            gate.setOutput(false);
                        }
                        if (gate.type === "NAND" && val === false) {
                            gate.setOutput(true);
                        }
                    }
                    else {
                        gate.generateOutput();
                    }
                }
                else if (gate.isOutput === false && gate.isInput === false && gate.type === "NOT") {
                    const val1 = getOutput(gate.inputs[0]);
                    if (val1 == null) {
                        continue;
                    }
                    else {
                        gate.generateOutput();
                    }
                }
                else if (gate.isOutput === false && gate.isInput === false && gate.type === "ThreeIPNAND") {
                    const val1 = getOutput(gate.inputs[0]);
                    const val2 = getOutput(gate.inputs[1]);
                    const val3 = getOutput(gate.inputs[2]);
                    const val = [];
                    if (val1 != null)
                        val.push(val1);
                    if (val2 != null)
                        val.push(val2);
                    if (val3 != null)
                        val.push(val3);
                    if (val.length === 0) {
                        continue;
                    }
                    else if (val.length === 3) {
                        gate.generateOutput();
                    }
                    else {
                        for (let value in val) {
                            if (val[value] === false) {
                                gate.setOutput(true);
                                break;
                            }
                        }
                    }
                }
            }

            testSimulateFFJK(flipFlops);
        }

    }
    if (window.currentTab === "task2") {
        testSimulateDD(flipFlops);
    }

    // output bits
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isOutput) {
            let input = gate.inputs[0];
            if (getOutput(input) != null) {
                gate.setOutput(getOutput(input));
            }
        }
    }
    return true;
}

// function to submit the desired circuit and get the final success or failure message
export function submitCircuit() {

    document.getElementById("table-body").innerHTML = EMPTY;
    const result = document.getElementById("result");
    result.innerHTML = EMPTY;
    if (window.currentTab === "task2") {
        testRingCounter("Input-0", "Clock-0", "Output-1", "Output-2", "Output-3");
    }
    else if (window.currentTab === "task1") {
        testBasicCounter("Input-0", "Input-1", "Clock-0", "Output-2", "Output-3");
    }
}
window.submitCircuit = submitCircuit;


export function deleteElement(gateid) {

    let gate = gates[gateid];
    // jsPlumbInstance.selectEndpoints().detachAll();
    jsPlumbInstance.removeAllEndpoints(document.getElementById(gate.id));
    // jsPlumbInstance.detach(gate.id); // <--
    jsPlumbInstance._removeElement(document.getElementById(gate.id));
    for (let elem in gates) {

        let found = 0;
        for (let index in gates[elem].inputs) {
            if (gates[elem].inputs[index][0].id === gate.id) {
                found = 1;
                break;
            }
        }
        if (found === 1) {
            gates[elem].removeInput(gate);
        }
    }
    delete gates[gateid];
}


