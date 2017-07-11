'use strict';

var geocoder,
    map,
    originAutocomplete,
    destinationAutocomplete,
    addWaypointsAutocomplete,
    minDistance,
    totalDistance = 0,
    locationList = [],
    geocoderLocationList = [],
    waypointsList = document.getElementById('waypoints-list'),
    originInput = document.getElementById('origin-input'),
    destinationInput = document.getElementById('destination-input'),
    submitButton = document.getElementById('submit-button'),
    waypointsInput = document.getElementById('waypoints-input'),
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
    addWaypointsAutocomplete = new google.maps.places.Autocomplete(
        waypointsInput, {
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

    originAutocomplete.addListener('place_changed', handleChangeOrigin);
    destinationAutocomplete.addListener('place_changed', handleChangeDestination);
    addWaypointsAutocomplete.addListener('place_changed', addValueToList);

    submitButton.addEventListener('click', onClickSubmit);
    clearButton.addEventListener('click', onClickClear);
}

function setMarkers(pointPosition, pointLabel) {
    return new google.maps.Marker({
        position: pointPosition,
        map: map,
        label: pointLabel
    });
}

function handleChangeOrigin() {
    var pointLabel = 'A';
    var address = originAutocomplete.getPlace().name;
    getGeoCode(address).then(function (response) {
        setMarkers(response[0].geometry.location, pointLabel);
    }).catch(function (error) {
        window.console.error(error);
    })
}

function handleChangeDestination() {
    var pointLabel = 'B';
    var address = destinationAutocomplete.getPlace().name;
    getGeoCode(address).then(function (response) {
        setMarkers(response[0].geometry.location, pointLabel);
    }).catch(function (error) {
        window.console.error(error);
    })
}

function getGeoCode(address) {
    return new Promise(function (resolve, reject) {
        geocoder.geocode({
            'address': address
        }, function (results, status) {
            if (status == 'OK') {
                resolve(results)
                //setMarkers(results[0].geometry.location, pointLabel);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        })
    })
}

function addValueToList() {
    //add waypoint to list
    debugger
    if (addWaypointsAutocomplete.getPlace().name) {
        locationList.push(addWaypointsAutocomplete.getPlace().name);
    } else {
        return;
    }

    //display choosen waypoints list
    waypointsList.innerHTML = locationList.map(function (item, index) {
        return '<p>' + (index + 1) + '. ' + item + '</p>'
    }).join('');

    //get geocode and display marker
    var address = addWaypointsAutocomplete.getPlace().name;
    getGeoCode(address).then(function (response) {
        geocoderLocationList.push({
            location: response[0].geometry.location,
            placeId: response[0].place_id,
            address: response[0].formatted_address
        });
        for (var i = 0; i < geocoderLocationList.length; i++) {
            var pointLabel = `${i+1}`;
            setMarkers(geocoderLocationList[i].location, pointLabel);
        }
        return geocoderLocationList;
    }).catch(function (error) {
        window.console.error(error);
    })

    waypointsInput.value = null;
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

        getDistanceBetweenPoints(service, [geocoderLocationList[i].location], tempWaypointsArray).then(function (response) {
            var childWaypoints = [];
            for (var i = 0; i < response.destinationAddresses.length; i++) {
                debugger
                childWaypoints.push({
                    pointAddress: response.destinationAddresses[i], //child waypoint address
                    distance: response.rows[0].elements[i].distance.value //distance from current waypoint to child waypoint
                })
            }
            var currentWaypoint = {
                pointAddress: response.originAddresses[0], //current waypoint address
                childWaypoints: childWaypoints //childs waypoints array
            }
            parentWaypoints.push(currentWaypoint); //all parent waypoints
            findMinDistation(directionsService, directionsDisplay, parentWaypoints);
        }).catch(function (error) {
            window.console.error(error);
        })
    }
}

function getDistanceBetweenPoints(service, origins, destinations) {
    return new Promise(function (resolve, reject) {
        service.getDistanceMatrix({
            origins: origins, //current waypoint
            destinations: destinations, //waypoints array
            travelMode: 'DRIVING'
        }, function (results, status) {
            if (status == 'OK') {
                resolve(results)
                //setMarkers(results[0].geometry.location, pointLabel);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        })
    })
}

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

        for (var i = 0; i < parts.length; i++) {
            var waypoints = [];
            for (var j = 1; j < parts[i].length - 1; j++) {
                waypoints.push({
                    location: parts[i][j],
                    stopover: false
                });
            }
            directionsRequest(directionsService, parts[i][0], parts[i][parts[i].length - 1], waypoints).then(function (response) {
                calculateMinDistance(response.routes);
                fieldDistanceValue.innerHTML = 'Distance: ' + (totalDistance / 1000) + ' km';
                directionsRendererFunction(response);
            }).catch(function (error) {
                window.console.error(error);
            })
        }
        return finalyWaypointsArray;
    } else {
        return;
    }
}

function compareDistance(originPoint, destinationPoint) {
    return originPoint.distance - destinationPoint.distance;
}

function directionsRequest(directionsService, origin, destination, waypoints) {
    return new Promise(function (resolve, reject) {
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING',
            provideRouteAlternatives: false,
            waypoints: waypoints,
            optimizeWaypoints: false
        }, function (response, status) {
            if (status === 'OK') {
                resolve(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    })
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
    return new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        routeIndex: minDistance.index,
        suppressMarkers: true,
        preserveViewport: true
    });
}