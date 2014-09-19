module.exports = (function() {
  var currentView;
  var data;
  var elections;
  var $container       = document.body;
  var addressView      = require('./views/addressView.js');
  var mapView          = require('./views/mapView.js');
  var apiRequest       = require('./api.js');
  var text             = require('./config.js');
  var $ = require('jquery');

  // function parseOption(option, defaultVal) {
    // var val = (typeof defaultVal !== 'undefined' ? defaultVal : null);
    // if (typeof this[option] !== 'undefined') ?  : null;
  // }
  

  return {
    start: function(options) {
      var router = this;

      // $.each(options, function(option) {
      //   parseOption.call(options, option);
      // })
      
      var modal = typeof options.modal !== 'undefined' ? options.modal : true;
      var alert = typeof options.alert !== 'undefined' ? options.alert : null;
      var logo  = typeof options.logo  !== 'undefined' ? options.logo : null;

      addressView
        .onRouteEvent('addressViewSubmit', function(response) {
          data = response;
          window.console && console.log(data);
          window.history && history.pushState && history.pushState(null, null, '?polling-location');
          $(window).on('popstate', function() {
            router.navigate(addressView, mapView, {
              assets: text
            });
            $('#_vitModal').hide();
          }.bind(this));
          router.navigate(mapView, addressView, {
            data: data,
            modal: modal,
            alert: alert,
            assets: text
          });
        });

      mapView
        .onRouteEvent('mapViewBack', function() {
          // if the user chose the election, reroute to the election choice view
          // else go back to the address entry view
          router.navigate(addressView, mapView, {
            assets: text
          });
        })
        .onRouteEvent('mapViewRerender', function() {
          router.navigate(mapView, mapView, { data: data })
        })
        .onRouteEvent('mapViewSubmit', function(response) {
          data = response;

          // render the elections view if there's more than one election
          // returned for the entered address, otherwise render the map view
          if (typeof data.otherElections !== 'undefined') {
            router.navigate(electionsView, mapView, { data: data });
          } else router.navigate(mapView, mapView, { 
            data: data,
            modal: modal,
            assets: text
          });
        });

      if (options.textFile) {
        $.getJSON(options.textFile, function(newText) {
            addressView.render({ assets: newText });
        });
      } else {
        addressView.render({ assets: text });
      }


    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();