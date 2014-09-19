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
      
      window.appOptions = {
        modal : typeof options.modal !== 'undefined' ? options.modal : true,
        officialOnly : typeof options.officialOnly !== 'undefined' ? options.officialOnly : 'false',
        alert : typeof options.alert !== 'undefined' ? options.alert : null,
        logo : typeof options.logo  !== 'undefined' ? options.logo : './images/voter-information-project.png',
        smallLogo : typeof options.smallLogo !== 'undefined' ? options.smallLogo : './images/vip-logo.png',
        width : typeof options.width !== 'undefined' ? options.width : 640,
        height : typeof options.height !== 'undefined' ? options.height : 480,
        assets : text
      };
      // var colors = typeof options.colors !== 'undefined' ? options.colors : 

      addressView
        .onRouteEvent('addressViewSubmit', function(response) {
          data = response;
          window.console && console.log(data);
          window.history && history.pushState && history.pushState(null, null, '?polling-location');
          $(window).on('popstate', function() {
            router.navigate(addressView, mapView, appOptions);
            $('#_vitModal').hide();
          }.bind(this));
          appOptions['data'] = data;
          router.navigate(mapView, addressView, appOptions);
        });

      mapView
        .onRouteEvent('mapViewBack', function() {
          // if the user chose the election, reroute to the election choice view
          // else go back to the address entry view
          router.navigate(addressView, mapView, appOptions);
        })
        .onRouteEvent('mapViewRerender', function() {
          appOptions['data'] = data;
          router.navigate(mapView, mapView, appOptions)
        })
        .onRouteEvent('mapViewSubmit', function(response) {
          data = response;
          appOptions['data'] = data;

          // render the elections view if there's more than one election
          // returned for the entered address, otherwise render the map view
          if (typeof data.otherElections !== 'undefined') {
            router.navigate(electionsView, mapView, appOptions);
          } else router.navigate(mapView, mapView, appOptions);
        });

      if (options.json) {
        $.getJSON(options.json, function(newText) {
            appOptions['assets'] = newText;
            // figure this out.
            addressView.render(appOptions);
        });
      } else {
        addressView.render(appOptions);
      }


    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();