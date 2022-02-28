<?php

namespace Unit;

use PHPUnit\Framework\TestCase;

class PassingTest extends TestCase
{
    /**
     * First Test
     *
     * @test
     */
    public function firstTest()
    {
        $this->assertTrue(true);
    }

    public function testSecond()
    {
        $this->assertEquals(0, 0);
    }
}
