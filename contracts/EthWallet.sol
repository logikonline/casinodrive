pragma solidity ^0.4.17;

import "./Members.sol";
import "./Ownable.sol";


contract EthWallet is Ownable {

    constructor() public {
    }

    function receiveFunds() payable public {

    }

    function sendFunds(address receiver, uint percent) public {
        receiver.transfer(getBalance()/percent);
    }

    function getBalance() public view returns (uint256) { return address(this).balance; }

    function kill() public {
        selfdestruct(owner);
    }
}