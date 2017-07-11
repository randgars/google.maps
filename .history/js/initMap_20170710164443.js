'use strict';

var geocoder,
    map,
    minDistance,
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

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        }, function() {
            handleLocationError(true);
        });
    } else {
        handleLocationError(false);
    }
}

function handleLocationError(browserHasGeolocation) {
    alert(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
}

function initMap() {
    var center = new google.maps.LatLng(41.850033, -87.6500523);
    var mapOptions = {
        zoom: 7,
        center: center
    }
    return map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function initialize() {
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var directionsService = new google.maps.DirectionsService();
    var service = new google.maps.DistanceMatrixService;
    geocoder = new google.maps.Geocoder();
    
    initMap();
    getCurrentLocation();

    var newLocationInput = new google.maps.places.Autocomplete(
        locationInput, {
            placeIdOnly: true
        });

    var onClickSubmit = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, service);
    };

    var onClickClear = function () {
        locationList.length = 0;
        geocoderLocationList.length = 0;
        waypointsList.innerHTML = '';
        initMap();
    }
    submitButton.addEventListener('click', onClickSubmit);
    addButton.addEventListener('click', addValueToList);
    clearButton.addEventListener('click', onClickClear);
}

function addValueToList() {
    //add waypoint to list
    debugger
    if (locationInput.value) {
        locationList.push(locationInput.value);
    } else {
        return;
    }
    
    //display choosen waypoints list
    waypointsList.innerHTML = locationList.map(function (item, index) {
        return '<p>' + (index + 1) + '. ' + item + '</p>'
    }).join('');

    //get geocode and display marker
    geocoder.geocode({
            'address': locationInput.value
        }, function (results, status) {
            if (status == 'OK') {
                debugger
                geocoderLocationList.push({location: results[0].geometry.location, placeId: results[0].place_id, address: results[0].formatted_address});
                for (var i = 0; i < geocoderLocationList.length; i++) {
                    new google.maps.Marker({
                        position: geocoderLocationList[i].location,
                        map: map,
                        label: `${i+1}`
                    });
                }
                return geocoderLocationList;
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        })
        
    locationInput.value = null;
}

function findDistations(directionsService, directionsDisplay, map) {
    
}

function compareDistance(pointA, pointB) {
    return pointA.distance - pointB.distance;
}

function directionsRequest(directionsService, directionsDisplay, map) {
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
            provideRouteAlternatives: false,
            waypoints: waypoints,
            optimizeWaypoints: true
        }, function (response, status) {
            if (status === 'OK') {
                calculateMinDistance(response.routes);
                directionsRendererFunction(map, response, minDistance);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
}
function findMinDistation(directionsService, directionsDisplay, map) {
    debugger
    if (allDistances.length == geocoderLocationList.length) {
            var i = 0;
            var fullFinalyList = [allDistances[i].point];
            while (allDistances.length > 0) {
                var tempDistances = allDistances[i].distances;
                tempDistances.sort(compareDistance);
                debugger
                var newPoint = tempDistances[0].point;
                fullFinalyList.push(newPoint);
                var previousPoint = allDistances[i].point;
                allDistances.splice(i, 1);
                for (var j = 0; j < allDistances.length; j++) {
                    for (var k = 0; k < allDistances[j].distances.length; k++) {
                        if (allDistances[j].distances[k].point == previousPoint) {
                            allDistances[j].distances.splice(k, 1);
                        }
                    }
                    debugger
                    if (allDistances[j].point == newPoint) {
                        i = j;
                    }
                }
            }
            debugger

            for (var i = 0, parts = [], max = 24; i < fullFinalyList.length; i = i + max) {
                parts.push(fullFinalyList.slice(i, i + max + 1));
            }
            directionsRequest(directionsService, directionsDisplay, map);
            


            return fullFinalyList;
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

function calculateAndDisplayRoute(directionsService, directionsDisplay, map) {
    for (var i = 0; i < geocoderLocationList.length; i++) {
        var tempArr = Object.assign([], geocoderLocationList);
        tempArr.splice(i, 1);
        debugger
        service.getDistanceMatrix({
            origins: [geocoderLocationList[i]],
            destinations: tempArr,
            travelMode: 'DRIVING'
        }, callback);

        function callback(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                debugger
                var result = response.rows[0].elements;
                var pointDistancesArray = [];
                for (var i = 0; i < result.length; i++) {
                    debugger
                    tempArr = Object.assign([], geocoderLocationList);
                    tempArr.splice(i, 1);
                    pointDistancesArray.push({point: tempArr[i], distance: result[i].distance.value, name: response.destinationAddresses[i]});
                };
                for (var j = 0; j < response; j++) {
                    pointsDistations = {
                        point: geocoderLocationList[j],
                        distances: pointDistancesArray,
                        name: response.originAddresses[0]
                    };
                }
                // allDistances undefined
            }
            allDistances.push(pointsDistations);
            debugger
            findMinDistation(directionsService, directionsDisplay, map);
        }
    }
}