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

  address : '',

  onAfterRender : function(apiCallback) {
    var $address = this.find('#address-input');
    var $aboutModal = this.find('#about');
    var $notFoundModal = this.find('#address-not-found');
    var electionChoiceTemplate = require('./templates/elections.hbs');

    document.body.addEventListener('click', function(e) {
      if (e.target !== $aboutModal) $aboutModal.style.display = 'none';
      $notFoundModal.style.display = 'none';
      if (e.target === this.find('#fade')) this.find('#fade').style.display = 'none';
    }.bind(this));

    this.autocomplete = new google.maps.places.Autocomplete($address);

    this.autocompleteListener = function () {
      enteredAddress = this.autocomplete.getPlace().formatted_address;
      this.address = enteredAddress;

      api({
        address: enteredAddress, 
        success: this.handleElectionData.bind(this), 
        error: this.handleAddressNotFound.bind(this)
      });
    }.bind(this);

    window.addEventListener('keypress', function(e) {
      var key = e.which || e.keyCode;
      if (key === 13) {
        var address = this.find('#address-input').value;
        this.address = address;

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

    if (!response.otherElections) {
      response.otherElections = [{
        name: "VIP Test Election",
        date: "01/25/1900",
        id: "2000"
      }];
    }
    if (response.otherElections) {
      // this.$el.innerHTML += electionChoiceTemplate({
      //   elections: [response.election].concat(response.otherElections)
      // });
      // document.getElementById('elections').style.display = 'block';
      // var that = this;
      // this.querySelectorAll('.election').forEach(function(election) {
      //   election.addEventListener('click', function(e) {
      //     var electionId = e.currentTarget.querySelector('.hidden').innerHTML;
      //     that.triggerRouteEvent('addressViewSubmit', response);
      //   });
      // });
      this.$el.innerHTML += this.multipleElections({
        elections: [response.election].concat(response.otherElections)
      });
      this.find('#multiple-elections').style.display = 'block';
      this.find('#fade').style.display = 'block';
      this.find('#multiple-elections .checked').classList.remove('hidden');
      this.find('#multiple-elections .unchecked').classList.add('hidden');
      this.find('#multiple-elections button').addEventListener('click', function() {
        var id = this.find('.checked:not(.hidden)').parentNode.lastElementChild.innerHTML;
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
    this.find('#address-not-found').style.display = 'block';
    this.find('#fade').style.display = 'block';
    this.find('#address-not-found h1').innerHTML = this.address;
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