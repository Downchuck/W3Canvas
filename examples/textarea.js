import { controlFactory } from '../html/control_factory.js';
import { ArialFont, loadFont } from '../font/arial_font.js';

function drawBoxes() {
	if (arialFontLib) {
		const lib = arialFontLib;
		const cBox = document.getElementById('cBox_top');
		lib.ctx = cBox.getContext('2d');
		const textbox = controlFactory.create('TextArea', 'cBox_top');
		const font = new ArialFont();
		font.setTextColor("red");
		textbox.setFont(font);
		const textContent = 'Canvas\n\n\nis an\textremely heavy-duty plain-woven fabric      used for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
		textbox.setValue(textContent);

		const cBox2 = document.getElementById('cBox_bottom');
		lib.ctx = cBox2.getContext('2d');
		const textbox2 = controlFactory.create('TextArea', 'cBox_bottom');
		const box2Style = {
			'color' : "rgb(200,200,0)",
			'reverseMode' : false,
			'showLines': true,
			'lineColor' : 'rgba(255,120,20,1)',
			'borderColor' : "black",
			'cursorWidth' : 4,
			'cursorColor'	: "#c97",
			'selectionColor': "rgba(20,40,20,.6)"
		};
		textbox2.setStyle(box2Style);
		const textContent2 = 'Roses are red, violets are blue, sugar is sweet and so is my code.';
		textbox2.setValue(textContent2);

		const textbox3 = controlFactory.create('TextArea', 'cBox_blacktext');
		const f = new ArialFont();
		f.setScaleFactor(0.10);
		textbox3.setFont(f);
		const box3Style = {
			'color' 		: "#555",
			'reverseMode'	: false,
			'cursorWidth'   : 1,
			'cursorColor'	: "#555",
			'showLines'		: true,
			'lineColor'		: 'blue',
			'borderColor'	: "#090909",
			'selectionColor': "rgba(255,255,255,0.6)"
		};
		textbox3.setStyle(box3Style);
		const textContent3 = 'Roses are red, violets are blue, sugar is sweet and so is my code.\nYesterday... all my troubles seem so far away.';
		textbox3.setValue(textContent3);
	}
}

loadFont(drawBoxes);
