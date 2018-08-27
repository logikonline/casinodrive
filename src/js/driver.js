App = {
    web3Provider: null,
    contracts: {},

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // metamask and mist inject their own web3 instances, so just 
        // set the provider if it exists
        if (typeof web3 !== "undefined") {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new web3.providers.HttpProvider("http://localhost:8545");
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },

    initContract: function () {

        $.getJSON('Members.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var MembersArtifact = data;
            App.contracts.Members = TruffleContract(MembersArtifact);

            // Set the provider for our contract.
            App.contracts.Members.setProvider(App.web3Provider);

            return;
        });

        $.getJSON('CasinoDrive.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var CasinoDriveArtifact = data;
            App.contracts.CasinoDrive = TruffleContract(CasinoDriveArtifact);

            // Set the provider for our contract.
            App.contracts.CasinoDrive.setProvider(App.web3Provider);

            return;
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-request', App.handleNextPassenger);
        $(document).on('click', '.btn-create', App.handleCreateDriver);
    },

    handleCreateDriver: function () {
        event.preventDefault();

        var commuteInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var accountDriver = accounts[0];

            App.contracts.CasinoDrive.deployed().then(function (instance) {
                commuteInstance = instance;

                return commuteInstance.addDriverRequest('Driver Dave', { from: accountDriver });
            }).then(function (result) {
                $('.driver-status').text('Driver Active');
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleNextPassenger: function () {
        event.preventDefault();

        var commuteInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var accountDriver = accounts[0];

            App.contracts.CasinoDrive.deployed().then(function (instance) {
                commuteInstance = instance;

                return commuteInstance.getNextPassenger({ from: accountDriver });
            }).then(function (result) {
                return App.driveToPickup();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    driveToPickup: function (passenger, account) {
        //navigate
        window.location.href = '/arrive.html';
    }

};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
