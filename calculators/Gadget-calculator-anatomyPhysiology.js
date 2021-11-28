( function() {
    mw.calculators.addUnitsBases( {
        bpm: {
            toString: function( units ) {
                units = units.replace( 'bpm', 'beats/min' );

                return units;
            }
        },
        hgb: {
            toString: function( units ) {
                units = units.replace( 'hgbperdL', '/dL' );
                units = units.replace( /\s?pcthct/, '%' );

                return units;
            }
        },
        o2: {
            toString: function( units ) {
                units = units.replace( /\s?pcto2/, '%' );

                return units;
            }
        },
        temperature: {
            toString: function( units ) {
                units = units.replace( 'deg', '&deg;' );

                return units;
            }
        }
    } );

    mw.calculators.addUnits( {
        bpm: {
            baseName: 'bpm'
        },
        pcthct: {
            baseName: 'hgb'
        },
        pcto2: {
            baseName: 'o2'
        },
        ghgbperdL: {
            baseName: 'hgb',
            prefixes: 'short',
            definition: '3 pcthct'
        }
    } );

    mw.calculators.addVariables( {
        caseDuration: {
            name: 'Case duration',
            type: 'number',
            abbreviation: 'Duration',
            minValue: '1 min',
            maxLength: 3,
            units: [
                'hr',
                'min'
            ]
        },
        fiO2: {
            name: 'FiO<sub>2</sub>',
            type: 'number',
            abbreviation: 'FiO<sub>2</sub>',
            minValue: '10 pcto2',
            maxValue: '100 pcto2',
            defaultValue: '21 pcto2',
            maxLength: 3,
            units: [
                'pcto2'
            ]
        },
        hct: {
            name: 'Current hematocrit/hemoglobin',
            type: 'number',
            abbreviation: 'Current hct/HgB',
            minValue: '10 pcthct',
            maxValue: '75 pcthct',
            defaultValue: '45 pcthct',
            maxLength: 4,
            units: [
                'pcthct',
                'ghgbperdL'
            ]
        },
        heartRate: {
            name: 'Heart rate',
            type: 'number',
            abbreviation: 'HR',
            defaultValue: '60 bpm',
            maxLength: 4,
            units: [
                'bpm'
            ]
        },
        hgb: {
            name: 'Hemoglobin/hematocrit',
            type: 'number',
            abbreviation: 'HgB',
            minValue: '3 ghgbperdL',
            maxValue: '25 ghgbperdL',
            defaultValue: '13 ghgbperdL',
            maxLength: 4,
            units: [
                'pcthct',
                'ghgbperdL'
            ]
        },
        minHct: {
            name: 'Minimum hematocrit/hemoglobin',
            type: 'number',
            abbreviation: 'Min hct/HgB',
            minValue: '10 pcthct',
            maxValue: '45 pcthct',
            defaultValue: '21 pcthct',
            maxLength: 4,
            units: [
                'pcthct',
                'ghgbperdL'
            ]
        },
        paCO2: {
            name: 'PaCO<sub>2</sub>',
            type: 'number',
            abbreviation: 'PaCO<sub>2</sub>',
            minValue: '20 mmHg',
            defaultValue: '40 mmHg',
            maxLength: 3,
            units: [
                'mmHg'
            ]
        },
        paO2: {
            name: 'PaO<sub>2</sub>',
            type: 'number',
            abbreviation: 'PaO<sub>2</sub>',
            minValue: '25 mmHg',
            defaultValue: '100 mmHg',
            maxLength: 3,
            units: [
                'mmHg'
            ]
        },
        pAtm: {
            name: 'Atmospheric pressure',
            type: 'number',
            abbreviation: 'P<sub>atm</sub>',
            minValue: '0 mmHg',
            defaultValue: '760 mmHg',
            maxLength: 4,
            units: [
                'mmHg'
            ]
        },
        saO2: {
            name: 'SaO<sub>2</sub>',
            type: 'number',
            abbreviation: 'SaO<sub>2</sub>',
            minValue: '25 pcto2',
            maxValue: '100 pcto2',
            defaultValue: '100 pcto2',
            maxLength: 3,
            units: [
                'pcto2'
            ]
        },
        smvO2: {
            name: 'SmvO<sub>2</sub>',
            type: 'number',
            abbreviation: 'SmvO<sub>2</sub>',
            minValue: '25 pcto2',
            maxValue: '100 pcto2',
            defaultValue: '75 pcto2',
            maxLength: 3,
            units: [
                'pcto2'
            ]
        },
        npoTime: {
            name: 'Time spent NPO',
            type: 'number',
            abbreviation: 'NPO time',
            minValue: '0 hr',
            defaultValue: '8 hr',
            maxLength: 2,
            units: [
                'hr'
            ]
        },
        raceSpirometry: {
            name: 'Race',
            type: 'string',
            abbreviation: 'Race',
            defaultValue: 'unknown',
            options: {
                unknown: 'Unknown',
                black: 'Black',
                caucasian: 'Caucasian',
                mexican: 'Mexican-American'
            }
        },
        surgicalTrauma: {
            name: 'Severity of surgical trauma',
            type: 'string',
            abbreviation: 'Surgical trauma',
            defaultValue: 'Minimal',
            options: [
                'Minimal',
                'Moderate',
                'Severe'
            ]
        },
        temperature: {
            name: 'Temperature',
            type: 'number',
            abbreviation: 'Temp',
            minValue: '20 degC',
            maxValue: '44 degC',
            defaultValue: '37 degC',
            maxLength: 5,
            units: [
                'degC',
                'degF'
            ]
        },
        weightBasedTidalVolumePerKgMin: {
            name: 'Minimum tidal volume',
            type: 'number',
            abbreviation: 'Min TV',
            minValue: '3 mL/kgwt',
            maxValue: '12 mL/kgwt',
            defaultValue: '6 mL/kgwt',
            maxLength: 2,
            units: [
                'mL/kgwt'
            ]
        },
        weightBasedTidalVolumePerKgMax: {
            name: 'Maximum tidal volume',
            type: 'number',
            abbreviation: 'Max TV',
            minValue: '3 mL/kgwt',
            maxValue: '12 mL/kgwt',
            defaultValue: '8 mL/kgwt',
            maxLength: 2,
            units: [
                'mL/kgwt'
            ]
        }
    } );

    // Force re-render of ibw and lbw. This is necessary to remove the additional inputs for patient variables from the
    // calculation which are now provided by the patient input toolbar.
    mw.calculators.calculations.ibw.render();
    mw.calculators.calculations.lbw.render();

    mw.calculators.addCalculations( {
        bmi: {
            name: 'Body mass index',
            abbreviation: 'BMI',
            data: {
                variables: {
                    required: [ 'weight', 'height' ]
                }
            },
            digits: 0,
            units: 'kg/m^2',
            formula: '<math>\\mathrm{BMI} = \\frac{\\mathrm{mass_{kg}}}{{(\\mathrm{height_{m}}})^2}</math>',
            link: '[[Body mass index]]',
            references: [],
            calculate: function( data ) {
                return data.weight.toNumber( 'kgwt' ) / Math.pow( data.height.toNumber( 'm' ), 2 );
            }
        },
        bsa: {
            name: 'Body surface area',
            abbreviation: 'BSA',
            data: {
                variables: {
                    required: [ 'weight', 'height' ]
                }
            },
            digits: 2,
            units: 'm^2',
            formula: '<math>\\mathrm{BSA} = \\sqrt{\\frac{\\mathrm{weight_{kg}}*\\mathrm{height_{cm}}}{3600}}</math>',
            link: false,
            references: [
                'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987 Oct 22;317(17):1098. doi: 10.1056/NEJM198710223171717. PMID: 3657876.'
            ],
            calculate: function( data ) {
                return Math.sqrt( data.height.toNumber( 'cm' ) * data.weight.toNumber( 'kgwt' ) / 3600 );
            }
        },
        systolicBloodPressure: {
            name: 'Systolic blood pressure',
            abbreviation: 'SBP',
            data: {
                variables: {
                    required: [ 'age' ]
                }
            },
            type: 'string',
            references: [
                'Baby Miller 6e, ch. 16, pg. 550'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yo' );

                var systolicMin, systolicMax, diastolicMin, diastolicMax, meanMin, meanMax;

                if( age >= 16 ) {
                    systolicMin = 100;
                    systolicMax = 125;
                } else if( age >= 13 ) {
                    systolicMin = 95;
                    systolicMax = 120;
                } else if( age >= 9 ) {
                    systolicMin = 90;
                    systolicMax = 115;
                } else if( age >= 6 ) {
                    systolicMin = 85;
                    systolicMax = 105;
                } else if( age >= 3 ) {
                    systolicMin = 80;
                    systolicMax = 100;
                } else if( age >= 1 ) {
                    systolicMin = 75;
                    systolicMax = 95;
                } else if( age >= 6 / 12 ) {
                    systolicMin = 70;
                    systolicMax = 90;
                } else if( age >= 1 / 12 ) {
                    systolicMin = 65;
                    systolicMax = 85;
                } else {
                    systolicMin = 60;
                    systolicMax = 75;
                }
            }
        }
    } );

    // Fluid management
    mw.calculators.addCalculations( {
        ebv: {
            name: 'Estimated blood volume',
            abbreviation: 'EBV',
            data: {
                variables: {
                    required: [ 'weight', 'age' ]
                }
            },
            digits: 0,
            units: 'mL',
            description: '<ul><li>Preterm: 95 mL/kg</li><li>0-1 month old: 85 mL/kg</li><li>1 month-1 year old: 80 mL/kg</li><li>&ge; 1 year old<ul><li>Female: 65 mL/kg</li><li>Male: 75 mL/kg</li></ul></li></ul>',
            references: [
                'Morgan & Mikhail\'s Clinical Anesthesiology. 5e. p1168'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );
                var age = data.age.toNumber( 'yo' );

                var ebvPerKg;

                if( age >= 1 ) {
                    if( data.gender === 'F' ) {
                        ebvPerKg = 65;
                    } else {
                        ebvPerKg = 75;
                    }
                } else if( age >= 1/12 ) {
                    ebvPerKg = 80;
                } else if( age >= 0 ) {
                    ebvPerKg = 85;
                } else {
                    ebvPerKg = 95;
                }

                return weight * ebvPerKg;
            }
        },
        fluidMaintenanceRate: {
            name: 'Fluid maintenance rate',
            abbreviation: 'Fluid maint.',
            data: {
                variables: {
                    required: [ 'weight' ]
                }
            },
            description: 'Uses 4-2-1 rule:<ul><li>4 mL/kg for the first 10 kg</li><li>2 mL/kg for the next 10 kg</li><li>1 mL/kg for the remaining weight</li></ul>',
            digits: 0,
            units: 'mL/hr',
            formula: '',
            references: [
                'Miller\'s Anesthesia 7e, section IV, pg. 1728'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );

                // Uses 4-2-1 rule
                var maintenanceRate = 4 * Math.min( weight, 10 );

                if( weight > 10 ) {
                    maintenanceRate += 2 * Math.min( weight - 10, 10 );
                }

                if( weight > 20) {
                    maintenanceRate += weight - 20;
                }

                return maintenanceRate;
            }
        },
        intraopFluids: {
            name: 'Intraoperative fluid dosing',
            abbreviation: 'Intraop fluids',
            data: {
                calculations: {
                    required: [ 'fluidMaintenanceRate' ]
                },
                variables: {
                    required: [ 'weight', 'npoTime', 'surgicalTrauma' ]
                }
            },
            type: 'string',
            references: [
                'Corcoran T, Rhodes JE, Clarke S, Myles PS, Ho KM. Perioperative fluid management strategies in major surgery: a stratified meta-analysis. Anesth Analg. 2012 Mar;114(3):640-51. doi: 10.1213/ANE.0b013e318240d6eb. Epub 2012 Jan 16. PMID: 22253274.'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );
                var maintenanceRate = data.fluidMaintenanceRate.toNumber( 'mL/hr' );
                var npoTime = data.npoTime.toNumber( 'hr' );
                var surgicalTrauma = data.surgicalTrauma;

                var output = '';

                var npoDeficit = npoTime * maintenanceRate;

                var surgicalLossMin, surgicalLossMax;

                if( surgicalTrauma === 'Minimal' ) {
                    surgicalLossMin = 2 * weight;
                    surgicalLossMax = 4 * weight;
                } else if( surgicalTrauma === 'Moderate' ) {
                    surgicalLossMin = 4 * weight;
                    surgicalLossMax = 6 * weight;
                } else {
                    surgicalLossMin = 6 * weight;
                    surgicalLossMax = 8 * weight;
                }

                var firstHour = Math.round( npoDeficit / 2 ) + maintenanceRate;
                var nextHoursMin = Math.round( npoDeficit / 4 ) + maintenanceRate + surgicalLossMin;
                var nextHoursMax = Math.round( npoDeficit / 4 ) + maintenanceRate + surgicalLossMax;
                var remainingHoursMin = maintenanceRate + surgicalLossMin;
                var remainingHoursMax = maintenanceRate + surgicalLossMax;

                output += 'NPO deficit: ' + Math.round( npoDeficit ) + ' mL<br/>';
                output += 'Surgical losses: ' + surgicalLossMin + '-' + surgicalLossMax + ' mL/hr<br/>';
                output += '1st hour: ' + firstHour + ' mL<br/>';
                output += '2nd hour: ' + nextHoursMin + '-' + nextHoursMax + ' mL<br/>';
                output += '3rd hour: ' + nextHoursMin + '-' + nextHoursMax + ' mL<br/>';
                output += '4+ hours: ' + remainingHoursMin + '-' + remainingHoursMax + ' mL<br/>';

                return output;
            }
        },
        maxAbl: {
            name: 'Maximum allowable blood loss',
            abbreviation: 'Max ABL',
            data: {
                calculations: {
                    required: [ 'ebv' ]
                },
                variables: {
                    required: [ 'weight', 'age', 'hct', 'minHct' ]
                }
            },
            digits: 0,
            units: 'mL',
            formula: '<math>\\mathrm{ABL_{max}} = \\mathrm{EBV} * \\frac{\\mathrm{Hct_{current}} - \\mathrm{Hct_{minimum}}}{\\mathrm{Hct_{current}}}</math>',
            references: [
                'Morgan & Mikhail\'s Clinical Anesthesiology. 5e. p1168'
            ],
            calculate: function( data ) {
                var currentHct = data.hct.toNumber( 'pcthct' );
                var minHct = data.minHct.toNumber( 'pcthct' );

                if( currentHct < minHct ) {
                    return '-';
                }

                return data.ebv.toNumber( 'mL' ) * ( currentHct - minHct ) / currentHct;
            }
        },
        minUop: {
            name: 'Minimum urine output',
            abbreviation: 'Min UOP',
            data: {
                variables: {
                    required: [ 'weight', 'age' ],
                    optional: [ 'caseDuration' ]
                }
            },
            type: 'string',
            formula: '<math>\\mathrm{UOP_{min}} = \\begin{cases}1 \\text{ mL/kg/hr} & \\text{if age} < 1 \\\\0.5 \\text{ mL/kg/hr} & \\text{if age} \\geq 1\\end{cases}</math>',
            references: [
                'Klahr S, Miller SB. Acute oliguria. N Engl J Med. 1998 Mar 5;338(10):671-5. doi: 10.1056/NEJM199803053381007. PMID: 9486997.',
                'Arant BS Jr. Postnatal development of renal function during the first year of life. Pediatr Nephrol. 1987 Jul;1(3):308-13. doi: 10.1007/BF00849229. PMID: 3153294.'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );
                var age = data.age.toNumber( 'yo' );
                var caseDuration = data.caseDuration ? data.caseDuration.toNumber( 'hr' ) : null;

                var minUop;

                if( age >= 1 ) {
                    minUop = 0.5 * weight;
                } else {
                    minUop = 1 * weight;
                }

                if( caseDuration ) {
                    minUop = minUop * caseDuration + ' mL';
                } else {
                    minUop = minUop + ' mL/hr';
                }

                return minUop;
            }
        }
    } );

    // Cardiovascular
    mw.calculators.addCalculations( {
        vO2: {
            name: 'Rate of oxygen consumption (VO<sub>2</sub>)',
            abbreviation: 'VO<sub>2</sub>',
            data: {
                calculations: {
                    required: [ 'bsa' ]
                },
                variables: {
                    optional: [ 'age' ]
                }
            },
            units: 'mL/min',
            formula: '<math>\\mathrm{VO_2} = \\begin{cases} 125 * \\mathrm{BSA}  & \\text{if age} < 70 \\\\ 110 * \\mathrm{BSA} & \\text{if age} \\geq 70 \\end{cases}</math>',
            references: [],
            calculate: function( data ) {
                var bsa = data.bsa.toNumber();
                var age = data.age ? data.age.toNumber( 'yr' ) : null;

                if( age < 70 ) {
                    return 125 * bsa;
                } else {
                    return 110 * bsa;
                }
            }
        },
        cardiacOutputFick: {
            name: 'Cardiac output (Fick)',
            abbreviation: 'CO (Fick)',
            data: {
                variables: {
                    required: [ 'saO2', 'smvO2', 'hgb' ]
                },
                calculations: {
                    required: [ 'vO2' ]
                }
            },
            units: 'L/min',
            formula: '<math>\\mathrm{CO_{Fick}}=\\frac{\\mathrm{VO_2}}{(\\mathrm{S_aO_2} - \\mathrm{S_{mv}O_2}) * H_b * 13.4}</math>',
            link: false,
            references: [],
            calculate: function( data ) {
                var vO2 = data.vO2.toNumber( 'mL/min' );
                var saO2 = data.saO2.toNumber() / 100;
                var smvO2 = data.smvO2.toNumber() / 100;
                var hgb = data.hgb.toNumber( 'ghgbperdL' );

                return vO2 / ( ( saO2 - smvO2 ) * hgb * 13.4 );
            }
        },
        cardiacIndex: {
            name: 'Cardiac index',
            abbreviation: 'CI',
            data: {
                calculations: {
                    required: [ 'bsa', 'cardiacOutputFick' ]
                }
            },
            units: 'L/min/m^2',
            formula: '<math>\\mathrm{CI}=\\frac{\\mathrm{CO}}{\\mathrm{BSA}}</math>',
            link: false,
            references: [],
            calculate: function( data ) {
                var cardiacOutput = data.cardiacOutputFick.toNumber( 'L/min' );
                var bsa = data.bsa.toNumber( 'm^2' );

                return cardiacOutput / bsa;
            }
        },
        strokeVolume: {
            name: 'Stroke volume',
            abbreviation: 'SV',
            data: {
                variables: {
                    required: [ 'heartRate' ]
                },
                calculations: {
                    required: [ 'cardiacOutputFick' ]
                }
            },
            units: 'mL',
            formula: '<math>\\mathrm{SV}=\\frac{\\mathrm{CO}}{\\mathrm{HR}}</math>',
            link: false,
            references: [],
            calculate: function( data ) {
                var cardiacOutput = data.cardiacOutputFick.toNumber( 'mL/min' );
                var heartRate = data.heartRate.toNumber();

                return cardiacOutput / heartRate;
            }
        }
    } );

    // Neuro
    mw.calculators.addCalculations( {
        brainMass: {
            name: 'Brain mass',
            data: {
                variables: {
                    optional: [ 'age', 'gender' ]
                }
            },
            digits: 0,
            units: 'gwt',
            description: 'This calculation will give a more precise estimate of brain mass if age and/or gender are provided.',
            references: [
                'Dekaban AS. Changes in brain weights during the span of human life: relation of brain weights to body heights and body weights. Ann Neurol. 1978 Oct;4(4):345-56. doi: 10.1002/ana.410040410. PMID: 727739.'
            ],
            calculate: function( data ) {
                var age = data.age ? data.age.toNumber( 'yr' ) : null;
                var gender = data.gender ? data.gender : null;

                var brainMassFemale = 1290;
                var brainMassMale = 1450;

                if( age !== null ) {
                    if( age <= 10 / 365 ) {
                        // <=10 days
                        brainMassFemale = 360;
                        brainMassMale = 380;
                    } else if( age <= 4 * 30 / 365 ) {
                        // Less than 4 months. This is a gap in the reported data of the paper, so linearly interpolate?
                        var ageFactor = 1 - ( 4 * 30 / 365 - age ) / ( 4 * 30 / 365 - 10 / 365 );

                        brainMassFemale = 360 + ageFactor * ( 580 - 360 );
                        brainMassMale = 380 + ageFactor * ( 640 - 380 );
                    } else if( age <= 8 * 30 / 365 ) {
                        // <=8 months
                        brainMassFemale = 580;
                        brainMassMale = 640;
                    } else if( age <= 18 * 30 / 365 ) {
                        // <=18 months
                        brainMassFemale = 940;
                        brainMassMale = 970;
                    } else if( age <= 30 * 30 / 365 ) {
                        // <=30 months
                        brainMassFemale = 1040;
                        brainMassMale = 1120;
                    } else if( age <= 43 * 30 / 365 ) {
                        // <=43 months
                        brainMassFemale = 1090;
                        brainMassMale = 1270;
                    } else if( age <= 5 ) {
                        brainMassFemale = 1150;
                        brainMassMale = 1300;
                    } else if( age <= 7 ) {
                        brainMassFemale = 1210;
                        brainMassMale = 1330;
                    } else if( age <= 9 ) {
                        brainMassFemale = 1180;
                        brainMassMale = 1370;
                    } else if( age <= 12 ) {
                        brainMassFemale = 1260;
                        brainMassMale = 1440;
                    } else if( age <= 15 ) {
                        brainMassFemale = 1280;
                        brainMassMale = 1410;
                    } else if( age <= 18 ) {
                        brainMassFemale = 1340;
                        brainMassMale = 1440;
                    } else if( age <= 21 ) {
                        brainMassFemale = 1310;
                        brainMassMale = 1450;
                    } else if( age <= 30 ) {
                        brainMassFemale = 1300;
                        brainMassMale = 1440;
                    } else if( age <= 40 ) {
                        brainMassFemale = 1290;
                        brainMassMale = 1440;
                    } else if( age <= 50 ) {
                        brainMassFemale = 1290;
                        brainMassMale = 1430;
                    } else if( age <= 55 ) {
                        brainMassFemale = 1280;
                        brainMassMale = 1410;
                    } else if( age <= 60 ) {
                        brainMassFemale = 1250;
                        brainMassMale = 1370;
                    } else if( age <= 65 ) {
                        brainMassFemale = 1240;
                        brainMassMale = 1370;
                    } else if( age <= 70 ) {
                        brainMassFemale = 1240;
                        brainMassMale = 1360;
                    } else if( age <= 75 ) {
                        brainMassFemale = 1230;
                        brainMassMale = 1350;
                    } else if( age <= 80 ) {
                        brainMassFemale = 1190;
                        brainMassMale = 1330;
                    } else if( age <= 85 ) {
                        brainMassFemale = 1170;
                        brainMassMale = 1310;
                    } else {
                        brainMassFemale = 1140;
                        brainMassMale = 1290;
                    }
                }

                if( gender === 'F' ) {
                    return brainMassFemale;
                } else if( gender === 'M' ) {
                    return brainMassMale;
                } else {
                    return ( brainMassFemale + brainMassMale ) / 2;
                }
            }
        },
        cerebralBloodVolume: {
            name: 'Cerebral blood volume',
            abbreviation: 'CBV',
            data: {
                calculations: {
                    required: [ 'brainMass' ]
                }
            },
            units: 'mL',
            description: '4 mL per 100g of brain mass',
            references: [
                'Tameem A, Krovvidi H, Cerebral physiology, Continuing Education in Anaesthesia Critical Care & Pain, Volume 13, Issue 4, August 2013, Pages 113–118, https://doi.org/10.1093/bjaceaccp/mkt001'
            ],
            calculate: function( data ) {
                var brainMass = data.brainMass.toNumber( 'gwt' );

                return 4 * brainMass / 100;
            }
        },
        cerebralMetabolicRateFactor: {
            name: 'Cerebral metabolic rate factor',
            abbreviation: '%CMR',
            data: {
                variables: {
                    optional: [ 'temperature' ]
                }
            },
            description: '7% change in CMR for every 1 &deg;C change in temperature',
            references: [
                'Tameem A, Krovvidi H, Cerebral physiology, Continuing Education in Anaesthesia Critical Care & Pain, Volume 13, Issue 4, August 2013, Pages 113–118, https://doi.org/10.1093/bjaceaccp/mkt001'
            ],
            calculate: function( data ) {
                var temperature = data.temperature ? data.temperature.toNumber( 'degC' ) : null;

                var cerebralMetabolicRateFactor = 1;

                if( temperature ) {
                    cerebralMetabolicRateFactor += 0.07 * ( temperature - 37 );
                }

                return cerebralMetabolicRateFactor;
            }
        },
        cerebralMetabolicRateO2: {
            name: 'Cerebral metabolic rate (O<sub>2</sub>)',
            abbreviation: 'CMRO<sub>2</sub>',
            data: {
                calculations: {
                    required: [ 'brainMass', 'cerebralMetabolicRateFactor' ]
                },
                variables: {
                    optional: [ 'temperature' ]
                }
            },
            units: 'mL/min',
            description: '<ul><li>3 mL O<sub>2</sub>/min per 100g of brain mass</li><li>If temperature is provided, adjusts estimate using 7% change in CMR for every 1 &deg;C change in temperature</li></ul>',
            references: [
                'Tameem A, Krovvidi H, Cerebral physiology, Continuing Education in Anaesthesia Critical Care & Pain, Volume 13, Issue 4, August 2013, Pages 113–118, https://doi.org/10.1093/bjaceaccp/mkt001'
            ],
            calculate: function( data ) {
                // Temperature is included as an optional variable to generate the input.
                // It is used by cerebralMetabolicRateFactor, which is an internal calculation not typically shown.
                var brainMass = data.brainMass.toNumber( 'gwt' );
                var cerebralMetabolicRateFactor = data.cerebralMetabolicRateFactor.toNumber();

                return cerebralMetabolicRateFactor * 3 * brainMass / 100;
            }
        },
        cerebralMetabolicRateGlucose: {
            name: 'Cerebral metabolic rate (Glucose)',
            abbreviation: 'CMR<sub>glu</sub>',
            data: {
                calculations: {
                    required: [ 'brainMass', 'cerebralMetabolicRateFactor' ]
                }
            },
            units: 'mg/min',
            description: '<ul><li>5 mg glucose/min per 100g of brain mass</li><li>7% change in CMR for every 1 &deg;C change in temperature</li></ul>',
            references: [
                'Tameem A, Krovvidi H, Cerebral physiology, Continuing Education in Anaesthesia Critical Care & Pain, Volume 13, Issue 4, August 2013, Pages 113–118, https://doi.org/10.1093/bjaceaccp/mkt001'
            ],
            calculate: function( data ) {
                var brainMass = data.brainMass.toNumber( 'gwt' );
                var cerebralMetabolicRateFactor = data.cerebralMetabolicRateFactor.toNumber();

                return cerebralMetabolicRateFactor * 5 * brainMass / 100;
            }
        },
        cerebralBloodFlow: {
            name: 'Cerebral blood flow',
            abbreviation: 'CBF',
            data: {
                calculations: {
                    required: [ 'brainMass', 'cerebralMetabolicRateFactor' ]
                },
                variables: {
                    optional: [ 'paCO2' ]
                }
            },
            units: 'mL/min',
            description: '<ul><li>50 mL/min per 100g of brain mass.</li><li>Every mmHg in PaCO2 changes CBF by 1.5 mL/min per 100g of brain mass.</li><li>Cerebral blood flow and cerebral metabolic rate are coupled. Factors that alter CMR (e.g. temperature) will proportionally alter CBF.</li>',
            references: [
                'Tameem A, Krovvidi H, Cerebral physiology, Continuing Education in Anaesthesia Critical Care & Pain, Volume 13, Issue 4, August 2013, Pages 113–118, https://doi.org/10.1093/bjaceaccp/mkt001',
                'Brian JE Jr. Carbon dioxide and the cerebral circulation. Anesthesiology. 1998 May;88(5):1365-86. doi: 10.1097/00000542-199805000-00029. PMID: 9605698.'
            ],
            calculate: function( data ) {
                var brainMass = data.brainMass.toNumber( 'gwt' );
                var cerebralMetabolicRateFactor = data.cerebralMetabolicRateFactor.toNumber();
                var paCO2 = data.paCO2.toNumber( 'mmHg' );

                var cerebralBloodFlow = cerebralMetabolicRateFactor * 50 * brainMass / 100;

                if( paCO2 ) {
                    // CO2 reductions don't reduce CBF more than 50%
                    var minCerebralBloodFlow = cerebralBloodFlow / 2;

                    cerebralBloodFlow += 1.5 * brainMass / 100 * ( paCO2 - 40 );

                    cerebralBloodFlow = math.max( cerebralBloodFlow, minCerebralBloodFlow );
                }

                return cerebralBloodFlow;
            }
        }
    } );



    // Pulmonary
    mw.calculators.addCalculations( {
        paO2Predicted: {
            name: 'PaO<sub>2</sub> (predicted)',
            abbreviation: 'PaO<sub>2</sub> pred.',
            data: {
                variables: {
                    required: [ 'pAtm', 'fiO2', 'paCO2' ]
                }
            },
            units: 'mmHg',
            formula: '<math>P_{aO_2Predicted} = FiO_2*(P_{atm}-P_{H_{2}O})-\\frac{P_{aCO_2}}{R}</math>',
            references: [
                'McFarlane MJ, Imperiale TF. Use of the alveolar-arterial oxygen gradient in the diagnosis of pulmonary embolism. Am J Med. 1994 Jan;96(1):57-62. doi: 10.1016/0002-9343(94)90116-3. PMID: 8304364.'
            ],
            calculate: function( data ) {
                var fiO2 = data.fiO2.toNumber( 'pcto2' ) / 100;
                var pAtm = data.pAtm.toNumber( 'mmHg' );
                var pH2O = 47; // mmHg
                var paCO2 = data.paCO2.toNumber( 'mmHg' );
                var r = 0.8;

                return fiO2 * ( pAtm - pH2O ) - paCO2 / r;
            }
        },
        aaGradientO2: {
            name: 'A-a O<sub>2</sub> gradient',
            abbreviation: 'A-a O<sub>2</sub>',
            data: {
                calculations: {
                    required: [ 'paO2Predicted' ]
                },
                variables: {
                    required: [ 'paO2' ]
                }
            },
            units: 'mmHg',
            formula: '<math>\\text{A-a gradient}_{\\mathrm{O}_2} = P_{aO_2Predicted}-P_{aO_2} </math>',
            references: [
                'McFarlane MJ, Imperiale TF. Use of the alveolar-arterial oxygen gradient in the diagnosis of pulmonary embolism. Am J Med. 1994 Jan;96(1):57-62. doi: 10.1016/0002-9343(94)90116-3. PMID: 8304364.'
            ],
            calculate: function( data ) {
                var paO2Predicted = data.paO2Predicted.toNumber( 'mmHg' );
                var paO2 = data.paO2.toNumber( 'mmHg' );

                return math.round( paO2Predicted - paO2 );
            }
        },
        aaGradientO2Predicted: {
            name: 'A-a O<sub>2</sub> gradient (predicted)',
            abbreviation: 'A-a O<sub>2</sub> pred.',
            data: {
                variables: {
                    required: [ 'age' ]
                }
            },
            units: 'mmHg',
            formula: '<math>\\text{Predicted A-a gradient}_{\\mathrm{O}_2} = \\frac{(\\mathrm{age_{yr} + 10)}}{4}</math>',
            references: [
                'Hantzidiamantis PJ, Amaro E. Physiology, Alveolar to Arterial Oxygen Gradient. 2021 Feb 22. In: StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing; 2021 Jan–. PMID: 31424737.'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yr' );

                return ( age + 10 ) / 4;
            }
        },
        weightBasedTidalVolume: {
            name: 'Weight-based tidal volume',
            abbreviation: 'Weight-based TV',
            data: {
                calculations: {
                    required: [ 'ibw' ]
                },
                variables: {
                    required: [ 'weightBasedTidalVolumePerKgMin', 'weightBasedTidalVolumePerKgMax' ]
                }
            },
            type: 'string',
            description: '<ul><li>Calculated using ideal body weight</li><li>Low tidal volume uses 6-8 mL/kg<sup>1</sup><ul><li>Current evidence does not show benefit of intraoperative low tidal volumes for patients without pulmonary injury<sup>2</sup></li></ul></li>',
            references: [
                'Acute Respiratory Distress Syndrome Network, Brower RG, Matthay MA, Morris A, Schoenfeld D, Thompson BT, Wheeler A. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and the acute respiratory distress syndrome. N Engl J Med. 2000 May 4;342(18):1301-8. doi: 10.1056/NEJM200005043421801. PMID: 10793162.',
                'Karalapillai D, Weinberg L, Peyton P, Ellard L, Hu R, Pearce B, Tan CO, Story D, O\'Donnell M, Hamilton P, Oughton C, Galtieri J, Wilson A, Serpa Neto A, Eastwood G, Bellomo R, Jones DA. Effect of Intraoperative Low Tidal Volume vs Conventional Tidal Volume on Postoperative Pulmonary Complications in Patients Undergoing Major Surgery: A Randomized Clinical Trial. JAMA. 2020 Sep 1;324(9):848-858. doi: 10.1001/jama.2020.12866. PMID: 32870298; PMCID: PMC7489812.'
            ],
            calculate: function( data ) {
                var ibw = data.ibw.toNumber( 'kgwt' );
                var weightBasedTidalVolumePerKgMin = data.weightBasedTidalVolumePerKgMin.toNumber( 'mL/kgwt' );
                var weightBasedTidalVolumePerKgMax = data.weightBasedTidalVolumePerKgMax.toNumber( 'mL/kgwt' );

                return math.round( weightBasedTidalVolumePerKgMin * ibw ) + '-' + math.round( weightBasedTidalVolumePerKgMax * ibw ) + ' mL';
            }
        }
    } );
}() );