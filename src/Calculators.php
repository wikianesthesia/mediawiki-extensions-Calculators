<?php

namespace Calculators;

use Parser;

class Calculators {
    public static function addCalculatorModules( Parser $parser, string $calculatorModules ) {
        $calculatorModuleIds = explode( ',', $calculatorModules );

        // TODO better validation on 'id' argument

        if( !in_array( 'ext.calculators.math.js', $parser->getOutput()->getModules() ) ) {
            $parser->getOutput()->addModules( [
                'ext.calculators.math.js',
                'ext.gadget.calculator-core'
            ] );
        }

        foreach( $calculatorModuleIds as $calculatorModuleId ) {
            $gadgetModule = 'ext.gadget.calculator-' . $calculatorModuleId;

            if( !in_array( $gadgetModule, $parser->getOutput()->getModules() ) ) {
                $parser->getOutput()->addModules( [
                    $gadgetModule
                ] );
            }
        }
    }

    public static function init() {
        return;
    }
}