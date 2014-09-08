var View = require('./view.js');
var api = require('../api.js');

module.exports = View.extend({

  $id          : 'address-view',

  template     : require('./templates/address-lookup.hbs'),

  events : {
    '#info-icon click' : 'openAboutModal',
    '#close-button click' : 'closeAboutModal',
  },

  onAfterRender : function(apiCallback) {
    var $address = this.find('#address-input');
    var $aboutModal = this.find('#about');
    var $notFoundModal = this.find('#address-not-found');
    var electionChoiceTemplate = require('./templates/elections.hbs');

    document.body.addEventListener('click', function(e) {
      if (e.target !== $aboutModal) $aboutModal.style.display = 'none';
      $notFoundModal.style.display = 'none';
      this.find('#fade').style.display = 'none';
    }.bind(this));

    this.autocomplete = new google.maps.places.Autocomplete($address);

    this.autocompleteListener = function () {
      enteredAddress = this.autocomplete.getPlace().formatted_address;

      api({
        address: enteredAddress, 
        success: this.handleElectionData.bind(this), 
        error: this.handleAddressNotFound.bind(this)
      });
    }.bind(this);

    google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
  },

  onRemove: function() {
    google.maps.event.clearInstanceListeners(this.autocomplete);
  },

  handleElectionData: function(response) {
    // if response has multiple elections, select which election
    if (response.otherElections) {
      this.$el.innerHTML += electionChoiceTemplate({
        elections: [response.election].concat(response.otherElections)
      });
      document.getElementById('elections').style.display = 'block';
      var that = this;
      this.querySelectorAll('.election').forEach(function(election) {
        election.addEventListener('click', function(e) {
          var electionId = e.currentTarget.querySelector('.hidden').innerHTML;
          that.triggerRouteEvent('addressViewSubmit', response);
        });
      });
    } else this.triggerRouteEvent('addressViewSubmit', response);
  },

  handleAddressNotFound: function() {
    this.find('#address-not-found').style.display = 'block';
    this.find('#fade').style.display = 'block';
    this.find('#address-input').value = "";
  },

  selectElection: function(e) {
    var electionId = e.currentTarget.querySelector('.hidden');
    console.log(electionId);
    this.triggerRouteEvent('');
  },

  openAboutModal: function(e) {
    this.find('#about').style.display = 'block';
    this.find('#fade').style.display = 'block';
    e.stopPropagation();
  },

  closeAboutModal: function() {
    this.find('#about').style.display = 'none';
    this.find('#fade').style.display = 'none';
  }

});