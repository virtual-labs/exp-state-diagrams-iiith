# State Diagrams

## Components Required - 

* 2 J-K flip-flops
* 1 NOT gate
* 1 AND gate
* 1 XOR gate

## Circuit Connections - 

* Drag 2 J-K flip-flops one near output bit A and another near output bit B.
* Drag a NOT gate and place it near X input bit and drag 1 AND and 1 XOR gate as well.
* Connect X to input of NOT and XOR gates.
* Connect output of NOT gate to input of AND gate and to J of the lower flip-flop.
* Connect output Q of upper flip-flop to input of XOR gate and output Q of lower flip-flop to input of AND gate and J of upper flip-flop.
* Connect output of AND gate to K of upper flip-flop and output of XOR gate to K of lower flip-flop.
* Connect Q of upper flip-flop to A and Q of lower flip-flop to B.
* Click on "Input" to add a binary input stream for X. After that click on "Simulate" (default start state will be A=0 and B=0).

## Observations - 

* Depending upon the input stream given the states of A and B will change from one state to another or will remain the same. For instance if the first input bit in the stream is 1 the output bits will stay at A=0 and B=0.
* If the circuit has been made correctly as described above, a "Success" message will be dispalyed upon clicking submit along with the state table. Do keep an eye on the observation section for any errors that you might get if any connections are missing.