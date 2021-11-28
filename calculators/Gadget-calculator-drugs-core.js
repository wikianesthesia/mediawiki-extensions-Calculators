/**
 * @author Chris Rishel
 */
( function() {
    mw.calculators.addConstant( 'defaultDrugColor', 'default' );
    mw.calculators.addConstant( 'defaultDrugPopulation', 'general' );
    mw.calculators.addConstant( 'defaultDrugRoute', 'iv' );

    mw.calculators.isValueDependent = function( value, variableId ) {
        // This may need generalized to support other variables in the future
        if( variableId === 'weight' ) {
            return value && value.formatUnits().match( /\/[\s(]*?kg/ );
        } else {
            throw new Error( 'Dependence "' + variableId + '" not supported by isValueDependent' );
        }
    };

    /**
     * Define units
     */
    mw.calculators.addUnitsBases( {
        concentration: {
            toString: function( units ) {
                units = units.replace( 'pct', '%' );
                units = units.replace( 'ug', 'mcg' );

                return units;
            }
        },
        mass: {
            toString: function( units ) {
                units = units.replace( 'ug', 'mcg' );

                return units;
            }
        }
    } );

    mw.calculators.addUnits( {
        Eq: {
            baseName: 'mass_eq',
            prefixes: 'short'
        },
        mcg: {
            baseName: 'mass',
            definition: '1 ug'
        },
        patch: {
            baseName: 'volume_patch'
        },
        pct: {
            baseName: 'concentration',
            definition: '10 mg/mL',
            formatValue: function( value ) {
                var pctMatch = value.match( /([\d.]+)\s*?%/ );

                if( pctMatch ) {
                    var pctValue = pctMatch[ 1 ];

                    value = pctValue + '% (' + 10 * pctValue + ' mg/mL)';
                }

                return value;
            }
        },
        pill: {
            baseName: 'volume_pill'
        },
        spray: {
            baseName: 'volume_spray'
        },
        units: {
            baseName: 'mass_units',
            aliases: [
                'unit'
            ]
        },
        vial: {
            baseName: 'volume_vial'
        }
    } );



    /**
     * DrugColor
     */
    mw.calculators.drugColors = {};

    mw.calculators.addDrugColors = function( drugColorData ) {
        var drugColors = mw.calculators.createCalculatorObjects( 'DrugColor', drugColorData );

        for( var drugColorId in drugColors ) {
            mw.calculators.drugColors[ drugColorId ] = drugColors[ drugColorId ];
        }
    };

    mw.calculators.getDrugColor = function( drugColorId ) {
        if( mw.calculators.drugColors.hasOwnProperty( drugColorId ) ) {
            return mw.calculators.drugColors[ drugColorId ];
        } else {
            return null;
        }
    };

    /**
     * Class DrugColor
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugColor}
     * @constructor
     */
    mw.calculators.objectClasses.DrugColor = function( propertyValues ) {
        var properties = {
            required: [
                'id'
            ],
            optional: [
                'parentColor',
                'primaryColor',
                'highlightColor',
                'striped'
            ]
        };

        mw.calculators.objectClasses.CalculatorObject.call( this, properties, propertyValues );

        this.parentColor = this.parentColor || this.id === mw.calculators.getConstantValue( 'defaultDrugColor' ) ? this.parentColor : mw.calculators.getConstantValue( 'defaultDrugColor' );
    };

    mw.calculators.objectClasses.DrugColor.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugColor.prototype.getParentDrugColor = function() {
        if( !this.parentColor ) {
            return null;
        }

        var parentDrugColor = mw.calculators.getDrugColor( this.parentColor );

        if( !parentDrugColor ) {
            throw new Error( 'Parent drug color "' + this.parentColor + '" not found for drug color "' + this.id + '"' );
        }

        return parentDrugColor;
    };

    mw.calculators.objectClasses.DrugColor.prototype.getHighlightColor = function() {
        if( this.highlightColor ) {
            return this.highlightColor;
        } else if( this.parentColor ) {
            return this.getParentDrugColor().getHighlightColor();
        }
    };

    mw.calculators.objectClasses.DrugColor.prototype.getPrimaryColor = function() {
        if( this.primaryColor ) {
            return this.primaryColor;
        } else if( this.parentColor ) {
            return this.getParentDrugColor().getPrimaryColor();
        }
    };

    mw.calculators.objectClasses.DrugColor.prototype.isStriped = function() {
        if( this.striped !== null ) {
            return this.striped;
        } else if( this.parentColor ) {
            return this.getParentDrugColor().isStriped();
        }
    };





    /**
     * DrugPopulation
     */

    mw.calculators.drugPopulations = {};

    mw.calculators.addDrugPopulations = function( drugPopulationData ) {
        var drugPopulations = mw.calculators.createCalculatorObjects( 'DrugPopulation', drugPopulationData );

        for( var drugPopulationId in drugPopulations ) {
            mw.calculators.drugPopulations[ drugPopulationId ] = drugPopulations[ drugPopulationId ];
        }
    };

    mw.calculators.getDrugPopulation = function( drugPopulationId ) {
        if( mw.calculators.drugPopulations.hasOwnProperty( drugPopulationId ) ) {
            return mw.calculators.drugPopulations[ drugPopulationId ];
        } else {
            return null;
        }
    };



    /**
     * Class DrugPopulation
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugPopulation}
     * @constructor
     */
    mw.calculators.objectClasses.DrugPopulation = function( propertyValues ) {
        var properties = {
            required: [
                'id',
                'name'
            ],
            optional: [
                'abbreviation',
                'variables'
            ]
        };

        mw.calculators.objectClasses.CalculatorObject.call( this, properties, propertyValues );

        if( this.variables ) {
            for( var variableId in this.variables ) {
                if( !mw.calculators.getVariable( variableId ) ) {
                    throw new Error( 'DrugPopulation variable "' + variableId + '" not defined' );
                }

                this.variables[ variableId ].min = this.variables[ variableId ].hasOwnProperty( 'min' ) ?
                    math.unit( this.variables[ variableId ].min ) : null;

                this.variables[ variableId ].max = this.variables[ variableId ].hasOwnProperty( 'max' ) ?
                    math.unit( this.variables[ variableId ].max ) : null;
            }
        } else {
            this.variables = {};
        }
    };

    mw.calculators.objectClasses.DrugPopulation.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugPopulation.prototype.getCalculationData = function() {
        var inputData = new mw.calculators.objectClasses.CalculationData();

        for( var variableId in this.variables ) {
            inputData.variables.required.push( variableId );
        }

        return inputData;
    };

    mw.calculators.objectClasses.DrugPopulation.prototype.getCalculationDataScore = function( dataValues ) {
        // A return value of -1 indicates the data did not match the population definition

        for( var variableId in this.variables ) {
            if( !dataValues.hasOwnProperty( variableId ) ) {
                return -1;
            }

            if( this.variables[ variableId ].min &&
                ( !dataValues[ variableId ] ||
                    !math.largerEq( dataValues[ variableId ], this.variables[ variableId ].min ) ) ) {
                return -1;
            }

            if( this.variables[ variableId ].max &&
                ( !dataValues[ variableId ] ||
                    !math.smallerEq( dataValues[ variableId ], this.variables[ variableId ].max ) ) ) {
                return -1;
            }
        }

        // If the data matches the population definition, the score corresponds to the number of variables in the
        // population definition. This should roughly correspond to the specificity of the population.
        return Object.keys( this.variables ).length;
    };

    mw.calculators.objectClasses.DrugPopulation.prototype.toString = function() {
        return mw.calculators.isMobile() && this.abbreviation ? this.abbreviation : this.name;
    };



    /**
     * DrugRoute
     */
    mw.calculators.drugRoutes = {};

    mw.calculators.addDrugRoutes = function( drugRouteData ) {
        var drugRoutes = mw.calculators.createCalculatorObjects( 'DrugRoute', drugRouteData );

        for( var drugRouteId in drugRoutes ) {
            mw.calculators.drugRoutes[ drugRouteId ] = drugRoutes[ drugRouteId ];
        }
    };

    mw.calculators.getDrugRoute = function( drugRouteId ) {
        if( mw.calculators.drugRoutes.hasOwnProperty( drugRouteId ) ) {
            return mw.calculators.drugRoutes[ drugRouteId ];
        } else {
            return null;
        }
    };

    /**
     * Class DrugRoute
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugRoute}
     * @constructor
     */
    mw.calculators.objectClasses.DrugRoute = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        this.abbreviation = this.abbreviation ? this.abbreviation : this.name;
    };

    mw.calculators.objectClasses.DrugRoute.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugRoute.prototype.getProperties = function() {
        return {
            required: [
                'id',
                'name'
            ],
            optional: [
                'abbreviation',
                'default'
            ]
        };
    };

    mw.calculators.objectClasses.DrugRoute.prototype.toString = function() {
        return mw.calculators.isMobile() && this.abbreviation ? this.abbreviation : this.name;
    };







    /**
     * DrugIndication
     */
    mw.calculators.drugIndications = {};

    mw.calculators.addDrugIndications = function( drugIndicationData ) {
        var drugIndications = mw.calculators.createCalculatorObjects( 'DrugIndication', drugIndicationData );

        for( var drugIndicationId in drugIndications ) {
            mw.calculators.drugIndications[ drugIndicationId ] = drugIndications[ drugIndicationId ];
        }
    };

    mw.calculators.getDrugIndication = function( drugIndicationId ) {
        if( mw.calculators.drugIndications.hasOwnProperty( drugIndicationId ) ) {
            return mw.calculators.drugIndications[ drugIndicationId ];
        } else {
            return null;
        }
    };

    /**
     * Class DrugIndication
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugIndication}
     * @constructor
     */
    mw.calculators.objectClasses.DrugIndication = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );
    };

    mw.calculators.objectClasses.DrugIndication.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugIndication.prototype.getProperties = function() {
        return {
            required: [
                'id',
                'name'
            ],
            optional: [
                'abbreviation',
                'default',
                'searchData'
            ]
        };
    };

    mw.calculators.objectClasses.DrugIndication.prototype.getSearchString = function() {
        var searchString = this.name;

        searchString += this.abbreviation ? ' ' + this.abbreviation : '';
        searchString += this.searchData ? ' ' + this.searchData : '';

        return searchString.trim();
    };

    mw.calculators.objectClasses.DrugIndication.prototype.toString = function() {
        return mw.calculators.isMobile() && this.abbreviation ? this.abbreviation : this.name;
    };





    /**
     * Drug
     */
    mw.calculators.drugs = {};

    mw.calculators.addDrugs = function( drugData ) {
        var drugs = mw.calculators.createCalculatorObjects( 'Drug', drugData );

        for( var drugId in drugs ) {
            mw.calculators.drugs[ drugId ] = drugs[ drugId ];
        }
    };

    mw.calculators.addDrugDosages = function( drugId, drugDosageData ) {
        var drug = mw.calculators.getDrug( drugId );

        if( !drug ) {
            throw new Error( 'DrugDosage references drug "' + drugId + '" which is not defined' );
        }

        drug.addDosages( drugDosageData );
    };

    mw.calculators.getDrug = function( drugId ) {
        if( mw.calculators.drugs.hasOwnProperty( drugId ) ) {
            return mw.calculators.drugs[ drugId ];
        } else {
            return null;
        }
    };



    /**
     * Class Drug
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.Drug}
     * @constructor
     */
    mw.calculators.objectClasses.Drug = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        if( !this.color ) {
            this.color = mw.calculators.getConstantValue( 'defaultDrugColor' );
        }

        var color = mw.calculators.getDrugColor( this.color );

        if( !color ) {
            throw new Error( 'Invalid drug color "' + this.color + '" for drug "' + this.id + '"' );
        }

        this.color = color;

        if( this.preparations ) {
            var preparationData = this.preparations;

            this.preparations = [];

            this.addPreparations( preparationData );
        } else {
            this.preparations = [];
        }

        if( this.dosages ) {
            var dosageData = this.dosages;

            this.dosages = [];

            this.addDosages( dosageData );
        } else {
            this.dosages = [];
        }

        this.references = this.references ? mw.calculators.prepareReferences( this.references ) : [];
        this.tradeNames = this.tradeNames ? this.tradeNames : [];
    };

    mw.calculators.objectClasses.Drug.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.Drug.prototype.addDosages = function( dosageData ) {
        var dosages = mw.calculators.createCalculatorObjects( 'DrugDosage', dosageData );

        for( var dosageId in dosages ) {
            dosages[ dosageId ].id = this.dosages.length;

            this.dosages.push( dosages[ dosageId ] );
        }
    };

    mw.calculators.objectClasses.Drug.prototype.addPreparations = function( preparationData ) {
        var preparations = mw.calculators.createCalculatorObjects( 'DrugPreparation', preparationData );

        for( var preparationId in preparations ) {
            preparations[ preparationId ].id = this.preparations.length;

            this.preparations.push( preparations[ preparationId ] );
        }
    };

    mw.calculators.objectClasses.Drug.prototype.getIndications = function() {
        var indications = [];

        for( var iDosage in this.dosages ) {
            if( this.dosages[ iDosage ].indication ) {
                indications.push( this.dosages[ iDosage ].indication );
            }
        }

        return indications.filter( mw.calculators.uniqueValues );
    };

    mw.calculators.objectClasses.Drug.prototype.getPopulations = function( indicationId ) {
        var populations = [];

        for( var iDosage in this.dosages ) {
            if( this.dosages[ iDosage ].population &&
                ( !indicationId || ( this.dosages[ iDosage ].indication && this.dosages[ iDosage ].indication.id === indicationId ) ) ) {
                populations.push( this.dosages[ iDosage ].population );
            }
        }

        return populations.filter( mw.calculators.uniqueValues );
    };

    mw.calculators.objectClasses.Drug.prototype.getRoutes = function( indicationId ) {
        var routes = [];

        for( var iDosage in this.dosages ) {
            if( this.dosages[ iDosage ].routes.length &&
                ( !indicationId || ( this.dosages[ iDosage ].indication && this.dosages[ iDosage ].indication.id === indicationId ) ) ) {
                for( var iRoute in this.dosages[ iDosage ].routes ) {
                    routes.push( this.dosages[ iDosage ].routes[ iRoute ] );
                }
            }
        }

        return routes.filter( mw.calculators.uniqueValues );
    };

    mw.calculators.objectClasses.Drug.prototype.getPreparations = function( excludeDilutionRequired ) {
        var preparations = this.preparations.filter( mw.calculators.uniqueValues );

        if( excludeDilutionRequired ) {
            for( var iPreparation in preparations ) {
                if( preparations[ iPreparation ].dilutionRequired ) {
                    delete preparations[ iPreparation ];
                }
            }
        }

        return preparations;
    };

    mw.calculators.objectClasses.Drug.prototype.getProperties = function() {
        return {
            required: [
                'id',
                'name'
            ],
            optional: [
                'color',
                'description',
                'dosages',
                'formula',
                'preparations',
                'references',
                'searchData',
                'tradeNames'
            ]
        };
    };





    /**
     * DrugPreparation
     */
    mw.calculators.addDrugPreparations = function( drugId, drugPreparationData ) {
        var drug = mw.calculators.getDrug( drugId );

        if( !drug ) {
            throw new Error( 'DrugPreparation references drug "' + drugId + '" which is not defined' );
        }

        drug.addPreparations( drugPreparationData );
    };



    /**
     * Class DrugPreparation
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugPreparation}
     * @constructor
     */
    mw.calculators.objectClasses.DrugPreparation = function( propertyValues ) {
        var properties = {
            required: [
                'id',
                'concentration'
            ],
            optional: [
                'default',
                'dilutionRequired',
                'commonDilution'
            ]
        };

        mw.calculators.objectClasses.CalculatorObject.call( this, properties, propertyValues );


        this.concentration = this.concentration.replace( 'mcg', 'ug' );

        this.concentration = math.unit( this.concentration );
    };

    mw.calculators.objectClasses.DrugPreparation.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugPreparation.prototype.getVolumeUnits = function() {
        // The units of concentration will always be of the form "mass / volume"
        // The regular expression matches all text leading up to the volume units
        return mw.calculators.getUnitsByBase( this.concentration ).volume;
    };

    mw.calculators.objectClasses.DrugPreparation.prototype.toString = function() {
        return mw.calculators.getValueString( this.concentration );
    };





    /**
     * Class DrugDosage
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugDosage}
     * @constructor
     */
    mw.calculators.objectClasses.DrugDosage = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        var drugIndication = mw.calculators.getDrugIndication( this.indication );

        if( !drugIndication ) {
            throw new Error( 'Invalid indication "' + this.indication + '" for drug dosage' );
        }

        this.indication = drugIndication;

        this.population = this.population ? this.population : mw.calculators.getConstantValue( 'defaultDrugPopulation' );

        var drugPopulation = mw.calculators.getDrugPopulation( this.population );

        if( !drugPopulation ) {
            throw new Error( 'Invalid population "' + this.population + '" for drug dosage' );
        }

        this.population = drugPopulation;

        this.references = this.references ? mw.calculators.prepareReferences( this.references ) : [];

        this.routes = this.routes ? this.routes : [ mw.calculators.getConstantValue( 'defaultDrugRoute' ) ];

        if( !Array.isArray( this.routes ) ) {
            this.routes = [ this.routes ];
        }

        drugRoutes = [];

        for( var iRoute in this.routes ) {
            var drugRouteId = this.routes[ iRoute ];
            var drugRoute = mw.calculators.getDrugRoute( drugRouteId );

            if( !drugRoute ) {
                throw new Error( 'Invalid route "' + drugRouteId + '" for drug dosage' );
            }

            drugRoutes[ iRoute ] = drugRoute;
        }

        this.routes = drugRoutes;

        // Add the dose objects to the drug
        var drugDoseData = this.dose;
        this.dose = [];

        this.addDoses( drugDoseData );
    };

    mw.calculators.objectClasses.DrugDosage.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugDosage.prototype.addDoses = function( drugDoseData ) {
        if( !drugDoseData ) {
            return;
        } else if( !Array.isArray( drugDoseData ) ) {
            // Each dosage can have one or more associated doses. Ensure this value is an array.
            drugDoseData = [ drugDoseData ];
        }

        var doses = mw.calculators.createCalculatorObjects( 'DrugDose', drugDoseData );

        for( var doseId in doses ) {
            doses[ doseId ].id = this.dose.length;

            this.dose.push( doses[ doseId ] );
        }
    };

    mw.calculators.objectClasses.DrugDosage.prototype.getCalculationData = function() {
        var inputData = new mw.calculators.objectClasses.CalculationData();

        inputData = inputData.merge( this.population.getCalculationData() );

        for( var iDose in this.dose ) {
            inputData = inputData.merge( this.dose[ iDose ].getCalculationData() );
        }

        return inputData;
    };

    mw.calculators.objectClasses.DrugDosage.prototype.getProperties = function() {
        return {
            required: [
                'id'
            ],
            optional: [
                'description',
                'dose',
                'indication',
                'population',
                'routes',
                'references'
            ]
        };
    };

    mw.calculators.objectClasses.DrugDosage.prototype.getRouteString = function() {
        var routeString = '';

        for( var iRoute in this.routes ) {
            routeString += routeString ? '/' : '';
            routeString += this.routes[ iRoute ].abbreviation;
        }

        return routeString;
    };

    mw.calculators.objectClasses.DrugDosage.prototype.hasInfo = function() {
        return this.description;
    };





    /**
     * Class DrugDose
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugDose}
     * @constructor
     */
    mw.calculators.objectClasses.DrugDose = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        if( this.weightCalculation ) {
            var weightCalculationIds = this.weightCalculation;

            // weightCalculation property will contain references to the actual objects, so reinitialize
            this.weightCalculation = [];

            if( !Array.isArray( weightCalculationIds ) ) {
                weightCalculationIds = [ weightCalculationIds ];
            }

            for( var iWeightCalculation in weightCalculationIds ) {
                var weightCalculationId = weightCalculationIds[ iWeightCalculation ];
                var weightCalculation = mw.calculators.getCalculation( weightCalculationId );

                if( !weightCalculation ) {
                    throw new Error( 'Drug dose references weight calculation "' + weightCalculationId + '" which is not defined' );
                }

                this.weightCalculation.push( weightCalculation );
            }
        } else {
            this.weightCalculation = [];
        }

        var mathProperties = this.getMathProperties();
        var isWeightDependent = false;

        for( var iMathProperty in mathProperties ) {
            var mathProperty = mathProperties[ iMathProperty ];

            if( this[ mathProperty ] ) {
                // TODO consider making a UnitsBase.weight.fromString()
                this[ mathProperty ] = this[ mathProperty ].replace( 'kg', 'kgwt' );
                this[ mathProperty ] = this[ mathProperty ].replace( 'mcg', 'ug' );

                this[ mathProperty ] = math.unit( this[ mathProperty ] );

                if( mw.calculators.isValueDependent( this[ mathProperty ], 'weight' ) ) {
                    isWeightDependent = true;
                }
            } else {
                this[ mathProperty ] = null;
            }
        }

        if( isWeightDependent ) {
            // Default is tbw
            this.weightCalculation.push( mw.calculators.getCalculation( 'tbw' ) );
        }
    };

    mw.calculators.objectClasses.DrugDose.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.DrugDose.prototype.getAdministration = function() {
        var administration = '';

        if( this.frequency ) {
            administration += administration ? ' ' : '';
            administration += this.frequency;
        }

        if( this.duration ) {
            administration += administration ? ' ' : '';
            administration += 'over ' + this.duration;
        }

        return administration;
    };

    mw.calculators.objectClasses.DrugDose.prototype.getCalculationData = function() {
        var calculationData = new mw.calculators.objectClasses.CalculationData();

        for( var iWeightCalculation in this.weightCalculation ) {
            calculationData.calculations.optional.push( this.weightCalculation[ iWeightCalculation ].id );
        }

        return calculationData;
    };

    mw.calculators.objectClasses.DrugDose.prototype.getMathProperties = function() {
        return [
            'dose',
            'min',
            'max',
            'absoluteMin',
            'absoluteMax'
        ];
    };

    mw.calculators.objectClasses.DrugDose.prototype.getProperties = function() {
        return {
            required: [
                'id'
            ],
            optional: [
                'absoluteMax',
                'absoluteMin',
                'dose',
                'duration',
                'frequency',
                'min',
                'max',
                'name',
                'text',
                'weightCalculation'
            ]
        };
    };

}() );
