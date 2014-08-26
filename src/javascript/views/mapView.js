var View = require('./view.js');
var api  = require('../api.js');

module.exports = View.extend({

  $id : 'map-view',

  template : require('./templates/map.hbs'),

  events: {
    '.nav click' : 'back',
    '#more-locations click' : 'moreLocations',
    '#voter-resources click' : 'voterResources'
  },

  onAfterRender: function(options) {
    if (options.data.pollingLocations && options.data.pollingLocations.length) {
      var address = this._parseAddress(options.data.pollingLocations[0].address);
      this._encodeAddressAndInitializeMap(options.data.pollingLocations[0].address);
      this._calculateDistance(
        options.data.normalizedInput,
        options.data.pollingLocations[0].address,
        function(distance) {
          document.querySelector('#map-view .address-distance').innerText = (Math.round(distance) / 1000) + ' mi';
      });


    } else this._encodeAddressAndInitializeMap("36 E. 20th St. New York, NY");
  },

  _encodeAddressAndInitializeMap : function(address) {
    var that = this;
    this._geocode(address, function(position) {
      var options = {
        zoom: 12,
        center: position,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false
      };
      var map = new google.maps.Map(document.getElementById("map-canvas"), options);
      var marker = new google.maps.Marker({
        map: map,
        position: position
      })
    })
    // var geocoder = new google.maps.Geocoder();
    // geocoder.geocode({
    //   'address': this._parseAddress(address)
    // }, function(results, status) {
    //   if (status == google.maps.GeocoderStatus.OK) {
    //     var options = {
    //       zoom: 12,
    //       center: results[0].geometry.location,
    //       mapTypeId: google.maps.MapTypeId.ROADMAP,
    //       zoomControl: false,
    //       mapTypeControl: false,
    //       streetViewControl: false
    //     };
    //     var map = new google.maps.Map(document.getElementById("map-canvas"), options);
    //     var marker = new google.maps.Marker({
    //       map: map,
    //       position: results[0].geometry.location
    //     })
    //     setTimeout(function() {
    //       document.querySelector('#map-canvas div div a div img').style.display='none';
    //       document.querySelector('#map-canvas div div div div a').style.display='none';
    //       document.querySelector('#map-canvas div div div div span').style.display='none';
    //       Array.prototype.forEach.call(document.querySelectorAll('.gmnoprint div'), function(el) {
    //         el.style.display='none';
    //       });
    //     }, 500)
    //   }
    // });
  },

  _parseAddress: function(address) {
    if (typeof address === 'object') {
      var parsedAddress = '';
      for (var key in address) parsedAddress += address[key] + ' ';
      return parsedAddress;
    } else return address;
  },

  _calculateDistance: function(fromLocation, toLocation, callback) {
    var that = this;
    this._geocode(fromLocation, function(fromCoords) {
      that._geocode(toLocation, function(toCoords) {
        callback(google.maps.geometry.spherical.computeDistanceBetween(fromCoords, toCoords));
      });
    })
  },

  _geocode: function(location, callback) {
    var that = this;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': this._parseAddress(location)
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) callback(results[0].geometry.location);
    });
  },

  moreLocations: function() {
    this.triggerRouteEvent('moreLocations');
  },

  voterResources: function() {
    this.triggerRouteEvent('voterResources');
  },

  back: function() {
    this.triggerRouteEvent('mapViewBack');
  }

});