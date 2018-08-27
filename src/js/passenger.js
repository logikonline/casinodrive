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
        $(document).on('click', '.btn-requestRide', App.handleNewPassenger);
    },

    handleNewPassenger: function () {
        event.preventDefault();

        var commuteInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var accountPassenger = accounts[1];

            this.state.web3.eth.defaultAccount = accounts[1];

            App.contracts.CasinoDrive.deployed().then(function (instance) {
                commuteInstance = instance;

                return commuteInstance.addPassengerRequest('Passenger Dave', 'Dune', 300.92, 8.92, Date.now(), { from: accountPassenger });
            }).then(function (result) {
                return App.driveToPickup();
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    driveToPickup: function (driver, account) {
        //navigate
        window.location.href = '/pickup.html';
    }

};

$(function () {
    $(window).load(function () {
        App.init();
    });
});

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay;

    directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "red"
        }
    });

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: new google.maps.LatLng(25.0837819, -77.321198),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    directionsDisplay.setMap(map);

    var locations = [
        ['The Reef Atlantis', 25.084536, -77.330704, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/hotel.png'],
        ['Oasis Restaurant & Bar', 25.003246, -77.4673455, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/food.png'],
        ['Carmines', 25.08668, -77.32665, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/food.png'],
        ['Dune', 25.0829234, -77.3114754, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/food.png'],
        ['Montagu Gardens', 25.0721743, -77.3091388, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/food.png'],
        ['Travellers Rest', 25.0647862, -77.4721588, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/food.png'],
        ['Lynden Pindling International Airport', 25.0439288, -77.4655212, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/airport.png'],
        ['The Royal Bank of Canada', 25.0347498, -77.5131047, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bank.png'],
        ['Scotia Bank', 25.0194408, -77.3810372, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bank.png'],
        ['CIBC First Caribbean', 25.0765015, -77.3386342, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bank.png'],
        ['Bahamas Development', 25.0699435, -77.3915533, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bank.png'],
        ['Cozy Corner Pub', 25.074803, -77.4294573, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bar.png'],
        ['Pirates Pub and Grill', 25.0775677, -77.3447612, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bar.png'],
        ['Beach Shack', 25.0293784, -77.5369602, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bar.png'],
        ['Bamboo Shack', 25.0383471, -77.3409279, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/bar.png'],
        ['Sea Trek Helmet Diving', 25.0844329, -77.3240519, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Stewarts Cove', 25.00496266, -77.54466321, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Bonefish Pond', 24.9851248, -77.4042102, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Loop View', 25.0439361, -77.3587326, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Seaworld Explorer', 25.06, -77.345, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Fort Charlotte', 25.0769583, -77.268455, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/tour.png'],
        ['Prince Charles Shopping Centre', 25.0433013, -77.3168743, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Seagrapes Shopping Plaza', 25.0371946, -77.2808844, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Caves Village', 25.0676409, -77.4517465, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Old Fort Bay Town Centre', 25.0467254, -77.4932671, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Fendi', 25.06, -77.345, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['John Chea', 25.014643, -77.3945644, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Bamboo Bamboo', 25.0344436, -77.5133997, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Albany Water Sports', 25.001501, -77.5133815, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['Sandyport Plaza', 25.0761927, -77.4280786, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/shop.png'],
        ['National Art Museum', 25.075424, -77.347321, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/destination.png'],
        ['Fort Fincastle', 25.06, -77.345, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/destination.png'],
        ['Queens Staircase', 25.0759204, -77.3378813, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/destination.png'],
        ['Balcony House', 25.0767534, -77.3436895, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/destination.png'],
        ['Albany Golf Course', 25.0125127, -77.5031764, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/sport.png'],
        ['Blue Shark Golf Course', 25.00571, -77.5261129, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/sport.png'],
        ['Lynford Cay Tennis Centre', 25.0285459, -77.534265, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/sport.png'],
        ['Cable Beach Golf Course', 25.0673443, -77.3941654, 'https://raw.githubusercontent.com/bjhm/ajax-dummyJson/master/sport.png']
    ]

    var marker, i;

    var infowindow = new google.maps.InfoWindow();

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][1], locations[i][2]),
            map: map,
            icon: locations[i][3]
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                var distinationOrigin = new google.maps.LatLng(25.0837819, -77.321198);
                var destinationMarker = locations[i][1] + ',' + '' + locations[i][2];
                infowindow.setContent(locations[i][0]);
                infowindow.open(map, marker);
                calculateAndDisplayRoute(directionsService, directionsDisplay, distinationOrigin, destinationMarker, infowindow);
            }
        })(marker, i));
    }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, distinationOrigin, destinationMarker, infowindow) {
    directionsService.route({
        origin: distinationOrigin,
        destination: destinationMarker,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            computeTotals(response, infowindow);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function computeTotals(result, infowindow) {
    var totalDist = 0;
    var totalTime = 0;
    var myroute = result.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
        totalDist += myroute.legs[i].distance.value;
        totalTime += myroute.legs[i].duration.value;
    }
    totalDist = totalDist / 1000.
    infowindow.setContent(infowindow.getContent() + "<br>total distance=" + totalDist.toFixed(2) + " km (" + (totalDist / 0.621371).toFixed(2) + " miles)<br>total time=" + (totalTime / 60).toFixed(2) + " minutes<br/><br/><a href='' class='btn-requestRide'>Request Ride</a>");
}

google.maps.event.addDomListener(window, "load", initMap);

