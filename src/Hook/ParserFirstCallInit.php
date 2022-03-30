<?php
/**
 * This hook registers custom tags
 */
namespace Calculators\Hook;

use Parser;

class ParserFirstCallInit {
    public static function callback( Parser $parser ) {
        $parser->setHook( 'calculation', 'Calculators\\Parser\\Calculation::render' );
        $parser->setHook( 'calculationcategory', 'Calculators\\Parser\\CalculationCategory::render' );
        $parser->setHook( 'calculatordescription', 'Calculators\\Parser\\CalculatorDescription::render' );
        $parser->setHook( 'calculatormodule', 'Calculators\\Parser\\CalculatorModule::render' );
        $parser->setHook( 'calculatoroptions', 'Calculators\\Parser\\CalculatorOptions::render' );
        $parser->setHook( 'calculatorsearch', 'Calculators\\Parser\\CalculatorSearch::render' );
    }
}