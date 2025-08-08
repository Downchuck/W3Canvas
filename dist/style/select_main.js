"use strict";
var $ = function (a) { return document.getElementById(a); };
var setupComboBoxFruits = function () {
    var doc = colorjack.currentDocument;
    var fruitSelection;
    var setupFruitSelection = function () {
        var options = [
            { id: "optionApple", label: "Apple" },
            { id: "optionOrange", label: "Orange" },
            { id: "optionKiwi", label: "Kiwi" },
            { id: "optionPeach", label: "Peach" },
            { id: "optionStrawberry", label: "Strawberry" },
            { id: "optionRaspberry", label: "Raspberry" },
            { id: "optionCherry", label: "Cherry" },
            { id: "optionVanilla", label: "Vanilla" },
            { id: "optionPineapple", label: "Pineapple" },
            { id: "optionBlackberry", label: "Blackberry" },
            { id: "optionBanana", label: "BananaBananaBanana" }
        ];
        var arialFont = new ArialFont();
        fruitSelection = doc.createElement('select');
        fruitSelection = colorjack.controlFactory.createLayout(fruitSelection, $('fruitComboBox'));
        fruitSelection.setFont(arialFont);
        overridePainters(fruitSelection);
        fruitSelection.setSize(4); // "to disable the scrollbar" //4 visible rows
        fruitSelection.setOptions(options);
        fruitSelection.setSelectionCallback(function (value, label) {
            var input = document.getElementById("selectionInputBox");
            input.value = value;
        });
        fruitSelection.setHoverCallback(function (value, label) {
            var input = document.getElementById("hoverInputBox");
            input.value = label;
        });
    };
    setupFruitSelection();
};
var setupComboBoxOther = function () {
    var doc = colorjack.currentDocument;
    var chordSelection;
    var scalesSelection;
    var musicSelection;
    var setupChordSelection = function () {
        var options = [
            { id: "opt1", label: "Scales..." },
            { id: "opt2", label: "Chinese Mongolian" },
            { id: "opt3", label: "Altered" },
            { id: "opt4", label: "Arabian" },
            { id: "opt5", label: "Augmented" },
            { id: "opt6", label: "Balinese" },
            { id: "opt7", label: "Blues" },
            { id: "opt8", label: "Byzantine" },
            { id: "opt9", label: "Chinese" },
            { id: "opt10", label: "Chromatic" },
            { id: "opt11", label: "Diminished (H-W)" },
            { id: "opt12", label: "Diminished (W-H)" },
            { id: "opt13", label: "Dorian" },
            { id: "opt14", label: "Dorian b2" },
            { id: "opt15", label: "Dorian #4" }
        ];
        chordSelection = doc.createElement('select');
        chordSelection = colorjack.controlFactory.createLayout(chordSelection, $('chordComboBox'));
        var smallFont = new ArialFont(0.06);
        chordSelection.setFont(smallFont);
        chordSelection.setSize(100);
        overrideMikePainters(chordSelection);
        chordSelection.setOptions(options);
        chordSelection.setSelectionCallback(function (value, label) {
            // throw new Error("Value: " + value);
        });
    };
    var setupScalesSelection = function () {
        var options = [
            { id: "Major", label: "Chords..." },
            { id: "Majb5", label: "Majb5" },
            { id: "Minor", label: "minor" },
            { id: "minb5", label: "minb5" }
        ];
        scalesSelection = doc.createElement('select');
        scalesSelection = colorjack.controlFactory.createLayout(scalesSelection, $('scalesComboBox'));
        // scalesSelection = colorjack.controlFactory.create('ComboBox', 'scalesComboBox'); //new colorjack.controlFactory.ComboBox(textLayer);
        var smallFont = new ArialFont(0.06);
        scalesSelection.setFont(smallFont);
        scalesSelection.setSize(100);
        overrideMikePainters(scalesSelection);
        scalesSelection.setOptions(options);
        scalesSelection.setSelectionCallback(function (value, label) {
            // throw new Error("Value: " + value);
        });
    };
    var setupComposerSelection = function () {
        var options2 = [
            { id: "Mozart", label: "Mozart" },
            { id: "Beethoven", label: "Beethoven" },
            { id: "Chopin", label: "Chopin" },
            { id: "Vivaldi", label: "Vivaldi" }
        ];
        musicSelection = doc.createElement('select');
        musicSelection = colorjack.controlFactory.createLayout(musicSelection, $('composerComboBox'));
        var largerFont = new ArialFont(0.4);
        largerFont.setTextColor("green");
        musicSelection.setFont(largerFont);
        musicSelection.setOptions(options2);
        musicSelection.setSelectionCallback(function (value, label) {
            // throw new Error("Value: " + value);
        });
    };
    setupChordSelection();
    setupScalesSelection();
    setupComposerSelection();
};
