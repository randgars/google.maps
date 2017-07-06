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


    var stations = [
        {lat: 48.9812840, lng: 21.2171920, name: 'Station 1'},
        {lat: 48.9832841, lng: 21.2176398, name: 'Station 2'},
        {lat: 48.9856443, lng: 21.2209088, name: 'Station 3'},
        {lat: 48.9861461, lng: 21.2261563, name: 'Station 4'},
        {lat: 48.9874682, lng: 21.2294855, name: 'Station 5'},
        {lat: 48.9909244, lng: 21.2295512, name: 'Station 6'},
        {lat: 48.9928871, lng: 21.2292352, name: 'Station 7'},
        {lat: 48.9921334, lng: 21.2246742, name: 'Station 8'},
        {lat: 48.9943196, lng: 21.2234792, name: 'Station 9'},
        {lat: 48.9966345, lng: 21.2221262, name: 'Station 10'},
        {lat: 48.9981191, lng: 21.2271386, name: 'Station 11'},
        {lat: 49.0009168, lng: 21.2359527, name: 'Station 12'},
        {lat: 49.0017950, lng: 21.2392890, name: 'Station 13'},
        {lat: 48.9991912, lng: 21.2398272, name: 'Station 14'},
        {lat: 48.9959850, lng: 21.2418410, name: 'Station 15'},
        {lat: 48.9931772, lng: 21.2453901, name: 'Station 16'},
        {lat: 48.9963512, lng: 21.2525850, name: 'Station 17'},
        {lat: 48.9985134, lng: 21.2508423, name: 'Station 18'},
        {lat: 49.0085000, lng: 21.2508000, name: 'Station 19'},
        {lat: 49.0093000, lng: 21.2528000, name: 'Station 20'},
        {lat: 49.0103000, lng: 21.2560000, name: 'Station 21'},
        {lat: 49.0112000, lng: 21.2590000, name: 'Station 22'},
        {lat: 49.0124000, lng: 21.2620000, name: 'Station 23'},
        {lat: 49.0135000, lng: 21.2650000, name: 'Station 24'},
        {lat: 49.0149000, lng: 21.2680000, name: 'Station 25'},
        {lat: 49.0171000, lng: 21.2710000, name: 'Station 26'},
        {lat: 49.0198000, lng: 21.2740000, name: 'Station 27'},
        {lat: 49.0305000, lng: 21.3000000, name: 'Station 28'},
        // ... as many other stations as you need
    ];


    
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
        //map = new google.maps.Map(document.getElementById('map'), mapOptions);
        calculateAndDisplayRoute(directionsService, directionsDisplay, map, this);
    };
    var onClickAddValue = function () {
        addValueToList(map)
    }
    submitButton.addEventListener('click', onClickHandler);

    addButton.addEventListener('click', onClickAddValue);
}

function addValueToList(map) {
    if (locationInput.value) {
        locationList.push(locationInput.value);
    } else {
        return;
    }
    waypointsList.innerHTML = locationList.map(function (item) {
        return '<p>' + item + '</p>'
    }).join('');

    var promise = new Promise(function(resolve, reject) {
        geocoder.geocode( { 'address': locationInput.value }, function(results, status) {
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
        return geocoderLocationList;
    }, function (error) {
        console.log(error)
    })
    
    locationInput.value = null;
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
    fieldDistanceValue.innerHTML = 'Distance: ' + routeIndex.textInfo.distance;
    fieldDurationValue.innerHTML = 'Duration: ' + routeIndex.textInfo.duration;
    return new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        routeIndex: routeIndex.index,
        suppressMarkers: true,
        preserveViewport: true
    });
}

function displayFilterWaypoints(response) {
    var waypointArr = [];
    for (var j = 0; j < response.routes.length; j++) {
        for (var i = 0; i < response.routes[j].waypoint_order.length; i++) {
            waypointArr.push(locationList[response.routes[j].waypoint_order[i]]);
        }
    }    
    waypointsList.innerHTML = waypointArr.map(function (item) {
        return '<p>' + item + '</p>'
    }).join('');
    return;
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, map, obj) {
    var clickBtnValue = obj.value;
    

    for (var i = 0, parts = [], max = 24; i < stations.length; i = i + max) {
        parts.push(stations.slice(i, i + max + 1));
    }
    // for (var i = 0; i < locationList.length; i++) {
    //     waypoints.push({
    //         location: locationList[i],
    //         stopover: true
    //     })
    // }
    for (var i = 0; i < parts.length; i++) {
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++) {
            debugger
            waypoints.push({location: parts[i][j], stopover: false});
        }

        directionsService.route({
            origin: parts[i][0],
            destination: parts[i][parts[i].length - 1],
            travelMode: 'DRIVING',
            provideRouteAlternatives: true,
            waypoints: waypoints,
            optimizeWaypoints: true
        }, function (response, status) {
            if (status === 'OK') {
                switch (clickBtnValue) {
                    case 'Get min distance':
                        calculateMinDistance(response.routes);
                        displayFilterWaypoints(response);
                        directionsRendererFunction(map, response, minDistance);
                    case 'Get min duration':
                        calculateMinDuration(response.routes);
                        displayFilterWaypoints(response);
                        directionsRendererFunction(map, response, minDuration);
                }
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }
    

    if (clickBtnValue != 'Get min distance') {
        submitButton.value = 'Get min distance';
    } else {
        submitButton.value = 'Get min duration';
    }
}