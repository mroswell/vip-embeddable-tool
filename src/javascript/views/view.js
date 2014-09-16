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
      return window.orientation % 180 === 0;
    },

    _setOrientation: function() {
      var container = (this.modal ? window : this.$container);
      if (this.isPortrait() && $(container).innerWidth() < 600) {
      //   $(this.$container).removeClass('floating-modal-container');
      //   this.triggerRouteEvent('mapViewRerender')
      //   this.landscape = false;
      } else {
        $(this.$container).removeClass('floating-container');
        this.landscape = true;
      //   console.log(this.landscape);
      }
    },

    onBeforeRender: function() {},

    onAfterRender: function() {},

    onRemove: function() {},

    render: function(options) {
      // last change
      var that = this;
      var $container = $('#_vit');
      if (options) {
        if (options.container) $container = options.container;
        if (options.data) this.data = options.data;
        if (options.modal) this.modal = options.modal;
      }
      this.$container = $container;
      this.onBeforeRender(options);

      $('html, body')
        .removeClass('max-height')
        .find('body')
          .removeClass('no-scroll')
          .find($container)
            .removeClass('floating-container')
            .removeClass('floating-modal-container')

      if (!!$('#' + this.$id)[0]) this.toggle();
      else {
        this.$el = $('<div id=' + this.$id + '/>')
        console.log(this.$el)
        this.$el.append(this.template(options));
        $container.append(this.$el);
        if (this.modal && !this.landscape) {
          var width = window.innerWidth;
          var height = window.innerHeight;
          console.log(width, height);
          this.prevWidth = $container.css('width');
          this.prevHeight = $container.css('height');
          $container
            .addClass('floating-container')
            .css({
              'width': width,
              'height': height,
            });
          $('html, body')
            .removeClass('max-height')
            .find('body')
              .addClass('no-scroll');
        } else if (this.modal && this.landscape) {
          $container
            .addClass('floating-modal-container')
            .css({
              'width': width,
              'height': height,
            });
          $('html, body')
            .addClass('max-height')
            .find('body')
              .removeClass('no-scroll')
        }
      }

      for (var key in this.events) {
        var el = key.split(' ')[0];
        var ev = key.split(' ')[1];

        var els = $(this.$el).find(el);
        if (!els.length) els = $(el);
        $.map(els, function(e) {
          $(e).on(ev, that[that.events[key]].bind(that));
        });
      }

      // this.onAfterRender({data: this.data});
      this.onAfterRender(options);

      return this;
    },

    remove: function() {
      // this.$el.parentNode.replaceChild(this.$el.cloneNode(true), this.$el);
      // this.toggle();
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
      // el.get(0).style.display = (el.style.display != 'none' ? 'none' : '')
    },

    _parseAddress: function(address) {
      if (typeof address === 'object') {
        var parsedAddress = '';
        for (var key in address) parsedAddress += address[key] + ' ';
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