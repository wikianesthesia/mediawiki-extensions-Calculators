/**
 * @author Chris Rishel
 */
( function() {
    var COOKIE_EXPIRATION = 12 * 60 * 60;

    var TYPE_NUMBER = 'number';
    var TYPE_STRING = 'string';

    var VALID_TYPES = [
        TYPE_NUMBER,
        TYPE_STRING
    ];

    var DEFAULT_CALCULATION_CLASS = 'SimpleCalculation';

    // Polyfill to fetch unit's base. This may become unnecessary in a future version of math.js
    math.Unit.prototype.getBase = function() {
        for( var iBase in math.Unit.BASE_UNITS ) {
            if( this.equalBase( math.Unit.BASE_UNITS[ iBase ] ) ) {
                return iBase;
            }
        }

        return null;
    };


    mw.calculators = {
        calculations: {},
        objectClasses: {},
        options: {},
        units: {},
        unitsBases: {},
        variables: {},
        addCalculations: function( calculationData, className ) {
            className = className ? className : DEFAULT_CALCULATION_CLASS;

            var calculations = mw.calculators.createCalculatorObjects( className, calculationData );

            for( var calculationId in calculations ) {
                var calculation = calculations[ calculationId ];

                mw.calculators.calculations[ calculationId ] = calculation;

                mw.calculators.calculations[ calculationId ].setDependencies();

                mw.calculators.calculations[ calculationId ].update();
            }
        },
        addUnitsBases: function( unitsBaseData ) {
            var unitsBases = mw.calculators.createCalculatorObjects( 'UnitsBase', unitsBaseData );

            for( var unitsBaseId in unitsBases ) {
                mw.calculators.unitsBases[ unitsBaseId.toLowerCase() ] = unitsBases[ unitsBaseId ];
            }
        },
        addUnits: function( unitsData ) {
            var units = mw.calculators.createCalculatorObjects( 'Units', unitsData );

            for( var unitsId in units ) {
                if( mw.calculators.units.hasOwnProperty( unitsId ) ) {
                    continue;
                }

                var unitData = {
                    aliases: units[ unitsId ].aliases,
                    baseName: units[ unitsId ].baseName ? units[ unitsId ].baseName.toUpperCase() : units[ unitsId ].baseName,
                    definition: units[ unitsId ].definition,
                    prefixes: units[ unitsId ].prefixes,
                    offset: units[ unitsId ].offset
                };

                try {
                    math.createUnit( unitsId, unitData );
                } catch( e ) {
                    console.warn( e.message );
                }

                mw.calculators.units[ unitsId ] = units[ unitsId ];
            }
        },
        addVariables: function( variableData ) {
            var variables = mw.calculators.createCalculatorObjects( 'Variable', variableData );

            for( var variableId in variables ) {
                mw.calculators.variables[ variableId ] = variables[ variableId ];

                var cookieValue = mw.calculators.getCookieValue( variableId );

                if( cookieValue ) {
                    // Try to set the variable value from the cookie value
                    if( !mw.calculators.variables[ variableId ].setValue( cookieValue ) ) {
                        // Unset the cookie value since for whatever reason it's no longer valid.
                        mw.calculators.setCookieValue( variableId, null );
                    }
                }
            }
        },
        createCalculatorObjects: function( className, objectData ) {
            if( !mw.calculators.objectClasses.hasOwnProperty( className ) ) {
                throw new Error( 'Invalid class name "' + className + '"' );
            }

            var objects = {};

            for( var objectId in objectData ) {
                var propertyValues = objectData[ objectId ];

                // Id can either be specified using the 'id' property, or as the property name in objectData
                if( propertyValues.hasOwnProperty( 'id' ) ) {
                    objectId = propertyValues.id;
                }
                else {
                    propertyValues.id = objectId;
                }

                objects[ objectId ] = new mw.calculators.objectClasses[ className ]( propertyValues );
            }

            return objects;
        },
        createInputGroup: function( variableIds, global, maxInputsPerRow ) {
            var $form = $( '<form>', {
                novalidate: true
            } );

            var $formRow;

            var inputOptions = {
                global: !!global
            };

            maxInputsPerRow = maxInputsPerRow ?
                maxInputsPerRow :
                mw.calculators.getOptionValue( 'inputgroupmaxinputsperrow' );

            var inputCount = 0;

            for( var iVariableId in variableIds ) {
                var variableId = variableIds[ iVariableId ];

                if( !mw.calculators.variables.hasOwnProperty( variableId ) ) {
                    throw new Error( 'Invalid variable name "' + variableId + '"' );
                }

                if( inputCount % maxInputsPerRow === 0 ) {
                    if( $formRow ) {
                        $form.append( $formRow );
                    }

                    $formRow = $( '<div>', {
                        class: 'form-row calculator-inputGroup'
                    } );
                }

                $formRow.append( mw.calculators.variables[ variableId ].createInput( inputOptions ) );

                inputCount++;
            }

            return $form.append( $formRow );
        },
        getCookieKey: function( variableId ) {
            return 'calculators-var-' + variableId;
        },
        getCookieValue: function( varId ) {
            var cookieValue = mw.cookie.get( mw.calculators.getCookieKey( varId ) );

            if( !cookieValue ) {
                return null;
            }

            return cookieValue;
        },
        getCalculation: function( calculationId ) {
            if( mw.calculators.calculations.hasOwnProperty( calculationId ) ) {
                return mw.calculators.calculations[ calculationId ];
            } else {
                return null;
            }
        },
        getOptionValue: function( optionId ) {
            return mw.calculators.options.hasOwnProperty( optionId ) ?
                mw.calculators.options[ optionId ] :
                undefined;
        },
        getUnitsByBase: function( value ) {
            if( typeof value !== 'object' || !value.hasOwnProperty( 'units' ) ) {
                return null;
            }

            var unitsByBase = {};

            for( var iUnits in value.units ) {
                var units = value.units[ iUnits ];

                // Some units are of a given dimension, but have no conversion definition
                // (e.g. 'units' for mass, 'vial' for volume, etc.). These units are added
                // by appending '_abstract' to the baseName of the unit definition. However,
                // the calculator should treat them as the same type of unit
                var baseId = units.unit.base.key.toLowerCase().replace( /_\w+/, '' );

                unitsByBase[ baseId ] = units.prefix.name + units.unit.name;
            }

            return unitsByBase;
        },
        getUnitsString: function( value ) {
            if( typeof value !== 'object' ) {
                return null;
            }

            var unitsString = value.formatUnits();

            var reDenominator = /\/\s?\((.*)\)/;
            var denominatorMatches = unitsString.match( reDenominator );

            if( denominatorMatches ) {
                var denominatorUnits = denominatorMatches[ 1 ];

                unitsString = unitsString.replace( reDenominator, '/' + denominatorUnits.replace( ' ', '/' ) );
            }

            unitsString = unitsString
                .replace( /\s/g, '' )
                .replace( /(\^(\d+))/g, '<sup>$2</sup>' );

            var unitsBase = value.getBase();

            if( unitsBase ) {
                unitsBase = unitsBase.toLowerCase();

                if( mw.calculators.unitsBases.hasOwnProperty( unitsBase ) &&
                    typeof mw.calculators.unitsBases[ unitsBase ].toString === 'function' ) {
                    unitsString = mw.calculators.unitsBases[ unitsBase ].toString( unitsString );
                }
            } else {
                // TODO nasty hack to fix weight units in compound units which have no base
                unitsString = unitsString.replace( 'kgwt', 'kg' );
                unitsString = unitsString.replace( 'ug', 'mcg' );
            }

            return unitsString;
        },
        getValueDecimals: function( value ) {
            // Supports either numeric values or math objects
            if( mw.calculators.isValueMathObject( value ) ) {
                value = mw.calculators.getValueNumber( value );
            }

            if( typeof value !== 'number' ) {
                return null;
            }

            // Convert the number to a string, reverse, and count the number of characters up to the period.
            var decimals = value.toString().split('').reverse().join('').indexOf( '.' );

            // If no decimal is present, will be set to -1 by indexOf. If so, set to 0.
            decimals = decimals > 0 ? decimals : 0;

            return decimals;
        },
        getValueNumber: function( value, decimals ) {
            if( !mw.calculators.isValueMathObject( value ) ) {
                return null;
            }

            // Remove floating point errors
            var number = math.round( value.toNumber(), 10 );

            var absNumber = math.abs( number );

            if( absNumber >= 10 || absNumber === 0 ) {
                if( absNumber < 100 && absNumber !== math.round( absNumber ) && 2 * absNumber === math.round( 2 * absNumber ) ) {
                    // Special case to allow nearly-round decimals (e.g. 12.5)

                    decimals = 1;
                } else {
                    decimals = 0;
                }
            } else {
                decimals = -math.floor( math.log10( absNumber ) ) + 1;
            }

            return math.round( number, decimals );
        },
        getValueString: function( value, decimals ) {
            if( !mw.calculators.isValueMathObject( value ) ) {
                return null;
            }

            var valueNumber = mw.calculators.getValueNumber( value, decimals );
            var valueUnits = mw.calculators.getUnitsString( value );

            if( math.abs( math.log10( valueNumber ) ) > 3 ) {
                var valueUnitsByBase = mw.calculators.getUnitsByBase( value );

                var oldSIUnit;

                if( valueUnitsByBase.hasOwnProperty( 'mass' ) ) {
                    oldSIUnit = valueUnitsByBase.mass;
                } else if( valueUnitsByBase.hasOwnProperty( 'volume' ) ) {
                    oldSIUnit = valueUnitsByBase.volume;
                }

                if( oldSIUnit ) {
                    // This new value should simplify to the optimal SI prefix.
                    // We need to create a completely new unit from the formatted (i.e. simplified) value
                    var newSIValue = math.unit( math.unit( valueNumber + ' ' + oldSIUnit ).format() );

                    // There is a bug in mathjs where formatUnits() won't simplify the units, only format() will.
                    var newSIUnit = newSIValue.formatUnits();

                    if( newSIUnit !== oldSIUnit ) {
                        value = math.unit( newSIValue.toNumber() + ' ' + value.formatUnits().replace( oldSIUnit, newSIUnit ) );

                        valueNumber = mw.calculators.getValueNumber( value, decimals );
                        valueUnits = mw.calculators.getUnitsString( value );
                    }
                }
            }

            var valueString = String( valueNumber );

            if( valueUnits ) {
                valueString += ' ' + valueUnits;
            }

            var unitsId = value.formatUnits();

            if( mw.calculators.units.hasOwnProperty( unitsId ) &&
                typeof mw.calculators.units[ unitsId ].formatValue === 'function' ) {
                valueString = mw.calculators.units[ unitsId ].formatValue( valueString );
            }

            return valueString;
        },
        getVariable: function( variableId ) {
            if( mw.calculators.variables.hasOwnProperty( variableId ) ) {
                return mw.calculators.variables[ variableId ];
            } else {
                return null;
            }
        },
        hasData: function( dataType, dataId ) {
            if( mw.calculators.hasOwnProperty( dataType ) &&
                mw.calculators[ dataType ].hasOwnProperty( dataId ) ) {
                return true;
            } else {
                return false;
            }
        },
        initialize: function() {
            // Change the menu item from "article" to "calculator"
            $( '#nav-article svg' ).addClass( 'fa-calculator' );
            $( '#nav-article .nav-label' ).html( 'Calculator' );

            // Wrap description in a collapse
            var descriptionCount = 0;

            $( '.calculator-description' ).each( function() {
                var descriptionContainerId = 'calculator-description-info';

                if( descriptionCount ) {
                    descriptionContainerId += '-' + descriptionCount;
                }

                var $descriptionLinkIcon = $( '<i>', {
                    class: 'far fa-question-circle fa-fw'
                } );

                var descriptionLinkString = '';

                descriptionLinkString += $( this ).data( 'title' ) ? $( this ).data( 'title' ) : 'About this calculator';

                var $descriptionLinkLabel = $( '<span>', {
                    html: descriptionLinkString
                } );

                var $descriptionLink = $( '<a>', {
                    'data-toggle': 'collapse',
                    href: '#' + descriptionContainerId,
                    role: 'button',
                    'aria-expanded': 'false',
                    'aria-controls': descriptionContainerId
                } ).append( $descriptionLinkIcon, $descriptionLinkLabel );

                var $descriptionContainer = $( '<div>', {
                    id: descriptionContainerId,
                    class: 'collapse calculator-description-info',
                    html: $( this ).html()
                } );

                $( this ).empty();

                if( !descriptionCount ) {
                    $descriptionLink.addClass( 'dropdown-item' );
                    $descriptionLinkLabel.addClass( 'nav-label' );

                    $('#menuButton .dropdown-menu').prepend( $descriptionLink );
                } else {
                    $descriptionLink.addClass( 'btn btn-outline-primary btn-sm' );
                    $( this ).append( $descriptionLink );
                }

                $( this ).append( $descriptionContainer );

                descriptionCount++;
            } );

            // Set options
            mw.calculators.setDefaultOptions();

            var $optionsElement = $( '.calculator-options' );
            if( $optionsElement.length ) {
                $.each( $optionsElement.data(), function( optionId, value ) {
                    mw.calculators.setOptionValue( optionId, value );
                } );
            }

            mw.hook( 'calculators.initialized' ).fire();
        },
        isMobile: function() {
            return window.matchMedia( 'only screen and (max-width: 760px)' ).matches;
        },
        isValueMathObject: function( value ) {
            return value && value.hasOwnProperty( 'value' );
        },
        prepareReferences: function( references ) {
            for( var iReference in references ) {
                var reference = references[ iReference ];

                // http(s)
                reference = reference.replace(
                    /(https?:\/\/[^\s]*)/gmi,
                    '<a href="$1" target="_blank">$1</a>'
                );

                // doi
                reference = reference.replace(
                    /doi: ([\w\d\.\/-]+)((\.\s)|$)/gmi,
                    'doi: <a href="https://doi.org/$1" target="_blank">$1</a>$2'
                );

                // PMCID
                reference = reference.replace(
                    /PMCID: PMC(\d+)/gmi,
                    'PMCID: <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC$1/" target="_blank">PMC$1</a>'
                );

                // PMID
                reference = reference.replace(
                    /PMID: (\d+)/gmi,
                    'PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/$1" target="_blank">$1</a>'
                );

                references[ iReference ] = reference;
            }

            return references;
        },
        setCookieValue: function( variableId, value ) {
            mw.cookie.set( mw.calculators.getCookieKey( variableId ), value, {
                expires: COOKIE_EXPIRATION
            } );
        },
        setDefaultOptions: function() {
            mw.calculators.setOptionValue( 'inputgroupmaxinputsperrow', 3 );
        },
        setOptionValue: function( optionId, value ) {
            mw.calculators.options[ optionId ] = value;

            return true;
        },
        setValue: function( variableId, value ) {
            if( !mw.calculators.variables.hasOwnProperty( variableId ) ) {
                return false;
            }

            if( !mw.calculators.variables[ variableId ].setValue( value ) ) {
                return false;
            }

            mw.calculators.setCookieValue( variableId, value );

            return true;
        },
        uniqueValues: function( value, index, self ) {
            return self.indexOf( value ) === index;
        }
    };

    /**
     * Class CalculatorObject
     *
     * @param {Object} properties
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.CalculatorObject}
     * @constructor
     */
    mw.calculators.objectClasses.CalculatorObject = function( properties, propertyValues ) {
        propertyValues = propertyValues ? propertyValues : {};

        if( properties ) {
            if( properties.hasOwnProperty( 'required' ) ) {
                for( var iRequiredProperty in properties.required ) {
                    var requiredProperty = properties.required[ iRequiredProperty ];

                    if( !propertyValues || !propertyValues.hasOwnProperty( requiredProperty ) ) {
                        console.error( 'Missing required property "' + requiredProperty + '"' );
                        console.log( propertyValues );

                        return null;
                    }

                    this[ requiredProperty ] = propertyValues[ requiredProperty ];

                    delete propertyValues[ requiredProperty ];
                }
            }

            if( properties.hasOwnProperty( 'optional' ) ) {
                for( var iOptionalProperty in properties.optional ) {
                    var optionalProperty = properties.optional[ iOptionalProperty ];

                    if( propertyValues && propertyValues.hasOwnProperty( optionalProperty ) ) {
                        this[ optionalProperty ] = propertyValues[ optionalProperty ];

                        delete propertyValues[ optionalProperty ];
                    } else if( typeof this[ optionalProperty ] === 'undefined' ) {
                        this[ optionalProperty ] = null;
                    }
                }
            }

            var invalidProperties = Object.keys( propertyValues );

            if( invalidProperties.length ) {
                console.warn( 'Unsupported properties defined for ' + typeof this + ' with id "' + this.id + '": ' + invalidProperties.join( ', ' ) );
            }
        }
    };

    mw.calculators.objectClasses.CalculatorObject.prototype.getProperties = function() {
        return {
            required: [],
            optional: []
        };
    };

    mw.calculators.objectClasses.CalculatorObject.prototype.mergeProperties = function( inheritedProperties, properties ) {
        var uniqueValues = function( value, index, self ) {
            return self.indexOf( value ) === index;
        };

        properties.required = inheritedProperties.required.concat( properties.required ).filter( uniqueValues );
        properties.optional = inheritedProperties.optional.concat( properties.optional ).filter( uniqueValues );

        return properties;
    };




    /**
     * Class UnitsBase
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.UnitsBase}
     * @constructor
     */
    mw.calculators.objectClasses.UnitsBase = function( propertyValues ) {
        var properties = {
            required: [
                'id'
            ],
            optional: [
                'toString'
            ]
        };

        mw.calculators.objectClasses.CalculatorObject.call( this, properties, propertyValues );
    };

    mw.calculators.objectClasses.UnitsBase.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );




    /**
     * Class Units
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.Units}
     * @constructor
     */
    mw.calculators.objectClasses.Units = function( propertyValues ) {
        var properties = {
            required: [
                'id'
            ],
            optional: [
                'aliases',
                'baseName',
                'definition',
                'formatValue',
                'offset',
                'prefixes'
            ]
        };

        mw.calculators.objectClasses.CalculatorObject.call( this, properties, propertyValues );
    };

    mw.calculators.objectClasses.Units.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );




    /**
     * Class Variable
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.Variable}
     * @constructor
     */
    mw.calculators.objectClasses.Variable = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        if( VALID_TYPES.indexOf( this.type ) === -1 ) {
            throw new Error( 'Invalid type "' + this.type + '" for variable "' + this.id + '"' );
        }

        // Accept options as either an array of strings, or an object with ids as keys and display text as values
        if( Array.isArray( this.options ) ) {
            var options = {};

            for( var iOption in this.options ) {
                var option = this.options[ iOption ];

                options[ option ] = option;
            }

            this.options = options;
        }

        this.calculations = [];

        if( this.defaultValue ) {
            this.defaultValue = this.prepareValue( this.defaultValue );
        }

        if( this.minValue ) {
            this.minValue = this.prepareValue( this.minValue );
        }

        if( this.maxValue ) {
            this.maxValue = this.prepareValue( this.maxValue );
        }

        this.message = null;
        this.valid = true;

        this.isValueSet = false;
        this.value = null;
    };

    mw.calculators.objectClasses.Variable.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.Variable.prototype.addCalculation = function( calculationId ) {
        if( this.calculations.indexOf( calculationId ) !== -1 ) {
            return;
        }

        this.calculations.push( calculationId );
    };

    mw.calculators.objectClasses.Variable.prototype.createInput = function( inputOptions ) {
        if( !inputOptions ) {
            inputOptions = {};
        }

        inputOptions.class = inputOptions.hasOwnProperty( 'class' ) ? inputOptions.class : '';
        inputOptions.global = inputOptions.hasOwnProperty( 'class' ) ? inputOptions.global : false;
        inputOptions.hideLabel = inputOptions.hasOwnProperty( 'hideLabel' ) ? inputOptions.hideLabel : false;
        inputOptions.hideLabelMobile = inputOptions.hasOwnProperty( 'hideLabelMobile' ) ? inputOptions.hideLabelMobile : false;
        inputOptions.inline = inputOptions.hasOwnProperty( 'inline' ) ? inputOptions.inline : false;
        inputOptions.inputClass = inputOptions.hasOwnProperty( 'inputClass' ) ? inputOptions.inputClass : '';

        var variableId = this.id;
        var inputId = 'calculator-input-' + variableId;

        // If not creating a global input, assign an iterated id
        if( !inputOptions.global ) {
            var inputIdCount = 0;

            while( $( '#' + inputId + '-' + inputIdCount ).length ) {
                inputIdCount++;
            }

            inputId += '-' + inputIdCount;
        }

        var inputContainerTag = inputOptions.inline ? '<span>' : '<div>';

        var inputContainerAttributes = {
            class: 'form-group mb-0 calculator-container-input'
        };

        inputContainerAttributes.class += inputOptions.class ? ' ' + inputOptions.class : '';
        inputContainerAttributes.class += ' calculator-container-input-' + variableId;

        var inputContainerCss = {};

        // Initialize label attributes
        var labelAttributes = {
            for: inputId,
            html: this.getLabelString()
        };

        if( inputOptions.hideLabel || ( inputOptions.hideLabelMobile && mw.calculators.isMobile() ) ) {
            labelAttributes.class = 'sr-only';
        }

        var labelCss = {};

        if( inputOptions.inline ) {
            inputContainerTag = '<span>';

            inputContainerCss[ 'align-items' ] = 'center';
            inputContainerCss[ 'display' ] = 'flex';
            //inputContainerCss[ 'height' ] = 'calc(1.5em + 0.75rem + 2px)';

            labelAttributes.html += ':&nbsp;';
            labelCss[ 'margin-bottom' ] = 0;
        }

        // Create the input container
        var $inputContainer = $( inputContainerTag, inputContainerAttributes ).css( inputContainerCss );

        var $label = $( '<label>', labelAttributes ).css( labelCss );

        $inputContainer.append( $label );

        // 'this' will be redefined for event handlers
        var variable = this;
        var value = this.getValue();

        if( this.type === TYPE_NUMBER ) {
            // Initialize the primary units variables (needed for handlers, even if doesn't have units)
            var unitsId = null;
            var $unitsContainer = null;

            var inputValue = '';

            if( mw.calculators.isValueMathObject( value ) ) {
                var number = value.toNumber();

                if( number ) {
                    inputValue = number;
                }
            } else {
                inputValue = value;
            }

            // Initialize input options
            var inputAttributes = {
                id: inputId,
                class: 'form-control form-control-sm calculator-input calculator-input-text',
                type: 'text',
                autocomplete: 'off',
                inputmode: 'decimal',
                value: inputValue
            };

            // Configure additional options
            if( this.maxLength ) {
                inputAttributes.maxlength = this.maxLength;
            }

            // Add any additional classes to the input
            inputAttributes.class += inputOptions.inputClass ? ' ' + inputOptions.inputClass : '';

            // Add the input id to the list of classes
            inputAttributes.class += ' ' + inputId;

            // If the variable has units, create the units input
            if( this.hasUnits() ) {
                // Set the units id
                unitsId = inputId + '-units';

                var unitsValue = mw.calculators.isValueMathObject( value ) ? value.formatUnits() : null;

                var unitsInputAttributes = {
                    id: unitsId
                };

                // Create the units container
                $unitsContainer = $( '<div>', {
                    class: 'input-group-append'
                } ).css( 'align-items', 'center' );

                if( this.units.length === 1 ) {
                    unitsInputAttributes.type = 'hidden';
                    unitsInputAttributes.value = this.units[ 0 ];

                    $unitsContainer
                        .css( 'padding', '0 0.5em' )
                        .append( mw.calculators.getUnitsString( math.unit( '0 ' + this.units[ 0 ] ) ) )
                        .append( $( '<input>', unitsInputAttributes ) );
                } else {
                    // Initialize the units input options
                    unitsInputAttributes.class = 'custom-select custom-select-sm calculator-input-select';

                    // Add any additional classes to the input
                    unitsInputAttributes.class += inputOptions.inputClass ? ' ' + inputOptions.inputClass : '';

                    unitsInputAttributes.class = unitsInputAttributes.class + ' ' + unitsId;

                    var $unitsInput = $( '<select>', unitsInputAttributes )
                        .on( 'change', function() {
                            var numberValue = $( '#' + inputId ).val();

                            var newValue = numberValue ? numberValue + ' ' + $( this ).val() : null;

                            if( !mw.calculators.setValue( variableId, newValue ) ) {
                                if( variable.message ) {
                                    $( this ).parent().parent().parent().find( '.invalid-feedback' ).html( variable.message );
                                }

                                $( this ).parent().parent().addClass( 'is-invalid' );
                            } else {
                                $( this ).parent().parent().removeClass( 'is-invalid' );
                            }
                        } );

                    for( var iUnits in this.units ) {
                        var units = this.units[ iUnits ];

                        var unitsOptionAttributes = {
                            html: mw.calculators.getUnitsString( math.unit( '0 ' + units ) ),
                            value: units
                        };

                        if( units === unitsValue ) {
                            unitsOptionAttributes.selected = true;
                        }

                        $unitsInput.append( $( '<option>', unitsOptionAttributes ) );
                    }

                    $unitsContainer.append( $unitsInput );
                }
            }

            // Create the input and add handlers
            var $input = $( '<input>', inputAttributes )
                .on( 'input', function() {
                    var numberValue = $( this ).val();

                    var newValue = numberValue ? numberValue : null;

                    if( newValue && unitsId ) {
                        newValue = newValue + ' ' + $( '#' + unitsId ).val();
                    }

                    if( !mw.calculators.setValue( variableId, newValue ) ) {
                        if( variable.message ) {
                            $( this ).parent().parent().find( '.invalid-feedback' ).html( variable.message );
                        }

                        $( this ).parent().addClass( 'is-invalid' );
                    } else {
                        $( this ).parent().removeClass( 'is-invalid' );
                    }
                } );

            // Create the input group
            var $inputGroup = $( '<div>', {
                class: 'input-group'
            } ).append( $input );

            if( $unitsContainer ) {
                $inputGroup.append( $unitsContainer );
            }

            $inputContainer.append( $inputGroup );
        } else if( this.type === TYPE_STRING ) {
            if( this.hasOptions() ) {
                var optionKeys = Object.keys( this.options );

                if( optionKeys.length === 1 ) {
                    $inputContainer.append( this.options[ optionKeys[ 0 ] ] );
                } else {
                    var selectAttributes = {
                        id: inputId,
                        class: 'custom-select custom-select-sm calculator-input calculator-input-select'
                    };

                    // Add any additional classes to the input
                    selectAttributes.class += inputOptions.inputClass ? ' ' + inputOptions.inputClass : '';

                    var $select = $( '<select>', selectAttributes )
                        .on( 'change', function() {
                            if( !mw.calculators.setValue( variableId, $( this ).val() ) ) {
                                if( variable.message ) {
                                    $( this ).parent().parent().find( '.invalid-feedback' ).html( variable.message );
                                }

                                $( this ).parent().addClass( 'is-invalid' );
                            } else {
                                $( this ).parent().removeClass( 'is-invalid' );
                            }

                        } );

                    for( var optionId in this.options ) {
                        var displayText = this.options[ optionId ];

                        var optionAttributes = {
                            value: optionId,
                            text: displayText
                        };

                        if( optionId == value ) {
                            optionAttributes.selected = true;
                        }

                        $select.append( $( '<option>', optionAttributes ) );
                    }

                    $inputContainer.append( $select );
                }
            }
        }

        if( $inputContainer.length ) {
            $inputContainer.append( $( '<div>', {
                class: 'invalid-feedback'
            } ) );
        }

        return $inputContainer;
    };

    mw.calculators.objectClasses.Variable.prototype.getLabelString = function() {
        return mw.calculators.isMobile() && this.abbreviation ? this.abbreviation : this.name;
    };

    mw.calculators.objectClasses.Variable.prototype.getProperties = function() {
        return {
            required: [
                'id',
                'name',
                'type'
            ],
            optional: [
                'abbreviation',
                'defaultValue',
                'maxLength',
                'maxValue',
                'minValue',
                'options',
                'units'
            ]
        };
    };

    mw.calculators.objectClasses.Variable.prototype.getValue = function() {
        if( !this.valid ) {
            return null;
        } else if( this.value !== null ) {
            return this.value;
        } else if( !this.isValueSet && this.defaultValue !== null ) {
            return this.defaultValue;
        } else {
            return null;
        }
    };

    mw.calculators.objectClasses.Variable.prototype.getValueString = function() {
        return String( this.getValue() );
    };

    mw.calculators.objectClasses.Variable.prototype.hasOptions = function() {
        return this.options !== null;
    };

    mw.calculators.objectClasses.Variable.prototype.hasUnits = function() {
        return this.units !== null;
    };

    mw.calculators.objectClasses.Variable.prototype.hasValue = function() {
        var value = this.getValue();

        if( value === null ||
            ( mw.calculators.isValueMathObject( value ) && !value.toNumber() ) ) {
            return false;
        }

        return true;
    };

    mw.calculators.objectClasses.Variable.prototype.isValueMathObject = function() {
        return mw.calculators.isValueMathObject( this.value );
    };

    mw.calculators.objectClasses.Variable.prototype.prepareValue = function( value ) {
        if( value !== null ) {
            if( this.type === TYPE_NUMBER ) {
                if( !mw.calculators.isValueMathObject( value ) ) {
                    value = math.unit( value );
                }
            }
        }

        return value;
    };

    mw.calculators.objectClasses.Variable.prototype.setValue = function( value ) {
        // Set flag to prevent returning defaultValue in getValue()
        this.isValueSet = true;

        var validateResult = this.validateValue( value );

        this.valid = !!validateResult.valid;
        this.message = validateResult.message;

        if( !this.valid ) {
            this.value = null;
            this.valueUpdated();

            return false;
        }

        this.value = this.prepareValue( value );

        this.valueUpdated();

        return true;
    };

    mw.calculators.objectClasses.Variable.prototype.toString = function() {
        return this.getLabelString();
    };

    mw.calculators.objectClasses.Variable.prototype.validateValue = function( value ) {
        // Initialize valid flag to true. Will be set false if an error is found.
        result = {
            message: null,
            valid: true
        };

        // (At least for now) unsetting a variable is always valid
        if( value === null ) {
             return result;
        }

        // Some errors which are plausibly from normal user input we will show as feedback on the input (e.g.
        // a numeric value that is below the minimum value. Errors which are unlikely to be from user input
        // and instead relate to developer issues (e.g. incorrect units in select boxes), only show on the console.
        var consoleWarnPrefix = 'Could not set value "' + value + '" for "' + this.id + '":';

        if( this.type === TYPE_NUMBER ) {
            if( !mw.calculators.isValueMathObject( value ) ) {
                value = math.unit( value );
            }

            var valueUnits;

            if( this.hasUnits() ) {
                valueUnits = value.formatUnits().replace( /\s/g, '' );

                if( !valueUnits ) {
                    // Unlikely to be a user error, so don't set message.
                    result.valid = false;

                    console.warn( consoleWarnPrefix + 'Value must define units' );
                } else if( this.units.indexOf( valueUnits ) === -1 ) {
                    // Unlikely to be a user error, so don't set message.
                    result.valid = false;

                    console.warn( consoleWarnPrefix + 'Units "' + valueUnits + '" are not valid for this variable' );
                }
            }

            if( this.minValue && math.smaller( value, this.minValue ) ) {
                var minValueString = mw.calculators.getValueString( this.minValue );

                if( valueUnits && valueUnits != this.minValue.formatUnits() ) {
                    minValueString += ' (' + mw.calculators.getValueString( this.minValue.to( valueUnits ) ) + ')';
                }

                result.message = String( this ) + ' must be at least ' + minValueString;
                result.valid = false;
            } else if( this.maxValue && math.larger( value, this.maxValue ) ) {
                var maxValueString = mw.calculators.getValueString( this.maxValue );

                if( valueUnits && valueUnits != this.maxValue.formatUnits() ) {
                    maxValueString += ' (' + mw.calculators.getValueString( this.maxValue.to( valueUnits ) ) + ')';
                }

                result.message = String( this ) + ' must be less than ' + maxValueString;
                result.valid = false;
            }
        } else if( this.hasOptions() ) {
            if( !this.options.hasOwnProperty( value ) ) {
                // Unlikely to be a user error, so don't set message
                result.valid = false;

                console.warn( consoleWarnPrefix + 'Value must be one of: ' + Object.keys( this.options ).join( ', ' ) );
            }
        }

        return result;
    };

    mw.calculators.objectClasses.Variable.prototype.valueUpdated = function() {
        for( var iCalculation in this.calculations ) {
            var calculation = mw.calculators.getCalculation( this.calculations[ iCalculation ] );

            if( calculation ) {
                calculation.update();
            }
        }
    };



    /**
     * Class AbstractCalculation
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.AbstractCalculation}
     * @constructor
     */
    mw.calculators.objectClasses.AbstractCalculation = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        this.initialize();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.AbstractCalculation.prototype.addCalculation = function( calculationId ) {
        if( this.calculations.indexOf( calculationId ) !== -1 ) {
            return;
        }

        this.calculations.push( calculationId );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.doRender = function() {
        throw new Error( 'AbstractCalculation child class "' + this.getClassName() + '" must implement doRender()' );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getCalculationData = function() {
        return this.data;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getCalculationDataValues = function() {
        var calculationData = this.getCalculationData();

        var missingRequiredData = this.getMissingRequiredData();

        if( missingRequiredData.length ) {
            this.message = missingRequiredData.join( ', ' ) + ' required';

            return false;
        }

        var data = {};

        var calculationId, calculation, variableId, variable;

        var calculations = calculationData.calculations.required.concat( calculationData.calculations.optional );

        for( var iRequiredCalculation in calculations ) {
            calculationId = calculations[ iRequiredCalculation ];
            calculation = mw.calculators.getCalculation( calculationId );

            // We shouldn't use getValue() since that triggers recalculate() which would cause an infinite loop
            data[ calculationId ] = calculation.value;
        }

        var variables = calculationData.variables.required.concat( calculationData.variables.optional );

        for( var iRequiredVariable in variables ) {
            variableId = variables[ iRequiredVariable ];
            variable = mw.calculators.getVariable( variableId );

            data[ variableId ] = variable.getValue();
        }

        return data;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getClassName = function() {
        throw new Error( 'AbstractCalculation child class must implement getClassName()' );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getContainerClasses = function() {
        return this.getElementClasses();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getContainerId = function() {
        return this.getElementPrefix() + '-' + this.id;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getDescription = function() {
        return this.description;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getElementPrefix = function( useClassName ) {
        var elementPrefix = 'calculator-';

        elementPrefix += useClassName ? this.getClassName() : 'calculation';

        return elementPrefix;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getElementClasses = function( elementId ) {
        elementId = elementId ? '-' + elementId : '';

        return this.getElementPrefix() + elementId + ' ' +
            this.getElementPrefix( true ) + elementId + ' ' +
            this.getContainerId() + elementId;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getFormula = function() {
        return this.formula;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getInfo = function( infoCount ) {
        var infoHtml = '';

        var description = this.getDescription();

        if( description ) {
            infoHtml += $( '<p>', {
                html: description
            } )[ 0 ].outerHTML;
        }

        var formula = this.getFormula();

        if( formula ) {
            infoHtml += $( '<div>', {
                class: this.getElementClasses( 'formula' )
            } )[ 0 ].outerHTML;
        }

        var references = this.getReferences();

        if( references.length ) {
            var $references = $( '<ol>' );

            for( var iReference in references ) {
                $references.append( $( '<li>', {
                    html: references[ iReference ]
                } ) );
            }

            infoHtml += $( '<div>', {
                class: this.getElementClasses( 'references' )
            } ).append( $references )[ 0 ].outerHTML;
        }

        var infoContainerId = this.getContainerId() + '-info';

        if( infoCount ) {
            infoContainerId += '-' + infoCount;
        }

        $infoContainer = $( '<div>', {
            id: infoContainerId,
            class: 'collapse row no-gutters border-top ' + this.getElementClasses( 'info' )
        } ).append( infoHtml );

        return $infoContainer;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getInfoButton = function( infoCount ) {
        var infoContainerId = this.getContainerId() + '-info';

        if( infoCount ) {
            infoContainerId += '-' + infoCount;
        }

        return $( '<span>', {
            class: this.getElementClasses( 'infoButton' )
        } )
            .append( $( '<a>', {
                'data-toggle': 'collapse',
                href: '#' + infoContainerId,
                role: 'button',
                'aria-expanded': 'false',
                'aria-controls': infoContainerId
            } )
                .append( $( '<i>', {
                    class: 'far fa-question-circle'
                } ) ) );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getMissingRequiredData = function() {
        var calculationData = this.getCalculationData();

        var missingRequiredData = [];
        var calculation, variable;

        for( var iRequiredCalculation in calculationData.calculations.required ) {
            calculation = mw.calculators.getCalculation( calculationData.calculations.required[ iRequiredCalculation ] );

            if( !calculation.hasValue() ) {
                missingRequiredData = missingRequiredData.concat( calculation.getMissingRequiredData() );
            }
        }

        for( var iRequiredVariable in calculationData.variables.required ) {
            variable = mw.calculators.getVariable( calculationData.variables.required[ iRequiredVariable ] );

            if( !variable.hasValue() ) {
                missingRequiredData.push( String( variable ) );
            }
        }

        return missingRequiredData.filter( mw.calculators.uniqueValues );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getProperties = function() {
        return {
            required: [
                'id',
                'calculate'
            ],
            optional: [
                'data',
                'description',
                'formula',
                'onRender',
                'onRendered',
                'references',
                'searchData',
                'type'
            ]
        };
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getReferences = function() {
        return this.references;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getSearchString = function() {
        var searchString = this.id;

        searchString += this.searchData ? ' ' + this.searchData : '';

        return searchString.trim();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getTitleHtml = function() {
        return this.getTitleString();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getTitleString = function() {
        return this.id;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.getValue = function() {
        // For now, we always need to recalculate, since the calculation may not be rendered but still required by
        // other calculations (i.e. drug dosages using lean body weight).
        this.recalculate();

        return this.value;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.hasInfo = function() {
        return this.getDescription() || this.getFormula() || this.getReferences().length;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.hasValue = function() {
        if( this.value === null ||
            ( this.isValueMathObject() && !this.value.toNumber() ) ) {
            return false;
        }

        return true;
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.initialize = function() {
        if( typeof this.calculate !== 'function' ) {
            throw new Error( 'calculate() must be a function for Calculation "' + this.id + '"' );
        }

        // Initialize array to store calculation ids which depend on this calculation's value
        this.calculations = [];

        this.data = new mw.calculators.objectClasses.CalculationData( this.getCalculationData() );

        this.references = this.references ? mw.calculators.prepareReferences( this.references ) : [];

        this.type = this.type ? this.type : TYPE_NUMBER;

        this.message = null;
        this.value = null;

        // Remove any placeholder content explicitly set in the markup (used for SEO).
        $( '.' + this.getContainerId() ).empty();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.isValueMathObject = function() {
        return mw.calculators.isValueMathObject( this.value );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.parseFormula = function() {
        var formula = this.getFormula();

        if( !formula ) {
            return;
        }

        var api = new mw.Api();

        var containerId = this.getContainerId() + '-formula';

        api.parse( formula ).then( function( result ) {
            $( '.' + containerId ).html( result );
        } );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.recalculate = function() {
        this.message = '';
        this.value = null;

        var data = this.getCalculationDataValues();

        if( data === false ) {
            this.valueUpdated();

            return false;
        }

        try {
            var value = this.calculate( data );

            if( this.type === TYPE_NUMBER && !isNaN( value ) ) {
                if( this.units ) {
                    value = value + ' ' + this.units;
                }

                this.value = math.unit( value );
            } else {
                this.value = value;
            }
       } catch( e ) {
            console.warn( e.message );

            this.message = e.message;
            this.value = null;
        } finally {
            this.valueUpdated();
        }

        return true;
    };



    mw.calculators.objectClasses.AbstractCalculation.prototype.render = function() {
        // Need to run rendering in setTimeout to allow browser events to remain responsive
        var calculation = this;

        setTimeout( function() {
            if( typeof calculation.onRender === 'function' ) {
                calculation.onRender();
            }

            calculation.doRender();

            // Send API queries to parse LaTeX formulas
            calculation.parseFormula();

            mw.track( 'mw.calculators.CalculationRendered' );

            if( typeof calculation.onRendered === 'function' ) {
                calculation.onRendered();
            }
        }, 0 );
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.setDependencies = function() {
        this.data = this.getCalculationData();

        var calculationIds = this.data.calculations.required.concat( this.data.calculations.optional );

        for( var iCalculationId in calculationIds ) {
            var calculationId = calculationIds[ iCalculationId ];

            if( !mw.calculators.calculations.hasOwnProperty( calculationId ) ) {
                throw new Error('Calculation "' + calculationId + '" does not exist for calculation "' + this.id + '"');
            }

            mw.calculators.calculations[ calculationId ].addCalculation( this.id );
        }

        var variableIds = this.data.variables.required.concat( this.data.variables.optional );

        for( var iVariableId in variableIds ) {
            var variableId = variableIds[ iVariableId ];

            if( !mw.calculators.variables.hasOwnProperty( variableId ) ) {
                throw new Error('Variable "' + variableId + '" does not exist for calculation "' + this.id + '"');
            }

            mw.calculators.variables[ variableId ].addCalculation( this.id );
        }

        this.recalculate();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.toString = function() {
        return this.getTitleString();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.update = function() {
        this.recalculate();

        this.render();
    };

    mw.calculators.objectClasses.AbstractCalculation.prototype.valueUpdated = function() {
        for( var iCalculation in this.calculations ) {
            calculation = mw.calculators.getCalculation( this.calculations[ iCalculation ] );

            if( calculation ) {
                calculation.update();
            }
        }
    };



    /**
     * Class CalculationData
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.CalculationData}
     * @constructor
     */
    mw.calculators.objectClasses.CalculationData = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        var dataTypes = this.getDataTypes();
        var dataRequirements = this.getDataRequirements();

        // Iterate through the supported data types (e.g. calculation, variable) to initialize the structure
        for( var iDataType in dataTypes ) {
            var dataType = dataTypes[ iDataType ];

            if( !this[ dataType ] ) {
                this[ dataType ] = {
                    optional: [],
                    required: []
                };
            } else {
                // Iterate through the requirement levels (i.e. optional, required) to initialize the structure
                for( var iDataRequirement in dataRequirements ) {
                    var dataRequirement = dataRequirements[ iDataRequirement ];

                    // FYI can't check to see if the data actually exists here since it may not be defined yet
                    if( !this[ dataType ].hasOwnProperty( dataRequirement ) ) {
                        this[ dataType ][ dataRequirement ] = [];
                    }
                }
            }
        }
    };

    mw.calculators.objectClasses.CalculationData.prototype = Object.create( mw.calculators.objectClasses.CalculatorObject.prototype );

    mw.calculators.objectClasses.CalculationData.prototype.getDataRequirements = function() {
        return [
            'optional',
            'required'
        ];
    };

    mw.calculators.objectClasses.CalculationData.prototype.getDataTypes = function() {
        return [
            'calculations',
            'variables'
        ];
    };

    mw.calculators.objectClasses.CalculationData.prototype.getProperties = function() {
        return {
            required: [],
            optional: [
                'calculations',
                'variables'
            ]
        };
    };




    mw.calculators.objectClasses.CalculationData.prototype.merge = function() {
        var mergedData = new mw.calculators.objectClasses.CalculationData();

        var data = [ this ].concat( Array.prototype.slice.call( arguments ) );

        var dataTypes = this.getDataTypes();

        for( var iData in data ) {
            for( var iDataType in dataTypes ) {
                var dataType = dataTypes[ iDataType ];

                mergedData[ dataType ].required = mergedData[ dataType ].required
                    .concat( data[ iData ][ dataType ].required )
                    .filter( mw.calculators.uniqueValues );

                mergedData[ dataType ].optional = mergedData[ dataType ].optional
                    .concat( data[ iData ][ dataType ].optional )
                    .filter( mw.calculators.uniqueValues );
            }
        }

        return mergedData;
    };





    /**
     * Class SimpleCalculation
     * @param {Object} propertyValues
     * @returns {mw.calculators.objectClasses.SimpleCalculation}
     * @constructor
     */
    mw.calculators.objectClasses.SimpleCalculation = function( propertyValues ) {
        mw.calculators.objectClasses.CalculatorObject.call( this, this.getProperties(), propertyValues );

        this.initialize();
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype = Object.create( mw.calculators.objectClasses.AbstractCalculation.prototype );

    mw.calculators.objectClasses.SimpleCalculation.prototype.doRender = function() {
        var $calculationContainer = $( '.' + this.getContainerId() );

        if( !$calculationContainer.length ) {
            return;
        }

        // Add all required classes
        $calculationContainer.addClass( 'row no-gutters border ' + this.getContainerClasses() );

        // Add search phrases
        $calculationContainer.attr( 'data-search', this.getSearchString() );

        // Get a string version of the calculation's value
        var valueString = this.getValueString();

        // We will need to show variable inputs for non-global variable inputs.
        // Global inputs (i.e. those in the header) will claim the DOM id for that variable.
        // Non-global inputs (i.e. specific to a calculation) will only set a class but not the id,
        // and thus will get added to each calculation even if a duplicate.
        // E.g. 2 calculation might use the current hematocrit, but we should show them for both calculations since
        // it wouldn't be obvious the input that only showed the first time would apply to both calculations.
        var inputVariableIds = this.data.variables.required.concat( this.data.variables.optional );
        var missingVariableInputs = [];

        for( var iInputVariableId in inputVariableIds ) {
            var variableId = inputVariableIds[ iInputVariableId ];

            if( !$( '#calculator-input-' + variableId ).length ) {
                missingVariableInputs.push( variableId );
            }
        }

        // Out of 12, uses Bootstrap col- classes in a container
        var titleColumns = '7';
        var valueColumns = '5';

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
                'variables',
                'value',
                'info'
            ];

            var elements = {};

            for( var iElementType in elementTypes ) {
                var elementType = elementTypes[ iElementType ];

                elements[ elementType ] = {
                    $container: null,
                    id: calculation.getContainerId() + '-' + elementType
                };

                if( calculationCount ) {
                    elements[ elementType ].id += '-' + calculationCount;
                }
            }

            // Create title element and append to container
            elements.title.$container = $( '<div>', {
                id: elements.title.id
            } );

            elements.title.$container.append( calculation.getTitleHtml() );

            if( calculation.hasInfo() ) {
                elements.title.$container.append( calculation.getInfoButton( calculationCount ) );

                // Id of the info container should already be set by getInfo()
                elements.info.$container = calculation.getInfo();
            }

            // Create the value element
            elements.value.$container = $( '<div>' ).append( valueString );

            if( !missingVariableInputs.length ) {
                // If we have no variable inputs to show, we can put the title and value in one row of the table
                elements.title.$container.addClass( 'col-' + titleColumns + ' border-right' );

                // Add the id attribute to the value container
                elements.value.$container.attr( 'id', elements.value.id );

                elements.value.$container.addClass( 'col-' + valueColumns );
            } else {
                // If we need to show variable inputs, make the title span the full width of the container,
                // put the variable inputs on a new row, and show the result on a row below that.
                elements.title.$container.addClass( 'col-12 border-bottom' );
                elements.value.$container.addClass( 'col-12' );

                // Create a new row for the variable inputs
                elements.variables.$container = $( '<div>', {
                    class: 'row no-gutters border-bottom ' + calculation.getElementClasses( 'variables' ),
                    id: elements.variables.id
                } )
                    .append( $( '<div>', {
                        class: 'col-12'
                    } )
                        .append( mw.calculators.createInputGroup( missingVariableInputs ) ) );

                elements.value.$container = $( '<div>', {
                    class: 'row no-gutters',
                    id: elements.value.id
                } )
                    .append(
                        elements.value.$container
                );
            }

            // Add the title classes after the layout classes
            elements.title.$container.addClass( calculation.getElementClasses( 'title' ) );

            elements.value.$container.addClass( calculation.getElementClasses( 'value' ) );

            // Iterate over elementTypes since it is in order of rendering
            for( var iElementType in elementTypes ) {
                var elementType = elementTypes[ iElementType ];

                var $existingContainer = $( '#' + elements[ elementType ].id );

                if( $existingContainer.length ) {
                    // If an input within this container has focus (i.e. the user changed a variable input which
                    // triggered this rerender), don't rerender the element as this would destroy the focus on
                    // the input.
                    if( !$.contains( $existingContainer[ 0 ], $( ':focus' )[ 0 ] ) ) {
                        $existingContainer.replaceWith( elements[ elementType ].$container );
                    }
                } else {
                    $( this ).append( elements[ elementType ].$container );
                }
            }

            calculationCount++;
        } );
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getClassName = function() {
        return 'SimpleCalculation';
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getProperties = function() {
        var inheritedProperties = mw.calculators.objectClasses.AbstractCalculation.prototype.getProperties();

        return this.mergeProperties( inheritedProperties, {
            required: [
                'name'
            ],
            optional: [
                'abbreviation',
                'digits',
                'link',
                'units'
            ]
        } );
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getSearchString = function() {
        return ( this.id + ' ' + this.abbreviation + ' ' + this.name + ' ' + this.searchData ).trim();
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getTitleHtml = function() {
        var titleHtml = this.getTitleString();

        if( this.link ) {
            var href = this.link;

            // Detect internal links (this isn't great)
            var matches = href.match( /\[\[(.*?)\]\]/ );

            if( matches ) {
                href = mw.util.getUrl( matches[ 1 ] );
            }

            titleHtml = $( '<a>', {
                href: href,
                text: titleHtml
            } )[ 0 ].outerHTML;
        }

        return titleHtml;
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getTitleString = function() {
        return mw.calculators.isMobile() && this.abbreviation ? this.abbreviation : this.name;
    };

    mw.calculators.objectClasses.SimpleCalculation.prototype.getValueString = function() {
        if( this.message ) {
            return this.message;
        } else if( typeof this.value === 'object' && this.value.hasOwnProperty( 'value' ) ) {
            return mw.calculators.getValueString( this.value );
        } else {
            return String( this.value );
        }
    };

    mw.calculators.initialize();

}() );