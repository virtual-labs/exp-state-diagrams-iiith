import { gates } from "./gate.js";
import { registerGate } from "./main.js";

'use strict';

window.simulationStatus = 1;

export class Clock {
    constructor(frequency, dutyCycle) {
        this.frequency = frequency;
        this.dutyCycle = dutyCycle;
        this.isOn = false;
        this.name = "C" + window.numComponents;
        this.id = "Clock-" + window.numComponents++;
        this.component = `<div class="low" id=${this.id}><a>0</a><p>${this.name}</p></div>`
        this.output = false;
        this.isInput = true;
        this.inputPoints = [];
        this.inputs = [];
        this.outputs= [];
        this.outputPoints = [];
        this.isConnected = false;
        this.type = "Clock";
    }

    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    updateComponent() {
        this.component = `<div class="low" id=${this.id}><a>0</a><p>${this.name}</p></div>`
    }

    addOutput(gate) {
        this.outputs.push(gate);
    }

    removeOutput(gate) {
        // Find and remove all occurrences of gate
      for (let i = this.outputs.length - 1; i >= 0; i--) {
        if (this.outputs[i] === gate) {
          this.outputs.splice(i, 1);
            }
        }
    }

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
        gates[this.id] = this;
        registerGate(this.id, this);

    }

    updateOutput() {
        let element = document.getElementById(this.id);
        if (this.isOn) {
            element.className = "high";
            element.childNodes[0].innerHTML = "1";
            this.output = true;
        }
        else {
            element.className = "low";
            element.childNodes[0].innerHTML = "0";
            this.output = false;
        }
    }

    simulate() {
        const intervalOn = 1000;
        const intervalOff = 1000;
        // isOn is on for intervalOn milliseconds, then off for intervalOff milliseconds

        let currentState = false;
        let timerOff = null;
        let timerOn = null;
        // a newer simulation (or a stop) ends this loop
        const generation = window.simulationGeneration;
        // the clock starts low
        this.isOn = false;
        this.updateOutput();

        const run = () => {
            if (window.simulationStatus === 1 || window.simulationGeneration !== generation) {
                return;
            }
            if (!currentState) {
                currentState = true;
                this.isOn = true;
                this.updateOutput();
                clearTimeout(timerOff);
                timerOn = setTimeout(run, intervalOn);
            }
            else {
                currentState = false;
                this.isOn = false;
                this.updateOutput();
                clearTimeout(timerOn);
                timerOff = setTimeout(run, intervalOff);
            }

            window.sim2(1, this.isOn ? "rise" : "fall");
        }

        timerOff = setTimeout(run, intervalOff);
    }

    addInputPoints(input) {
        this.inputPoints.push(input);
    }

    addOutputPoints(output) {
        this.outputPoints.push(output);
    }

    setConnected(val) {
        this.isConnected = val;
    }

    setOutput(value) {
        this.output = value;
    }



}


export function addClock(frequency, dutyCycle, workingArea, x, y, name, id) {
    let clock = new Clock(frequency, dutyCycle);
    if (id !== null) {
        clock.setId(id);
    }
    if (name !== null) {
        clock.setName(name);
    }
    clock.updateComponent();
    const parent = document.getElementById(workingArea);
    parent.insertAdjacentHTML('beforeend', clock.component);
    clock.registerComponent(workingArea, x, y);

    return clock;
}

