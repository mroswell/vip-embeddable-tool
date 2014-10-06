module.exports = (function() {
  var data
    , addressView = require('./views/addressView.js')
    , mapView     = require('./views/mapView.js')
    , apiRequest  = require('./api.js')
    , text        = require('./config.js')
    , $           = require('jquery')
    , csv         = require('csv-string');

  function fetchVoterIdData (state, callback) {
    $.ajax({
      url: 'https://s3.amazonaws.com/vip-voter-information-tool/voter-id/voterIdInfo.csv',
      cache: false,
      success: function(resp) {
        var csvArray = csv.parse(resp);
        var questions = csvArray[0];
        var states = csvArray.slice(1);
        var stateData = Array.prototype.filter.call(states, function(entry) {
          return entry[0] === state;
        });
        var voterIdInfo = {};
        var voterIdLink;
        stateData.forEach(function(state) {
          questions.forEach(function(question, index) {
            if (question !== 'Complete Voter ID Information') {
              var answer = state[index];
              for (var i = 0, len = answer.length; i < len; i++) {
                if (answer.charCodeAt(i) === 65533) {
                  var newStr = answer.slice(0, i) + answer.slice(i + 1, answer.length);
                  answer = newStr;
                }
              }
              voterIdInfo[index] = {
                'question' : question,
                'answer': answer
              }
            } else voterIdLink = state[index];
          });
        });

        callback({ data: voterIdInfo, link: voterIdLink });
      }
    });
  }

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
      if (options.productionOnly === false) options.productionDataOnly = options.productionOnly;

      addressView
        .onRouteEvent('addressViewSubmit', function(response) {
          data = response;

          fetchVoterIdData(data.normalizedInput.state, function(voterId) {
            data.voterId = voterId.data;
            data.voterIdLink = voterId.link;
            // window.console && console.log(data);
            window.history && history.pushState && history.pushState(null, null, '?polling-location');
            $(window).on('popstate', function() {
              router.navigate(addressView, mapView, options);
              $('#_vitModal').hide();
            }.bind(this));
            $.extend(options, { data: data })
            router.navigate(mapView, addressView, options);
          });
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

          fetchVoterIdData(data.normalizedInput.state, function(voterId) {
            data.voterId = voterId.data;
            data.voterIdLink = voterId.link;

            $.extend(options, { data: data })
            router.navigate(mapView, mapView, options);
          });
        });

      if ((options.language && options.language !== 'en') || !navigator.language.match(/en/)) {
        var language = options.language || navigator.language;
        var supportedLanguages = ['en', 'es'];
        if (supportedLanguages.indexOf(language) === -1) addressView.render(options);
        var url = 'https://s3.amazonaws.com/vip-voter-information-tool/languages/' + language + '-config.json';

        $.ajax({
          url: url,
          // dataType: 'jsonp',
          cache: false,
          success: function(newText) {
          $.extend(options, { assets: JSON.parse(newText) });
          addressView.render(options);
          }
        });
      // } else if (!navigator.language.match(/en/)) {
      //   var language = navigator.language;

      } else addressView.render(options);
    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();