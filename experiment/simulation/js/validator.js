import { checkForSubmit, gates, simulate2, testSimulation,xValues} from './gate.js';
import { flipFlops } from './flipflop.js';

'use strict';

// Helper functions
export function computeXor(a, b) {
    return a != b;
}
export function computeAnd(a, b) {
    return a && b;
}
export function computeOr(a, b) {
    return a || b;
}
export function computeXnor(a, b) {
    return a == b;
}
export function computeNand(a, b) {
    return !(a && b);
}
export function computeNor(a, b) {
    return !(a || b);
}

export function testStateDiagram(input0,clock0,output1,output2){
    let circuitIsCorrect1 = true;
    let circuitIsCorrect2 = true;
    for (let ffID in flipFlops) {
        const gate = flipFlops[ffID];
        gate.q = false;
        gate.Qbefore = false;
    }
    xValues.length = 0;
    const expectedx = [true,false,true,true,false,false,false,false,true,false];
    expectedx.forEach(element => {
        xValues.push(element);
    });
    const expectedOutputs1 = [[false,false],[false,true],[true,false],[true,false],[true,true],[false,false],[false,true],[true,true],[true,true],[false,false]];
    const expectedOutputs2 = [[false,false],[true,false],[false,true],[false,true],[true,true],[false,false],[true,false],[true,true],[true,true],[false,false]];
    if(checkForSubmit()){
        for(let i = 0; i < 10; i++){
            simulate2(0);
            if(expectedOutputs1[i][0]!=gates[output1].output || expectedOutputs1[i][1]!=gates[output2].output){
                circuitIsCorrect1 = false;
            }
            if(expectedOutputs2[i][0]!=gates[output1].output || expectedOutputs2[i][1]!=gates[output2].output){
                circuitIsCorrect2 = false;
            }
        }
        if(circuitIsCorrect1===false && circuitIsCorrect2===false){
            document.getElementById('result').innerHTML = "<span>&#10007;</span> Fail";
            document.getElementById('result').className = "failure-message";
        }
        else{
            document.getElementById('result').innerHTML = "<span>&#10003;</span> Success";
            document.getElementById('result').className = "success-message";
        }
    }
    xValues.length = 0;
}