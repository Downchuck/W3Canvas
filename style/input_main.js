
var drawBoxes = function() {

	var cBox = document.getElementById('cBox_top');

	var textbox = colorjack.controlFactory.create('InputText', 'cBox_top');
	textbox.setInput("text");

	var textContent = 'Canvas\n\n\nis an\textremely heavy-duty plain-woven fabric      used for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
		//var textContent = 'used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
		//var textContent = 'and on handbagsand shoes.Inthessss Wyoming.';

	var boxStyle = {
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
	var smallFont = new ArialFont(0.06);
	//textbox.setFont(smallFont);

	textbox.setValue(textContent);


	//----------------------------------------

	var cBox2 = document.getElementById('cBox_bottom');

	var textbox2 = colorjack.controlFactory.create('TextArea', 'cBox_bottom');

	var yellowFont = new ArialFont();
	yellowFont.setTextColor("yellow");
	textbox2.setFont(yellowFont);

	var box2Style = {
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

	var textContent = '';
	textbox2.setValue(textContent);
	//textbox2.select();
};

