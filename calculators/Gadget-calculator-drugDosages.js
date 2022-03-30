( function() {
    mw.calculators.getDrugDosageCalculationId = function( drugId ) {
        return 'drugDosages-' + drugId;
    };

    mw.calculators.initializeDrugDosages = function() {
        for( var drugId in mw.calculators.drugs ) {
            var drugDosageCalculationId = mw.calculators.getDrugDosageCalculationId( drugId );
            var drugDosageCalculation = mw.calculators.getCalculation( drugDosageCalculationId );

            if( !drugDosageCalculation ) {
                var calculationData = {};

                calculationData[ drugDosageCalculationId ] = {
                    calculate: mw.calculators.objectClasses.DrugDosageCalculation.prototype.calculate,
                    drug: drugId,
                    type: 'drug'
                };

                mw.calculators.addCalculations( calculationData, 'DrugDosageCalculation' );

                drugDosageCalculation = mw.calculators.getCalculation( drugDosageCalculationId );
            }

            drugDosageCalculation.setDependencies();
        }
    };

    /**
     * Class DrugDosageCalculation
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.DrugDosageCalculation}
     * @constructor
     */
    mw.calculators.objectClasses.DrugDosageCalculation = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        this.initialize();
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype = Object.create( mw.calculators.objectClasses.AbstractCalculation.prototype );

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.calculate = function( data ) {
        var value = {
            message: null,
            population: null,
            preparation: data.preparation,
            dose: []
        };

        this.activeDosageId = null;

        if( !data.drug.dosages.length ) {
            value.message = 'No dose data';

            return value;
        }

        // Determine which dosage to use
        var populationScores = [];

        for( var iDosage in data.drug.dosages ) {
            var drugDosage = data.drug.dosages[ iDosage ];

            // If the indication and route do not match, set the score to -1
            var populationScore = -1;

            // Make sure the indication matches
            if( drugDosage.indication.id === data.indication.id ) {
                for( var iRoute in drugDosage.routes ) {
                    // Make sure the route matches
                    if( drugDosage.routes[ iRoute ].id === data.route.id ) {
                        populationScore = drugDosage.population.getCalculationDataScore( data );

                        break;
                    }
                }
            }

            populationScores.push( populationScore );
        }

        var maxPopulationScore = Math.max.apply( null, populationScores );

        if( maxPopulationScore < 0 ) {
            value.message = 'No dose data for indication "' + String( data.indication ) + '" and route "' + String( data.route ) + '"';

            return value;
        }

        // If there is more than one dosage with the same score, take the first.
        // This allows the data editor to decide which is most important.
        this.activeDosageId = populationScores.indexOf( maxPopulationScore );

        var dosage = data.drug.dosages[ this.activeDosageId ];

        if( !dosage.dose.length && dosage.description ) {
            value.message = dosage.description;

            return value;
        }

        // A dosage may contain multiple doses (e.g. induction and maintenance)
        for( var iDose in dosage.dose ) {
            var dose = dosage.dose[ iDose ];

            var mathProperties = dose.getMathProperties();

            var weightCalculation = null;
            var weightValue = null;

            // data.weightCalculation should be in order of preference, so take the first non-null value
            for( var iWeightCalculation in dose.weightCalculation ) {
                if( dose.weightCalculation[ iWeightCalculation ].value !== null ) {
                    weightCalculation = dose.weightCalculation[ iWeightCalculation ];
                    weightValue = dose.weightCalculation[ iWeightCalculation ].value;

                    break;
                }
            }

            // Initialize value properties for dose
            value.dose[ iDose ] = {
                amountPerWeight: {},
                mass: {},
                volume: {},
                weightCalculation: weightCalculation ? weightCalculation : null
            };

            if( dose.text ) {
                // Only show raw text dose
                continue;
            }

            for( var iMathProperty in mathProperties ) {
                var mathProperty = mathProperties[ iMathProperty ];

                var doseValue = dose[ mathProperty ];

                if( doseValue ) {
                    var doseUnitsByBase = mw.calculators.getUnitsByBase( doseValue );

                    if( doseUnitsByBase.hasOwnProperty( 'weight' ) ) {
                        value.dose[ iDose ].amountPerWeight[ mathProperty ] = doseValue;

                        if( weightValue ) {
                            // Amount could be either a mass or volume
                            var amountBase = doseUnitsByBase.mass ? 'mass' :
                                doseUnitsByBase.volume ? 'volume' : null;

                            if( amountBase ) {
                                var amountUnits = doseUnitsByBase[ amountBase ];

                                if( doseUnitsByBase.hasOwnProperty( 'time' ) ) {
                                    amountUnits += '/' + doseUnitsByBase.time;
                                }

                                // For whatever reason math.format will simplify the units, but math.formatUnits will not
                                // as a hack, we recreate a new unit value with the correct formatting of the result
                                value.dose[ iDose ][ amountBase ][ mathProperty ] = math.unit( math.multiply( doseValue, weightValue ).format() ).to( amountUnits );
                            }
                        }
                    } else {
                        value.dose[ iDose ].mass[ mathProperty ] = doseValue;
                    }

                    if( data.preparation && value.dose[ iDose ].mass[ mathProperty ] ) {
                        var volumeUnits;

                        // Need a special case for pct
                        if( data.preparation.concentration.formatUnits() === 'pct' ) {
                            volumeUnits = 'mL';
                        } else {
                            var preparationUnitsByBase = mw.calculators.getUnitsByBase( data.preparation.concentration );

                            volumeUnits = preparationUnitsByBase.volume;
                        }

                        if( doseUnitsByBase.hasOwnProperty( 'time' ) ) {
                            volumeUnits += '/' + doseUnitsByBase.time;
                        }

                        // Same hack as above to get units to simplify correctly
                        value.dose[ iDose ].volume[ mathProperty ] = math.unit( math.multiply( value.dose[ iDose ].mass[ mathProperty ], math.divide( 1, data.preparation.concentration ) ).format() ).to( volumeUnits );
                    }
                }
            }

            if( value.dose[ iDose ].mass.hasOwnProperty( 'absoluteMin' ) ) {
                if( value.dose[ iDose ].mass.hasOwnProperty( 'max' ) && math.larger( value.dose[ iDose ].mass.absoluteMin, value.dose[ iDose ].mass.max ) ) {
                    // Both min and max are larger than the absolute max dose, so just convert to single dose.
                    value.dose[ iDose ].mass.dose = value.dose[ iDose ].mass.absoluteMin;

                    delete value.dose[ iDose ].mass.min;
                    delete value.dose[ iDose ].mass.max;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMin' ) ) {
                        value.dose[ iDose ].volume.dose = value.dose[ iDose ].volume.absoluteMin;

                        delete value.dose[ iDose ].volume.min;
                        delete value.dose[ iDose ].volume.max;
                    }
                } else if( value.dose[ iDose ].mass.hasOwnProperty( 'min' ) && math.larger( value.dose[ iDose ].mass.absoluteMin, value.dose[ iDose ].mass.min ) ) {
                    value.dose[ iDose ].mass.min = value.dose[ iDose ].mass.absoluteMin;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMin' ) ) {
                        value.dose[ iDose ].volume.min = value.dose[ iDose ].volume.absoluteMin;
                    }
                } else if( value.dose[ iDose ].mass.hasOwnProperty( 'dose' ) && math.larger( value.dose[ iDose ].mass.absoluteMin, value.dose[ iDose ].mass.dose ) ) {
                    value.dose[ iDose ].mass.dose = value.dose[ iDose ].mass.absoluteMin;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMin' ) ) {
                        value.dose[ iDose ].volume.dose = value.dose[ iDose ].volume.absoluteMin;
                    }
                }
            }

            if( value.dose[ iDose ].mass.hasOwnProperty( 'absoluteMax' ) ) {
                if( value.dose[ iDose ].mass.hasOwnProperty( 'min' ) && math.smaller( value.dose[ iDose ].mass.absoluteMax, value.dose[ iDose ].mass.min ) ) {
                    // Both min and max are larger than the absolute max dose, so just convert to single dose.
                    value.dose[ iDose ].mass.dose = value.dose[ iDose ].mass.absoluteMax;

                    delete value.dose[ iDose ].mass.min;
                    delete value.dose[ iDose ].mass.max;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMax' ) ) {
                        value.dose[ iDose ].volume.dose = value.dose[ iDose ].volume.absoluteMax;

                        delete value.dose[ iDose ].volume.min;
                        delete value.dose[ iDose ].volume.max;
                    }
                } else if( value.dose[ iDose ].mass.hasOwnProperty( 'max' ) && math.smaller( value.dose[ iDose ].mass.absoluteMax, value.dose[ iDose ].mass.max ) ) {
                    value.dose[ iDose ].mass.max = value.dose[ iDose ].mass.absoluteMax;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMax' ) ) {
                        value.dose[ iDose ].volume.max = value.dose[ iDose ].volume.absoluteMax;
                    }
                } else if( value.dose[ iDose ].mass.hasOwnProperty( 'dose' ) && math.smaller( value.dose[ iDose ].mass.absoluteMax, value.dose[ iDose ].mass.dose ) ) {
                    value.dose[ iDose ].mass.dose = value.dose[ iDose ].mass.absoluteMax;

                    if( value.dose[ iDose ].volume.hasOwnProperty( 'absoluteMax' ) ) {
                        value.dose[ iDose ].volume.dose = value.dose[ iDose ].volume.absoluteMax;
                    }
                }
            }
        }

        return value;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.doRender = function() {
        var $calculationContainer = $( '.' + this.getContainerId() );

        if( !$calculationContainer.length ) {
            return;
        }

        // Add all required classes
        $calculationContainer.addClass( 'border ' + this.getContainerClasses() );

        // Add search phrases
        $calculationContainer.attr( 'data-search', this.getSearchString() );

        // Store this object in a local variable since .each() will reassign this to the DOM object of each
        // calculation container.
        var calculation = this;
        var calculationCount = 0;

        // Eventually may implement different rendering, so we should regenerate
        // all elements with each iteration of the loop.
        // I.e. might show result in table and inline in 2 different places of article.
        $calculationContainer.each( function() {
            // Initalize the variables for all the elements of the calculation. These need to be in order of placement
            // in the calculation container
            var elementTypes = [
                'title',
                'dosage',
                'info'
            ];

            var elements = {};

            for( var iElementType in elementTypes ) {
                var elementType = elementTypes[ iElementType ];

                // If an input contained by $container has user input focus, $container will not rerender (would be
                // annoying behavior to the user). However, if it contains subelements which should try to rerender,
                // add those elements to the contains property.
                elements[ elementType ] = {
                    $container: null,
                    contains: [],
                    id: calculation.getContainerId() + '-' + elementType
                };

                if( calculationCount ) {
                    elements[ elementType ].id += '-' + calculationCount;
                }
            }

            // Create title element and append to container
            elements.title.$container = $( '<div>', {
                id: elements.title.id,
                class: 'col-12 border-bottom ' + calculation.getElementClasses( 'title' )
            } );

            elements.title.$container.append( calculation.getTitleHtml() );

            if( calculation.hasInfo() ) {
                // Id of the info container should already be set by getInfo()
                elements.info.$container = calculation.getInfo();
            }

            // Create the dosage element
            elements.dosage.$container = $( '<div>', {
                id: elements.dosage.id,
                class: 'row no-gutters ' + calculation.getElementClasses( 'dosage' )
            } );

            // Dose column
            var $dose = $( '<div>', {
                id: calculation.getContainerId() + '-dose',
                class: 'col-7 ' + calculation.getElementClasses( 'dose' )
            }  );

            var dash = '-';

            // The options column should only show the preparation if there is a calculated volume
            var hasVolume;

            if( !calculation.value ) {
                $dose.append( $( '<i>' ).append( 'Error calculating dose' ) );
            } else if( calculation.activeDosageId === null ) {
                if( calculation.value.message ) {
                    $dose.append( $( '<i>' ).append( calculation.value.message ) );
                }
            } else {
                var dosage = calculation.drug.dosages[ calculation.activeDosageId ];

                if( dosage.population && dosage.population.id !== mw.calculators.getOptionValue( 'defaultDrugPopulation' ) ) {
                    var $dosePopulation = $( '<div>', {
                        class: calculation.getElementClasses( 'dose-info' )
                    } );

                    $dosePopulation
                        .append( $( '<div>', {
                            class: calculation.getElementClasses( 'dose-info-population' )
                        } ).append( String( dosage.population ) + ' dosing' ) );

                    $dose.append( $dosePopulation );
                }

                var $doseData = $( '<div>', {
                    class: calculation.getElementClasses( 'dose-data' )
                } );

                // This will iterate through the calculated doses. iDose should exactly correspond to doses within dosage
                // to allow referencing other properties of the dose.
                for( var iDose in calculation.value.dose ) {
                    var dose = dosage.dose[ iDose ];
                    var doseValue = calculation.value.dose[ iDose ];

                    if( dose.name ) {
                        $doseData.append( dose.name + '<br />' );
                    }

                    if( dose.text ) {
                        // Only show text
                        $doseData.append( dose.text + '<br />' );

                        continue;
                    }

                    var $doseList = $( '<ul>' );

                    var administration = '';
                    var administrationDisplayed = false;

                    if( dosage.routes && !mw.calculators.isMobile() ) {
                        administration += dosage.getRouteString();
                    }

                    var doseAdministration = dose.getAdministration();

                    if( doseAdministration ) {
                        administration += administration ? ' ' : '';
                        administration += doseAdministration;
                    }

                    var amountPerWeightHtml = '';

                    if( doseValue.amountPerWeight.hasOwnProperty( 'dose' ) ) {
                        amountPerWeightHtml += mw.calculators.getValueString( doseValue.amountPerWeight.dose );
                    } else if( doseValue.amountPerWeight.hasOwnProperty( 'min' ) &&
                        doseValue.amountPerWeight.hasOwnProperty( 'max' ) ) {

                        // getValueString will simplify the value and may adjust the units
                        var amountPerWeightMinValue = math.unit( mw.calculators.getValueString( doseValue.amountPerWeight.min ) );
                        var amountPerWeightMaxValue = math.unit( mw.calculators.getValueString( doseValue.amountPerWeight.max ) );

                        if( amountPerWeightMinValue.formatUnits() !== amountPerWeightMaxValue.formatUnits() ) {
                            // If the units between min and max don't match, show both
                            amountPerWeightHtml += mw.calculators.getValueString( amountPerWeightMinValue );
                        } else {
                            amountPerWeightHtml += mw.calculators.getValueNumber( amountPerWeightMinValue );
                        }

                        amountPerWeightHtml += dash;
                        amountPerWeightHtml += mw.calculators.getValueString( amountPerWeightMaxValue );
                    }

                    if( amountPerWeightHtml ) {
                        if( administration && ! administrationDisplayed ) {
                            amountPerWeightHtml += ' ' + administration;
                            administrationDisplayed = true;
                        }

                        var amountPerWeightNotesHtml = '';

                        if( doseValue.mass.hasOwnProperty( 'absoluteMin' ) ) {
                            amountPerWeightNotesHtml += 'Min: ' + mw.calculators.getValueString( doseValue.mass.absoluteMin );
                        } else if( doseValue.mass.hasOwnProperty( 'absoluteMax' ) ) {
                            amountPerWeightNotesHtml += 'Max: ' + mw.calculators.getValueString( doseValue.mass.absoluteMax );
                        }

                        if( dose.weightCalculation && dose.weightCalculation[ 0 ].id !== 'tbw' ) {
                            if( amountPerWeightNotesHtml ) {
                                amountPerWeightNotesHtml += ', ';
                            }

                            amountPerWeightNotesHtml += dose.weightCalculation[ 0 ].getTitleString();
                        }

                        if( amountPerWeightNotesHtml ) {
                            amountPerWeightHtml += ' (' + amountPerWeightNotesHtml + ')';
                        }

                        amountPerWeightHtml = $( '<li>' ).append( amountPerWeightHtml );

                        $doseList.append( amountPerWeightHtml );
                    }

                    var weightCalculationInfo = '';
                    var weightCalculationInfoDisplayed = false;

                    if( doseValue.weightCalculation && dose.weightCalculation.length && doseValue.weightCalculation.id !== dose.weightCalculation[ 0 ].id ) {
                        var weightCalculationLabel = doseValue.weightCalculation.getTitleString();

                        var $weightCalculationInfoIcon = $( '<a>', {
                            tabindex: '0',
                            'data-container': 'body',
                            'data-html': 'true',
                            'data-placement': 'top',
                            'data-toggle': 'popover',
                            'data-trigger': 'focus',
                            'data-content': doseValue.weightCalculation.name +
                                ' is being used because data is missing for ' +
                                dose.weightCalculation[ 0 ].name + ': ' + dose.weightCalculation[ 0 ].message
                        } )
                            .append( $( '<i>', {
                                class: 'far fa-question-circle'
                            } ) );

                        weightCalculationInfo = '&nbsp; (' + weightCalculationLabel + '&nbsp;' + $weightCalculationInfoIcon[ 0 ].outerHTML + ')';
                    }

                    var massHtml = '';

                    if( doseValue.mass.hasOwnProperty( 'dose' ) ) {
                        massHtml += mw.calculators.getValueString( doseValue.mass.dose );
                    } else if( doseValue.mass.hasOwnProperty( 'min' ) &&
                        doseValue.mass.hasOwnProperty( 'max' ) ) {

                        // getValueString will simplify the value and may adjust the units
                        var massMinValue = math.unit( mw.calculators.getValueString( doseValue.mass.min ) );
                        var massMaxValue = math.unit( mw.calculators.getValueString( doseValue.mass.max ) );

                        if( massMinValue.formatUnits() !== massMaxValue.formatUnits() ) {
                            // If the units between min and max don't match, show both
                            massHtml += mw.calculators.getValueString( massMinValue );
                        } else {
                            massHtml += mw.calculators.getValueNumber( massMinValue );
                        }

                        massHtml += dash;
                        massHtml += mw.calculators.getValueString( massMaxValue );
                    }

                    if( massHtml ) {
                        if( administration && ! administrationDisplayed ) {
                            massHtml += ' ' + administration;
                            administrationDisplayed = true;
                        }

                        if( weightCalculationInfo && !weightCalculationInfoDisplayed ) {
                            massHtml += weightCalculationInfo;
                            weightCalculationInfoDisplayed = true;
                        }

                        massHtml = $( '<li>' ).append( massHtml );

                        $doseList.append( massHtml );
                    }

                    var volumeHtml = '';

                    if( doseValue.volume.hasOwnProperty( 'dose' ) ) {
                        volumeHtml += mw.calculators.getValueString( doseValue.volume.dose );
                    } else if( doseValue.volume.hasOwnProperty( 'min' ) &&
                        doseValue.volume.hasOwnProperty( 'max' ) ) {

                        // getValueString will simplify the value and may adjust the units
                        var volumeMinValue = math.unit( mw.calculators.getValueString( doseValue.volume.min ) );
                        var volumeMaxValue = math.unit( mw.calculators.getValueString( doseValue.volume.max ) );

                        if( volumeMinValue.formatUnits() !== volumeMaxValue.formatUnits() ) {
                            // If the units between min and max don't match, show both
                            volumeHtml += mw.calculators.getValueString( volumeMinValue );
                        } else {
                            volumeHtml += mw.calculators.getValueNumber( volumeMinValue );
                        }

                        volumeHtml += dash;
                        volumeHtml += mw.calculators.getValueString( doseValue.volume.max );
                    }

                    if( volumeHtml ) {
                        if( administration && ! administrationDisplayed ) {
                            volumeHtml += ' ' + administration;
                            administrationDisplayed = true;
                        }

                        if( weightCalculationInfo && !weightCalculationInfoDisplayed ) {
                            volumeHtml += weightCalculationInfo;
                            weightCalculationInfoDisplayed = true;
                        }

                        if( calculation.value.preparation && !mw.calculators.isMobile() ) {
                            volumeHtml += ' of ' + String( calculation.value.preparation );
                        }

                        volumeHtml = $( '<li>' ).append( volumeHtml );

                        $doseList.append( volumeHtml );

                        hasVolume = true;
                    }

                    $doseData.append( $doseList );
                }

                $dose.append( $doseData );

                if( calculation.hasInfo() ) {
                    $dose.append( calculation.getInfoButton( calculationCount ) );
                }
            }


            // Options column
            var $options = $( '<div>', {
                id: calculation.getContainerId() + '-options',
                class: 'col-5 ' + calculation.getElementClasses( 'options' )
            } );

            var optionsRowClass = 'row no-gutters align-items-center';

            if( !mw.calculators.isMobile() ) {
                optionsRowClass += ' mb-2';
            }

            if( mw.calculators.getOptionValue( 'patientinputinline' ) ) {
                // If patient input should be inline, add patient input group
                $options.append( mw.calculators.createInputGroup( [
                    'weight',
                    'height',
                    'age',
                    'gender'
                ], true, 4 ) );
            }

            var optionLabelClass = mw.calculators.isMobile() ? 'col-4' : 'col-3';
            var optionValueClass = mw.calculators.isMobile() ? 'col-8' : 'col-9';

            var indications = calculation.drug.getIndications();

            if( indications.length ) {
                var indicationVariable = mw.calculators.getVariable( calculation.getVariableIds().indication );

                $options
                    .append( $( '<div>', {
                        class: optionsRowClass
                    } )
                        .append(
                            $( '<div>', {
                                class: optionLabelClass,
                                html: indicationVariable.getLabelString() + '&nbsp;'
                            } ),
                            $( '<div>', {
                                class: optionValueClass
                            } )
                                .append( indicationVariable.createInput({
                                    class: 'calculator-container-input-DrugDosageCalculator-options',
                                    hideLabel: true,
                                    inline: true
                                } ) ) ) );
            }

            var routes = calculation.drug.getRoutes();

            if( routes.length ) {
                var routeVariable = mw.calculators.getVariable( calculation.getVariableIds().route );

                $options
                    .append( $( '<div>', {
                        class: optionsRowClass
                    } )
                        .append(
                            $( '<div>', {
                                class: optionLabelClass,
                                html: routeVariable.getLabelString() + '&nbsp;'
                            } ),
                            $( '<div>', {
                                class: optionValueClass
                            } )
                                .append( routeVariable.createInput({
                                    class: 'calculator-container-input-DrugDosageCalculator-options',
                                    hideLabel: true,
                                    inline: true
                                } ) ) ) );
            }

            // Don't show preparations if there isn't a dose with volume
            if( hasVolume ) {
                var preparations = calculation.drug.getPreparations();

                if( preparations.length ) {
                    var preparationVariable = mw.calculators.getVariable( calculation.getVariableIds().preparation );

                    $options
                        .append( $( '<div>', {
                            class: optionsRowClass
                        } )
                            .append(
                                $( '<div>', {
                                    class: optionLabelClass,
                                    html: preparationVariable.getLabelString() + '&nbsp;'
                                } ),
                                $( '<div>', {
                                    class: optionValueClass
                                } )
                                    .append( preparationVariable.createInput({
                                        class: 'calculator-container-input-DrugDosageCalculator-options',
                                        hideLabel: true,
                                        inline: true
                                    } ) ) ) );
                }
            }

            elements.dosage.$container.append( $dose, $options );

            // Add elements to the contains array
            elements.dosage.contains.push( $dose, $options );

            // Iterate over elementTypes since it is in order of rendering
            for( var iElementType in elementTypes ) {
                var elementType = elementTypes[ iElementType ];
                var element = elements[ elementType ];

                var $existingContainer = $( '#' + element.id );

                if( $existingContainer.length ) {
                    // If an input within this container has focus (i.e. the user changed a variable input which
                    // triggered this rerender), don't rerender the element as this would destroy the focus on
                    // the input.
                    if( !$.contains( $existingContainer[ 0 ], $( ':focus' )[ 0 ] ) ) {
                        $existingContainer.replaceWith( element.$container );
                    } else {
                        for( var containedElementId in element.contains ) {
                            var $containedElement = element.contains[ containedElementId ];

                            var $existingContainedContainer = $( '#' + $containedElement.attr( 'id' ) );

                            if( $existingContainedContainer.length ) {
                                if( !$.contains( $existingContainedContainer[ 0 ], $( ':focus' )[ 0 ] ) ) {
                                    $existingContainedContainer.replaceWith( $containedElement );
                                }
                            }
                        }
                    }
                } else {
                    $( this ).append( elements[ elementType ].$container );
                }
            }

            calculationCount++;
        } );

        // Activate popovers
        $( '[data-toggle="popover"]' ).popover();
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getCalculationData = function() {
        var inputData = new mw.calculators.objectClasses.CalculationData();

        // Add variables created by this calculation
        var variableIds = this.getVariableIds();

        for( var variableType in variableIds ) {
            inputData.variables.optional.push( variableIds[ variableType ] );
        }

        var dataTypes = inputData.getDataTypes();

        // Data is only actually required if it is required by every dosage for the drug.
        // Data marked as required by an individual dosage that does not appear in every
        // dosage will be converted to optional.
        var requiredInputData = new mw.calculators.objectClasses.CalculationData();

        // Need a way to tell the first iteration of the loop to initialize the required variables to a value that
        // is distinct from the empty array (populated across loop using array intersect, so could become [] and shouldn't
        // reinitialize).
        var initializeRequiredData = true;

        // Iterate through each dosage to determine variable dependency
        for( var iDosage in this.drug.dosages ) {
            var dosageInputData = this.drug.dosages[ iDosage ].getCalculationData();

            inputData = inputData.merge( dosageInputData );

            for( var iDataType in dataTypes ) {
                var dataType = dataTypes[ iDataType ];

                if( initializeRequiredData ) {
                    requiredInputData[ dataType ].required = inputData[ dataType ].required;
                } else {
                    // Data is only truly required if it is required by all dosage calculations, so use array intersection
                    requiredInputData[ dataType ].required = requiredInputData[ dataType ].required.filter( function( index ) {
                        return dosageInputData[ dataType ].required.indexOf( index ) !== -1;
                    } );
                }
            }

            initializeRequiredData = false;
        }

        for( var iDataType in dataTypes ) {
            var dataType = dataTypes[ iDataType ];

            // Move any data marked required in inputData to optional if it not actually required (i.e. doesn't appear
            // in requiredInputData).
            inputData[ dataType ].optional = inputData[ dataType ].optional.concat( inputData[ dataType ].required.filter( function( index ) {
                return requiredInputData[ dataType ].required.indexOf( index ) === -1;
            } ) ).filter( mw.calculators.uniqueValues );

            inputData[ dataType ].required = requiredInputData[ dataType ].required;
        }

        return inputData;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getCalculationDataValues = function() {
        var data = mw.calculators.objectClasses.AbstractCalculation.prototype.getCalculationDataValues.call( this );

        data.drug = this.drug;

        data.indication = data[ this.getVariablePrefix() + 'indication' ] !== null ?
            mw.calculators.getDrugIndication( mw.calculators.getVariable( this.getVariableIds().indication ).getValue() ) :
            null;

        delete data[ this.getVariablePrefix() + 'indication' ];

        data.preparation = data[ this.getVariablePrefix() + 'preparation' ] !== null ?
            this.drug.preparations[ mw.calculators.getVariable( this.getVariableIds().preparation ).getValue() ] :
            null;

        delete data[ this.getVariablePrefix() + 'preparation' ];

        data.route = data[ this.getVariablePrefix() + 'route' ] !== null ?
            mw.calculators.getDrugRoute( mw.calculators.getVariable( this.getVariableIds().route ).getValue() ) :
            null;

        delete data[ this.getVariablePrefix() + 'route' ];

        return data;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getClassName = function() {
        return 'DrugDosageCalculation';
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getDescription = function() {
        var description = '';

        if( this.activeDosageId !== null && this.drug.dosages[ this.activeDosageId ].description ) {
            description += description ? '<br/><br/>' : '';
            description += this.drug.dosages[ this.activeDosageId ].description;
        }

        description += this.drug.description ? this.drug.description : '';

        return description;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getFormula = function() {
        return this.drug.formula;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getInfoButton = function( infoCount ) {
        var infoContainerId = this.getContainerId() + '-info';

        if( infoCount ) {
            infoContainerId += '-' + infoCount;
        }

        var infoString = 'More information';

        infoString += !mw.calculators.isMobile() ? ' about this dose' : '';

        return $( '<div>', {
            class: this.getElementClasses( 'infoButton' )
        } )
            .append( $( '<a>', {
                class: 'btn btn-outline-primary btn-sm',
                'data-toggle': 'collapse',
                href: '#' + infoContainerId,
                role: 'button',
                'aria-expanded': 'false',
                'aria-controls': infoContainerId,
                html: infoString
            } ) );
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getProperties = function() {
        var inheritedProperties = mw.calculators.objectClasses.AbstractCalculation.prototype.getProperties();

        return this.mergeProperties( inheritedProperties, {
            required: [
                'drug'
            ],
            optional: []
        } );
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getReferences = function() {
        var references = this.drug.references;

        if( this.activeDosageId !== null && this.drug.dosages[ this.activeDosageId ].references.length ) {
            references = references
                .concat( this.drug.dosages[ this.activeDosageId ].references )
                .filter( mw.calculators.uniqueValues );
        }

        return references;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getSearchString = function() {
        var searchString = this.drug.name + ' ' + this.drug.color.id;

        searchString += this.drug.tradeNames.length ? ' ' + this.drug.tradeNames.join( ' ' ) : '';

        var indications = this.drug.getIndications();

        for( var iIndication in indications ) {
            var indication = indications[ iIndication ];

            searchString += ' ' + indication.getSearchString();
        }

        searchString += this.drug.searchData ? ' ' + this.drug.searchData : '';

        return searchString.trim();
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getTitleHtml = function() {
        var $title = $( '<a>', {
            class: this.getElementClasses( 'title-name' ),
            href: mw.util.getUrl( this.drug.name ),
            text: this.getTitleString()
        } ).css( 'background-color', '#fff' );

        var highlightColor = this.drug.color.getHighlightColor();

        if( highlightColor ) {
            var highlightContainerAttributes = {
                class: this.getElementClasses( 'title-highlight' )
            };

            var highlightContainerCss = {};

            highlightContainerCss[ 'background' ] = highlightColor;

            $title = $( '<span>', highlightContainerAttributes ).append( $title ).css( highlightContainerCss );
        }

        var primaryColor = this.drug.color.getPrimaryColor();

        if( primaryColor ) {
            var backgroundContainerAttributes = {
                class: this.getElementClasses( 'title-background' )
            };

            var backgroundContainerCss = {};

            if( this.drug.color.isStriped() ) {
                backgroundContainerCss[ 'background' ] = 'repeating-linear-gradient(135deg,rgba(0,0,0,0),rgba(0,0,0,0)10px,rgba(255,255,255,1)10px,rgba(255,255,255,1)20px),' + primaryColor;
            } else {
                backgroundContainerCss[ 'background'] = primaryColor;
            }

            $title = $( '<span>', backgroundContainerAttributes ).append( $title ).css( backgroundContainerCss );
        }

        return $title;
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getTitleString = function() {
        return this.drug ? this.drug.name : '';
    }

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getVariableIds = function() {
        return {
            indication: this.getVariablePrefix() + 'indication',
            preparation: this.getVariablePrefix() + 'preparation',
            route: this.getVariablePrefix() + 'route'
        };
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getVariableOptions = function( variableId ) {
        if( variableId === this.getVariablePrefix() + 'indication' ) {
            return this.drug.getIndications();
        } else if( variableId === this.getVariablePrefix() + 'preparation' ) {
            // Exclude preparations which require dilution
            return this.drug.getPreparations( true );
        } else if( variableId === this.getVariablePrefix() + 'route' ) {
            return this.drug.getRoutes();
        }
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.getVariablePrefix = function() {
        return this.drug.id + '-';
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.initialize = function() {
        if( typeof this.drug === 'string' ) {
            var drug = mw.calculators.getDrug( this.drug );

            if( !drug ) {
                throw new Error( 'DrugDosage references drug "' + this.drug + '" which is not defined' );
            }

            this.drug = drug;
        }

        this.activeDosageId = null;

        this.updateVariables();

        mw.calculators.objectClasses.AbstractCalculation.prototype.initialize.call( this );
    };

    mw.calculators.objectClasses.DrugDosageCalculation.prototype.updateVariables = function() {
        var variableIds = this.getVariableIds();

        for( var variableType in variableIds ) {
            var variableId = variableIds[ variableType ];
            var variableOptions = this.getVariableOptions( variableId );
            var variableOptionValues = {};
            var defaultOption = 0;

            for( var iVariableOption in variableOptions ) {
                var variableOption = variableOptions[ iVariableOption ];

                defaultOption = variableOption.default ? iVariableOption : defaultOption;

                variableOptionValues[ variableOption.id ] = String( variableOption );
            }

            var defaultValue = variableOptions.length ? variableOptions[ defaultOption ].id : null;

            var variable = mw.calculators.getVariable( variableId );

            if( !variable ) {
                var newVariable = {};

                // TODO put this somewhere else
                var abbreviation;

                if( variableType === 'indication' ) {
                    abbreviation = 'Use';
                } else if( variableType === 'route' ) {
                    abbreviation = 'Route';
                } else if( variableType === 'preparation' ) {
                    abbreviation = 'Prep';
                }

                newVariable[ variableId ] = {
                    name: variableType.charAt(0).toUpperCase() + variableType.slice(1),
                    abbreviation: abbreviation,
                    type: 'string',
                    defaultValue: defaultValue,
                    options: variableOptionValues
                };

                mw.calculators.addVariables( newVariable );
            } else {
                // Probably not ideal to reach into the variable to change these things directly
                // Perhaps add helper functions to variable class
                mw.calculators.variables[ variableId ].defaultValue = defaultValue;
                mw.calculators.variables[ variableId ].options = variableOptionValues;
            }
        }
    };

    mw.hook( 'calculators.initialized' ).add( mw.calculators.initializeDrugDosages );
}() );