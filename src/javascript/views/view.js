var $ = require('jquery');
var api = require('../api.js');
var csv = require('csv-string');
var colors = require('../colors.js');
var xdr = require('../XDomainRequest.min.js')

module.exports = (function() {
  var view = {

    $id : '',

    $el : '',

    $container : '',

    template: function() {},

    events : {},

    routeEvents : {},

    modal: false,

    isPortrait: function() {
      // return window.orientation % 180 === 0;
      return true;
    },

    onBeforeRender: function() {},

    onAfterRender: function() {},

    onRemove: function() {},

    render: function(options) {
      // last change
      var that = this;
      var $container = $('#_vit');
      $container.css({
        'position' : 'relative',
        'border' : '1px solid #898989'
      });

      if (options) {
        if (options.container) $container = options.container;
        if (options.data) this.data = options.data;
        if (options.key) this.key = options.key;
        if (options.modal) this.modal = options.modal;
        if (options.alert) this.alert = options.alert;
        if (options.test) this.test = options.test;
        if (options.officialOnly) this.officialOnly = options.officialOnly;
        if (!options.productionDataOnly) this.productionDataOnly = options.productionDataOnly;
        if (options.assets) this.assets = options.assets;
      }

      this.$container = $container;
      this.onBeforeRender(options);

      $('html, body')
        .removeClass('max-height')
        .find('body')
          .removeClass('no-scroll')
          .find($container)
            .removeClass('floating-container')
            .removeClass('floating-modal-container');

      this.insertView(options);

      return this;
    },

    insertView: function(options) {
      if (!!$('#' + this.$id)[0]) this.toggle();
      else {
        this.$el = $('<div id=' + this.$id + '/>')
        this.$el.append(this.template(options));
        this.$container.append(this.$el);
      }

      for (var key in this.events) {
        var el = key.split(' ')[0];
        var ev = key.split(' ')[1];

        var els = $(this.$el).find(el);
        if (!els.length) els = $(el);
        $.map(els, function(e) {
          $(e).on(ev, this[this.events[key]].bind(this));
        }.bind(this));
      }

      this.onAfterRender(options);

      if (options.colors) {
        colors.replace(options.colors);
        this.$el.on('click', colors.update)
      }
    },

    remove: function() {
      this.onRemove();
      $(this.$el).remove();

      if (this.modal) {
        this.$container
          .removeClass('floating-container')
          .css({
            width: this.prevWidth,
            height: this.prevHeight
          });
        $('body')
          .removeClass('no-scroll');
      }

      return this;
    },

    onRouteEvent: function(event, callback) {
      this.routeEvents[event] = callback;

      return this;
    },

    triggerRouteEvent: function(event, args) {
      this.routeEvents[event].call(this, args);
    },

    find: function(query) {
      return $(this.$el).find(query);
    },

    toggle: function() {
      var el = $('#' + this.$id);
      var val = (el.css('display') !== 'none') ? 'none' : 'block';
      el.css('display', val);
    },

    toggleLoadingDisplay: function() {
      if (this.find('.loading').is(':hidden')) {
        this.$el.on('click', function(event) {
          event.stopPropagation();
        })
        this.find('#fade').fadeTo('slow', .1);
        this.find('.loading').fadeIn('slow');
        google.maps.event.clearInstanceListeners(this.autocomplete);
      } else {
        this.find('#fade').hide();
        this.find('.loading').hide();
      }
    },

    _makeRequest: function (options) {
      var requestParams = {
        officialOnly: this.officialOnly,
        productionDataOnly: this.productionDataOnly,
        key: this.key,
        test: this.test,
        success: this.handleElectionData.bind(this),
        error: this.handleAddressNotFound.bind(this),
        complete: this.toggleLoadingDisplay.bind(this)
      };

      $.extend(requestParams, options)

      api(requestParams);
    },

    handleElectionData: function(response) {
      var routeEvent = (this.$id === 'address-view') ? 'addressViewSubmit' : 'mapViewSubmit';
      this.hasSubmitted = false;
      this.triggerRouteEvent(routeEvent, response);
    },

    _parseAddress: function(address) {
      if (typeof address === 'object') {
        var parsedAddress = '';
        for (var key in address) parsedAddress += address[key] + ' ';
      return parsedAddress;
      } else return address;
    },

    _parseAddressWithoutName: function(address) {
      if (typeof address === 'object') {
        var parsedAddress = '';
        for (var key in address) {
          if (key === 'locationName' || key === 'name' || key === 'line3') continue;
          parsedAddress += address[key] + ' ';
        }
      return parsedAddress;
      } else return address;
    }
  };
  
  return {
    extend: function(extObj) {
      var newObj = {};
      for (var key in view) newObj[key] = view[key];
      for (var key in extObj) newObj[key] = extObj[key];

      return newObj;
    }
  }
})(this);