var View = require('./view.js');
var api  = require('../api.js');
var voterIdData = require('../voterIdData.js');
var $ = require('jquery');
window.$ = $;

module.exports = View.extend({

  $id : 'map-view',

  template : require('./templates/map.hbs'),

  addressPartial: require('./templates/partials/address.hbs'),

  events: {
    '.nav click' : 'back',
    '.contest-toggle click' : 'toggleContest',
    '.election-selection click' : 'changeElection',
    '#registered-address click' : 'changeAddress',
    '#fade click' : 'changeAddress',
    '#more-locations click' : 'moreLocations',
    '#voter-resources click' : 'voterResources',
    '#polling-location click' : 'toggleMap',
    '#more-elections click' : 'toggleElections',
    '#resources-toggle click' : 'toggleResources',
    '#plus-icon click' : 'openAboutModal',
    '#close-button click' : 'closeAboutModal'
  },

  map: null,

  markers: [],

  address: '',

  onBeforeRender: function(options) {

    // TESTING
    // var newPollingLocation = {
    //   address: {
    //     line1: "233 Frost St.",
    //     city: "Milwaukee",
    //     state: "WI",
    //     zip: "53211"
    //   },
    //   notes: "jsld",
    //   pollingHours: "24/7"
    // };
    // if (options.data.pollingLocations) options.data.pollingLocations.push(newPollingLocation);

    // TESTING
    if (!options.data.otherElections) {
      options.data.otherElections = [{
        name: "VIP Test Election",
        date: "01/25/1900",
        id: "2000"
      }];
    }

    // comb the voter id data
    var stateData = Array.prototype.filter.call(voterIdData, function(entry) {
      return entry.State === options.data.normalizedInput.state;
    });
    stateData = stateData[0];
    var voterId = {};
    var i = 0;
    for (var key in stateData) {
      if (key !== 'Link') {
        voterId[i] = { 
          'question' : key,
          'answer' : stateData[key]
        }
        i += 1;
      } else options.data.voterIdLink = stateData[key];
    }
    options.data.voterId = voterId;

    // comb the address data
    var state = options.data.state[0];
    if (state.electionAdministrationBody && !state.electionAdministrationBody.name) {
      state.electionAdministrationBody.name = "Election Administration Body";
    }

    if (state.local_jurisdiction && !state.local_jurisdiction.name) {
      state.local_jurisdiction.name = "Local Jurisdiction";
    }

    // WA / OR mail-in case
    if (state.name === 'Washington' || state.name === 'Oregon') {
      
    }    

    // reformat the dates
    var date = new Date(options.data.election.electionDay);
    var newDate = date.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    options.data.election.electionDay = newDate;

    // add google searches for candidates with no link
    var contests = options.data.contests;
    contests && contests.forEach(function(contest) {
      var candidates = contest.candidates;
      candidates && candidates.forEach(function(candidate) {
        var candidateUrl = candidate.candidateUrl;
        if (!candidateUrl) candidateUrl = 'http://google.com/search?q=' + candidate.name;
      });
    });

    // sort the contests by their placement on the ballot
    function contestComparator(firstContest, secondContest) {
      var firstPosition = parseInt(firstContest.ballotPlacement);
      var secondPosition = parseInt(secondContest.ballotPlacement);
      return firstPosition - secondPosition;
    }
    if (options.data.contests) {
      options.data.contests = options.data.contests.sort(contestComparator);

      // remove candidate-specific party if its a primary
      options.data.contests.forEach(function(contest) {
        if (contest.type === 'Primary' && contest.primaryParty) {
          contest.candidates.forEach(function(candidate) {
            delete candidate.party;
          })
        }
      })
    }

    this.data = options.data;
  },

  onAfterRender: function(options) {
    var that = this;
    if (options.data.pollingLocations && options.data.pollingLocations.length) {
      var address = this._parseAddress(options.data.pollingLocations[0].address);

      this._encodeAddressAndInitializeMap(options.data.pollingLocations[0].address);

      this.find('#location a').href="https://maps.google.com?daddr=" + address;

      if (options.data.pollingLocations.length > 1) {
        var otherLocations = options.data.pollingLocations.slice(1);

        otherLocations.forEach(function(location) {
          that._geocode(location.address, function(position) {
            that._addPollingLocation(position, location.address);
          })
        });
      }

      // is distance going in?
      // this._calculateDistance(
      //   options.data.normalizedInput,
      //   options.data.pollingLocations[0].address,
      //   function(distance) {
      //     document.querySelector('#map-view .address-distance').innerText = (Math.round(distance) / 1000) + ' mi';
      // });
    } else this._encodeAddressAndInitializeMap("Paris, France");

    this.find('#info-icon').parentNode.href = options.data.state[0].electionAdministrationBody.electionInfoUrl;

    // this._toggleModal();
  },

  onRemove: function() {
    if (this.autocomplete) {
      // google.maps.event.removeListener(this.autocompleteListener);
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }

    this.markers = [];
  },

  _toggleModal: function() {
    var modal = document.querySelector('#modal');
    var that = this;

    if (getComputedStyle(modal)['display'] !== 'block') {
      document.querySelector('#modal').style.display = 'block';
      document.querySelector('#modal').addEventListener('click', function() {
        this.style.display = '';
        that.triggerRouteEvent('mapViewBack')
      });

      document.body.classList.add('body-modal-show');
      this.$el.parentNode.classList.add('container-modal-show');
      this.$el.classList.add('map-view-modal-show');
    } else {
      modal.style.display = '';
      document.body.classList.remove('body-modal-show');
      this.$el.parentNode.classList.remove('container-modal-show');
      this.$el.classList.remove('map-view-modal-show');
    }
  },

  _encodeAddressAndInitializeMap : function(address) {
    var that = this;
    this._geocode(address, function(position) {
      var options = {
        zoom: 12,
        center: position,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        draggable: false,
        panControl: false,
        zoomControl: false,
        scrollwheel: false,
        mapTypeControl: false,
        streetViewControl: false
      };
      that.map = new google.maps.Map(document.getElementById("map-canvas"), options);
      that._addPollingLocation(position, address);
      google.maps.event.addListener(that.map, 'click', function() {
        that.toggleMap();

        that.find('#location .address').innerHTML = that.addressPartial(address);
      });

      document.getElementById('map-canvas').addEventListener(that._transitionEnd(), function() {
        google.maps.event.trigger(that.map, 'resize');
        that.map.panTo(that.markers[0].getPosition());
        window.markers = that.markers;
        if (that.find('#map-canvas').style.height === '300px') that._fitMap();
        else that.map.setZoom(12);
      });
    });
  },

  _fitMap: function() {
    var bounds = new google.maps.LatLngBounds();
    for(i=0;i<this.markers.length;i++) {
      bounds.extend(this.markers[i].getPosition());
    }

    this.map.fitBounds(bounds);
  },

  _zoomTo: function() {

  },

  _addPollingLocation: function(position, address) {
      var marker = new google.maps.Marker({
        map: this.map,
        position: position,
        icon: './images/blue-marker.png'
      });
      var that = this;
      google.maps.event.addListener(marker, 'click', function() {
        if (this.map.getZoom() !== 12) {
          that.map.panTo(marker.getPosition());
          that.map.setZoom(12);
          that.find('#location .address').innerHTML = that.addressPartial(address);
        } else that._fitMap();
      });
      this.markers.push(marker);
  },

  _parseAddress: function(address) {
    if (typeof address === 'object') {
      var parsedAddress = '';
      for (var key in address) parsedAddress += address[key] + ' ';
    return parsedAddress;
    } else return address;
  },

  _calculateDistance: function(fromLocation, toLocation, callback) {
    var that = this;
    this._geocode(fromLocation, function(fromCoords) {
      that._geocode(toLocation, function(toCoords) {
        callback(google.maps.geometry.spherical.computeDistanceBetween(fromCoords, toCoords));
      });
    })
  },

  _transitionEnd: function() {
    var i,
      undefined,
      el = document.createElement('div'),
      transitions = {
        'transition':'transitionend',
        'OTransition':'otransitionend',
        'MozTransition':'transitionend',
        'WebkitTransition':'webkitTransitionEnd'
      };

    for (i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
        return transitions[i];
      }
    }
  },

  _geocode: function(location, callback) {
    var that = this;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': this._parseAddress(location)
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) callback(results[0].geometry.location);
    });
  },

  changeAddress: function(e) {
    var addressInput = this.find('.change-address');
    var that = this;

    if (getComputedStyle(addressInput)['display'] === 'none') {
      this.autocomplete = new google.maps.places.Autocomplete(addressInput);
      addressInput.previousElementSibling.style.display = 'none';
      addressInput.style.display = 'block';
      this.find('#fade').style.display = 'block';

      this.autocompleteListener = function() {
        var address = this.autocomplete.getPlace().formatted_address;

        api({
          address: address,
          success: function(response) {
            this.triggerRouteEvent('mapViewSubmit', response)
          }.bind(this)
        });
      }.bind(this);

      google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
    } else {
      console.log(this.autocompleteListener);
      google.maps.event.clearInstanceListeners(this.autocomplete);

      addressInput.previousElementSibling.style.display = '';
      addressInput.style.display = 'none';
      this.find('#fade').style.display = 'none';
    }
  },

  changeElection: function(e) {
    var selected = e.currentTarget.firstElementChild;

    if (selected.classList.contains('hidden')) {
      var electionId = selected.nextElementSibling.nextElementSibling.innerHTML;
      var address = this._parseAddress(this.data.normalizedInput);
      api({
        address: address,
        success: function(response) {
          this.triggerRouteEvent('mapViewSubmit', response)
        }.bind(this),
        electionId: electionId
      });
    }
  },

  toggleMap: function(e) {
    var canvas = this.find('#map-canvas');
    var toggle = this.find('#map-toggle');
    if (getComputedStyle(canvas)['height'] !== '300px') {
      canvas.style.height = '300px';
      toggle.querySelector('.minus').classList.remove('hidden');
      toggle.querySelector('.plus').classList.add('hidden');
      this._scrollTo('#map-toggle', 10);
    } else {
      canvas.style.height = '150px';
      toggle.querySelector('.plus').classList.remove('hidden');
      toggle.querySelector('.minus').classList.add('hidden');
    }
  },

  toggleElections: function(e) {
    e.stopPropagation();
    this._slidePanel(
      this.find('#election-list'),
      e.currentTarget.querySelector('span'),
      { max: '100px' }
    );
  },

  toggleResources: function(e) {
    this._slidePanel(
      this.find('#more-resources'),
      e.currentTarget.lastElementChild
    );
  },

  toggleContest: function(e) {
    // this._slidePanel(
    //   e.currentTarget.lastElementChild,
    //   e.currentTarget.firstElementChild.lastElementChild
    // );

    var inSymbol = '+';
    var out = '−';
    var max = '2000px';
    var min = '0px';
    if (getComputedStyle(e.currentTarget.lastElementChild)['max-height'] !== min) {
      e.currentTarget.lastElementChild.style['max-height'] = min;
      e.currentTarget.firstElementChild.lastElementChild.innerHTML = inSymbol;
      // button.querySelector('.plus').classList.remove('hidden');
      // button.querySelector('.minus').classList.add('hidden');
    } else {
      e.currentTarget.lastElementChild.style['max-height'] = max;
      e.currentTarget.firstElementChild.lastElementChild.innerHTML = out;
      // button.querySelector('.minus').classList.remove('hidden');
      // button.querySelector('.plus').classList.add('hidden');
      this._scrollTo(e.currentTarget.firstElementChild.lastElementChild, 20);
    }

    // this.$container.scrollTop = e.currentTarget.firstElementChild.lastElementChild.getBoundingClientRect().top - this.$container.getBoundingClientRect().top;
  },

  _slidePanel: function(panel, button, options) {
    var inSymbol = (options && options.in ? options.in : '+');
    var out = (options && options.out ? options.out : '−');
    var max = (options && options.max ? options.max : '2000px');
    var min = (options && options.min ? options.min : '0px');
    if (getComputedStyle(panel)['max-height'] !== min) {
      panel.style['max-height'] = min;
      // button.innerHTML = inSymbol;
      button.querySelector('.plus').classList.remove('hidden');
      button.querySelector('.minus').classList.add('hidden');
    } else {
      panel.style['max-height'] = max;
      // button.innerHTML = out;
      button.querySelector('.minus').classList.remove('hidden');
      button.querySelector('.plus').classList.add('hidden');
      this._scrollTo(button, 10);
    }

    // this.$container.scrollTop = button.getBoundingClientRect().top - this.$container.getBoundingClientRect().top;
  },

  _scrollTo: function(target, padding) {
    $(this.$container).animate({
      scrollTop: $(target).offset().top - $(this.$container).offset().top + $(this.$container).scrollTop() - padding
    }, 500);
  },

  moreLocations: function() {
    this.triggerRouteEvent('moreLocations');
  },

  voterResources: function() {
    this.triggerRouteEvent('voterResources');
  },

  back: function() {
    this.triggerRouteEvent('mapViewBack');
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