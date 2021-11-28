/**
 * @author Chris Rishel
 */
( function() {
    // Units for age (37 weeks = birth)
    mw.calculators.addUnits( {
        wk: {
            definition: '0.01923 year',
            offset: -37
        },
        mo: {
            definition: '1 month'
        },
        yr: {
            definition: '1 year',
            aliases: [ 'yo' ]
        }
    } );

    // Units for weight
    // Body weight needs to be treated as a different fundamental unit type from mass (otherwise it would cancel out
    // doing stoichiometry calculations.
    // Gram-weight, which uses short SI prefixes (e.g. 1 kgwt = 1000 gwt)
    mw.calculators.addUnitsBases( {
        weight: {
            toString: function( units ) {
                return units.replace( 'wt', '' );
            }
        }
    } );

    mw.calculators.addUnits( {
        gwt: {
            baseName: 'weight',
            prefixes: 'short'
        },
        lbwt: {
            baseName: 'weight',
            definition: '453.59237 gwt'
        }
    } );

    mw.calculators.addVariables( {
        age: {
            name: 'Age',
            type: 'number',
            minValue: '20 wk',
            maxValue: '125 yr',
            maxLength: 3,
            units: [
                'yr',
                'mo',
                'wk'
            ]
        },
        gender: {
            name: 'Gender',
            type: 'string',
            options: [
                '',
                'F',
                'M'
            ]
        },
        height: {
            name: 'Height',
            type: 'number',
            minValue: '20 cm',
            maxValue: '300 cm',
            maxLength: 3,
            units: [
                'cm',
                'm',
                'in',
                'ft'
            ]
        },
        weight: {
            name: 'Weight',
            type: 'number',
            minValue: '200 gwt',
            maxValue: '750 kgwt',
            maxLength: 3,
            units: [
                'kgwt',
                'lbwt',
                'gwt'
            ]
        }
    } );
}() );