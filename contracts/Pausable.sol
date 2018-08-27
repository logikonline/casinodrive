pragma solidity ^0.4.21;


import "./Ownable.sol";


/**
 * @title Pausable
 * @dev Enables children contracts to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
    event Pause();
    event Unpause();

    bool public paused = false;

    // @dev Modifier to make a function callable only when the contract is not paused.
    //
    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    // @dev Modifier to make a function callable only when the contract is paused.
    //
    modifier whenPaused() {
        require(paused);
        _;
    }

    // @dev called by the owner to pause, triggers stopped state
    //
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Pause();
    }

    // @dev called by the owner to unpause, returns to normal state
    //
    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpause();
    }
}