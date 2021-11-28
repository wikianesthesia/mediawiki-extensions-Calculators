( function() {
    mw.calculators.addCalculations( {
        bladeMacSize: {
            name: 'Laryngoscope blade size (MAC)',
            abbreviation: 'Blade (MAC)',
            data: {
                variables: {
                    required: [ 'age' ]
                }
            },
            type: 'string',
            references: [
                'Smith\'s Anesthesia for Infants and Children. 8e. p356'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yo' );

                if( age >= 6 ) {
                    return '3';
                } else if( age >= 1 ) {
                    // ( age + 16 ) / 4
                    // To nicely display in increments of 0.5, double the calculation, round (floor), then divide by 2
                    return '2';
                } else {
                    return '-';
                }
            }
        },
        bladeMillerSize: {
            name: 'Laryngoscope blade size (Miller)',
            abbreviation: 'Blade (Miller)',
            data: {
                variables: {
                    required: [ 'age' ]
                }
            },
            type: 'string',
            references: [
                'Smith\'s Anesthesia for Infants and Children. 8e. p356'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yo' );

                if( age >= 2 ) {
                    return '2';
                } else if( age >= 1 / 12 ) {
                    return '1';
                } else if( age >= 0 ) {
                    return '0-1';
                } else {
                    return '0';
                }
            }
        },
        ettDepth: {
            name: 'Endotracheal tube (ETT) depth',
            abbreviation: 'ETT depth',
            data: {
                variables: {
                    required: [ 'age' ],
                    optional: [ 'height' ]
                }
            },
            type: 'string',
            references: [
                'Techanivate A, Kumwilaisak K, Samranrean S. Estimation of the proper length of orotracheal intubation by Chula formula. J Med Assoc Thai. 2005 Dec;88(12):1838-46. PMID: 16518983.',
                'Smith\'s Anesthesia for Infants and Children. 8e. p356'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yo' );
                var height = data.height ? data.height.toNumber( 'cm' ) : null;

                var depth;

                if( age >= 12 ) {
                    if( height ) {
                        depth = math.round( 0.1 * height + 4 );
                    } else {
                        depth = '20+';
                    }
                } else if( age >= 2 ) {
                    // ( age / 2 ) + 12
                    depth = math.round( age / 2 + 12 );
                } else if( age >= 1 ) {
                    depth = 12;
                } else if( age >= 0.5 ) {
                    depth = 11;
                } else if( age >= 0 ) {
                    depth = 9;
                } else {
                    depth = '7-8';
                }

                return depth + ' cm from teeth';
            }
        },
        ettSize: {
            name: 'Endotracheal tube (ETT) size',
            abbreviation: 'ETT size',
            data: {
                variables: {
                    required: [ 'age' ]
                }
            },
            type: 'string',
            references: [
                'Smith\'s Anesthesia for Infants and Children. 8e. p356'
            ],
            calculate: function( data ) {
                var age = data.age.toNumber( 'yo' );
                var size;

                if( age >= 12 ) {
                    size = '6+';
                } else if( age >= 1 ) {
                    // ( age + 16 ) / 4
                    // To nicely display in increments of 0.5, double the calculation, round (floor), then divide by 2
                    size = String( Math.floor( 2 * ( ( age + 16 ) / 4 ) ) / 2 );
                } else if( age >= 0.5 ) {
                    size = '3.5-4';
                } else if( age >= 0 ) {
                    size = '3-3.5';
                } else {
                    size = '2.5-3';
                }

                return size + ' mm (ID)';
            }
        },
        lmaSize: {
            name: 'Laryngeal mask airway (LMA) size',
            abbreviation: 'LMA size',
            data: {
                variables: {
                    required: [ 'weight' ]
                }
            },
            type: 'string',
            references: [
                'Smith\'s Anesthesia for Infants and Children. 8e. p312'
            ],
            calculate: function( data ) {
                var weight = data.weight.toNumber( 'kgwt' );
                var size;

                if( weight > 100 ) {
                    size = '6';
                } else if( weight > 70 ) {
                    size = '5';
                } else if( weight > 50 ) {
                    size = '4';
                } else if( weight > 30 ) {
                    size = '3';
                } else if( weight > 20 ) {
                    size = '2.5';
                } else if( weight > 10 ) {
                    size = '2';
                } else if( weight > 5 ) {
                    size = '1.5';
                } else {
                    size = '1';
                }

                return size;
            }
        }
    } );
}() );