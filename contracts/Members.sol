pragma solidity ^0.4.17;

import "./EthWallet.sol";


library Members {
    
    enum passengerState { Waiting, Pending, PendingCancel, Riding, Completed, Canceled }
    
    enum driverState { Waiting, Pending, PendingCancel, Driving, Arrived, Canceled }
    
    struct Driver {
        string name;
        driverState state;
        uint accepttime;
        address user;
        bool isActive;
        address passenger;
        uint listPointer;
    }
    
    struct Passenger {
        string name;
        passengerState state;
        string destination;
        uint destprice;
        uint pickup;
        uint desttime;
        uint asktime;
        address user;
        bool isActive;
        address driver;
        uint listPointer;
        EthWallet wallet;
    }
}
