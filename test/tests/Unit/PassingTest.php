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
        // Arrange

        // Act

        // Assert
        $this->assertTrue(true);
    }

    public function testSecond()
    {
        // Arrange

        // Act

        // Assert
        $this->assertEquals(0, 0);
    }
}
