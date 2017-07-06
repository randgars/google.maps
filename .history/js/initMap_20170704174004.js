function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var chicago = new google.maps.LatLng(41.850033, -87.6500523);

    var minsk = new google.maps.LatLng(53.5500, 27.3300);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);

    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
    }, function (response, status) {
        debugger
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            var routesArray = response.routes;
            // for (var i = 0; i < routesArray.length; i++) {
            //     routesArray[i]
            // }
            var distanceValues = routesArray.map(function (item) {
                return item.legs[0].distance.value
            })
            debugger
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}