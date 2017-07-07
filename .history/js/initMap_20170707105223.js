'use strict';

var minDistance,
    minDuration,
    geocoder,
    service,
    locationList = [],
    geocoderLocationList = [],
    waypointsList = document.getElementById('waypoints-list'),
    //originInput = document.getElementById('origin-input'),
    //destinationInput = document.getElementById('destination-input'),
    locationInput = document.getElementById('location-input'),
    submitButton = document.getElementById('submit-button'),
    addButton = document.getElementById('add-button'),
    clearButton = document.getElementById('clear-button'),
    fieldDistanceValue = document.getElementById('distance-value'),
    fieldDurationValue = document.getElementById('duration-value'),
    pointsDistations,
    allDistances = [];

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    service = new google.maps.DistanceMatrixService;
    geocoder = new google.maps.Geocoder();

    var locationAutocomplete = new google.maps.places.Autocomplete(
        locationInput, {
            placeIdOnly: true
        });

    // var originAutocomplete = new google.maps.places.Autocomplete(
    //     originInput, {
    //         placeIdOnly: true
    //     });
    // var destinationAutocomplete = new google.maps.places.Autocomplete(
    //     destinationInput, {
    //         placeIdOnly: true
    //     });

    var chicago = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: chicago
    }
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var onClickHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, this, service);
    };
    var onClickAddValue = function () {
        addValueToList(map)
    }
    var onClickClear = function () {
        locationList.length = 0;
        geocoderLocationList.length = 0;
        waypointsList.innerHTML = '';
        map = new google.maps.Map(document.getElementById('map'), mapOptions);
    }
    submitButton.addEventListener('click', onClickHandler);

    addButton.addEventListener('click', onClickAddValue);
    clearButton.addEventListener('click', onClickClear);
}



function addValueToList(map) {
    if (locationInput.value) {
        locationList.push(locationInput.value);
    } else {
        return;
    }
    waypointsList.innerHTML = locationList.map(function (item, index) {
        return '<p>' + (index + 1) + '. ' + item + '</p>'
    }).join('');

    var promise = new Promise(function (resolve, reject) {
        geocoder.geocode({
            'address': locationInput.value
        }, function (results, status) {
            if (status == 'OK') {
                resolve(results);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        })
    }).then(function (response) {
        geocoderLocationList.push(response[0].geometry.location);
        for (var i = 0; i < geocoderLocationList.length; i++) {
            new google.maps.Marker({
                position: geocoderLocationList[i],
                map: map,
                title: `${i+1}`
            });
        }
        debugger
        return geocoderLocationList;
    }, function (error) {
        console.log(error)
    })
    locationInput.value = null;
}

function findDistations() {
    var promise;
    for (var i = 0; i < geocoderLocationList.length; i++) {
        var tempArr = Object.assign([], geocoderLocationList);
        tempArr.splice(i, 1);
        service.getDistanceMatrix({
            origins: [geocoderLocationList[i]],
            destinations: tempArr,
            travelMode: 'DRIVING'
        }, callback);

        function callback(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                var result = response.rows[0].elements;
                var pointDistancesArray = [];
                for (var i = 0; i < result.length; i++) {
                    pointDistancesArray.push(result[i].distance.value);
                };
                pointsDistations = {
                    point: response.originAddresses[0],
                    distances: pointDistancesArray
                };
                
            }
            allDistances.push(pointsDistations);
                findMinDistation();
                return allDistances;
        }

    }

}

function findMinDistation() {
    debugger
    if (allDistances.length == geocoderLocationList.length) {
        for (var i = 0; i < allDistances.length; i++) {

        }
    } else {
        return;
    }
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

function directionsRendererFunction(map, response, routeIndex) {
    // fieldDistanceValue.innerHTML = 'Distance: ' + routeIndex.textInfo.distance;
    // fieldDurationValue.innerHTML = 'Duration: ' + routeIndex.textInfo.duration;
    debugger
    return new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        routeIndex: routeIndex.index,
        suppressMarkers: true,
        preserveViewport: true
    });
}

// function displayFilterWaypoints(response) {
//     var waypointArr = [];
//     for (var j = 0; j < response.routes.length; j++) {
//         for (var i = 0; i < response.routes[j].waypoint_order.length; i++) {
//             waypointArr.push(locationList[response.routes[j].waypoint_order[i]]);
//         }
//     }    
//     waypointsList.innerHTML = waypointArr.map(function (item) {
//         return '<p>' + item + '</p>'
//     }).join('');
//     return;
// }

function calculateAndDisplayRoute(directionsService, directionsDisplay, map, obj) {
    var clickBtnValue = obj.value;
    findDistations();
    for (var i = 0, parts = [], max = 24; i < geocoderLocationList.length; i = i + max) {
        parts.push(geocoderLocationList.slice(i, i + max + 1));
    }

    for (var i = 0; i < parts.length; i++) {
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++) {
            debugger
            waypoints.push({
                location: parts[i][j],
                stopover: false
            });
        }

        directionsService.route({
            origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            travelMode: 'DRIVING',
            provideRouteAlternatives: true,
            waypoints: waypoints,
            optimizeWaypoints: false
        }, function (response, status) {
            if (status === 'OK') {
                debugger
                switch (clickBtnValue) {
                    case 'Get min distance':
                        calculateMinDistance(response.routes);
                        //displayFilterWaypoints(response);
                        directionsRendererFunction(map, response, minDistance);
                        break;
                    case 'Get min duration':
                        calculateMinDuration(response.routes);
                        //displayFilterWaypoints(response);
                        directionsRendererFunction(map, response, minDuration);
                        break;
                    default:
                        break;
                }
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    debugger

    if (clickBtnValue != 'Get min distance') {
        submitButton.value = 'Get min distance';
    } else {
        submitButton.value = 'Get min duration';
    }
}