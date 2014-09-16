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
    var $currentLocationModal = this.find('#current-location');
    // var electionChoiceTemplate = require('./templates/elections.hbs');

    this.$container.css('max-width', 800);

    if (this.$container.width() > 600) {
      $('#user-image').css('max-width', '450px');
    }

    $('body').on('click', function(e) {
      if (e.target !== $aboutModal) $aboutModal.hide();
      if (e.target !== $notFoundModal) $notFoundModal.hide();
      if (e.target !== $currentLocationModal) $currentLocationModal.hide();
      if (e.target !== this.find('#fade')) this.find('#fade').hide();
    }.bind(this));
    this.autocomplete = new google.maps.places.Autocomplete($address[0]);
    console.log('in on after render', this.autocompleteListener)
    this.hasSubmitted = false;
    this.autocompleteListener = function () {
      if (this.hasSubmitted) return;
      enteredAddress = this.autocomplete.getPlace().formatted_address;
      if (typeof enteredAddress === 'undefined') return;
      this.address = enteredAddress;
      console.log('autocomplete triggered for address: ' + this.address);
      this.hasSubmitted = true;

      api({
        address: enteredAddress, 
        success: this.handleElectionData.bind(this), 
        error: this.handleAddressNotFound.bind(this)
      });
    }.bind(this);
    console.log(this.keypressListener)
    this.keypressListener = function(e) {
      console.log(this.find('#address-input').val(), this.hasSubmitted)
      if (this.hasSubmitted) return;
      var key = e.which || e.keyCode;
      if (key === 13) {
        var address = this.find('#address-input').val();
        this.address = address;
        console.log('enter key pressed for address: ' + this.address);
        this.hasSubmitted = true;

        api({
          address: address, 
          success: this.handleElectionData.bind(this), 
          error: this.handleAddressNotFound.bind(this)
        });
      }
    }

    $(window).on('keypress.keypressListener', this.keypressListener.bind(this));

    google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
  },

  onRemove: function() {
    google.maps.event.clearInstanceListeners(this.autocomplete);
    $(window).unbind('keypress.keypressListener')
  },

  handleElectionData: function(response) {
    var that = this;
    // if response has multiple elections, select which election
    // console.log('handling electiondata')
    // if (!response.otherElections) {
    //   response.otherElections = [{
    //     name: "VIP Test Election",
    //     date: "01/25/1900",
    //     id: "2000"
    //   }];
    // }
    var stateName = response.state[0].name;
    console.log(stateName)
    if (stateName === 'New York' || stateName === 'Washington' || stateName === 'Oregon') {
      $('#current-location, #fade')
        .show();

      $('#use-current-location').one('click', function() {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude
              , lng = position.coords.longitude;
            that._reverseGeocode(
              position.coords.latitude,
              position.coords.longitude,
              function(address) {
                console.log(address);
                api({
                  address: address,
                  success: function(newResponse) {
                    that.triggerRouteEvent('addressViewSubmit', newResponse);
                  },
                  error: function() {
                    that.triggerRouteEvent('addressViewSubmit', response);
                  }
              });
            });
          });
        } else {
          $('#current-location, #fade').hide();
          $('#address-input')
            .val('')
            .attr('placeholder', 'Enter Your Current Location');
        }
      });

      $('#use-registered-address').one('click', function() {
        that.triggerRouteEvent('addressViewSubmit', response);
      })
      return;
    }

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
  },

  _reverseGeocode: function(lat, lng, callback) {
    var latLng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'latLng': latLng
    }, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          callback(results[1].formatted_address);
        }
      }
    })
  }

});