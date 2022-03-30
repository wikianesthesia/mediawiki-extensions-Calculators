<?php


namespace Calculators\Parser;

use Calculators\Calculators;
use Html;
use Parser;
use PPFrame;

class CalculatorOptions {
    public static $tag = 'calculatoroptions';

    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        Calculators::addCalculatorModules( $parser, 'core' );

        $tagAttribs = [
            'class' => 'calculator-options'
        ];

        foreach( $args as $optionId => $value ) {
            $tagAttribs[ 'data-' . $optionId ] = $value;
        }

        return Html::rawElement( 'div', $tagAttribs );
    }
}