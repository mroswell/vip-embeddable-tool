module.exports = (function() {
  var view = {

    $id : '',

    $el : '',

    $container : '',

    template: '',

    events : {},

    routeEvents : {},

    onBeforeRender: function() {},

    onAfterRender: function() {},

    onRemove: function() {},

    render: function(options) {
      // last change
      var that = this;
      var isModal = false;
      var $container = $('#app-container');
      if (options) {
        if (options.container) $container = options.container;
        if (options.data) this.data = options.data;
        if (options.modal) isModal = true;
      }
      this.$container = $container;
      this.onBeforeRender(options);

      if (!!$('#' + this.$id)[0]) this.toggle();
      else {
        this.$el = $('<div id=' + this.$id + '/>').append(this.template(options));
        console.log(this.$el)
        $container.append(this.$el);
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
      this.$el.remove();

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
    },
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