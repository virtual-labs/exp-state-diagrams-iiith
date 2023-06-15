import { registerGate, jsPlumbInstance } from "./main.js";
import { setPosition } from "./layout.js";
import { gates,printErrors } from './gate.js';


'use strict';

export let flipFlops = {};

export function clearFlipFlops() {

    for (let ffID in flipFlops) {
        delete flipFlops[ffID];
    }
    flipFlops = {};
}
window.firstSimulation = true;
export class RSFlipFlop {
    constructor() {
        this.id = "RSFlipFlop-" + window.numComponents++;
        this.r = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.s = [];
        this.clk = [];
        this.q = null;
        this.qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qOutputs = [];
        this.qbarOutputs = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.component = `<div class="drag-drop rsflipflop" id=${this.id}></div>`;
    }
    addqOutput(gate) {
        this.qOutputs.push(gate);
    }
    addqbarOutput(gate) {
        this.qbarOutputs.push(gate);
    }

    removeqOutput(gate) {
        // Find and remove all occurrences of gate
      for (let i = this.qOutputs.length - 1; i >= 0; i--) {
        if (this.qOutputs[i] === gate) {
          this.qOutputs.splice(i, 1);
            }
        }
    }
    removeqbarOutput(gate) {
        // Find and remove all occurrences of gate
      for (let i = this.qbarOutputs.length - 1; i >= 0; i--) {
        if (this.qbarOutputs[i] === gate) {
          this.qbarOutputs.splice(i, 1);
            }
        }
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        const el = document.getElementById(this.id);
        el.style.left = x + "px";
        el.style.top = y + "px";

        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            const origin = {
                left: ev.pageX - document.getScroll()[0],
                top: ev.pageY - document.getScroll()[1]
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setR(r) {
        this.r = r;
    }
    setS(s) {
        this.s = s;
    }
    setClk(clk) {
        this.clk = clk;
    }
    setQ(q) {
        this.q = q;
    }
    setQbar(qbar) {
        this.qbar = qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        if (pos === "Q") {
            this.qIsConnected = val;
        }
        else if (pos === "Q'") {
            this.qbarIsConnected = val;
        }
    }

    generateOutput() {

        // In RS flip flop, when Clock is low, the flip flop is in memory state, hence there is no change in output
        // When clock is high, if both S and R are low, the flip flop is in memory state
        // If S is high and R is low, the flip flop is in set state i.e. Q is 1 and Q' is 0
        // If S is low and R is high, the flip flop is in reset state i.e. Q is 0 and Q' is 1
        // If both S and R are high, the flip flop gives both Q and Q' as 1 (invalid input generally)


        const r = getOutputRS(this.r[0], this.r[1]);
        const s = getOutputRS(this.s[0], this.s[1]);
        const clk = getOutputRS(this.clk[0], this.clk[1]);

        if (!clk) {
            return;
        }
        else {
            if (!s && !r) {
                return;
            }
            else if (!s && r) {
                this.q = false;
                this.qbar = true;
            }
            else if (s && !r) {
                this.q = true;
                this.qbar = false;
            }
            else if (s && r) {
                this.q = true;
                this.qbar = true;
            }
        }
    }
}


export function addRSFlipFlop(x, y) {
    const ff = new RSFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addRSFlipFlop = addRSFlipFlop;

export function getOutputRS(gate, pos) {
    if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
    // But if the gate is not an FA, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
export function getResultRS(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }

    if (getOutputRS(ff.r[0], ff.r[1]) !== null && getOutputRS(ff.s[0], ff.s[1]) !== null && getOutputRS(ff.clk[0], ff.clk[1]) !== null) {
        ff.generateOutput();
    }
    return;
}


// done checking
export function checkConnectionsRS() {
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        if (!gate.qIsConnected) {
            correctConnection = false;
            break;
        }
        if (!gate.qbarIsConnected) {
            correctConnection = false;
            break;
        }
        // Check if all the inputs are connected
        if (gate.r === null || gate.r.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.s === null || gate.s.length === 0) {
            correctConnection = false;
            break;
        }
        if (gate.clk === null || gate.clk.length === 0) {
            correctConnection = false;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput) {
            if (!gate.isConnected) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length === 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length !== gate.inputs.length) {
                correctConnection = false;
            }
            else if (!gate.isConnected && !gate.isOutput) {
                correctConnection = false;
            }
        }
    }

    return correctConnection;
}

export function simulateFFRS() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultRS(gate);
    }
}

export function testSimulateFFRS(flipFlops) {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultRS(gate);
    }
}




export class JKFlipFlop {
    constructor() {
        this.id = "JKFlipFlop-" + window.numComponents++;
        this.k = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.j = [];
        this.clk = [];
        this.q = false;
        this.Qbefore = false;
        this.qbar = true;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qOutputs = [];
        this.qbarOutputs = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.component = `<div class="drag-drop jkflipflop" id=${this.id}></div>`;
        this.prevclk = false;
    }
    addqOutput(gate) {
        this.qOutputs.push(gate);
    }
    addqbarOutput(gate) {
        this.qbarOutputs.push(gate);
    }

    removeqOutput(gate) {
        // Find and remove all occurrences of gate
      for (let i = this.qOutputs.length - 1; i >= 0; i--) {
        if (this.qOutputs[i] === gate) {
          this.qOutputs.splice(i, 1);
            }
        }
    }
    removeqbarOutput(gate) {
        // Find and remove all occurrences of gate
      for (let i = this.qbarOutputs.length - 1; i >= 0; i--) {
        if (this.qbarOutputs[i] === gate) {
          this.qbarOutputs.splice(i, 1);
            }
        }
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        const el = document.getElementById(this.id);
        el.style.left = x + "px";
        el.style.top = y + "px";

        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            const origin = {
                left: ev.pageX - document.getScroll()[0],
                top: ev.pageY - document.getScroll()[1]
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            // deleteElement(this.id);
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setK(k) {
        this.k = k;
    }
    setQbefore(Qbefore) {
        this.Qbefore = Qbefore ;
    }
    setJ(j) {
        this.j = j;
    }
    setClk(clk) {
        this.clk = clk;
    }
    setQ(q) {
        this.q = q;
    }
    setQbar(qbar) {
        this.qbar = qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        if (pos === "Q") {
            this.qIsConnected = val;
        }
        else if (pos === "Q'") {
            this.qbarIsConnected = val;
        }
    }

    generateOutput() {
        // In JK flip flop, when Clock is low, the flip flop is in memory state, hence there is no change in output
        // When clock is high, if both J and K are low, the flip flop is in memory state
        // If J is high and K is low, the flip flop is in set state i.e. Q is 1 and Q' is 0
        // If J is low and K is high, the flip flop is in reset state i.e. Q is 0 and Q' is 1
        // If both J and K are high, the flip flop toggles its state i.e. Q is Q' and Q' is Q


        const k = getOutputJK(this.k[0], this.k[1]);
        const j = getOutputJK(this.j[0], this.j[1]);
        // const clk = getOutputRS(this.clk[0], this.clk[1]);
        if (!j && !k) {
            return;
        }
        else if (!j && k) {
            this.q = false;
            this.qbar = true;
        }
        else if (j && !k) {
            this.q = true;
            this.qbar = false;
        }
        else if (j && k) {
            let temp = this.q;
            this.q = this.qbar;
            this.qbar = temp;
        }
    }
}


export function addJKFlipFlop(x, y) {
    const ff = new JKFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addJKFlipFlop = addJKFlipFlop;

export function getOutputJK(gate, pos) {
    if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
    // But if the gate is not a flipflop, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
export function getResultJK(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }


    if (getOutputJK(ff.k[0], ff.k[1]) !== null && getOutputJK(ff.j[0], ff.j[1]) !== null && getOutputJK(ff.clk[0], ff.clk[1]) !== null) {
        ff.generateOutput();
    }

    return;
}

// done checking
export function checkConnectionsJK() {
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        const id = document.getElementById(gate.id);
        if (!gate.qIsConnected || gate.qOutputs.length===0) {
            printErrors("Q of Flip-Flop must be connected\n",id);
            correctConnection = false;
            break;
        }
        // Check if all the inputs are connected
        if (gate.k === null || gate.k.length === 0) {
            printErrors("K of Flip-Flop must be connected\n",id);
            correctConnection = false;
            break;
        }
        if (gate.j === null || gate.j.length === 0) {
            printErrors("J of Flip-Flop must be connected\n",id);
            correctConnection = false;
            break;
        }
        if (gate.clk === null || gate.clk.length === 0) {
            printErrors("Clock of Flip-Flop must be connected\n",id);
            correctConnection = false;
            break;
        }
    }
    for (let gateId in gates) {
        const gate = gates[gateId];
        if (gate.isInput) {
            if (!gate.isConnected || gate.outputs.length===0) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length === 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length !== gate.inputs.length) {
                correctConnection = false;
            }
            else if ((!gate.isConnected || gate.outputs.length===0) && !gate.isOutput) {
                correctConnection = false;
            }
        }
    }
    return correctConnection;
}

export function simulateFFJK() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultJK(gate);
    }
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        gate.setQbefore(gate.q);
    }
}

export function testSimulateFFJK(flipFlops) {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultJK(gate);
    }
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        gate.setQbefore(gate.q);
    }
}


class DFlipFlop {
    constructor() {
        this.id = "DFlipFlop-" + window.numComponents++;
        this.d = [];  // Takes 2 items in a list : Gate, Output endpoint of gate
        this.dbefore = false; // either true or false
        this.pr = [];
        this.clr = [];
        this.clk = [];
        this.q = null;
        this.qbar = null;
        this.inputPoints = [];
        this.outputPoints = [];
        this.qIsConnected = false;
        this.qbarIsConnected = false;
        this.prevclk = false;
        this.component = '<div class="drag-drop dflipflop" id=' + this.id + '></div>';
    }
    registerComponent(workingArea, x = 0, y = 0) {
        const parent = document.getElementById(workingArea);
        parent.insertAdjacentHTML('beforeend', this.component);
        document.getElementById(this.id).style.left = x + "px";
        document.getElementById(this.id).style.top = y + "px";

        const el = document.getElementById(this.id);
        el.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            let left = ev.pageX - document.getScroll()[0];
            let top = ev.pageY - document.getScroll()[1];
            const origin = {
                left: left,
                top: top
            };
            setPosition(origin);
            window.selectedComponent = this.id;
            window.componentType = "flipFlop";
            return false;
        }, false);

        flipFlops[this.id] = this;
        registerGate(this.id, this);
    }

    setD(d) {
        this.d = d;
    }
    setDbefore(dbefore) {
        this.dbefore = dbefore;
    }
    setPr(pr) {
        this.pr = pr;
    }
    setClr(clr) {
        this.clr = clr;
    }
    setClk(clk) {
        this.clk = clk;
    }
    setQ(q) {
        this.q = q;
    }
    setQbar(qbar) {
        this.qbar = qbar;
    }
    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val, pos) {
        if (pos === "Q") {
            this.qIsConnected = val;
        }
        else if (pos === "Q'") {
            this.qbarIsConnected = val;
        }
    }

    generateOutput() {
        const d = this.dbefore;
        const clk = getOutputD(this.clk[0], this.clk[1]);
        if (this.prevclk === true && clk === false) {
            if (!d) {
                this.q = false;
                this.qbar = true;
            }
            else if (d) {
                this.q = true;
                this.qbar = false;
            }
            this.prevclk = false;
        }
        else if (this.prevclk === false && clk === true) {
            this.prevclk = true;
        }
        
    }
}


function addDFlipFlop(x, y) {
    const ff = new DFlipFlop();
    ff.registerComponent("working-area", x, y);
}

window.addDFlipFlop = addDFlipFlop;

export function getOutputD(gate, pos) {
    if (pos === "Q") {
        return gate.q;
    }
    else if (pos === "Q'") {
        return gate.qbar;
    }
    // But if the gate is not an FA, but an input bit, then return the value of the input
    else {
        return gate.output
    }
}

// done checking
export function getResultDD(ff) {
    // check if flipflop type is Gate object
    if (ff.constructor.name === "Gate") {
        return;
    }
    if (ff.pr.length > 0) {
        if (ff.pr[0].id === "Input-0" && ff.pr[0].output === false) {
            ff.q = true;
            return;
        }
    }
    if (ff.clr.length>0) {
        if (ff.clr[0].id === "Input-0" && ff.clr[0].output === false) {
            ff.q = false;
            return;
        }
    }
    if (getOutputD(ff.d[0], ff.d[1]) !== null && getOutputD(ff.clk[0], ff.clk[1]) !== null) {
            ff.generateOutput();
    }
    return;
}


// done checking
export function checkConnectionsDD() {
    let correctConnection = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        // For Full Adder objects
        // Check if all the outputs are connected
        const id = document.getElementById(gate.id);

        if(gate.pr.length !== 0 && gate.clr.length !== 0){
            correctConnection = false;
            printErrors("Can't activate both preset and clear\n",id);
            break;
        }

        if (gate.qIsConnected === false) {
            correctConnection = false;
            printErrors("Q of flip flops must be connected\n",id);
            break;
        }
        // Check if all the inputs are connected
        if (gate.d === null || gate.d.length === 0) {
            correctConnection = false;
            printErrors("D of flip flops must be connected\n",id);
            break;
        }
        if (gate.clk === null || gate.clk.length === 0) {
            correctConnection = false;
            printErrors("CLK of flip flops must be connected\n",id);
            break;
        }
    }
    let oriVal=false;
    for (let gateId in gates) {
        const gate = gates[gateId];
        if(gate.type==="Input"){
            oriVal=gate.output;
        }
        if (gate.isInput) {
            if (!gate.isConnected) {
                correctConnection = false;
                break;
            }
        }
        else if (gate.isOutput) {
            if (gate.inputs.length === 0) {
                correctConnection = false;
                break;
            }
        }
        else {
            if (gate.inputPoints.length !== gate.inputs.length) {
                correctConnection = false;
            }
            else if (!gate.isConnected && !gate.isOutput) {
                correctConnection = false;
            }
        }
    }

    if (correctConnection) {
        if(window.firstSimulation===true && oriVal===true)
        {
            printErrors("Ori value has to be initalized to 0\n",null)
            
            return false;
        }
        window.firstSimulation = false;
        return true;
    }
    else {
        
        return false;
    }
}

export function simulateFFDD() {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultDD(gate);
    }
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        gate.setDbefore(getOutputD(gate.d[0], gate.d[1]));
    }
}

export function testSimulateDD(flipFlops) {
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        getResultDD(gate);
    }
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        gate.setDbefore(getOutputD(gate.d[0], gate.d[1]));
    }
}

export function deleteFF(id) {
    const ff = flipFlops[id];
    jsPlumbInstance.removeAllEndpoints(document.getElementById(ff.id));
    jsPlumbInstance._removeElement(document.getElementById(ff.id));
    for (let key in flipFlops) {
        if (ff.constructor.name === "JKFlipFlop") {
            if (flipFlops[key].j!== null && flipFlops[key].j.length!== 0 && flipFlops[key].j[0] === ff) {
                flipFlops[key].j = null;
            }
            if (flipFlops[key].k!==null && flipFlops[key].k.length!==0 && flipFlops[key].k[0] === ff) {
                flipFlops[key].k = null;
            }
            if (flipFlops[key].clk!==null && flipFlops[key].clk.length!==0 && flipFlops[key].clk[0] === ff) {
                flipFlops[key].clk = null;
            }
            if(flipFlops[key].qOutputs.includes(ff)) {
                flipFlops[key].removeqOutput(ff);
            }
            if(flipFlops[key].qbarOutputs.includes(ff)) {
                flipFlops[key].removeqbarOutput(ff);
            }
        }
    }

    for (let elem in gates) {
        let found = 0;
        for (let index in gates[elem].inputs) {
            if (gates[elem].inputs[index][0].id === ff.id) {
                found = 1;
                break;
            }
        }
        if (found === 1) {
            gates[elem].removeInput(ff);
        }
        if(gates[elem].outputs.includes(ff)) {
            gates[elem].removeOutput(ff);
        }
    }


    delete flipFlops[id];
}