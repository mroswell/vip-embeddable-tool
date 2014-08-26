var View = require('./view.js');

module.exports = View.extend({

  $id: 'more-locations-view',

  template: require('./templates/extended-map.hbs'),

  events: {
    '.nav click' : 'back',
    '#map-close-button click' : 'back'
  },

  map: null,

  _initializeMap: function(addresses) {
    var moreLocationsView = this;
    var geocoder = new google.maps.Geocoder();
    console.log(addresses)
    addresses.forEach(function(address, i) {
      geocoder.geocode({ 'address': address }, function(results, status) {
        if (status !== google.maps.GeocoderStatus.OK) return;
        // center map around the first supplied location
        if (i === 0) {
          var options = {
            zoom: 12,
            center: results[0].geometry.location,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false
          };
          moreLocationsView.map = new google.maps.Map(document.querySelector("#more-locations-view #map-canvas"), options);
        }

        // set a marker on the map for this current location
        var marker = new google.maps.Marker({ map: moreLocationsView.map, position: results[0].geometry.location });
        var infoWindow = new google.maps.InfoWindow({ content: address });
        google.maps.event.addListener(marker, 'click', function() {
          moreLocationsView.map.setCenter(marker.getPosition());
          infoWindow.open(moreLocationsView.map, marker);
        });

      });
    })

  },

  onAfterRender: function(options) {
    var locationsArray = [];
    var addressObjs = options.data.pollingLocations;
    addressObjs.forEach(function(addressObj) {
      var address = '';
      for (var key in addressObj.address) address += ' ' + addressObj.address[key];
      locationsArray.push(address); 
    });
    console.log(locationsArray)

    this._initializeMap(locationsArray);
  },

  back: function() {
    this.triggerRouteEvent('moreLocationsViewBack');
  }

});