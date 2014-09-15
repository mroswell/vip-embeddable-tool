var View = require('./view.js');
var api = require('../api.js');
var $ = require('jquery');

module.exports = View.extend({

  $id          : 'address-view',

  template     : require('./templates/address-lookup.hbs'),

  multipleElections : require('./templates/partials/multiple-elections.hbs'),

  events : {
    '#plus-icon click' : 'openAboutModal',
    '#close-button click' : 'closeAboutModal',
  },

  hasSubmitted: false,

  address : '',

  onAfterRender : function(apiCallback) {
    var $address = this.find('#address-input');
    var $aboutModal = this.find('#about');
    var $notFoundModal = this.find('#address-not-found');
    // var electionChoiceTemplate = require('./templates/elections.hbs');

    if (this.$container.width() > 600) {
      $('#user-image').css('max-width', '450px');
    }

    $('body').on('click', function(e) {
      if (e.target !== $aboutModal) $aboutModal.hide();
      if (e.target !== $notFoundModal) $notFoundModal.hide();
      if (e.target !== this.find('#fade')) this.find('#fade').hide();
    }.bind(this));
    this.autocomplete = new google.maps.places.Autocomplete($address[0]);

    this.autocompleteListener = function () {
      if (this.hasSubmitted) return;
      enteredAddress = this.autocomplete.getPlace().formatted_address;
      if (typeof enteredAddress === 'undefined') return;
      this.address = enteredAddress;
      this.hasSubmitted = true;

      api({
        address: enteredAddress, 
        success: this.handleElectionData.bind(this), 
        error: this.handleAddressNotFound.bind(this)
      });
    }.bind(this);

    $(window).on('keypress', function(e) {
      if (this.hasSubmitted) return;
      var key = e.which || e.keyCode;
      if (key === 13) {
        var address = this.find('#address-input').val();
        this.address = address;
        this.hasSubmitted = true;

        api({
          address: address, 
          success: this.handleElectionData.bind(this), 
          error: this.handleAddressNotFound.bind(this)
        });
      }
    }.bind(this));

    google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
  },

  onRemove: function() {
    google.maps.event.clearInstanceListeners(this.autocomplete);
  },

  handleElectionData: function(response) {
    // if response has multiple elections, select which election
    // console.log('handling electiondata')
    // if (!response.otherElections) {
    //   response.otherElections = [{
    //     name: "VIP Test Election",
    //     date: "01/25/1900",
    //     id: "2000"
    //   }];
    // }
    if (response.otherElections) {
      this.$el.append(this.multipleElections({
        elections: [response.election].concat(response.otherElections)
      }));
      this.find('#multiple-elections').show();
      this.find('#fade').show();
      $('.checked:first').removeClass('hidden');
      $('.unchecked:first').addClass('hidden');
      $(this.find('#multiple-elections button')).on('click', function() {
        // var id = this.find('.checked:not(.hidden)').parentNode.lastElementChild.innerHTML;
        var id = this.find('.checked:not(.hidden)').siblings('.hidden').eq(0).text();
        api({
          address: this._parseAddress(response.normalizedInput), 
          success: function(newResponse) {
            this.triggerRouteEvent('addressViewSubmit', newResponse);
          }.bind(this),
          electionId: id
        });
      }.bind(this));
      $('.election').on('click', function() {
        $('.checked').addClass('hidden');
        $('.unchecked').removeClass('hidden')
        $(this).find('.checked').removeClass('hidden');
        $(this).find('.unchecked').addClass('hidden');
      });
      
    } else this.triggerRouteEvent('addressViewSubmit', response);
  },

  handleAddressNotFound: function() {
    this.find('#address-not-found').show();
    this.find('#fade').show();
    this.find('#address-not-found h1').text(this.address);
    this.find('#address-input').value = "";
    this.hasSubmitted = false;
  },

  selectElection: function(e) {
    var electionId = e.currentTarget.querySelector('.hidden');
    this.triggerRouteEvent('');
  },

  openAboutModal: function(e) {
    this.find('#about').toggle();
    this.find('#fade').toggle();
    e.stopPropagation();
  },

  closeAboutModal: function() {
    this.find('#about').hide();
    this.find('#fade').hide();
  }

});