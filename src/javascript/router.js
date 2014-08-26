module.exports = (function() {
  var currentView;
  var data;
  var elections;
  var $container       = document.body;
  var addressView      = require('./views/addressView.js');
  var electionsView     = require('./views/electionsView.js');
  var informationView  = require('./views/informationView.js');
  var mapView          = require('./views/mapView.js');
  var moreLocationsView = require('./views/moreLocationsView.js')
  var apiRequest       = require('./api.js');

  return {
    start: function() {
      var router = this;

      addressView
        .onRouteEvent('addressViewSubmit', function(response) {
          data = response;
          console.log(data)

          // render the elections view if there's more than one election
          // returned for the entered address, otherwise render the map view
          if (typeof data.otherElections !== 'undefined') {
            router.navigate(electionsView, addressView, { data: data });
          } else router.navigate(mapView, addressView, { data: data });
        });

      electionsView
        .onRouteEvent('electionsViewSubmit', function(election) {
          // if its the main returned election, continue to the map view
          // else resubmit the query with the chosen election and route to the mapview
          // for now assume main election
          router.navigate(mapView, addressView, { data: data });
        });

      mapView
        .onRouteEvent('mapViewBack', function() {
          // if the user chose the election, reroute to the election choice view
          // else go back to the address entry view
          router.navigate(addressView, mapView);
        })
        .onRouteEvent('moreLocations', function() {
          router.navigate(moreLocationsView, mapView, { data: data });
        });

      electionsView
        .onRouteEvent('electionsViewBack', function() {
          router.navigate(addressView, electionsView);
        });

      moreLocationsView
        .onRouteEvent('moreLocationsViewBack', function() {
          router.navigate(mapView, moreLocationsView, { data: data });
        })

      addressView.render();
    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();