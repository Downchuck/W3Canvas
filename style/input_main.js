
var drawBoxes = function() {

	var cBox = document.getElementById('cBox_top');
	var textbox = colorjack.controlFactory.create('InputText', 'cBox_top');

	var textContent = 'Canvas is an\textremely heavy-duty plain-woven fabric\nused for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';	
	var cssHack = ":nth-char(0):before {content: url('test.jpg'); width:100px; height:75px; } :nth-char(0) {font: 14px arial} :nth-char(13){font: bold 24px arial} :nth-char(22){font: italic 20px arial} :nth-char(104):before{content: url('canvas.jpg'); width:160px; height:120px} :nth-char(108) {font: 14px sans-serif} :nth-char(130){font: 32px arial} :nth-char(153){font: 22px sans}"
	//var cssHack = ":nth-char(0) {font: 32px arial} :nth-char(40):before {content: url('test.jpg'); width:240px; height:180px} :nth-char(50) {font: 24px arial;}";
	//var cssHack = ":nth-char(0) {font: 14px arial} :nth-char(13){font: bold 24px arial} :nth-char(22){font: italic 20px arial} :nth-char(108) {font: 14px sans-serif} :nth-char(130){font: 32px arial} :nth-char(153){font: 22px sans}"
	//var cssHack = ":nth-char(0) {font: 14px arial} :nth-char(13):before {content:\"very funny\"} :nth-char(13){font: bold 24px arial} :nth-char(22){font: italic 20px arial} :nth-char(108) {font: 14px sans-serif} :nth-char(130){font: 32px arial} :nth-char(153){font: 22px sans}"

	//test for generated content: text
	//var textContent = "012345678901234567890123456789";
	//var cssHack = ":nth-char(0) {font: 12px} :nth-char(10):before {content:Hello World}";
	//var cssHack = ":nth-char(0) {font: 12px arial} :nth-char(10):before {content:Inserted Before;font:20px arial} :nth-char(10):after {content:Inserted After;font:20px arial} :nth-char(15) {font: 30px arial}";
	//var cssHack = ":nth-char(0) {font: 12px arial} :nth-char(10):after {content:Hello World;font:20px arial} :nth-char(15) {font: 30px arial}";
	
	//test for generated content: image
	//var textContent = "012345678901234567890123456789\nHello World";
	//var textContent = "Hello World this is fun blah blah very fun! ";
	//var cssHack = ":nth-char(0) {font: 32px arial} :nth-char(20):before {content: url('test.jpg'); width:240px; height:180px} :nth-char(20) {font: 24px arial;}";
	//var cssHack = ":nth-char(10):after {content: url('test.jpg'); width:240px; height:180px} :nth-char(21) {font: 24px arial;}";

	//var cssHack = ":nth-char(0) {14px arial} :nth-char(13):before {content: \"very funny\"} :nth-char(13){bold 24px arial} :nth-char(22){italic 20px arial} :nth-char(108) {14px sans-serif} :nth-char(130){32px arial} :nth-char(153){22px sans}"
	//nth-char(10):after {content:url(#abc) "Alt-Text"; width:32px; height:32px; }
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
	
	textbox.setValue(textContent, cssHack);
	
	

};

