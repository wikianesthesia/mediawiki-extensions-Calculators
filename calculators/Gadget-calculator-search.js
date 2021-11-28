/**
 * @author Chris Rishel
 */
( function() {
    mw.calculators.initializeSearch = function() {
        var $searchContainer = $( '#calculator-search' );

        if( !$searchContainer.length ) {
            return;
        }

        var searchHeading = $searchContainer.data( 'title' ) ? ' ' + $searchContainer.data( 'title' ) : 'Search';

        var $searchHeading = $( '<h4>' ).append( searchHeading );

        var searchPlaceholderText;

        if( $searchContainer.data( 'search-placeholder' ) ){
            searchPlaceholderText = $searchContainer.data( 'search-placeholder' );
        } else {
            searchPlaceholderText = 'Search ';
            searchPlaceholderText += $searchContainer.data( 'title' ) ? $searchContainer.data( 'title' ) : 'calculations';
        }

        var searchInputAttributes = {
            id: 'calculator-search-input',
            class: 'form-control form-control-sm',
            type: 'text',
            placeholder: searchPlaceholderText,
            autocomplete: 'off'
        };

        var $searchInput = $( '<input>', searchInputAttributes )
            .on( 'input', function() {
                mw.calculators.searchCalculations( $( this ).val() );
            } )
            .on( 'keypress', function( e ) {
                if( event.keyCode === 13 ) {
                    e.preventDefault();
                    return false;
                }
            } );

        $searchContainer.append( $searchHeading );

        $searchContainer
            .append( $( '<form>' )
                .append(
                    $searchInput ) );

        $searchContainer.append( $( '<form>', {
            id: 'calculator-search-category-form'
        } ) );


        var categoryPlaceholderText;

        if( $searchContainer.data( 'category-placeholder' ) ){
            categoryPlaceholderText = $searchContainer.data( 'category-placeholder' );
        } else {
            categoryPlaceholderText = '(Show all categories)';
        }

        var categorySelectAttributes = {
            id: 'calculator-category-input',
            class: 'custom-select custom-select-sm'
        };

        var $categorySelectInput = $( '<select>', categorySelectAttributes )
            .on( 'change', function() {
                mw.calculators.selectCategory( $( this ).val() );
            } );


        $categorySelectInput.append( $( '<option>', {
            text: categoryPlaceholderText,
            value: ''
        } ) );

        $( '.calculator-calculationcategory' ).each( function() {
            $categorySelectInput.append( $( '<option>', {
                value: $( this ).data( 'id' ),
                html: $( this ).data( 'title' )
            } ) );
        } );

        $( '#calculator-search-category-form' )
            .replaceWith( $( '<form>', {
                id: 'calculator-search-category-form'
            } )
                .append(
                    $categorySelectInput ) );
    };

    mw.calculators.searchCalculations = function( searchText ) {
        var $calculationCategories = $( '.calculator-calculationcategory' );

        var reSearch = new RegExp( searchText, 'im' );

        $calculationCategories.each( function() {
            // Get the calculations contained by the calculator
            var $calculations = $( this ).find( '.calculator-calculation' );

            // If no search text is defined or if the search text matches one of the search terms,
            // show the calculator and all calculations.
            var showCalculationCategory = !searchText || reSearch.test( $( this ).data( 'search' ) );

            if( showCalculationCategory ) {
                // If the entire calculator should be shown, show all calculations
                $calculations.each( function() {
                    $( this ).show();
                } );
            } else {
                // If we aren't certain we should show the entire calculator, see if the search matches
                // any of the contained calculations.
                $calculations.each( function() {
                    var showCalculation = !searchText || reSearch.test( $( this ).data( 'search' ) );

                    if( showCalculation ) {
                        $( this ).show();

                        // Make sure the calculator heading and structure gets shown
                        showCalculationCategory = true;
                    } else {
                        $( this ).hide();
                    }
                } );
            }

            // If either the calculator or any contained calculations matched, show the calculator container
            // (i.e. title and structure for the calculations)
            if( showCalculationCategory ) {
                $( this ).show();
            } else {
                $( this ).hide();
            }
        } );
    };

    mw.calculators.selectCategory = function( calculationCategoryId ) {
        $( '.calculator-calculationcategory' ).each( function() {
            if( !calculationCategoryId || $( this ).data( 'id' ) === calculationCategoryId ) {
                $( this ).show();
            } else {
                $( this ).hide();
            }
        } );
    };

    mw.calculators.initializeSearch();
}() );