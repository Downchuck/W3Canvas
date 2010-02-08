colorjack.textbox.ui.InputScrolling = function() {
	var enabled = false;
	var offset = 0;
	var viewportBox = null;		// offset + visualTextBox.getBoxModel().getLeftLength()
	var visualTextBox = null;
	
	var getOffset = function() { return (enabled)? offset : 0; };
	var setOffset = function(f) { offset = f; };
	
	var isEnabled = function() { return enabled; };
	
	var setEnabled = function(e) {
		enabled = e;
		visualTextBox.resetBox(); // resize control to 1-line or not.
	};
	
	var init = function(vars) {
		try {
			visualTextBox = vars.visualTextBox;
		
			colorjack.debug.checkNull("InputScrolling", [visualTextBox]);
		}
		catch (e837) {
			colorjack.debug.programmerPanic("InputScrolling. Initialization error: " + e837.name + " = " + e837.message);
		}
	};
	
	return {
		'init'				: init,
		'getOffset' 		: getOffset,
		'setOffset'			: setOffset,
		'isEnabled'			: isEnabled,
		'setEnabled'		: setEnabled
	};
};
