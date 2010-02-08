                function setupButtons() {
                        var radio1 = colorjack.controlFactory.create("InputRadio", "radio1");
                        var radio2 = colorjack.controlFactory.create("InputRadio", "radio2");
                        var radio3 = colorjack.controlFactory.create("InputRadio", "radio3");

                        radio1.setName("Radio");
                        radio2.setName("Radio");
                        radio3.setName("Radio");

                        radio3.setChecked(true);

                        // SetLabel() repaints the radio
                        radio1.setLabel("Radio 1");
                        radio2.setLabel("Radio 2");
                        radio3.setLabel("Radio 3");


                        var radio4 = colorjack.controlFactory.create("InputRadio", "radio4");
                        var radio5 = colorjack.controlFactory.create("InputRadio", "radio5");
                        var radio6 = colorjack.controlFactory.create("InputRadio", "radio6");

                        radio4.setName("RadioGroup2");
                        radio5.setName("RadioGroup2");
                        radio6.setName("RadioGroup2");

                        //radio4.setChecked(true);

                        // SetLabel() repaints the radio
                        radio4.setLabel("Radio 1 !2");
                        radio5.setLabel("Radio 2 !2");
                        radio6.setLabel("Radio 3 !2");


                        var checkbox1 = colorjack.controlFactory.create("InputCheckBox", "checkbox1");
                        var checkbox2 = colorjack.controlFactory.create("InputCheckBox", "checkbox2");
                        var checkbox3 = colorjack.controlFactory.create("InputCheckBox", "checkbox3");

                        checkbox1.setName("Checkbox");
                        checkbox2.setName("Checkbox");
                        checkbox3.setName("Checkbox");

                        checkbox1.setChecked(true);
                        checkbox2.setChecked(false);
                        checkbox3.setChecked(true);

                        // SetLabel() repaints the checkbox
                        checkbox1.setLabel("Checkbox 1");
                        checkbox2.setLabel("Checkbox 2");
                        checkbox3.setLabel("Checkbox 3");

                }

