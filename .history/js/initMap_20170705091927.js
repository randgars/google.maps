var minDistance;

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay, map);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateMinDistance(response) {
    var distanceValues = response.routes.map(function (item) {
        return item.legs[0].distance.value
    })
    minDistance = { distance: distanceValues[0], index: 0 };
    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i] < minDistance.distance) {
            minDistance = { distance: distanceValues[i], index: i };
        }
    }
    return minDistance;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, map) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    }, function (response, status) {
        if (status === 'OK') {
            //directionsDisplay.setDirections(response);
            calculateMinDistance(response);
            debugger
            for (var i = 0; i < response.routes.length; i++) {
                new google.maps.DirectionsRenderer({
                    map: map,
                    directions: response,
                    routeIndex: i
                });
            }
            debugger
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}