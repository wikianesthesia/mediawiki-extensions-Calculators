<?php


namespace Calculators\Parser;

use Calculators\Calculators;
use Html;
use Parser;
use PPFrame;

class Calculation {
    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        Calculators::addCalculatorModules( $parser, 'core' );

        $tagAttributes = [];

        foreach( $args as $arg => $value ) {
            if( $arg === 'id' ) {
                // The id argument should actually just apply a class, and not set an id
                $arg = 'class';
                $value = 'calculator-calculation calculator-calculation-' . $value;
            } else {
                if( $arg === 'module' ) {
                    Calculators::addCalculatorModules( $parser, $args[ $arg ] );
                }

                $arg = 'data-' . $arg;
            }

            $tagAttributes[ $arg ] = $value;
        }

        return Html::rawElement( 'div', $tagAttributes, trim( $parser->recursiveTagParse( $input ) ) );
    }
}