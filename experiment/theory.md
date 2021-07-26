There are many applications where there is a need for our circuits to have "memory"; to remember previous inputs and calculate their outputs according to them. A circuit whose output depends not only on the present input but also on the history of the input is called a sequential circuit. In this section we will learn how to design and build such sequential circuits.
In order to see how this procedure works, we will use an example.

So let's suppose we have a digital quiz game that works on a clock and reads an input from a manual button. However, we want the switch to transmit only one HIGH pulse to the circuit. If we hook the button directly on the game circuit it will transmit HIGH for as few clock cycles as our finger can achieve. On a common clock frequency our finger can never be fast enough.

**Step 1**

The first step of the design procedure is to define with simple but clear words what we want our circuit to do.

**Step 2**

The next step is to design a State Diagram. This is a diagram that is made from circles and arrows and describes visually the operation of our circuit. In mathematic terms, this diagram that describes the operation of our sequential circuit is a Finite State Machine.

**A state Diagram**

Every circle represents a "state", a well-defined condition that our machine can be found at.
In the upper half of the circle we describe that condition. The description helps us remember what our circuit is supposed to do at that condition.
In the lower part of the circle is the output of our circuit. If we want our circuit to transmit a HIGH on a specific state, we put a 1 on that state. Ohterwise we put a 0.
Every arrow represents a "transition" from one state to another. A transition happens once every clock cycle. Depending on the current Input, we may go to a different state each time.


**Step 3**

Next, we replace the words that describe the different states of the diagram with binary numbers. We start the enumeration from 0 which is assigned always on the initial state. We then continue the enumeration with any state we like, until all states have their number.


**Step 4**

Afterwards, we fill the State Table. This table has a very specific form.

**A State Table**

The first columns are as many as the bits of the highest number we assigned the State Diagram.These columns describe the Current State of our circuit.
To the right of the Current State columns we write the Input Columns. These will be as many as our Input variables.
Next, we write the Next State Columns. These are as many as the Current State columns.
Finally, we write the Outputs Columns. These are as many as our outputs.
Each row of the Next State columns is filled as follows: We fill it in with the state that we reach when, in the State Diagram, from the Current State of the same row we follow the Input of the same row. If we get to a row whose Current State number doesn't correspond to any actual State in the State Diagram we fill it with Don't Care terms (X). After all, we don't care where we can go from a State that doesn't exist. We wouldn't be there in the first place! Again it is simpler than it sounds.
The outputs column is filled by the output of the corresponding Current State in the State Diagram.
The State Table is complete! It describes the behaviour of our circuit as fully as the State Diagram does.


**Step 5a**

The next step is to take that theoretical "Machine" and implement it in a circuit. Most often than not, this implementation involves Flip Flops. This guide is dedicated to this kind of implementation and will describe the procedure for both D - Flip Flops as well as JK - Flip Flops. T - Flip Flops will not be included as they are too similar to the two previous cases. The selection of the Flip Flop to use is arbitrary and usually is determined by cost factors. The best choice is to perform both analysis and decide which type of Flip Flop results in minimum number of logic gates and lesser cost.
We will need as many D - Flip Flops as the State columns.For every Flip Flop we will add one one more column in our State table with the name of the Flip Flop's input. The column that corresponds to each Flip Flop describes what input we must give the Flip Flop in order to go from the Current State to the Next State. For the D - Flip Flop this is easy: The necessary input is equal to the Next State. In the rows that contain X's we fill X's in this column as well.


**Step 5b**

We can do the same steps with JK - Flip Flops. There are some differences however. A JK - Flip Flop has two inputs, therefore we need to add two columns for each Flip Flop.

**Step 6**

We are in the final stage of our procedure. What remains, is to determine the Boolean functions that determine the inputs of our Flip Flops and the Output. We will extract one Boolean funtion for each Flip Flop input we have. This can be done with a Karnaugh Map. The input variables of this map are the Current State variables as well as the Inputs.


**Step 7**

We design our circuit. We place the Flip Flops and use logic gates to form the Boolean functions that we calculated. The gates take input from the output of the Flip Flops and the Input of the circuit.

We have successfully designed and constructed a Sequential Circuit.Sequential Circuits can come in handy as control parts of bigger circuits and can perform any sequential logic task that we can think of. 