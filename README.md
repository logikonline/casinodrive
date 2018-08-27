# casinodrive-dapp

## What it does
CasinoDrive is intended to be an initial prototype of an Uber-like solution which removes the company and connects drivers/passengers together.  Casino Drive is a solution for a local casino that wants to provide their gamblers with rides after a long night of action. Only allowing passengers the ability to travel to a few preset locations (controlled by web markers on a google map), the solution negotiates the driver/passenger handshake

## How to setup

### Prerequisites 

1. Truffle install - https://github.com/trufflesuite/truffle

Truffle should be installed properly on your machine.   See the above link for how to do this.

2. ganache-cli install - https://github.com/trufflesuite/ganache-cli

Ganache-cli should be installed properly on your machine.  See the above link for how to do this.  The GUI Ganache can also be used.

3. Install lite-server https://www.npmjs.com/package/lite-server

Lite-Server should be installed properly to enable thew web portion.

4. project files (this git collection) in a local directory.  (if you are reading this you should have access.)

Unzip/Clone the Repository to a local directory

5. MetaMask install - https://metamask.io/

Install MetaMask.  See above link for how to do this.

### Installing
1. Copy files to casionocommute Directory
2. run ganache-cli with following mnemonic "bubble quality salmon raven glove elder royal sign process already zero skill"

```
ganache-cli --port 8545 --mnemonic "bubble quality salmon raven glove elder royal sign process already zero skill"
```

3. Set Up MetaMask for project -
    import with seed phrase "bubble quality salmon raven glove elder royal sign process already zero skill"
    1. change the network to Private Network, set port to: 8545
    2. This will set account[0] for you. 

4. Compile truffle
Compile the project in standard manner from the directory where the files are located.

```
truffle compile
```

5. Migrate
Migrate the project to the blockchain.
```
truffle migrate
```

6. Tests
A series of solidity tests for the contract files, testing basic contract functionality.

```
truffle test
```

5. Run Development Web Server for project.
Run the following command in the directory where you compiled the package from

```
npm run dev
```

## Tests
There are 6 automated tests to verify workflow:  

1. "add driver to the system" - Adds driver to system and confirms enrollment, and verifies driver.
2. "add passenger to the system" - Adds passenger request and confirms request, and verifies passenger.
3. "check passenger/driver in the system" - Verifies driver waiting, verifies a passenger is waiting
4. "perform driver assign and passenger cancels" - Tests a driver assigning a passenger but the passenger cancels request before pickup.
5. "perform driver assign, passenger pickup, driver arrives" - Tests a driver assigning, this time passenger is picked up and the driver arrives at destination.
6. "check followup passenger/driver in the system" - Tests to see if driver is available, allows driver reset to available for next passenger. Confirms passengers are no longer waiting.

## Additional Notes

The contract provides more functions than used but outlined to show additional features for handling other events.  Workflow such as rating was not added based on time constraints but would be added to confirm the driver, as well as provide ranking for canceled trips.

## Built With

* [Truffle Suite](https://truffleframework.com) - Truffle Suite Framework.
* [ganache-cli](https://github.com/trufflesuite/ganache-cli) - Ganache-cli (command line)

## Author
Dave Friedel