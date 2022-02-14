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
        // Arrange

        // Act

        // Assert
        $this->assertTrue(false);
    }

    public function testSecond()
    {
        // Arrange

        // Act

        // Assert
        $this->assertEquals(0, 1);
    }
}
