import { controlFactory } from '../html/control_factory.js';

export function setupButtons() {
        const radio1 = controlFactory.create("InputRadio", "radio1");
        const radio2 = controlFactory.create("InputRadio", "radio2");
        const radio3 = controlFactory.create("InputRadio", "radio3");

        radio1.setName("Radio");
        radio2.setName("Radio");
        radio3.setName("Radio");

        radio3.setChecked(true);

        radio1.setLabel("Radio 1");
        radio2.setLabel("Radio 2");
        radio3.setLabel("Radio 3");


        const radio4 = controlFactory.create("InputRadio", "radio4");
        const radio5 = controlFactory.create("InputRadio", "radio5");
        const radio6 = controlFactory.create("InputRadio", "radio6");

        radio4.setName("RadioGroup2");
        radio5.setName("RadioGroup2");
        radio6.setName("RadioGroup2");

        radio4.setLabel("Radio 1 !2");
        radio5.setLabel("Radio 2 !2");
        radio6.setLabel("Radio 3 !2");


        const checkbox1 = controlFactory.create("InputCheckBox", "checkbox1");
        const checkbox2 = controlFactory.create("InputCheckBox", "checkbox2");
        const checkbox3 = controlFactory.create("InputCheckBox", "checkbox3");

        checkbox1.setName("Checkbox");
        checkbox2.setName("Checkbox");
        checkbox3.setName("Checkbox");

        checkbox1.setChecked(true);
        checkbox2.setChecked(false);
        checkbox3.setChecked(true);

        checkbox1.setLabel("Checkbox 1");
        checkbox2.setLabel("Checkbox 2");
        checkbox3.setLabel("Checkbox 3");
}
