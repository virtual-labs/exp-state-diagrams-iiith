This lab allows you to design and simulate any digital combinational or sequential circuit. Following instruction help you build the circuit. A Java-based basic tool and simulation enigne is at the hear of this laboratory. You can create many circuits and test them with fixed or time-varying input signals. You can also see the outputs as values or time-varying waveforms.

The tool consist of mainly four pannels: Left Pannel, Mid Pannel, Right Pannel, and Top Pannel.

1. **Left Pannel**

   1. Gate Buttons: These buttons are used to draw basic gates like AND, OR, XOR, NOT, NOR, NAND,XNOR andCONNECTOR . Click on these by drop down menu then select the proper number of inputs . Once You have finalized the gate & number of inputs then click on SELECT Button and place the gate where you want to in the mid pannel drawing area.

   2. **Probe**: Output at each terminal is shown by default against it. Iif you want explicitly to watch another node, you can probe it using a feature from the left panel.

   3. **None**: It is used to get default cursor option back, so that you can do basic operation like drag and drop.

   4. **Delete Element**: This is used for explicitly deleting an element. Click on the element after selecting delete mode.

   5. Connect/Disconnect**: This mode allows establishing and removing connection between various points. Connection can be established only from output to input. You have to first click to the output node then to the input node (consisting of red square box). For disconnection, you can start by clicking either the input or the output node.

   6. **Naming**: This is used to give a user-selected name to an input or output node. Click on the node and give the name into the input box that pops up.

   7. **Output**: This is used to define an output node. See the explanation of import button to learn why this may be necessary.

   8. **Time Pulse**: Enter the time pulse pattern separated by commas. For example: 0,10,10,10,10 defines a clock that is 0 for 10 units and 1 for 10 units. Press enter or click on the new timepulse to create it. It will be available as input in list box.

   9. **Binary One And Zero**: These can be used to give fixed values to terminals

2. **Top Pannel**

   1. **Clear**: Use this to clear every element on the circuit. Caution: Everything on the design panel will be lost; there is no undo!

   2. **Save**: Use this to save the designed circuit as a file on your machine. This file can be loaded and imported later.

   3. **Load**: A circuit saved on your machine can be loaded onto the mid panel to as a fresh circuit that can be further edited.

   4. **Import**: This is an important feature that lets you construct building blocks. A circuit from your machine is imported to the mid panel, but will appear as a block or a box with input and output terminals. The name of the element is that of the imported file. The named terminals will have their saved names. The input and output nodes will come in the same order from top to bottom as created. This allows one to build on circuits saved as blocks. For instance, an full adder you design using gates can be saved as a block and used in later circuits as an adder-block.

    5. **Simulate**: Use this to simulate or compute the intermediate and final outputs of the whole circuit, if all the terminal inputs are present. It also computes the gate delays, which is diplayed when the mouse hovers over each element. The default gate delay is -1. Simulation can fail or give ambiguous result if the circuit does not stablizes with time. This can happen due to improper feedback circuitry. The underlying engine is not a full fledged circuit simulator and can get stuck at constructions involving certain feedback.

2. **Mid Pannel**: This is the drawing area used to build the circuit. You can move the elements by clicking and dragging.

3. **Right Pannel**: This area shows the time-varying inputs, outputs, and probed points. Name or index associated with points are displayed. Indexes are given top to bottom.

**Note**: Sample circuit for each experiment will be given as default. You can try them with the help of load_it or impor_itt button.It is advised try to built circuit of your own before trying the default circuit.
