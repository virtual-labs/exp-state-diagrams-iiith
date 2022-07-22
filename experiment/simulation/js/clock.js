import { gates } from "./gate.js";
import { registerGate } from "./main.js";

'use strict';

window.simulate = 0;

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
        const intervalOn = 4000;
        const intervalOff = 4000;
        // isOn is on for intervalOn milliseconds, then off for intervalOff milliseconds

        let currentState = false;
        let timerOff = null;
        let timerOn = null;

        const run = () => {
            if (window.simulate === 1) {
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

            window.sim2(1);
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

