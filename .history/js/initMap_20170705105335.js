var minDistance,
    minDuration,
    submitButton = document.getElementById('submitButton'),
    fieldDistanceValue = document.getElementById('distanceValue'),
    fieldDurationValue = document.getElementById('durationValue')

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    var onClickHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, this);
    };
    submitButton.addEventListener('click', onClickHandler);
    // document.getElementById('minDistance').addEventListener('click', onClickHandler);
    // document.getElementById('minDuration').addEventListener('click', onClickHandler);

    // document.getElementById('start').addEventListener('change', onChangeHandler);
    // document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateMinDistance(routes) {
    var distanceValues = routes.map(function (item) {
        return item.legs[0]
    });

    minDistance = { distance: distanceValues[0].distance.value, index: 0 };

    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i].distance.value < minDistance.distance) {
            minDistance = { distance: distanceValues[i].distance.value, index: i };
            minDistance.duration = distanceValues[i].duration.value;
        }
    }

    return minDistance;
}

function calculateMinDuration(routes) {
    var durationValues = routes.map(function (item) {
        return item.legs[0]
    });

    minDuration = { duration: durationValues[0].duration.value, index: 0 };

    for (var i = 0; i < durationValues.length; i++) {
        if (durationValues[i].duration.value < minDuration.duration) {
            minDuration = { duration: durationValues[i].duration.value, index: i };
            minDuration.distance = distanceValues[i].distance.value;
        }
    }
    
    return minDuration;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, map, obj) {
    var clickBtnValue = obj.value;
    if (clickBtnValue != 'Get min distance') {
        submitButton.value = 'Get min distance';        
    } else {
        submitButton.value = 'Get min duration';
    }

    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    }, function (response, status) {
        if (status === 'OK') {
            //directionsDisplay.setDirections(response);
            calculateMinDistance(response.routes);
            calculateMinDuration(response.routes);
            switch (clickBtnValue) {
                case 'Get min distance':
                    fieldDistanceValue.innerHTML = 'Distance: ' + minDistance.distance;
                    fieldDurationValue.innerHTML = 'Duration: ' + minDistance.duration;
                    return new google.maps.DirectionsRenderer({
                                map: map,
                                directions: response,
                                routeIndex: minDistance.index
                            });
                case 'Get min duration':
                    fieldDistanceValue.innerHTML = 'Distance: ' + minDuration.distance;
                    fieldDurationValue.innerHTML = 'Duration: ' + minDuration.duration;
                    return new google.maps.DirectionsRenderer({
                                map: map,
                                directions: response,
                                routeIndex: minDuration.index
                            });
            }
            // for (var i = 0; i < response.routes.length; i++) {
            //     new google.maps.DirectionsRenderer({
            //         map: map,
            //         directions: response,
            //         routeIndex: i
            //     });
            // }
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}