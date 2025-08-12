import { currentDocument } from '../html/dom_html_doc.js';
import { controlFactory } from '../html/control_factory.js';
import { overridePainters } from './combo_blue.js';
import { overrideMikePainters } from './combo_mike.js';

const $ = function(a) { return document.getElementById(a); };

export function setupComboBoxFruits() {
  let fruitSelection;
  const setupFruitSelection = function() {
    const options = [
      { id : "optionApple",    label: "Apple" },
      { id : "optionOrange",    label: "Orange" },
      { id : "optionKiwi",    label: "Kiwi" },
      { id : "optionPeach",    label: "Peach" },
      { id : "optionStrawberry",  label: "Strawberry" },
      { id : "optionRaspberry",  label: "Raspberry" },
      { id : "optionCherry",    label: "Cherry" },
      { id : "optionVanilla",    label: "Vanilla" },
      { id : "optionPineapple",  label: "Pineapple" },
      { id : "optionBlackberry",  label: "Blackberry" },
      { id : "optionBanana",    label: "BananaBananaBanana" }
    ];

    const arialFont = {
        _scale: 0.2,
        _color: 'black',
        getScaleFactor: function() { return this._scale; },
        getTextColor: function() { return this._color; },
        setTextColor: function(c) { this._color = c; },
        setScaleFactor: function(s) { this._scale = s; }
    };

    fruitSelection = currentDocument.createElement('select');
    fruitSelection = controlFactory.createLayout(fruitSelection,$('fruitComboBox'));
    fruitSelection.setFont(arialFont);

    overridePainters(fruitSelection);

    fruitSelection.setSize(4);
    fruitSelection.setOptions(options);

    fruitSelection.setSelectionCallback(
      function(value, label) {
        const input = document.getElementById("selectionInputBox");
        input.value = value;
      }
    );

    fruitSelection.setHoverCallback(
      function(value, label) {
        const input = document.getElementById("hoverInputBox");
        input.value = label;
      }
    );
  };

  setupFruitSelection();
}

export function setupComboBoxOther() {
  let chordSelection;
  let scalesSelection;
  let musicSelection;

  const setupChordSelection = function() {
    const options = [
      { id : "opt1",   label: "Scales..." },
      { id : "opt2",   label: "Chinese Mongolian" },
      { id : "opt3",   label: "Altered" },
      { id : "opt4",   label: "Arabian" },
      { id : "opt5",   label: "Augmented" },
      { id : "opt6",   label: "Balinese" },
      { id : "opt7",   label: "Blues" },
      { id : "opt8",   label: "Byzantine" },
      { id : "opt9",   label: "Chinese" },
      { id : "opt10", label: "Chromatic" },
      { id : "opt11", label: "Diminished (H-W)" },
      { id : "opt12", label: "Diminished (W-H)" },
      { id : "opt13", label: "Dorian" },
      { id : "opt14", label: "Dorian b2" },
      { id : "opt15", label: "Dorian #4" }
    ];

    chordSelection = currentDocument.createElement('select');
    chordSelection = controlFactory.createLayout(chordSelection,$('chordComboBox'));

    const smallFont = {
        _scale: 0.06,
        _color: 'black',
        getScaleFactor: function() { return this._scale; },
        getTextColor: function() { return this._color; },
        setTextColor: function(c) { this._color = c; },
        setScaleFactor: function(s) { this._scale = s; }
    };
    chordSelection.setFont(smallFont);
    chordSelection.setSize(100);

    overrideMikePainters(chordSelection);

    chordSelection.setOptions(options);

    chordSelection.setSelectionCallback(function(value, label) {
    });
  };

  const setupScalesSelection = function() {
    const options = [
      { id : "Major",   label: "Chords..." },
      { id : "Majb5",   label: "Majb5" },
      { id : "Minor",   label: "minor" },
      { id : "minb5",   label: "minb5" }
    ];

    scalesSelection = currentDocument.createElement('select');
    scalesSelection = controlFactory.createLayout(scalesSelection,$('scalesComboBox'));

    const smallFont = {
        _scale: 0.06,
        _color: 'black',
        getScaleFactor: function() { return this._scale; },
        getTextColor: function() { return this._color; },
        setTextColor: function(c) { this._color = c; },
        setScaleFactor: function(s) { this._scale = s; }
    };
    scalesSelection.setFont(smallFont);
    scalesSelection.setSize(100);

    overrideMikePainters(scalesSelection);

    scalesSelection.setOptions(options);

    scalesSelection.setSelectionCallback(function(value, label) {
    });
  };

  const setupComposerSelection = function() {
    const options2 = [
      { id : "Mozart",  label: "Mozart" },
      { id : "Beethoven", label: "Beethoven" },
      { id : "Chopin",  label: "Chopin" },
      { id : "Vivaldi",  label: "Vivaldi" }
    ];

    musicSelection = currentDocument.createElement('select');
    musicSelection = controlFactory.createLayout(musicSelection,$('composerComboBox'));

    const largerFont = {
        _scale: 0.4,
        _color: 'green',
        getScaleFactor: function() { return this._scale; },
        getTextColor: function() { return this._color; },
        setTextColor: function(c) { this._color = c; },
        setScaleFactor: function(s) { this._scale = s; }
    };
    musicSelection.setFont(largerFont);

    musicSelection.setOptions(options2);

    musicSelection.setSelectionCallback(function(value, label) {
    });
  };

  setupChordSelection();
  setupScalesSelection();
  setupComposerSelection();
}
