var minDistance,
    minDuration,
    geocoder,
    locationList = [],
    geocoderLocationList = [],
    waypointsList = document.getElementById('waypoints-list'),
    originInput = document.getElementById('origin-input'),
    destinationInput = document.getElementById('destination-input'),
    locationInput = document.getElementById('location-input'),
    submitButton = document.getElementById('submit-button'),
    addButton = document.getElementById('add-button'),
    fieldDistanceValue = document.getElementById('distance-value'),
    fieldDurationValue = document.getElementById('duration-value');

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    geocoder = new google.maps.Geocoder();
    
    var locationAutocomplete = new google.maps.places.Autocomplete(
        locationInput, {
            placeIdOnly: true
        });

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
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, this);
    };
    submitButton.addEventListener('click', onClickHandler);

    addButton.addEventListener('click', addValueToList);
}

function addValueToList() {
    if (locationInput.value) {
        locationList.push(locationInput.value);
        locationInput.value = null;
    } else {
        return;
    }
    waypointsList.innerHTML = locationList.join(',')
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
    // var promise;
    var wayPoints = [];
    for (var i = 0; i < locationList.length; i++) {
        wayPoints.push({
            location: locationList[i],
            stopover: true
        })
        // promise = new Promise(function(resolve, reject) {
        //     geocoder.geocode( { 'address': locationList[i] }, function(results, status) {
        //         if (status == 'OK') {
        //             debugger
        //             resolve(results);
        //         } else {
        //             alert('Geocode was not successful for the following reason: ' + status);
        //         }
        //     })
        // }).then(function (response) {
        //     debugger
        //     return geocoderLocationList.push(response[0].geometry.location);
        // }, function (error) {
        //     console.log(error)
        // })
        
    }

    debugger
    directionsService.route({
        origin: originInput.value,
        destination: destinationInput.value,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true,
        waypoints: wayPoints,
        optimizeWaypoints: true
    }, function (response, status) {
        debugger
        if (status === 'OK') {
            switch (clickBtnValue) {
                case 'Get min distance':
                    calculateMinDistance(response.routes);
                    fieldDistanceValue.innerHTML = 'Distance: ' + minDistance.textInfo.distance;
                    fieldDurationValue.innerHTML = 'Duration: ' + minDistance.textInfo.duration;
                    return new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: minDistance.index
                    });
                case 'Get min duration':
                    calculateMinDuration(response.routes);
                    fieldDistanceValue.innerHTML = 'Distance: ' + minDuration.textInfo.distance;
                    fieldDurationValue.innerHTML = 'Duration: ' + minDuration.textInfo.duration;
                    return new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        routeIndex: minDuration.index
                    });
            }
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