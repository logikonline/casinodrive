var CasinoDrive = artifacts.require("./CasinoDrive.sol");

contract('CasinoDrive', function (accounts) {

    const owner = accounts[3]
    const driver = accounts[4];
    const passenger = accounts[5];

    const timeNow = Date.now();
    const destTime = 300.92;
    const destPrice = 700.84;

    it("add driver to the system", async () => {
        const commute = await CasinoDrive.deployed();
        await commute.addDriverRequest('Driver Dave', { from: driver });

        const DriverEnrolled = await commute.DriverEnrolled();
        const log = await new Promise(function (resolve, reject) {
            DriverEnrolled.watch(function (error, log) { resolve(log); });
        });

        const logDriverAddress = log.args.driverAddress;

        const driverIs = await commute.isDriver(driver, { from: driver });
        assert.equal(driverIs, true, 'not a valid driver');

        assert.equal(driver, logDriverAddress, 'Driver failed to add');
    });

    it("add passenger to the system", async () => {
        const commute = await CasinoDrive.deployed();
        await commute.addPassengerRequest('Passenger Dave', 'Dune', destPrice, destTime, timeNow, { from: passenger });

        const PassengerRequest = await commute.PassengerRequest();
        const log = await new Promise(function (resolve, reject) {
            PassengerRequest.watch(function (error, log) { resolve(log); });
        });

        const logPassengerAddress = log.args.passengerAddress;

        const passengerIs = await commute.isPassenger(passenger, { from: passenger });
        assert.equal(passengerIs, true, 'not a valid passenger');

        assert.equal(passenger, logPassengerAddress, 'Passenger failed to add');
    });

    it("check passenger/driver in the system", async () => {
        const commute = await CasinoDrive.deployed();

        const driverCount = await commute.getDriversWaiting({ gas: 1000000 });
        assert.equal(driverCount, 1, 'Driver not waiting');

        //Must be called from driver or fails
        const passengerCount = await commute.getPassengersWaitingCount({ from: driver, gas: 1000000 });
        assert.equal(passengerCount, 1, 'Passengers not waiting');

        const passengerArray = await commute.getPassengersWaiting({ from: driver, gas: 1000000 });
        assert.equal(passengerArray[0], passenger, 'Passenger not waiting');
    });

    it("perform driver assign and passenger cancels", async () => {
        const commute = await CasinoDrive.deployed();

        const passengerArray = await commute.getPassengersWaiting({ from: driver });
        assert.equal(passengerArray[0], passenger, 'Passenger not waiting');

        //Must be called from driver or fails
        const nextPassenger = await commute.getNextPassenger({ from: driver });

        const DriverAccepted = await commute.DriverAccepted();
        const logAccept = await new Promise(function (resolve, reject) {
            DriverAccepted.watch(function (error, logAccept) { resolve(logAccept); });
        });

        const logPassengerAddress = logAccept.args.passengerAddress;
        assert.equal(passenger, logPassengerAddress, 'Passenger accepted by driver');

        //Confirm no longer waiting passenger
        const passengerCount = await commute.getPassengersWaitingCount({ from: driver });
        assert.equal(passengerCount, 0, 'Passengers not waiting');

        const passState = await commute.cancelPassengerPickup({ from: passenger });

        const PassengerCanceled = await commute.PassengerCanceled();
        const logCancel = await new Promise(function (resolve, reject) {
            PassengerCanceled.watch(function (error, logCancel) { resolve(logCancel); });
        });

        const logPassengerCancelAddress = logCancel.args.passengerAddress;
        assert.equal(passenger, logPassengerCancelAddress, 'Driver canceled by passenger');

    });

    it("perform driver assign, passenger pickup, driver arrives", async () => {
        const commute = await CasinoDrive.deployed();

        const passengerArray = await commute.getPassengersWaiting({ from: driver });
        assert.equal(passengerArray[0], passenger, 'Passenger not waiting');

        //Must be called from driver or fails
        const nextPassenger = await commute.getNextPassenger({ from: driver });

        const DriverAccepted = await commute.DriverAccepted();
        const logAccept = await new Promise(function (resolve, reject) {
            DriverAccepted.watch(function (error, logAccept) { resolve(logAccept); });
        });

        const logPassengerAddress = logAccept.args.passengerAddress;
        assert.equal(passenger, logPassengerAddress, 'Passenger accepted by driver');

        //Confirm no longer waiting passenger
        const passengerCount = await commute.getPassengersWaitingCount({ from: driver });
        assert.equal(passengerCount, 0, 'Passengers not waiting');

        await commute.confirmPassengerPickup({ from: passenger });

        const PassengerPickedUp = await commute.PassengerPickedUp();
        const logPickup = await new Promise(function (resolve, reject) {
            PassengerPickedUp.watch(function (error, logPickup) { resolve(logPickup); });
        });

        const logDriverPickupAddress = logPickup.args.driverAddress;
        assert.equal(driver, logDriverPickupAddress, 'Passenger confirms pickup');

        //Must be called from driver or fails
        await commute.confirmDriverArrived({ from: driver });

        const DriverArrived = await commute.DriverArrived();
        const logArrive = await new Promise(function (resolve, reject) {
            DriverArrived.watch(function (error, logArrive) { resolve(logArrive); });
        });

        const logPassengerArriveAddress = logArrive.args.passengerAddress;
        assert.equal(passenger, logPassengerArriveAddress, 'Driver confirms arrival');

    });

    it("check followup passenger/driver in the system", async () => {
        const commute = await CasinoDrive.deployed();

        const driverCount = await commute.getDriversWaiting();
        assert.equal(driverCount, 0, 'Driver not waiting');

        await commute.getDriverState({ from: driver });

        const DriverState = await commute.DriverState();
        const logState = await new Promise(function (resolve, reject) {
            DriverState.watch(function (error, logState) { resolve(logState); });
        });

        const logDriverState = logState.args.state;
        assert.equal(4, logDriverState, 'Driver confirms starte');

        await commute.setDriverAvailable({ from: driver });

        const newCount = await commute.getDriversWaiting();
        assert.equal(newCount, 1, 'Driver not waiting');

        //Must be called from driver or fails
        const passengerCount = await commute.getPassengersWaitingCount({ from: driver });
        assert.equal(passengerCount, 0, 'Passengers waiting');

    });

});
