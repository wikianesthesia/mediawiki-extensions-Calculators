( function() {
    mw.calculators.addUnitsBases( {
        hgb: {
            toString: function( units ) {
                units = units.replace( 'hgbperdL', '/dL' );
                units = units.replace( /\s?pcthct/, '%' );

                return units;
            }
        },
        mEqperL: {
            toString: function( units ) {
                units = units.replace( 'mEqperL', 'mEq/L' );
                units = units.replace( /mmolperL[\w]*/, 'mmol/L' );

                return units;
            }
        }
    } );

    mw.calculators.addUnits( {
        pcthct: {
            baseName: 'hgb'
        },
        ghgbperdL: {
            baseName: 'hgb',
            prefixes: 'short',
            definition: '3 pcthct'
        },
        mEqperL: {
            baseName: 'mEqperL'
        },
        mmolperLUnivalent: {
            baseName: 'mEqperL',
            definition: '1 mEqperL'
        }
    } );

    mw.calculators.addVariables( {
        caseDuration: {
            name: 'Case duration',
            type: 'number',
            abbreviation: 'Duration',
            minValue: '1 min',
            defaultValue: '4 hr',
            maxLength: 3,
            units: [
                'hr',
                'min'
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
        serumSodium: {
            name: 'Current serum sodium',
            type: 'number',
            abbreviation: 'Current Na<sup>+</sup>',
            minValue: '100 mEqperL',
            maxValue: '170 mEqperL',
            defaultValue: '140 mEqperL',
            maxLength: 3,
            units: [
                'mEqperL',
                'mmolperLUnivalent'
            ]
        },
        serumSodiumGoal: {
            name: 'Goal serum sodium',
            type: 'number',
            abbreviation: 'Goal Na<sup>+</sup>',
            minValue: '100 mEqperL',
            maxValue: '170 mEqperL',
            defaultValue: '140 mEqperL',
            maxLength: 3,
            units: [
                'mEqperL',
                'mmolperLUnivalent'
            ]
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
        },
        freeWaterDeficit: {
            name: 'Free water deficit in hypernatremia',
            abbreviation: 'Free water deficit',
            data: {
                variables: {
                    required: [ 'weight', 'age', 'gender', 'serumSodium', 'serumSodiumGoal' ]
                }
            },
            digits: 0,
            units: 'L',
            formula: '<math>\\text{Free water deficit} = \\text{Total body water}*\\left(\\frac{\\mathrm{Na_{Current}}}{\\mathrm{Na_{Goal}}} - 1\\right)</math>' +
                '<math>\\text{Total body water} = \\mathrm{weight_{kg}}*\\begin{cases}0.6 & \\text{if child}\\\\0.5 & \\text{if adult female}\\\\0.6 & \\text{if adult male}\\\\0.45 & \\text{if elderly female}\\\\0.5 & \\text{if elderly male}\\end{cases}</math>',
            references: [
                'Adrogué HJ, Madias NE. Hypernatremia. N Engl J Med. 2000 May 18;342(20):1493-9. doi: 10.1056/NEJM200005183422006. PMID: 10816188.'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );
                var age = data.age.toNumber( 'yo' );
                var gender = data.gender;
                var serumSodium = data.serumSodium.toNumber( 'mEqperL' );
                var serumSodiumGoal = data.serumSodiumGoal.toNumber( 'mEqperL' );

                var totalBodyWater, waterFraction, freeWaterDeficit;

                if( age < 18 ) {
                    waterFraction = 0.6;
                } else if( age < 65 ) {
                    if( gender === 'F' ) {
                        waterFraction = 0.5;
                    } else {
                        waterFraction = 0.6;
                    }
                } else {
                    if( gender === 'F' ) {
                        waterFraction = 0.45;
                    } else {
                        waterFraction = 0.5;
                    }
                }

                totalBodyWater = waterFraction * weight;
                freeWaterDeficit = totalBodyWater * ( serumSodium / serumSodiumGoal - 1 );

                return freeWaterDeficit;
            }
        }
    } );
}() );