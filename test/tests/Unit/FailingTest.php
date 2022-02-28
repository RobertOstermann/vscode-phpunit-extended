<?php

namespace Unit;

use PHPUnit\Framework\TestCase;

class FailingTest extends TestCase
{
    /**
     * First Test
     *
     * @test
     */
    public function firstTest()
    {
        $this->assertTrue(false);
    }

    public function testSecond()
    {
        $this->assertEquals(0, 1);
    }
}
