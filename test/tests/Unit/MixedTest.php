<?php

namespace Unit;

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
        // Arrange

        // Act

        // Assert
        $this->assertTrue(true);
    }

    public function testSecond()
    {
        // Arrange

        // Act
        sleep(3);

        // Assert
        $this->assertEquals(0, 1);
    }
}
