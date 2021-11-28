/**
 * @author Chris Rishel
 */
( function() {
    var containerId = 'calculator-patients-patientInput';

    if( !$( '#' + containerId ).length ) {
        var $container = $( '<div>', {
            id: containerId
        } );

        $container.addClass( 'container border-bottom px-0 py-1' );

        $container.append( mw.calculators.createInputGroup( [
            'weight',
            'height',
            'age',
            'gender'
        ], true ) );

        $container.appendTo( $( '#contentHeader' ) );
    }
}() );