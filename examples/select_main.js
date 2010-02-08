var setupComboBoxFruits = function() {

	var setupFruitSelection = function() {
	
		var options = [
			{ id : "optionApple",		label: "Apple" },
			{ id : "optionOrange",		label: "Orange" },
			{ id : "optionKiwi",		label: "Kiwi" },
			{ id : "optionPeach",		label: "Peach" },
			{ id : "optionStrawberry",	label: "Strawberry" },
			{ id : "optionRaspberry",	label: "Raspberry" },
			{ id : "optionCherry",		label: "Cherry" },
			{ id : "optionVanilla",		label: "Vanilla" },
			{ id : "optionPineapple",	label: "Pineapple" },
			{ id : "optionBlackberry",	label: "Blackberry" },
			{ id : "optionBanana",		label: "BananaBananaBanana" }
		];

		var arialFont = new ArialFont();
		
		// Keep experimenting...
		//arialFont.setScaleFactor(0.07);
		//arialFont.setScaleFactor(0.1);
		//arialFont.setScaleFactor(0.2);
		//arialFont.setScaleFactor(0.4);
		
		fruitSelection = ControlFactory.create('ComboBox', 'fruitComboBox');
		fruitSelection.setFont(arialFont);

		overridePainters(fruitSelection);
		
		fruitSelection.setSize(4); // "to disable the scrollbar" //4 visible rows
		fruitSelection.setOptions(options);
		
		var selectionCallback = function(value, label) {
			var input = document.getElementById("selectionInputBox");
			input.value = value;
		};
		
		fruitSelection.setSelectionCallback(selectionCallback);
		
		fruitSelection.setHoverCallback(
			function(value, label) {
				var input = document.getElementById("hoverInputBox");
				input.value = label;
			}
		);
	};

	setupFruitSelection();
};

var setupComboBoxOther = function() {

	var setupChordSelection = function() {
		var options = [
			{ id : "opt1", 	label: "Scales..." },
			{ id : "opt2", 	label: "Chinese Mongolian" },
			{ id : "opt3", 	label: "Altered" },
			{ id : "opt4", 	label: "Arabian" },
			{ id : "opt5", 	label: "Augmented" },
			{ id : "opt6", 	label: "Balinese" },
			{ id : "opt7", 	label: "Blues" },
			{ id : "opt8", 	label: "Byzantine" },
			{ id : "opt9", 	label: "Chinese" },
			{ id : "opt10", label: "Chromatic" },
			{ id : "opt11", label: "Diminished (H-W)" },
			{ id : "opt12", label: "Diminished (W-H)" },
			{ id : "opt13", label: "Dorian" },
			{ id : "opt14", label: "Dorian b2" },
			{ id : "opt15", label: "Dorian #4" }
		];
		
		chordSelection = ControlFactory.create('ComboBox', 'chordComboBox');
		
		var smallFont = new ArialFont(0.06);
		chordSelection.setFont(smallFont);
		chordSelection.setSize(100);
		
		overrideMikePainters(chordSelection);
		
		chordSelection.setOptions(options);
		
		chordSelection.setSelectionCallback(function(value, label) {
			// throw new Error("Value: " + value);	
		});
	};


	var setupScalesSelection = function() {
		var options = [
			{ id : "Major", 	label: "Chords..." },
			{ id : "Majb5", 	label: "Majb5" },
			{ id : "Minor", 	label: "minor" },
			{ id : "minb5", 	label: "minb5" }
		];
		
		scalesSelection = ControlFactory.create('ComboBox', 'scalesComboBox'); //new ComboBoxControl(textLayer);
		
		var smallFont = new ArialFont(0.06);
		scalesSelection.setFont(smallFont);
		scalesSelection.setSize(100);
		
		overrideMikePainters(scalesSelection);
		
		scalesSelection.setOptions(options);
		
		scalesSelection.setSelectionCallback(function(value, label) {
			// throw new Error("Value: " + value);	
		});
	};
	
	var setupComposerSelection = function() {
		var options2 = [
			{ id : "Mozart",	label: "Mozart" },
			{ id : "Beethoven", label: "Beethoven" },
			{ id : "Chopin",	label: "Chopin" },
			{ id : "Vivaldi",	label: "Vivaldi" }
		];
		
		var musicSelection = ControlFactory.create('ComboBox', 'composerComboBox');
		
		var largerFont = new ArialFont(0.4);
		largerFont.setTextColor("green");
		musicSelection.setFont(largerFont);
		
		musicSelection.setOptions(options2);
		
		musicSelection.setSelectionCallback(function(value, label) {
			// throw new Error("Value: " + value);	
		});
	};

	setupChordSelection();
	setupScalesSelection();
	setupComposerSelection();
};

// These are just for testing

var up = function() {
	fruitSelection.getSelectControl().scrollUp();
};

var down = function() {
	fruitSelection.getSelectControl().scrollDown();
};	