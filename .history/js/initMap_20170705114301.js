var minDistance,
    minDuration,
    originInput = document.getElementById('origin-input'),
    destinationInput = document.getElementById('destination-input'),
    submitButton = document.getElementById('submit-button'),
    fieldDistanceValue = document.getElementById('distance-value'),
    fieldDurationValue = document.getElementById('duration-value');

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {
            placeIdOnly: true
        });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {
            placeIdOnly: true
        });

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var onClickHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, this);
    };
    submitButton.addEventListener('click', onClickHandler);
}

function calculateMinDistance(routes) {
    var distanceValues = routes.map(function (item) {
        return item.legs[0]
    });

    minDistance = {
        distance: distanceValues[0].distance.value,
        textInfo: {
            distance: distanceValues[0].distance.text,
            duration: distanceValues[0].duration.text
        },
        index: 0
    };

    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i].distance.value < minDistance.distance) {
            minDistance = {
                distance: distanceValues[i].distance.value,
                textInfo: {
                    distance: distanceValues[i].distance.text,
                    duration: distanceValues[i].duration.text
                },
                index: i
            };
        }
    }

    return minDistance;
}

function calculateMinDuration(routes) {
    var durationValues = routes.map(function (item) {
        return item.legs[0]
    });

    minDuration = {
        textInfo: {
            distance: durationValues[0].distance.text,
            duration: durationValues[0].duration.text
        },
        duration: durationValues[0].duration.value,
        index: 0
    };

    for (var i = 0; i < durationValues.length; i++) {
        if (durationValues[i].duration.value < minDuration.duration) {
            minDuration = {
                textInfo: {
                    distance: durationValues[i].distance.text,
                    duration: durationValues[i].duration.text
                },
                duration: durationValues[i].duration.value,
                index: i
            };
        }
    }

    return minDuration;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, map, obj) {
    var clickBtnValue = obj.value;

    directionsService.route({
        origin: originInput.value,
        destination: destinationInput.value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    }, function (response, status) {
        debugger
        if (status === 'OK') {
            switch (clickBtnValue) {
                case 'Get min distance':
                    calculateMinDistance(response.routes);
                    fieldDistanceValue.innerHTML = 'Distance: ' + minDistance.distance;
                    fieldDurationValue.innerHTML = 'Duration: ' + minDistance.duration;
                    return new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: minDistance.index
                    });
                case 'Get min duration':
                    calculateMinDuration(response.routes);
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
    if (clickBtnValue != 'Get min distance') {
        submitButton.value = 'Get min distance';
    } else {
        submitButton.value = 'Get min duration';
    }
}