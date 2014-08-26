var View = require('./view.js');

module.exports = View.extend({

  $id: 'more-locations-view',

  template: require('./templates/extended-map.hbs'),

  events: {
    '.nav click' : 'back'
  },

  map: null,

  _initializeMap: function(addresses) {
    var geocoder = new google.maps.Geocoder();
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
          this.map = new google.maps.Map(document.querySelector("#more-locations-view #map-canvas"), options);
        }

        // set a marker on the map for this current location
        var marker = new google.maps.Marker({ map: this.map, position: results[0].geometry.location });
      });
    })

  },

  onRender: function(options) {
    var addressObj = options.data.normalizedInput;
    var address = '';
    for (var key in addressObj) address += addressObj[key];

    this._initializeMap([address]);
  },

  back: function() {
    this.triggerRouteEvent('moreLocationsViewBack');
  }

});