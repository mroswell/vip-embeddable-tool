module.exports = (function() {
  var data
    , voterIdData
    , addressView = require('./views/addressView.js')
    , mapView     = require('./views/mapView.js')
    , apiRequest  = require('./api.js')
    , text        = require('./config.js')
    , $           = require('jquery')
    , csv         = require('csv-string')
    , xdr         = require('jquery-xdr').load($)

  var parseVoterIdData = function (state, data) {
    var csvArray = csv.parse(data);
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

    return {
      voterId: voterIdInfo,
      VoterIdLink: voterIdLink
    };
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
          $.extend(data, parseVoterIdData(data.normalizedInput.state, voterIdData));

          window.history && history.pushState && history.pushState(null, null, '?polling-location');
          $(window).on('popstate', function() {
            router.navigate(addressView, mapView, options);
            $('#_vitModal').hide();
          }.bind(this));
          $.extend(options, { data: data });
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

          $.extend(data, parseVoterIdData(data.normalizedInput.state, voterIdData));

          $.extend(options, { data: data })
          router.navigate(mapView, mapView, options);
        });

      var voterIdInfoUrl = location.protocol.toString() + '//s3.amazonaws.com/vip-voter-information-tool/voter-id/voterIdInfo.csv';

      var language = navigator.language || navigator.browserLanguage;

      if ((options.language && options.language !== 'en') || !language.match(/en/) || options.json) {
        var language = options.language || language;
        var supportedLanguages = [
          'en',
          'es',
          'hi',
          'ja',
          'ko',
          'th',
          'tl-PH',
          'vi',
          'zh'
        ];
        if (supportedLanguages.indexOf(language) === -1) addressView.render(options);
        var url = location.protocol.toString() + '//s3.amazonaws.com/vip-voter-information-tool/languages/' + language + '-config.json';
        if (options.json) url = options.json;

        $.ajax({
          url: url,
          cache: false,
          success: function(newText) {
            $.extend(options, { assets: JSON.parse(newText) });
            addressView.render(options);
          }
        });

        //
        // for the spanish voter id info translations
        //
        // if (language === 'es') voterIdInfoUrl = location.protocol.toString() + 'put-url-here'

      } else addressView.render(options);

      $.ajax({
        url: voterIdInfoUrl,
        cache: false,
        success: function(resp) { voterIdData = resp; }
      });
    },

    navigate: function(toView, fromView, options) {
      fromView.remove();
      toView.render(options);
    }
  }
})();