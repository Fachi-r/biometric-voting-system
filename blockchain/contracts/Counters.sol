// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Provides counters that can only be incremented, decremented or reset.
 *
 * This can be used e.g. to track the number of elements in a mapping,
 * issuing ERC721 ids, or counting request ids.
 *
 * Include with `using Counters for Counters.Counter;`
 */
library Counters {
    // Counter struct to hold the current value
    struct Counter {
        uint256 _value; // default: 0
    }

    /**
     * @dev Returns the current value of the counter.
     * @param counter The Counter struct to read from.
     */
    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    /**
     * @dev Increments the counter by one.
     * @param counter The Counter struct to increment.
     */
    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    /**
     * @dev Decrements the counter by one. Reverts if the counter is zero.
     * @param counter The Counter struct to decrement.
     */
    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }

    /**
     * @dev Resets the counter to zero.
     * @param counter The Counter struct to reset.
     */
    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}