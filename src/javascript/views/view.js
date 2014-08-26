module.exports = (function() {
  var view = {
    $id : '',
    $el : '',
    template: '',
    events : {},
    routeEvents : {},
    onRender: function() {},
    render: function(options) {
      var that = this;
      var $container = document.body;
      if (options) {
        if (options.container) $container = options.container;
        if (options.data) this.data = options.data;
      }
      if (!!this.$el) this.toggle();
      else $container.innerHTML += '<div id=' + this.$id + '>' + this.template(options) + '</div>';
      this.$el = document.getElementById(this.$id);

      for (var key in this.events) {
        var el = key.split(' ')[0];
        var ev = key.split(' ')[1];

        var els = this.$el.querySelectorAll(el);
        if (!els.length) els = document.body.querySelectorAll(el);
        Array.prototype.map.call(els, function(e) {
          e.addEventListener(ev, that[that.events[key]].bind(that));
        });
      }

      this.onRender({data: this.data});

      return this;
    },
    remove: function() {
      this.$el.parentNode.replaceChild(this.$el.cloneNode(true), this.$el);
      this.toggle();

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
      return this.$el.querySelector(query);
    },
    toggle: function() {
      var el = document.getElementById(this.$id);
      el.style.display = (el.style.display != 'none' ? 'none' : '')
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