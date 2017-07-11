'use strict';

var geocoder,
    map,
    originAutocomplete,
    destinationAutocomplete,
    minDistance,
    totalDistance = 0,
    locationList = [],
    geocoderLocationList = [],
    waypointsList = document.getElementById('waypoints-list'),
    originInput = document.getElementById('origin-input'),
    destinationInput = document.getElementById('destination-input'),
    locationInput = document.getElementById('location-input'),
    submitButton = document.getElementById('submit-button'),
    addButton = document.getElementById('add-button'),
    clearButton = document.getElementById('clear-button'),
    fieldDistanceValue = document.getElementById('distance-value'),
    fieldDurationValue = document.getElementById('duration-value');

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        }, function () {
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
    var center = new google.maps.LatLng(53.90453979999999, 27.561524400000053);
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
    //getCurrentLocation();

    originAutocomplete = new google.maps.places.Autocomplete(
        originInput, {
            placeIdOnly: true
        });
    destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, {
            placeIdOnly: true
        });
    new google.maps.places.Autocomplete(
        locationInput, {
            placeIdOnly: true
        });

    var onClickSubmit = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay, service);
    };

    var onClickClear = function () {
        locationList.length = 0;
        geocoderLocationList.length = 0;
        waypointsList.innerHTML = '';
        initMap();
    };

    var onHandleChangedOrigin = function () {
        handleChange(this);
    };
    var onHandleChangedDestination = function () {
        handleChange(this);
    };

    originAutocomplete.addListener('place_changed', onHandleChangedOrigin);
    destinationAutocomplete.addListener('place_changed', onHandleChangedDestination);

    submitButton.addEventListener('click', onClickSubmit);
    addButton.addEventListener('click', addValueToList);
    clearButton.addEventListener('click', onClickClear);
}

function handleChange(input) {
    debugger
    var place = autocomplete.getPlace();
    geocoder.geocode({
        'address': input.value
    }, function (results, status) {
        if (status == 'OK') {
            if (input.id == 'origin-input') {
                return new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    label: 'A'
                });
            } else {
                return new google.maps.Marker({
                    position: results[0].geometry.location,
                    map: map,
                    label: 'B'
                });
            }
            
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    })
}

function addValueToList() {
    //add waypoint to list
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
            geocoderLocationList.push({
                location: results[0].geometry.location,
                placeId: results[0].place_id,
                address: results[0].formatted_address
            });
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

function calculateAndDisplayRoute(directionsService, directionsDisplay, service) {
    //find distance between waypoints
    var parentWaypoints = [];
    for (var i = 0; i < geocoderLocationList.length; i++) {
        var tempWaypointsArray = [];
        for (var j = 0; j < geocoderLocationList.length; j++) {
            tempWaypointsArray.push(geocoderLocationList[j].location); //clone main waypoints array
        }
        tempWaypointsArray.splice(i, 1); //delete current waypoint
        service.getDistanceMatrix({
            origins: [geocoderLocationList[i].location], //current waypoint
            destinations: tempWaypointsArray, //waypoints array
            travelMode: 'DRIVING'
        }, callback);

        function callback(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                var childWaypoints = [];
                for (var i = 0; i < response.destinationAddresses.length; i++) {
                    childWaypoints.push({
                        pointAddress: response.destinationAddresses[i], //child waypoint address
                        distance: response.rows[0].elements[i].distance.value //distance from current waypoint to child waypoint
                    })
                }
                var currentWaypoint = {
                    pointAddress: response.originAddresses[0], //current waypoint address
                    childWaypoints: childWaypoints //childs waypoints array
                }
            }
            parentWaypoints.push(currentWaypoint); //all parent waypoints
            findMinDistation(directionsService, directionsDisplay, parentWaypoints);
        }
    }
}

// function idGenerator() {
//     return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
// }

function findMinDistation(directionsService, directionsDisplay, parentWaypoints) {
    if (parentWaypoints.length == geocoderLocationList.length) {
        var i = 0;
        var finalyWaypointsArray = [parentWaypoints[i].pointAddress];
        while (parentWaypoints.length > 0) {
            if (parentWaypoints[i].childWaypoints.length == 0) {
                break;
            }
            var tempChildWaypoints = parentWaypoints[i].childWaypoints;
            tempChildWaypoints.sort(compareDistance);
            var nextWaypoint = tempChildWaypoints[0].pointAddress;
            finalyWaypointsArray.push(nextWaypoint);
            var previousWaypoint = parentWaypoints[i].pointAddress;
            parentWaypoints.splice(i, 1);
            for (var j = 0; j < parentWaypoints.length; j++) {
                for (var k = 0; k < parentWaypoints[j].childWaypoints.length; k++) {
                    if (parentWaypoints[j].childWaypoints[k].pointAddress == previousWaypoint) {
                        parentWaypoints[j].childWaypoints.splice(k, 1);
                    }
                }
                if (parentWaypoints[j].pointAddress == nextWaypoint) {
                    i = j;
                }
            }
        }
        finalyWaypointsArray.unshift(originInput.value);
        finalyWaypointsArray.push(destinationInput.value);
        var parts = [];
        for (var i = 0, max = 24; i < finalyWaypointsArray.length; i = i + max) {
            parts.push(finalyWaypointsArray.slice(i, i + max + 1));
        }
        directionsRequest(directionsService, directionsDisplay, parts);
        debugger
        return finalyWaypointsArray;
    } else {
        return;
    }
}

function compareDistance(originPoint, destinationPoint) {
    return originPoint.distance - destinationPoint.distance;
}

function directionsRequest(directionsService, directionsDisplay, parts) {
    for (var i = 0; i < parts.length; i++) {
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++) {
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
            optimizeWaypoints: false
        }, function (response, status) {
            if (status === 'OK') {
                calculateMinDistance(response.routes);
                directionsRendererFunction(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
}

function calculateMinDistance(routes) {
    var distanceValues = routes.map(function (item) {
        return item.legs[0]
    });

    minDistance = {
        distance: distanceValues[0].distance.value,
        index: 0
    };

    for (var i = 0; i < distanceValues.length; i++) {
        if (distanceValues[i].distance.value < minDistance.distance) {
            minDistance = {
                distance: distanceValues[i].distance.value,
                index: i
            };
        }
    }
    totalDistance += minDistance.distance
    return minDistance;
}

function directionsRendererFunction(response) {
    fieldDistanceValue.innerHTML = 'Distance: ' + totalDistance;
    return new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        routeIndex: minDistance.index,
        suppressMarkers: true,
        preserveViewport: true
    });
}