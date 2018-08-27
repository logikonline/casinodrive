pragma solidity ^0.4.17;

import "./Members.sol";
import "./Pausable.sol";
import "./EthWallet.sol";

/**
 * @title CasinoDrive
 * @dev Provides driver and passenger operations for negotiating trips.
 */
contract CasinoDrive {
    
    event WalletBalance(uint amount);

    event DriverEnrolled(address driverAddress);
    event DriverCanceled(address driverAddress);
    event DriverState(address driverAddress, uint state);
    
    event DriverAborted(address passengerAddress);
    event DriverAccepted(address passengerAddress);
    event DriverArrived(address passengerAddress);
    
    event PassengerRequest(address passengerAddress);
    event PassengerCanceled(address passengerAddress);
    event PassengerPickedUp(address driverAddress);
    
    uint cancelTime = 300;
    address owner;
    
    using Members for Members.Passenger;
    mapping(address => Members.Passenger) passengers;
    address[] public passengerList;
    
    using Members for Members.Driver;
    mapping(address => Members.Driver) drivers;
    address[] public driverList;
    
    // @dev Constructor, sets creator to owner
    //
    constructor() public {
        owner = msg.sender;
    }

    // @dev get the owner of the contract
    // @return returns owner address
    //
    function getOwner()
    public view
    returns (address returnedOwner)
    {
        returnedOwner = owner;
    }

    /*
        Driver Routines
    */

    // @dev checks for address to be a driver
    // @param driverAddress
    // @return return bool if true
    function isDriver(address driverAddress) public constant returns(bool isIndeed) {
        if(driverList.length == 0) return false;
        return (driverList[drivers[driverAddress].listPointer] == driverAddress);
    }

    function getDriverCount() public constant returns(uint driverCount) {
        return driverList.length;
    }

    function isPassenger(address passengerAddress) public constant returns(bool isIndeed) {
        if(passengerList.length == 0) return false;
        return (passengerList[passengers[passengerAddress].listPointer] == passengerAddress);
    }

    function getPassengerCount() public constant returns(uint passengerCount) {
        return passengerList.length;
    }

    // @dev adds a new driver - will not add more if paused
    // @param name of driver
    function addDriverRequest(string name) public  { //whenNotPaused
        
        if(isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(!sender.isActive, "You are already driver.");
        
        sender.name = name;
        sender.state = Members.driverState.Waiting;
        sender.user = msg.sender;
        sender.isActive = true;
        sender.listPointer = driverList.push(msg.sender) - 1;
        
        emit DriverEnrolled(msg.sender);
    }
    
    // @dev Gets driver status
    // @returns enumerated state
    function getDriverState() public returns(uint) {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");

        emit DriverState(msg.sender, uint(sender.state));

        return uint(sender.state);
    }
    
    // @dev Make driver available
    //
    function setDriverAvailable() public {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        //require(sender.state > Members.driverState.Driving, "You are not currently inactive");
        
        sender.state = Members.driverState.Waiting;

        emit DriverState(msg.sender, uint(sender.state));
    }
    
    // @dev Removes a driver
    //
    function removeDriver() public {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state != Members.driverState.Waiting, "You are not currently inactive");
        
        uint rowToDelete = sender.listPointer;
        address keyToMove  = driverList[driverList.length-1];
        driverList[rowToDelete] = keyToMove;
        drivers[keyToMove].listPointer = rowToDelete;
        driverList.length--;
        sender.isActive = false;

    }
    
    // @dev Drivers cancel a pending request, if longer that time allowed - transfer a fee
    // @returns bool if successful
    function cancelDriverRequest() payable public returns(bool) {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state == Members.driverState.Pending, "Operation InProgress");

        if (sender.state == Members.driverState.Pending) {
            if ((sender.accepttime + cancelTime) > block.timestamp) { 
                //under time alloted minutes, free cancel
                passengers[drivers[msg.sender].passenger].state = Members.passengerState.Waiting;
                passengers[drivers[msg.sender].passenger].driver = address(0); 
                drivers[msg.sender].passenger = address(0);
                emit DriverCanceled(msg.sender);
                sender.state = Members.driverState.Canceled;
                return true;
            } else if (sender.state != Members.driverState.PendingCancel) {
                sender.state = Members.driverState.PendingCancel;
                //log bad driver rating in future - pending state to prevent re-entry
                passengers[drivers[msg.sender].passenger].state = Members.passengerState.Waiting;
                passengers[drivers[msg.sender].passenger].driver = address(0);
                drivers[msg.sender].passenger = address(0);
                emit DriverCanceled(msg.sender);
                sender.state = Members.driverState.Canceled;
                return true;
            }
        }
    }
    
    // @dev Returns next passenger in line.
    // @returns address of passenger selected
    function getNextPassenger() public returns(address) {

        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state == Members.driverState.Waiting, "Operation InProgress");

        address retPass = address(0);
        uint lowAsk = 0;
        for(uint i = 0; i<passengerList.length; i++){
            if(passengers[passengerList[i]].state == Members.passengerState.Waiting) {
                if (lowAsk == 0 || passengers[passengerList[i]].asktime < lowAsk) {
                    lowAsk = passengers[passengerList[i]].asktime;
                    retPass = passengerList[i];
                }
            }
        }
        if (retPass != address(0))
        {
            passengers[retPass].state = Members.passengerState.Pending;
            passengers[retPass].driver = msg.sender;
            sender.passenger = retPass;
            sender.state = Members.driverState.Pending;
            emit DriverAccepted(retPass);
        }
        return retPass; 
        
    }
    
    // @dev Returns all waiting passengers addresses in array
    // @returns address[] 
    function getPassengersWaiting() public view returns(address[]) {

        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");

        uint passCount = 0;
        for(uint i = 0; i<passengerList.length; i++){
            if(passengers[passengerList[i]].state == Members.passengerState.Waiting) {
                passCount+=1;
            }
        }

        address[] memory result = new address[](passCount);
        if (passCount>0) {
            passCount = 0;
            for(uint b = 0; b<passengerList.length; b++){
                if(passengers[passengerList[b]].state == Members.passengerState.Waiting) {
                    result[passCount] = passengerList[b];
                    passCount+=1;
                }
            }
        } 
        return result; 
        
    }
    
    // @dev Returns all waiting passengers count
    // @returns uint of the number of passengers
    function getPassengersWaitingCount() public view returns(uint) {

        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");

        uint passCount = 0;
        for(uint i = 0; i<passengerList.length; i++){
            if(passengers[passengerList[i]].state == Members.passengerState.Waiting) {
                passCount+=1;
            }
        }
        return passCount; 
        
    }
    
    // @dev Return the total drivers waiting for passengers to see
    // @returns uint of the number of drivers
    function getDriversWaiting() public view returns(uint) {

        uint driverCount = 0;
        for(uint i = 0; i<driverList.length; i++){
            if(drivers[driverList[i]].state == Members.driverState.Waiting){
                driverCount+=1;
            }
        }
        return driverCount; 
        
    }
    
    // @dev Driver accepts passenger request
    // @param aPassenger as the passenger address
    // @returns bool if successful
    function acceptPassengerRequest(address aPassenger) public returns(bool) { //whenNotPaused
        
        if(!isDriver(msg.sender)) revert();
        if(!isPassenger(aPassenger)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state == Members.driverState.Waiting, "You are in progress with another ride");

        if (sender.state == Members.driverState.Waiting) {
            passengers[aPassenger].state = Members.passengerState.Pending;
            passengers[aPassenger].driver = msg.sender; 
            sender.passenger = aPassenger;
            sender.state = Members.driverState.Pending;
            emit DriverAccepted(aPassenger);
            return true;
        }
        return false;
        
    }
    
    // @dev Driver confirms passenger arrival
    // @returns bool if driver successfully sets passenger as arrived
    function confirmDriverArrived() public returns(bool) {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state == Members.driverState.Driving, "You are not in progress");

        if (sender.state == Members.driverState.Driving) {
            sender.state = Members.driverState.Arrived;
            passengers[sender.passenger].state = Members.passengerState.Completed;
            passengers[sender.passenger].driver = address(0); 
            passengers[sender.passenger].isActive = false;
            emit DriverArrived(sender.passenger);

            emit WalletBalance(passengers[sender.passenger].wallet.getBalance());
            passengers[sender.passenger].wallet.sendFunds(msg.sender, 100);
            emit WalletBalance(passengers[sender.passenger].wallet.getBalance());

            sender.passenger = address(0);
            return true;
        }
        return false;
        
    }
    
    // @dev Driver cancels a ride in progress - no payment
    // @returns bool if driver cancels ride
    function cancelDriverRide() public returns(bool) {
        
        if(!isDriver(msg.sender)) revert();
        Members.Driver storage sender = drivers[msg.sender];
        require(sender.isActive, "You are not a driver.");
        require(sender.state == Members.driverState.Driving, "Operation not InProgress");

        if (sender.state == Members.driverState.Driving) {
            if (sender.passenger != address(0)) {
                passengers[sender.passenger].state = Members.passengerState.Canceled;
                passengers[sender.passenger].driver = address(0); 
                passengers[sender.passenger].isActive = false; 
            }
            emit DriverAborted(sender.passenger);
            sender.passenger = address(0);
            sender.state = Members.driverState.Canceled;
            return true;
        }
    }
    

    /*
        Passenger Routines
    */

    // @dev Request a ride and create passenger
    // @param name of the passenger
    // @param desitnation of location
    // @param destprice in wei for trip
    // @param desttime in minutes for trip
    // @param asktime original time requested
    function addPassengerRequest(string name, string desitnation, uint destprice, uint desttime, uint asktime) public { //whenNotPaused
        
        if(isPassenger(msg.sender)) revert();
        Members.Passenger storage sender = passengers[msg.sender];

        require(!sender.isActive, "You are already a passenger");
        require(msg.value < destprice, "Insufficent funds"); 
        
        sender.destination = desitnation;
        sender.name = name;
        sender.desttime = desttime;
        sender.destprice = destprice;
        sender.asktime = asktime;
        sender.state = Members.passengerState.Waiting;
        sender.user = msg.sender;
        sender.isActive = true;
        sender.listPointer = passengerList.push(msg.sender) - 1;
        sender.wallet = new EthWallet();
        //Send money to the contract
        sender.wallet.receiveFunds.value(destprice);

        emit PassengerRequest(msg.sender);
        
    }
    
    // @dev Passenger confirms the picked up
    // @returns bool if successful 
    function confirmPassengerPickup() public returns(bool) {
        
        if(!isPassenger(msg.sender)) revert();
        Members.Passenger storage sender = passengers[msg.sender];
        require(sender.isActive, "You are not a passenger.");
        require(sender.state == Members.passengerState.Pending, "Operation not pending");
        
        if (sender.state == Members.passengerState.Pending) {
            drivers[sender.driver].state = Members.driverState.Driving;
            sender.state = Members.passengerState.Riding;
            emit PassengerPickedUp(sender.driver);
            return true;
        }
        
    }
    
    // @dev Passenger cancels the picked up
    // @returns bool if successful 
    function cancelPassengerPickup() public returns(bool) {
        
        if(!isPassenger(msg.sender)) revert();
        Members.Passenger storage sender = passengers[msg.sender];
        require(sender.isActive, "You are not a passenger.");
        require(sender.state == Members.passengerState.Pending, "Operation not pending");
        
        if (sender.state == Members.passengerState.Pending) {
            drivers[sender.driver].state = Members.driverState.Waiting;
            sender.state = Members.passengerState.Waiting;
            emit PassengerCanceled(msg.sender);
            return true;
        }
        return false;
    }
    
    // @dev Passenger cancels a pending request
    // @returns bool if successful 
    function cancelPassengerRequest() public returns(bool) {
        
        if(!isPassenger(msg.sender)) revert();
        Members.Passenger storage sender = passengers[msg.sender];
        require(sender.isActive, "You are not a passenger.");
        require(sender.state < Members.passengerState.PendingCancel, "Operation InProgress");
        
        if (sender.state == Members.passengerState.Waiting) {
            sender.wallet.sendFunds(msg.sender, 100);
            delete passengers[msg.sender];
            emit PassengerCanceled(msg.sender);
            return true;
        }
        
        if (sender.state == Members.passengerState.Pending) {
            if ((sender.asktime + cancelTime) > block.timestamp) { 
                //under time alloted minutes, free cancel
                sender.wallet.sendFunds(msg.sender, 100);
                delete passengers[msg.sender];
                emit PassengerCanceled(msg.sender);
                return true;
            } else if (sender.state != Members.passengerState.PendingCancel) {
                sender.state = Members.passengerState.PendingCancel;
                sender.wallet.sendFunds(passengers[msg.sender].driver, 10);
                sender.wallet.sendFunds(msg.sender, 100);
                delete passengers[msg.sender];
                emit PassengerCanceled(msg.sender);
                return true;
            }
        }
    }
    
}