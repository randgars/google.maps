var minDistance,
    minDuration,
    autocomplete,
    submitButton = document.getElementById('submitButton'),
    fieldDistanceValue = document.getElementById('distanceValue'),
    fieldDurationValue = document.getElementById('durationValue');

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();

    autocomplete = new google.maps.places.Autocomplete(
        (
            document.getElementById('autocomplete')), {
            types: ['(cities)'],
            componentRestrictions: countryRestrict
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
        duration: distanceValues[0].duration.value,
        index: 0
    };

    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i].distance.value < minDistance.distance) {
            minDistance = {
                distance: distanceValues[i].distance.value,
                duration: distanceValues[i].duration.value,
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
        distance: durationValues[0].distance.value,
        duration: durationValues[0].duration.value,
        index: 0
    };

    for (var i = 0; i < durationValues.length; i++) {
        if (durationValues[i].duration.value < minDuration.duration) {
            minDuration = {
                distance: durationValues[i].distance.value,
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
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    }, function (response, status) {
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