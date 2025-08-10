import { currentDocument } from '../html/dom_html_doc.js';
import { controlFactory } from '../html/control_factory.js';

const $ = function(a) { return document.getElementById(a); };

export function setupImageTest() {
	const c = { image1: $('cBox_image1'),
	image1b: $('cBox_image1b'),
	image2: $('cBox_image2') };
	let image = currentDocument.createElement('img');
	image = controlFactory.createLayout(image,c.image1);
	image.setSize(120, 200);
  image.setBorderSize(25);
  image.setBorderColor("red");
  image.setSource("examples/marilyn_th.jpg");

	let imageb = currentDocument.createElement('img');
	imageb = controlFactory.createLayout(imageb,c.image1b);
  imageb.setMargin(30);
  imageb.setPadding(15);
  imageb.setBorderSize(25);
  imageb.setBorderColor("purple");
  imageb.setSource("examples/marilyn_th.jpg");

	let image2 = currentDocument.createElement('img');
	image2 = controlFactory.createLayout(image2,c.image2);
  image2.setSize(320, 400);
  image2.setMargin(30);
  image2.setBorderSize(15);
  image2.setBorderColor("blue");
  image2.setSource("examples/marilyn2_th.jpg");
}
