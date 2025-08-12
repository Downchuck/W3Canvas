import { setupComboBoxFruits, setupComboBoxOther } from '../style/select_main.js';
import { loadFont } from '../font/arial_font.js';

function setupCombos() {
  setupComboBoxFruits();
  setupComboBoxOther();
}

loadFont(setupCombos);
