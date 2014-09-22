module.exports = (function() {
  var data
    , addressView = require('./views/addressView.js')
    , mapView     = require('./views/mapView.js')
    , apiRequest  = require('./api.js')
    , text        = require('./config.js')
    , $           = require('jquery');

  return {
    start: function(options) {
      var router = this;
      
      var appOptions = {
        modal : typeof options.modal !== 'undefined' ? options.modal : true,
        officialOnly : typeof options.officialOnly !== 'undefined' ? options.officialOnly : true,
        alert : typeof options.alert !== 'undefined' ? options.alert : null,
        title : typeof options.title !== 'undefined' ? options.title : 'Voting Information Tool',
        subtitle: typeof options.subtitle !== 'undefined' ? options.subtitle : '',
        logo : typeof options.logo  !== 'undefined' ? options.logo : './images/voter-information-project.png',
        smallLogo : typeof options.smallLogo !== 'undefined' ? options.smallLogo : './images/vip-logo.png',
        language: typeof options.language !== 'undefined' ? options.language : 'en',
        width : typeof options.width !== 'undefined' ? options.width : 640,
        height : typeof options.height !== 'undefined' ? options.height : 480,
        assets : text
      };

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
            addressView.render(appOptions);
        });
      } else addressView.render(appOptions);
    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();