<?php

namespace Unit;

use ErrorException;
use PHPUnit\Framework\TestCase;

class MixedTest extends TestCase
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
        $this->assertEquals(0, 1);
    }

    public function testException()
    {
        // $this->expectException(ErrorException::class);

        throw new ErrorException("");
    }

    public function testIncomplete()
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testRisky()
    {
        $this->markAsRisky('This test is risky.');
    }

    public function testSkipped()
    {
        $this->markTestSkipped('This test has not been implemented yet.');
    }
}
