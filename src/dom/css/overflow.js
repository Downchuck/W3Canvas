import * as debug from '../lang_debug.js';

export class InputScrolling {
	enabled = false;
	offset = 0;
	viewportBox = null;
	visualTextBox = null;

	getOffset() { return (this.enabled)? this.offset : 0; }
	setOffset(f) { this.offset = f; }

	isEnabled() { return this.enabled; }

	setEnabled(e) {
		this.enabled = e;
		this.visualTextBox.resetBox();
	}

	init(vars) {
		try {
			this.visualTextBox = vars.visualTextBox;
			debug.checkNull("InputScrolling", [this.visualTextBox]);
		}
		catch (e837) {
			debug.programmerPanic("InputScrolling. Initialization error: " + e837.name + " = " + e837.message);
		}
	}
}
