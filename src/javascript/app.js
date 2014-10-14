var util       = require('./util.js')
  , router     = require('./router.js')
  , handlebars = require('./handlebars.js')
  , $          = require('jquery')
  , css        = require('../../build/app.css')

// console.log(xdr)
function loadScript(language) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + 
    '&language=' + language +
    '&libraries=places,geometry' +
    '&callback=_VIT_GOOGLE_MAPS_INIT_CALLBACK';
  document.body.appendChild(script);
}

window.vit = (function () {
  var once = function (fn) {
    var done = false;

    return function () {
      return done ? void 0 : ((done = true), fn.apply(this, arguments))
    }
  }

  var load = function(options) {
    if (window._vitOptions) return;

    // var protocol = (document.location.protocol ? 'https' : 'http')
    var protocol = 'https'
      , googleMapsUrl = protocol 
        + '://maps.googleapis.com/maps/api/js?libraries=places,geometry&language=iw&callback='
        + '_VIT_GOOGLE_MAPS_INIT_CALLBACK'
      , googleWebFontsUrl = protocol
        + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';

    // save the options to pass in to the router
    window._vitOptions = typeof options !== 'undefined' ? options : {}

    // Roboto font
    WebFontConfig = { google: { families: [ 'Roboto:400,500,700:latin' ] } };

    $.getScript(googleWebFontsUrl);

    var language = navigator.language || navigator.browserLanguage;

    if ((window._vitOptions.language && window._vitOptions.language !== 'en') ||
      !language.match(/en/)) {
      language = window._vitOptions.language || language;
      var supportedLanguages = ['en', 'es'];
      if (supportedLanguages.indexOf(language) !== -1) loadScript(language);
      else loadScript('en-US');
    } else loadScript('en-US');
  }

  return { load: once(load) }
})(window);

// callback on load of Google Maps
window._VIT_GOOGLE_MAPS_INIT_CALLBACK = function() {
  router.start(window._vitOptions);
}

// register partials and helpers for use in templates
handlebars.registerPartials();
handlebars.registerHelpers();