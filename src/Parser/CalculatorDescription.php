<?php


namespace Calculators\Parser;

use Calculators\Calculators;
use Html;
use Parser;
use PPFrame;

class CalculatorDescription {
    public static $tag = 'calculatordescription';

    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        $tagAttributes = [
            'class' => 'calculator-description'
        ];

        foreach( $args as $arg => $value ) {
            $tagAttributes[ 'data-' . $arg ] = $value;
        }

        return Html::rawElement( 'div', $tagAttributes, $parser->recursiveTagParse( trim( $input ) ) );
    }
}