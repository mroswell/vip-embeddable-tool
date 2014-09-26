module.exports = (function() {
  var data
    , addressView = require('./views/addressView.js')
    , mapView     = require('./views/mapView.js')
    , apiRequest  = require('./api.js')
    , text        = require('./config.js')
    , $           = require('jquery');
window.$ = $

  return {
    start: function(config) {
      var router = this;

      var options = {
        modal: true,
        officialOnly: false,
        alert: null,
        test: false,
        key: 'AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8',
        title: 'Voting Information Project',
        subtitle: '',
        logo: 'https://s3.amazonaws.com/vip-voter-information-tool/images/voting-information-project.png',
        smallLogo: 'https://s3.amazonaws.com/vip-voter-information-tool/images/vip-logo.png',
        language: 'en',
        width: 640,
        height: 480,
        productionDataOnly: true,
        assets: text
      };
      $.extend(options, config);

      addressView
        .onRouteEvent('addressViewSubmit', function(response) {
          data = response;
          window.console && console.log(data);
          window.history && history.pushState && history.pushState(null, null, '?polling-location');
          $(window).on('popstate', function() {
            router.navigate(addressView, mapView, options);
            $('#_vitModal').hide();
          }.bind(this));
          $.extend(options, { data: data })
          router.navigate(mapView, addressView, options);
        });

      mapView
        .onRouteEvent('mapViewBack', function() {
          // if the user chose the election, reroute to the election choice view
          // else go back to the address entry view
          router.navigate(addressView, mapView, options);
        })
        .onRouteEvent('mapViewRerender', function() {
          $.extend(options, { data: data })
          router.navigate(mapView, mapView, options)
        })
        .onRouteEvent('mapViewSubmit', function(response) {
          data = response;
          $.extend(options, { data: data })
          // render the elections view if there's more than one election
          // returned for the entered address, otherwise render the map view
          router.navigate(mapView, mapView, options);
        });

      if (options.json) {
        $.getJSON(options.json, function(newText) {
          $.extend(options, { assets: newText });
          addressView.render(options);
        });
      } else addressView.render(options);
    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();