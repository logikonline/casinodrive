pragma solidity ^0.4.21;
/**
 * @title Ownable
 * @dev The Ownable contract provides a basic implementation of "user permissions".
 */
 
 
contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor () public {
        owner = msg.sender;
    }


    // @dev requires owner to complete
    //
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    // @dev Allows the current owner to transfer control of the contract to a newOwner.
    // @param newOwner The address to transfer ownership to.
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

}