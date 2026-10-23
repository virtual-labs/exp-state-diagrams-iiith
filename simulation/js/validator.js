import { checkForSubmit, gates, simulate2, xValues } from './gate.js';
import { flipFlops } from './flipflop.js';

'use strict';

// Helper functions
export function computeXor(a, b) {
    return a !== b;
}
export function computeAnd(a, b) {
    return a && b;
}
export function computeOr(a, b) {
    return a || b;
}
export function computeXnor(a, b) {
    return a === b;
}
export function computeNand(a, b) {
    return !(a && b);
}
export function computeNor(a, b) {
    return !(a || b);
}

const bit = (value) => (value === null || value === undefined ? "?" : value ? 1 : 0);

// Task 1: the state diagram of the Practice page. The state is the pair of outputs (A, B), the input X drives it:
// S0 = 00 -> (X = 1) S0, (X = 0) S1 = 01;  S1 -> (1) S2 = 10, (0) S3 = 11;  S2 -> (1) S2, (0) S3;  S3 -> (1) S3, (0) S0.
// The sequence below is the one of this diagram for the input string of the test. A circuit that gives the state
// code with the two bits in the other order (A and B swapped) is accepted as well.
const TASK1_X = [1, 0, 1, 1, 0, 0, 0, 0, 1, 0];
const TASK1_AB = [[0, 0], [0, 1], [1, 0], [1, 0], [1, 1], [0, 0], [0, 1], [1, 1], [1, 1], [0, 0]];

// Task 2: detector of 3 or more 1s. The outputs have to be 11 exactly while the last 3 inputs (or more) were 1;
// at all the other times they can be anything but 11. The runs of 1s of the test string are 1, 4, 1, 2 and 3 long.
const TASK2_X = [1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0];

function showTable(head, rows, circuitIsCorrect, successMessage, failMessage) {
    document.getElementById('table-head').innerHTML = head;
    document.getElementById('table-body').innerHTML = rows;
    const result = document.getElementById('result');
    if (circuitIsCorrect) {
        result.innerHTML = "<span>&#10003;</span> " + successMessage;
        result.className = "success-message";
    }
    else {
        result.innerHTML = "<span>&#10007;</span> " + failMessage;
        result.className = "failure-message";
    }
}

export function testStateDiagram(output1, output2) {
    // everything the test changes is put back afterwards, the input string of the student included
    const savedX = xValues.slice();
    const savedFlipFlops = [];
    for (let ffID in flipFlops) {
        const ff = flipFlops[ffID];
        savedFlipFlops.push([ff, ff.q, ff.qbar, ff.Qbefore, ff.prevclk]);
        // every simulation starts in the state 00
        ff.q = false;
        ff.qbar = true;
        ff.Qbefore = false;
        ff.prevclk = false;
    }
    const task = window.currentTab;
    const testX = task === "task2" ? TASK2_X : TASK1_X;
    xValues.length = 0;
    testX.forEach((value) => xValues.push(value === 1));

    if (checkForSubmit()) {
        const observed = [];
        for (let i = 0; i < testX.length; i++) {
            simulate2(0);
            observed.push([gates[output1].output, gates[output2].output]);
        }
        let head, rows = "", circuitIsCorrect = true;
        if (task === "task2") {
            head = `<tr><th>Step</th><th>X</th><th>Expected A B</th><th>Observed A B</th></tr>`;
            for (let i = 0; i < testX.length; i++) {
                const wantAll = i >= 2 && testX[i] === 1 && testX[i - 1] === 1 && testX[i - 2] === 1;
                const isAll = observed[i][0] === true && observed[i][1] === true;
                const ok = isAll === wantAll;
                if (!ok) {
                    circuitIsCorrect = false;
                }
                rows += `<tr class="bold-table"><th>${i + 1}</th><td>${testX[i]}</td><td>${wantAll ? "1 1" : "not 1 1"}</td>` +
                    `<td class="${ok ? "success-table" : "failure-table"}">${bit(observed[i][0])} ${bit(observed[i][1])}</td></tr>`;
            }
            showTable(head, rows, circuitIsCorrect,
                "Success - the outputs are 1 1 when 3 or more 1s are found",
                "Fail - the outputs have to be 1 1 exactly when 3 or more 1s in a row have been found");
        } else {
            // the sequence of the diagram, or the same sequence with A and B swapped: the one with fewer mistakes is shown
            const swapped = TASK1_AB.map(([a, b]) => [b, a]);
            const mistakes = (expected) => observed.filter((o, i) => o[0] !== (expected[i][0] === 1) || o[1] !== (expected[i][1] === 1)).length;
            const expected = mistakes(TASK1_AB) <= mistakes(swapped) ? TASK1_AB : swapped;
            head = `<tr><th>Step</th><th>X</th><th>Expected A B</th><th>Observed A B</th></tr>`;
            for (let i = 0; i < testX.length; i++) {
                const ok = observed[i][0] === (expected[i][0] === 1) && observed[i][1] === (expected[i][1] === 1);
                if (!ok) {
                    circuitIsCorrect = false;
                }
                rows += `<tr class="bold-table"><th>${i + 1}</th><td>${testX[i]}</td><td>${expected[i][0]} ${expected[i][1]}</td>` +
                    `<td class="${ok ? "success-table" : "failure-table"}">${bit(observed[i][0])} ${bit(observed[i][1])}</td></tr>`;
            }
            showTable(head, rows, circuitIsCorrect,
                "Success - the circuit follows the state diagram",
                "Fail - the outputs do not follow the state diagram");
        }
    }

    xValues.length = 0;
    savedX.forEach((value) => xValues.push(value));
    savedFlipFlops.forEach(([ff, q, qbar, Qbefore, prevclk]) => {
        ff.q = q;
        ff.qbar = qbar;
        ff.Qbefore = Qbefore;
        ff.prevclk = prevclk;
    });
}
