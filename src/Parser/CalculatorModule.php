<?php


namespace Calculators\Parser;

use Calculators\Calculators;
use Parser;
use PPFrame;

class CalculatorModule {
    public static $tag = 'calculatormodule';

    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        $requiredArgs = [
            'id'
        ];

        foreach( $requiredArgs as $requiredArg ) {
            if( !isset( $args[ $requiredArg ] ) ) {
                return wfMessage( 'calculators-parser-tag-missing-required-argument', static::$tag, $requiredArg )->text();
            }
        }

        Calculators::addCalculatorModules( $parser, $args[ 'id' ] );

        return '';
    }
}