<?php

namespace Unit;

use PHPUnit\Framework\TestCase;

class PassingTestWithSpacesTest extends TestCase
{
    /**
     * Spaces Test
     *
     * @test
     */
    public function spacesTest()
    {
        $this->assertTrue(true);
    }
}
