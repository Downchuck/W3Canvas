import { controlFactory } from '../html/control_factory.js';
import { ArialFont, loadFont } from '../font/arial_font.js';

function drawBoxes() {
	if (arialFontLib) {
		const lib = arialFontLib;
		const cBox = document.getElementById('cBox_top');
		const textbox = controlFactory.create('InputText', 'cBox_top');
		const textContent = 'Canvas is an\textremely heavy-duty plain-woven fabric\nused for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
		const boxStyle = {
			'color' 		: "#555",
			'reverseMode'	: false,
			'cursorWidth'   : 2,
			'cursorColor'	: "#555",
			'showLines'		: true,
			'lineColor'		: 'blue',
			'borderColor'	: "red",
			'selectionColor': "rgba(216,216,255,0.6)"
		};
		textbox.setStyle(boxStyle);
		textbox.setValue(textContent);

		const cBox2 = document.getElementById('cBox_bottom');
		const textbox2 = controlFactory.create('TextArea', 'cBox_bottom');
		const yellowFont = new ArialFont();
		yellowFont.setTextColor("yellow");
		textbox2.setFont(yellowFont);
		const box2Style = {
			'color' : "rgb(200,200,0)",
			'cursorWidth'   : 4,
			'cursorColor'   : "green",
			'reverseMode' 	: false,
			'showLines'		: true,
			'lineColor' 	: 'rgba(255,120,20,1)',
			'borderColor' 	: "black",
			'selectionColor': "rgba(20,40,20,.6)"
		};
		textbox2.setStyle(box2Style);
		const textContent2 = '';
		textbox2.setValue(textContent2);
	}
}

loadFont(drawBoxes);
