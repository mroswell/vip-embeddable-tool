var View = require('./view.js');
var api = require('../api.js');

module.exports = View.extend({
  $id          : 'address-view', 
  template     : require('./templates/address-lookup.hbs'),
  events : {
    '#current-location click' : 'currentLocation',
    '#info-icon click' : 'openAboutModal',
    '#close-button click' : 'closeAboutModal', 
  },
  onRender : function(apiCallback) {
    var $address = this.find('#address-input');
    var $aboutModal = this.find('#about');
    var $notFoundModal = this.find('#address-not-found');
    var autocomplete = new google.maps.places.Autocomplete($address);
    var that = this;

    document.body.addEventListener('click', function(e) {
      if (e.target !== $aboutModal) $aboutModal.style.display = 'none';
      $notFoundModal.style.display = 'none';
    })

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      enteredAddress = autocomplete.getPlace().formatted_address;

      api(enteredAddress, function(response) {
        that.triggerRouteEvent('addressViewSubmit', response);
      });
    });
  },
  currentLocation: function() {
    var that = this;
    api('36 E. 20th St. New York, NY', function(response) {
      that.triggerRouteEvent('addressViewSubmit', response);
    });
  },
  openAboutModal: function(e) {
    this.find('#about').style.display = 'block';
    e.stopPropagation();
  },
  closeAboutModal: function() {
    this.find('#about').style.display = 'none';
  }
});