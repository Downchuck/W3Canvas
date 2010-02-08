
var $ = function(a) { return document.getElementById(a); };

var setupImageTest = function() {
	var document = colorjack.currentDocument;
	var c = { image1: $('cBox_image1'),
	image1b: $('cBox_image1b'),
	image2: $('cBox_image2') };
	var image = document.createElement('img');
	image = colorjack.controlFactory.createLayout(image,c.image1);
	image.setSize(120, 200);
  // var image = colorjack.controlFactory.create('Image', 'cBox_image1');
  // throw new Error("Width: " + image.width + "," + image.contentArea.width);
  // image.setMargin(30);
  // image.setBorderColor("#cc0a0a");
  image.setBorderSize(25);
  image.setBorderColor("red");
  image.setSource("examples/marilyn_th.jpg");

	var imageb = document.createElement('img');
	imageb = colorjack.controlFactory.createLayout(imageb,c.image1b);
	// imageb.style.cssText = 'margin: 30px; padding: 15px; border: 25px purple;';
	// imageb.src = "examples/marilyn_th.jpg";
  imageb.setMargin(30);
  imageb.setPadding(15);
  imageb.setBorderSize(25);
  imageb.setBorderColor("purple");
  imageb.setSource("examples/marilyn_th.jpg");
  // throw new Error("Width: " + imageb.width + "," + imageb.contentArea.width);

	var image2 = document.createElement('img');
	image2 = colorjack.controlFactory.createLayout(image2,c.image2);
  image2.setSize(320, 400);
  image2.setMargin(30);
  image2.setBorderSize(15);
  image2.setBorderColor("blue");
  image2.setSource("examples/marilyn2_th.jpg");
};
