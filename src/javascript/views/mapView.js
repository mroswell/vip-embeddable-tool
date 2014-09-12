var View = require('./view.js');
var api  = require('../api.js');
var voterIdData = require('../voterIdData.js');
var $ = require('jquery');
window.$ = $;

module.exports = View.extend({

  $id : 'map-view',

  template : require('./templates/map.hbs'),

  addressPartial: require('./templates/partials/address.hbs'),

  pollingLocationPartial: require('./templates/partials/polling-location-info.hbs'),

  landscape: false,

  hasSubmitted: false,

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
    '#close-button click' : 'closeAboutModal',
    '#ballot-information click' : 'toggleBallot'
  },

  map: null,

  markers: [],

  address: '',

  noScroll: true,

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

    // TESTING multiple election scenario
    // if (!options.data.otherElections) {
    //   options.data.otherElections = [{
    //     name: "VIP Test Election",
    //     date: "01/25/1900",
    //     id: "2000"
    //   }];
    // }

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
    // var contests = options.data.contests;
    // contests && contests.forEach(function(contest) {
    //   var candidates = contest.candidates;
    //   candidates && candidates.forEach(function(candidate) {
    //     var candidateUrl = candidate.candidateUrl;
    //     if (!candidateUrl) {
    //       candidate.candidateUrl = 'http://google.com/search?q=' + candidate.name;
    //     }
    //   });
    // });

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

    if ($(this.$container).innerWidth() > 600) {
      this.landscape = true;
    }
  },

  onAfterRender: function(options) {
    var that = this;
    if (options.data.pollingLocations && options.data.pollingLocations.length) {
      var primaryLocation = options.data.pollingLocations[0];
      var address = this._parseAddress(primaryLocation.address);

      this._encodeAddressAndInitializeMap(primaryLocation.address);

      this.find('#location a').attr('href', 'https://maps.google.com?daddr=' + address);

      primaryLocation.hours = "9am - 5pm";
      var $locationInfo = $(this.pollingLocationPartial(primaryLocation));
      this.find('#location').append($locationInfo);
      $locationInfo.find('a').attr('href', 'https://maps.google.com?daddr=' + address);
      // this.find('#location').on('click', function() {
      //   if ($locationInfo.css('display') === 'none') $locationInfo.show();
      //   else $locationInfo.hide();
      // });
      $locationInfo.hide();

      if (options.data.pollingLocations.length > 1) {
        var otherLocations = options.data.pollingLocations.slice(1);

        otherLocations.forEach(function(location) {
          that._geocode(location.address, function(position) {
            that._addPollingLocation(position, location.address);
          })
        });
      }

      //
      // tablet/desktop view
      //
        // this.landscape = true;
      // setTimeout(function() {
      //   this.remove();
      //   this.render(options);
      // }.bind(this), 2000);

      // is distance going in?
      // this._calculateDistance(
      //   options.data.normalizedInput,
      //   options.data.pollingLocations[0].address,
      //   function(distance) {
      //     document.querySelector('#map-view .address-distance').innerText = (Math.round(distance) / 1000) + ' mi';
      // });
    } else {
      this._encodeAddressAndInitializeMap();
    }

    if (this.landscape) this._switchToLandscape();
    else this.find('#ballot-information .toggle-image').hide();

    this.noScroll = true;
    $('.contest-toggle').trigger('click');
    this.noScroll = false;


    this.find('#info-icon').parent().attr('href', options.data.state[0].electionAdministrationBody.electionInfoUrl);

    // this._toggleModal();

    $('html,body').scrollLeft($(this.$container).scrollLeft());
    $('html,body').scrollTop($(this.$container).scrollTop());
  },

  onRemove: function() {
    if (this.autocomplete) {
      // google.maps.event.removeListener(this.autocompleteListener);
      google.maps.event.clearInstanceListeners(this.autocomplete);
    }

    this.markers = [];
  },

  _switchToLandscape: function() {
      $('#map-view').css('height', '100%');
      $('#map-view .info').css('font-size', '16px');
      $('#location img').css('margin-right', '-10px');
      $('#map-view').prepend(($('.left').detach()));
      $('.left').wrapAll('<div class="left-wrapper" />');
      $('.left-wrapper').prepend('<img src="./images/vip-logo.png" class="left box">');
      $('.left-wrapper').append('<div class="light-blue-box"/>');
      $('.right').wrapAll($('<div class="right-wrapper" />'));
      $('.toggle-image.plus').attr('src', './images/left-arrow-white.png').addClass('arrow right-arrow');
      $('.toggle-image.minus').attr('src', './images/right-arrow-white.png').addClass('arrow left-arrow');
      $('#registered-address').find('span').css({
        // 'margin-top':'-17px'
      })
      $('.left-wrapper').css({
        'float': 'left',
        'position': 'absolute',
        'z-index': 2,
        'width': '40%',
        'height': 'calc(100% - 40px)',
        // 'overflow': 'visible',
        'box-shadow': '8px 0px 5px 0px rgba(50, 50, 50, 0.35)'
      });
      $('.left-wrapper img.box').css({
        'width': '100px',
        'margin': '-12px auto',
        'display': 'block',
        'border-bottom': '0'      
      });
      $('.right-wrapper').css({
        'height': 'calc(100% - 40px)',
        'overflow-y': 'auto',
        'position': 'absolute'
      });
      $('.right').css({
        'float': 'right',
        'width': '60%'
      })
      $('.right .box').css({
        'margin-left': '8px'
      });
      $('#map-canvas').css({
        'position': 'absolute',
        'left': '40%',
        'height': '100%'
      });
      $('#location').css({
        'position': 'absolute',
        'left': '45%',
        'top': '55%',
        'width': '50%',
        'background-color': 'white',
        'z-index': 1
      });
      $('#polling-location .right-arrow').addClass('hidden')
      $('#polling-location .left-arrow').removeClass('hidden');
      $('#polling-location').css({
        'width': '105%',
        'background-color': '#57c4f7' // $highlightblue
      });
      $('.left-wrapper .box:not(.info)').css({
        padding: '10px'
      })
      $('#more-resources').hide();
      $('.contests.right').hide();
      $('.left').css({
      });
      $('#info-icon').css({
        transform: 'none'
      });
  },

  _toggleModal: function() {
    var modal = $('#modal');
    var that = this;

    if (modal.css('display') !== 'block') {
      modal.show();
      modal.on('click', function() {
        modal.hide()
        that.triggerRouteEvent('mapViewBack')
      });

      $(document.body).addClass('body-modal-show');
      $(this.$el.parentNode).addClass('container-modal-show');
      $(this.$el).addClass('map-view-modal-show');
    } else {
      modal.hide()
      $(document.body).removeClass('body-modal-show');
      $(this.$el.parentNode).removeClass('container-modal-show');
      $(this.$el).removeClass('map-view-modal-show');
    }
  },

  _encodeAddressAndInitializeMap : function(address) {
    var that = this;

    // no polling location found
    if (typeof address === 'undefined') {
      this._geocode("United States of America", function(position) {
        var options = {
          zoom: 3,
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
        that.find('#location').find('a').remove();
        that.find('#location .address')
          .css('text-align', 'center')
          .text('No Polling Locations Found');

        $('#map-canvas').on(that._transitionEnd(), function() {
          google.maps.event.trigger(that.map, 'resize');
          that.map.panTo(position);
          if (that.find('#map-canvas').height() === '300px') that._fitMap();
          // else that.map.setZoom(4);
        });
      })

        // google.maps.event.addListener(that.map, 'click', function() {
        //   that.toggleMap();

        //   // that.find('#location .address').innerHTML = that.addressPartial(address);
        // });


    } else {
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

        $('#map-canvas').on(that._transitionEnd(), function() {
          google.maps.event.trigger(that.map, 'resize');
          that.map.panTo(that.markers[0].getPosition());
          window.markers = that.markers;
          if (that.find('#map-canvas').height() === '300px') that._fitMap();
          else that.map.setZoom(12);
        });
      });
    }
  },

  _fitMap: function() {
    if (this.markers.length === 1) {
      this.map.setZoom(15);
    } else {
      var bounds = new google.maps.LatLngBounds();
      for(i=0;i<this.markers.length;i++) {
        bounds.extend(this.markers[i].getPosition());
      }

      this.map.fitBounds(bounds);
    }
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
      google.maps.event.addListener(marker, 'click', this._toggleMapZoom.bind(this, marker, address));
      this.markers.push(marker);
  },

  _toggleMapZoom: function(marker, address) {
      if (this.map.getZoom() !== 12) {
        this.map.panTo(marker.getPosition());
        this.map.setZoom(12);
        this.find('#location .address').innerHTML = this.addressPartial(address);
        $('.polling-location-info').hide();
      } else {
        this._fitMap();
        $('.polling-location-info').show();
      }
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

    if (addressInput.css('display') === 'none') {
      // this.autocomplete = new google.maps.places.Autocomplete(addressInput[0]);
      this.autocomplete = new google.maps.places.SearchBox(addressInput[0]);
      addressInput.prev().hide();
      addressInput.show();
      if (!this.landscape) this.find('#fade').show();

      addressInput.on('focus', function() {
        addressInput.val("");
      })

      this.autocompleteListener = function() {
        // console.log('autocomplete ' + this.hasSubmitted);
        if (this.hasSubmitted) return;
        // var address = this.autocomplete.getPlace().formatted_address;
        var address = this.autocomplete.getPlaces()[0].formatted_address;
        // console.log('autocomplete ' + address);
        if (typeof address === 'undefined') return;
        this.hasSubmitted = true;

        api({
          address: address,
          success: function(response) {
            this.hasSubmitted = false;
            this.triggerRouteEvent('mapViewSubmit', response);
          }.bind(this),
          error: this.handleAddressNotFound
        });
      }.bind(this);

      $(window).on('keypress', function(e) {
        this.address = addressInput.val();
        var key = e.which || e.keyCode;
        if (key === 13) {
          // google.maps.event.trigger(autocomplete, 'places_changed');
          // e.preventDefault();
          if (this.hasSubmitted) return;
          // var address = addressInput.val();
          addressInput.replaceWith(addressInput.clone());
          // var address = $(".pac-container .pac-item:first").text();
          // console.log('enterkey ' + address + addressInput.val())
          // this.hasSubmitted = true;

          // api({
          //   address: address,
          //   success: function(response) {
          //     this.hasSubmitted = false;
          //     this.triggerRouteEvent('mapViewSubmit', response)
          //   }.bind(this),
          //   error: this.handleAddressNotFound
          // });
        }
      }.bind(this));

      // google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
      google.maps.event.addListener(this.autocomplete, 'places_changed', this.autocompleteListener);
    } else {
      google.maps.event.clearInstanceListeners(this.autocomplete);

      addressInput.prev().show()
      addressInput.hide()
      this.find('#fade').hide()
    }
  },

  handleAddressNotFound: function() {
    // this.find('#address-not-found').show();
    // this.find('#fade').show();
    // this.find('#address-not-found h1').text(this.address);
    $('.change-address').val("");
    this.hasSubmitted = false;
  },

  changeElection: function(e) {
    var selected = e.currentTarget.firstElementChild;

    if ($(selected).hasClass('hidden')) {
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
    if (!this.landscape) {
      var canvas = this.find('#map-canvas');
      var toggle = this.find('#map-toggle');
      if (canvas.height() !== 300) {
        canvas.height(300);
        toggle.find('.minus').removeClass('hidden');
        toggle.find('.plus').addClass('hidden');
        this._scrollTo(toggle, 10);
      } else {
        canvas.height(150);
        toggle.find('.plus').removeClass('hidden');
        toggle.find('.minus').addClass('hidden');
      }
    } else {
      if ($('#location').css('display') !== 'none') return;
      $('.info.box').css({
          'background-color':'#1C7CA5',
          width: '100%'
      });
      $(':not(#polling-location) .right-arrow').removeClass('hidden');
      $(':not(#polling-location) .left-arrow').addClass('hidden');
      $('#more-resources, .contests').hide();
      $('#map-canvas, #location').show();
      $('#polling-location')
        .css({
          'background-color':'#57c4f7',
          width: '105%',
        });
      $('#polling-location .right-arrow').addClass('hidden');
      $('#polling-location .left-arrow').removeClass('hidden');
    }
  },

  toggleElections: function(e) {
    e.stopPropagation();
    if (this.landscape) {
      // $('.left-wrapper').css({
      //   'overflow-y': 'auto',
      // })
    }
    this._slidePanel(
      this.find('#election-list'),
      $(e.currentTarget.querySelector('span')),
      { max: '100px' }
    );
  },

  toggleResources: function(e) {
    if (!this.landscape) {
      this._slidePanel(
        this.find('#more-resources'),
        $(e.currentTarget.lastElementChild)
      );
    } else {
      if ($('#more-resources').css('display') !== 'none') return;
      $('#map-canvas, #location, .contests').hide();
      $('.info.box')
        .css({
          'background-color':'#1C7CA5',
          width: '100%'
        });

      $(':not(#resources-toggle) .right-arrow').removeClass('hidden');
      $(':not(#resources-toggle) .left-arrow').addClass('hidden');

      $('#resources-toggle')
        .css({
          'background-color':'#57c4f7',
          width: '105%',
        });
      $('#resources-toggle .right-arrow').addClass('hidden');
      $('#resources-toggle .left-arrow').removeClass('hidden');

      $('#more-resources')
        .css({
          'max-height':'2000px'
        }).show();
    }
  },

  toggleBallot: function() {
    // if (!this.landscape || $('.contests').css('display') !== 'none') return;
    if (!this.landscape) return;
    $('#map-canvas, #location, #more-resources').hide();
    $('.info.box')
      .css({
        'background-color':'#1C7CA5',
        'width': '100%'
      });

    $(':not(#ballot-information) .right-arrow').removeClass('hidden');
    $(':not(#ballot-information) .left-arrow').addClass('hidden');

    $('#ballot-information')
      .css({
        'background-color':'#57c4f7',
        'width': '105%',
      });

    $('#ballot-information .right-arrow').addClass('hidden');
    $('#ballot-information .left-arrow').removeClass('hidden');
    $('.contests').show();
  },

  toggleContest: function(e) {
    // this._slidePanel(
    //   e.currentTarget.lastElementChild,
    //   e.currentTarget.firstElementChild.lastElementChild
    // );
    if (!$(e.target).hasClass('subsection')) return;
    var candidateList = $(e.currentTarget).find('.candidate-list');
    var toggleSign = $(e.currentTarget).find('span');

    if (candidateList.css('max-height') !== '0px') {
      candidateList.css('max-height', '0px');
      toggleSign.text('+')
    } else {
      candidateList.css('max-height', '2000px');
      toggleSign.text('-')
      this._scrollTo(toggleSign, 20);
    }

    // var inSymbol = '+';
    // var out = '−';
    // var max = '2000px';
    // var min = '0px';
    // if (getComputedStyle(e.currentTarget.lastElementChild)['max-height'] !== min) {
    //   e.currentTarget.lastElementChild.style['max-height'] = min;
    //   e.currentTarget.firstElementChild.lastElementChild.innerHTML = inSymbol;
    // } else {
    //   e.currentTarget.lastElementChild.style['max-height'] = max;
    //   e.currentTarget.firstElementChild.lastElementChild.innerHTML = out;
    //   this._scrollTo(e.currentTarget.firstElementChild.lastElementChild, 20);
    // }

    // this.$container.scrollTop = e.currentTarget.firstElementChild.lastElementChild.getBoundingClientRect().top - this.$container.getBoundingClientRect().top;
  },

  _slidePanel: function(panel, button, options) {
    var inSymbol = (options && options.in ? options.in : '+');
    var out = (options && options.out ? options.out : '−');
    var max = (options && options.max ? options.max : '2000px');
    var min = (options && options.min ? options.min : '0px');
    if (panel.css('max-height') !== min) {
      panel.css('max-height', min);
      button.find('.plus').removeClass('hidden');
      button.find('.minus').addClass('hidden');
    } else {
      panel.css('max-height', max);

      button.find('.minus').removeClass('hidden');
      button.find('.plus').addClass('hidden');
      this._scrollTo(button, 10);
    }

    // this.$container.scrollTop = button.getBoundingClientRect().top - this.$container.getBoundingClientRect().top;
  },

  _scrollTo: function(target, padding) {
    if (this.noScroll) return;
    $(this.$container).animate({
      scrollTop: target.offset().top - $(this.$container).offset().top + $(this.$container).scrollTop() - padding
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