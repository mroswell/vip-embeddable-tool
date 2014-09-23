var util       = require('./util.js')
  , router     = require('./router.js')
  , handlebars = require('./handlebars.js')
  , $          = require('jquery')
  , css        = require('../../build/app.css')

window.vit = {
  load: function(options) {
    // var protocol = (document.location.protocol ? 'https' : 'http')
    var protocol = 'https'
      , googleMapsUrl = protocol 
        + '://maps.googleapis.com/maps/api/js?libraries=places,geometry&callback='
        + '_VIT_GOOGLE_MAPS_INIT_CALLBACK'
      , googleWebFontsUrl = protocol
        + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';

    // save the options to pass in to the router
    window._vitOptions = typeof options !== 'undefined' ? options : {}

    // Roboto font
    WebFontConfig = { google: { families: [ 'Roboto:400,500,700:latin' ] } };

    $.getScript(googleMapsUrl);
    $.getScript(googleWebFontsUrl);
  }
}

// callback on load of Google Maps
window._VIT_GOOGLE_MAPS_INIT_CALLBACK = function() {
  router.start(window._vitOptions);
}

// register partials and helpers for use in templates
handlebars.registerPartials();
handlebars.registerHelpers();