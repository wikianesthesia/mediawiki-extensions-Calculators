/**
 * @author Chris Rishel
 */
( function() {
    mw.calculators.addCalculations( {
        ibw: {
            name: 'Ideal body weight',
            abbreviation: 'IBW',
            data: {
                variables: {
                    required: [ 'height', 'gender' ]
                }
            },
            units: 'kgwt',
            link: 'https://en.wikipedia.org/wiki/Human_body_weight#Ideal_body_weight',
            description: 'Ideal body weight may only be applied to persons 152 cm (60 inches) or taller',
            formula: '<math>\\mathrm{IBW} = \\begin{cases}45.5 + 2.3 * (\\mathrm{height_{in}} - 60) & \\text{if female} \\\\50 + 2.3 * (\\mathrm{height_{in}} - 60) & \\text{if male}\\end{cases}</math>',
            references: [
                'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650–655.'
            ],
            calculate: function( data ) {
                if( data.height.toNumber( 'cm' ) < 152 ) {
                    throw new Error( 'Ideal body weight may only be applied to persons 152 cm (60 inches) or taller' );
                }

                var baseWeight;

                if( data.gender === 'F' ) {
                    baseWeight = 45.5;
                } else if( data.gender === 'M' ) {
                    baseWeight = 50;
                } else {
                    throw new Error( 'Invalid gender "' + data.gender + '"' );
                }

                // baseWeight + 2.3 kg for every inch over 5 feet
                return baseWeight + 2.3 * ( data.height.toNumber( 'in' ) - 60 );
            }
        },
        lbw: {
            name: 'Lean body weight',
            abbreviation: 'LBW',
            data: {
                variables: {
                    required: [ 'weight', 'height', 'gender' ]
                }
            },
            units: 'kgwt',
            link: 'https://en.wikipedia.org/wiki/Lean_body_mass',
            formula: '<math>\\mathrm{LBW} = \\begin{cases} \\frac{9270 * \\mathrm{weight_{kg}}}{8780+(244*\\mathrm{BMI})} & \\text{if female} \\\\\\\\ \\frac{9270 * \\mathrm{weight_{kg}}}{6680+(216*\\mathrm{BMI})} & \\text{if male} \\end{cases}</math>',
            references: [
                'Janmahasatian S, Duffull SB, Ash S, Ward LC, Byrne NM, Green B. Quantification of lean bodyweight. Clin Pharmacokinet. 2005; 44(10): 1051-65.'
            ],
            calculate: function( data ) {
                if( data.gender === 'F' ) {
                    return 9270 * data.weight.toNumber( 'kgwt' ) / ( 8780 + 244 * data.weight.toNumber( 'kgwt' ) / Math.pow( data.height.toNumber( 'm' ), 2 ) );
                } else if( data.gender === 'M' ) {
                    return 9270 * data.weight.toNumber( 'kgwt' ) / ( 6680 + 216 * data.weight.toNumber( 'kgwt' ) / Math.pow( data.height.toNumber( 'm' ), 2 ) );
                } else {
                    throw new Error( 'Invalid gender "' + data.gender + '"' );
                }
            }
        },
        tbw: {
            name: 'Total body weight',
            abbreviation: 'TBW',
            data: {
                variables: {
                    required: [ 'weight' ]
                }
            },
            units: 'kgwt',
            calculate: function( data ) {
                return data.weight.toNumber( 'kgwt' );
            }
        }
    } );
}() );