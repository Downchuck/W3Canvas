import { controlFactory } from '../html/control_factory.js';

export function drawBoxes() {
	const textbox = controlFactory.create('InputText', 'cBox_top');

	const textContent = 'Canvas is an\textremely heavy-duty plain-woven fabric\nused for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
	const cssHack = ":nth-char(0):before {content: url('test.jpg'); width:100px; height:75px; } :nth-char(0) {font: 14px arial} :nth-char(13){font: bold 24px arial} :nth-char(22){font: italic 20px arial} :nth-char(104):before{content: url('[canvas.jpg]');} :nth-char(108) {font: 14px sans-serif} :nth-char(130){font: 32px arial} :nth-char(153){font: 22px sans}"

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

	textbox.setValue(textContent, cssHack);
}
