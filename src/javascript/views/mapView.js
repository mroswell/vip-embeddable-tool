var View = require('./view.js');
var api  = require('../api.js');

module.exports = View.extend({

  $id : 'map-view',

  template : require('./templates/map.hbs'),

  events: {
    '.nav click' : 'back',
    '#more-locations click' : 'moreLocations'
  },

  onRender: function(options) {
    var addressObj = options.data.normalizedInput;
    var address = '';
    for (var key in addressObj) address += addressObj[key];

    this._encodeAddressAndInitializeMap(address);
  },

  _encodeAddressAndInitializeMap : function(address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var options = {
          zoom: 12,
          center: results[0].geometry.location,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), options);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        })
        setTimeout(function() {
          document.querySelector('#map-canvas div div a div img').style.display='none';
          document.querySelector('#map-canvas div div div div a').style.display='none';
          document.querySelector('#map-canvas div div div div span').style.display='none';
          Array.prototype.forEach.call(document.querySelectorAll('.gmnoprint div'), function(el) {
            el.style.display='none';
          });
        }, 500)
      }
    });
  },

  moreLocations: function() {
    this.triggerRouteEvent('moreLocations');
  },

  back: function() {
    this.triggerRouteEvent('mapViewBack');
  }

});