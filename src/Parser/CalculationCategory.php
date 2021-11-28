<?php


namespace Calculators\Parser;

use Html;
use Parser;
use PPFrame;

class CalculationCategory {
    public static $tag = 'calculationcategory';

    public static function render( $input, array $args, Parser $parser, PPFrame $frame ) {
        $requiredArgs = [
            'id',
        ];

        foreach( $requiredArgs as $requiredArg ) {
            if( !isset( $args[ $requiredArg ] ) ) {
                return wfMessage( 'calculators-parser-tag-missing-required-argument', static::$tag, $requiredArg )->text();
            }
        }

        $tagContents = $parser->recursiveTagParse( trim( $input ) );

        $categoryId = $args[ 'id' ];
        $title = isset( $args[ 'title' ] ) ? $args[ 'title' ] : '';
        $search = $categoryId;

        if( $title ) {
            $header = Html::rawElement( 'h4', [], $title );
            $tagContents = $header . "\n" . $tagContents;

            $search .= ' ' . $title;
        }

        $args[ 'search' ] = isset( $args[ 'search' ] ) ? $search . ' ' . $args[ 'search' ] : $search;

        $tagAttributes = [
            'class' => 'calculator-calculationcategory calculator-calculationcategory-' . $categoryId
        ];

        if( isset( $args[ 'class' ] ) ) {
            $tagAttributes[ 'class' ] .= ' ' . $args[ 'class' ];
            unset( $args[ 'class' ] );
        }

        foreach( $args as $arg => $value ) {
            $tagAttributes[ 'data-' . $arg ] = $value;
        }

        return Html::rawElement( 'div', $tagAttributes, $tagContents );
    }
}