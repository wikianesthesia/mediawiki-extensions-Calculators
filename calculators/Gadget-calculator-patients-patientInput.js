/**
 * @author Chris Rishel
 */
( function() {
    mw.calculators.renderPatientInput = function() {
        if( mw.calculators.getOptionValue( 'patientinputinline' ) ) {
            return;
        }

        var containerId = 'calculator-patients-patientInput';

        if( !$( '#' + containerId ).length ) {
            var inputs = [
                'weight',
                'height',
                'age',
                'gender'
            ];

            var $container = $( '<div>', {
                id: containerId
            } );

            $container.addClass( 'container border-bottom px-0 py-1' );

            $container.append( mw.calculators.createInputGroup( inputs, true, inputs.length ) );

            $container.appendTo( $( '#contentHeader' ) );
        }
    };

    mw.hook( 'calculators.initialized' ).add( mw.calculators.renderPatientInput );
}() );