<?php


namespace Calculators\Parser;

use Calculators\Calculators;
use Html;
use Parser;
use PPFrame;

class CalculatorSearch {
    public static $tag = 'calculatorsearch';

    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        Calculators::addCalculatorModules( $parser, 'search' );

        $tagAttributes = [
            'id' => 'calculator-search'
        ];

        foreach( $args as $arg => $value ) {
            $tagAttributes[ 'data-' . $arg ] = $value;
        }

        return Html::rawElement( 'div', $tagAttributes );
    }
}