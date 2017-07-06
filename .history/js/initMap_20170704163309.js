(function () {
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
})();
