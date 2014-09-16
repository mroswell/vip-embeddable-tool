var util       = require('./util.js')
  , router     = require('./router.js')
  , handlebars = require('./handlebars.js')
  , $          = require('jquery')
  , css        = require('../../build/app.css');

window.vit = {
  load: function() {
    var protocol = (document.location.protocol ? 'https' : 'http')
      , googleMapsUrl = protocol 
        + '://maps.googleapis.com/maps/api/js?libraries=places,geometry&callback='
        + '_VIT_GOOGLE_MAPS_INIT_CALLBACK'
      , googleWebFontsUrl = protocol
        + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';

    // Roboto font
    WebFontConfig = { google: { families: [ 'Roboto:400,500,700:latin' ] } };

    // load Google Maps onto page
    $('<script>')
      .attr('type', 'text/javascript')
      .attr('src', googleMapsUrl)
      .appendTo($('body'));

    // add Google Web Fonts
    $('<script>')
      .attr('src', googleWebFontsUrl)
      .attr('type', 'text/javascript')
      .attr('async', 'true')
      .appendTo($('head'));
      
    // $('<meta>')
    //   .attr('name', 'viewport')
    //   .attr('content', 'width=device-width')
    //   .appendTo($('head'));

  }
}

// callback on load of Google Maps
window._VIT_GOOGLE_MAPS_INIT_CALLBACK = function() {
  router.start();
}

// register partials and helpers for use in templates
handlebars.registerPartials();
handlebars.registerHelpers();