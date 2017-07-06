var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function initialize() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var minsk = new google.maps.LatLng(53.5500, 27.3300);
  var mapOptions = {
    zoom: 7,
    center: minsk
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsDisplay.setMap(map);
}

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {
            lat: 53.5500,
            lng: 27.3300
        },
        zoom: 11
    });

    new AutocompleteDirectionsHandler(map);
}
