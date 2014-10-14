var $ = require('jquery');

module.exports = (function() {
  var theme;

  function update() {
    $('#_vit')
      .css('color', theme.text)
      .find('#alert') 
        .css('background-color', theme.alertText)
      .end()
      .find('.info:not(.expanded-pane)')
        .css('background-color', theme.header)
      .end()
      .find('.info.expanded-pane')
        .css('background-color', theme.selectedHeader)
      .end()
      .find('.left-wrapper')
        .css('background-color', theme.landscapeHeaderBackground)
      .end()
  }

  function findByColor(color) {
    return $('#_vit')
      .find('*')
      .filter(function() {
        return (
          $(this).css('background-color') === color ||
          $(this).css('background') === color ||
          $(this).css('color') === color
        );
      })
  }

  return {
    replace: function(options) {
      var defaults = {
        text: 'rgb(73, 73, 73)',
        header: 'rgb(28, 124, 165)',
        selectedHeader: 'rgb(87, 196, 247)',
        landscapeHeaderBackground: 'rgb(15, 99, 135)',
        alertText: 'rgba(200, 0, 0, 0.85098)'
      };
      theme = $.extend(defaults, options);

      update(theme);
    },
    update: update
  }
})(this);