var directionsDisplay;
var map;

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);

    var minsk = new google.maps.LatLng(53.5500, 27.3300);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateMinDistance(response) {
    debugger
    var distanceValues = response.routes.map(function (item) {
        return item.legs[0].distance.value
    })
    var minDistance = distanceValues[0];
    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i] < minDistance) {
            minDistance = distanceValues[i]
        }
    }
    debugger
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            calculateMinDistance(calculateMinDistance);
            debugger
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}