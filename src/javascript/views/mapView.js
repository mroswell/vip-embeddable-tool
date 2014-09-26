var View = require('./view.js');
var api  = require('../api.js');
var voterIdData = require('../voterIdData.js');
var $ = require('jquery');
var fastclick = require('fastclick');
var ouiCal = require('../ouical.js');

module.exports = View.extend({

  $id : 'map-view',

  template : require('./templates/map.hbs'),

  addressPartial: require('./templates/partials/address.hbs'),

  pollingLocationPartial: require('./templates/partials/polling-location-info.hbs'),

  landscape: false,

  hasSubmitted: false,

  events: {
    '#map-view click' : "closePopUps",
    '.nav click' : 'back',
    '.contest-toggle click' : 'toggleContest',
    '.election-selection click' : 'changeElection',
    '#registered-address click' : 'changeAddress',
    '#vote-address-edit click' : 'changeAddress',
    '.address click' : 'changeAddress',
    '#fade click' : 'changeAddress',
    '#more-locations click' : 'moreLocations',
    '#voter-resources click' : 'voterResources',
    '#polling-location click' : 'toggleMap',
    '#more-elections click' : 'toggleElections',
    '#resources-toggle click' : 'toggleResources',
    '#plus-icon click' : 'openAboutModal',
    '#close-button click' : 'closeAboutModal',
    '#ballot-information click' : 'toggleBallot',
    '#alert click' : 'closeAlert'
  },

  map: null,

  markers: [],

  address: '',

  onBeforeRender: function(options) {

    if(navigator.userAgent.match('CriOS')) {
      $('<meta>')
        .attr('name', 'viewport')
        .attr('content', 'width=device-width,initial-scale=0.75')
        .attr('id', 'viewport-mobile-web-tag')
        .appendTo($('head'));
    }

    $(this.$container).css('-webkit-overflow-scrolling', 'touch')

    // comb the voter id data
    var stateData = Array.prototype.filter.call(voterIdData, function(entry) {
      return entry.State === options.data.normalizedInput.state;
    });
    stateData = stateData[0];
    var voterId = {};
    var i = 0;
    for (var key in stateData) {
      if (key !== 'Complete Voter ID Information') {
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

    if (state.electionAdministrationBody &&
        state.electionAdministrationBody.correspondenceAddress &&
        state.electionAdministrationBody.physicalAddress) {

      // delete duplicate state election administration body address
      var correspondenceAddress = this._parseAddress(
        state.electionAdministrationBody.correspondenceAddress
      );
      var physicalAddress = this._parseAddress(
        state.electionAdministrationBody.physicalAddress
      );
      if (correspondenceAddress === physicalAddress) {
        delete options.data.state[0].electionAdministrationBody.correspondenceAddress;
      }
    }

    // WA / OR mail-in case
    if (state.name === 'Washington' || state.name === 'Oregon') {
      
    }    

    // reformat the dates
    var date = new Date(options.data.election.electionDay);

    options.data.election.dateForCalendar = date.getMonth() + 1 + '/' + date.getDate() + '/' +  date.getFullYear();

    var newDate = date.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    options.data.election.electionDay = newDate;

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

    $('<div id="_vitModal">')
      .prependTo($('html'));
  },

  onAfterRender: function(options) {
    var scrapeAddress = function(arr) {
      return Array.prototype.reduce.call(
        arr,
        function(m, n) { return m + $(n).text().trim() },
        ''
      );
    }
    if (scrapeAddress($('#local-jurisdiction-correspondence-address').children().children()) 
      === scrapeAddress($('#local-jurisdiction-physical-address').children().children())) {
      $('#local-jurisdiction-correspondence-address').remove();
    }

    if (scrapeAddress($('#state-election-correspondence-address').children().children()) 
      === scrapeAddress($('#state-election-physical-address').children().children())) {
      $('#state-election-correspondence-address').remove();
    }

    $('.election-administration-address').each(function() {
      if (scrapeAddress($(this).children().children()).length === 2) $(this).remove();
    })

    if (typeof this.data.otherElections === 'undefined') {
      $('#more-elections .toggle-image').hide();
    }

    var informationLinks = $('.information-links');
    if (!informationLinks.val()) {
      informationLinks.prev().hide();
      informationLinks.hide();
    }

    if (options.alert) {
      this.find('#alert')
        .find('#text')
          .text(options.alert)
        .end()
        .show();
    }

    this.resizeListener = function() {

      if (!this.modal) {
        if (this.$container.width() < 500) {
          // set to mobile view
          this.landscape = false;
          this.$container.css({
            'overflow-y':'scroll',
            'overflow-x':'hidden'
          })
        } else {
          this.landscape = true;
          this.$container.width(options.width);
          this.$container.height(options.height)
          if (this.$container.width() < 600) {
            this.find('.info').css({ 'font-size': '14px' });
            this.find('.election').css({ 'font-size': '16px' });
            this.find('.subsection').css({ 'font-size': '15px' });
            this.find('.right .box').css({ 'padding': '5px 15px' });
            this.find('#more-resources h1').css({ 'font-size': '16px' });
          } else {
            if (this.$container.height() < 480) {
              // $('.left-wrapper')[0].style['overflow-y'] = 'auto';
              // $('.left-wrapper')[0].style['overflow-x'] = 'hidden';
              // css({
              //   overflowY: 'auto',
              //   overflowX: 'hidden'
              // })
            }
          }
        }
        return;
      }

      var width = $(window).width()
        , height = $(window).height()
        , screenWidth = screen.availWidth
        , screenHeight = screen.availHeight;

      if (!$('#viewport-mobile-web-tag').length) {
        $('<meta>')
          .attr('name', 'viewport')
          .attr('content', 'width=device-width,initial-scale=1.0')
          .attr('id', 'viewport-mobile-web-tag')
          .appendTo($('head'));
      }

      if (screenWidth < 600) {

        var width = $(window).width()
          , height = $(window).height()
          , screenWidth = screen.availWidth
          , screenHeight = screen.availHeight;

        this.$container.width(width);
        this.$container.height(height);
        this.landscape = false;
      } else {
        // tablet sizing
        this.$container
          .width(width-40);

        var containerWidth = this.$container.width();
        this.$container
          .height(containerWidth * (7/10));

        var containerHeight = this.$container.height();

        this.$container
          .css({
            'top':((height/2) - (containerHeight/2)) + 'px',
            'left':((width/2) - (containerWidth/2)) + 'px'
          });

        $('#_vitModal').css({
          'width': width,
          'height': height
        })

        this.landscape = true;
      }

      if (this.modal && !this.landscape) {
        this.$container
          .addClass('floating-container')
        $('html, body')
          .removeClass('max-height')
          .find('body')
            .addClass('no-scroll');
      } else if (this.modal && this.landscape) {
        this.$container
          .addClass('floating-modal-container')
        $('html, body')
          .addClass('max-height')
          .find('body')
            .removeClass('no-scroll')
      }

      $(window)
        .scrollTop(0)
        .scrollLeft(0)
    };

    this.prevWidth = this.$container.width();
    this.prevHeight = this.$container.height();
    this.prevLeft = this.$container.css('left');
    this.prevTop = this.$container.css('top');

    $(window).on('resize.mapview', this.resizeListener.bind(this));

    this.resizeListener();


    var that = this;
    if (options.data.pollingLocations && options.data.pollingLocations.length) {
      var primaryLocation = options.data.pollingLocations[0];
      var address = this._parseAddress(primaryLocation.address);
      var daddr = this._parseAddressWithoutName(primaryLocation.address)
      var saddr = this._parseAddressWithoutName(options.data.normalizedInput);

      this._encodeAddressAndInitializeMap(primaryLocation.address);

      this.find('#location a').attr('href', 'https://maps.google.com?daddr=' + daddr + '&saddr=' + saddr);

      primaryLocation.hours = "9am - 5pm";
      var $locationInfo = $(this.pollingLocationPartial(primaryLocation));
      this.find('#location').append($locationInfo);
      $locationInfo.find('a').attr('href', 'https://maps.google.com?daddr=' + daddr + '&saddr=' + saddr);
      $locationInfo.hide();

      if (options.data.pollingLocations.length > 1) {
        var otherLocations = options.data.pollingLocations.slice(1);

        otherLocations.forEach(function(location) {
          that._geocode(location.address, function(position) {
            that._addPollingLocation(position, location.address);
          })
        });
      }
    } else this._encodeAddressAndInitializeMap();

    if (this.landscape) this._switchToLandscape(options);


    if (options.data.state[0].electionAdministrationBody)
      this.find('#info-icon').parent().attr('href', options.data.state[0].electionAdministrationBody.electionInfoUrl);

    $('html,body').scrollLeft($(this.$container).scrollLeft());
    $('html,body').scrollTop($(this.$container).scrollTop());

    var formattedAddress = "";
    if (options.data.pollingLocations) {
      for (var key in options.data.pollingLocations[0].address) {
        formattedAddress += options.data.pollingLocations[0].address[key] + " "
      }
    }

    var myCalendar = createOUICalendar({
      options: {
        class: 'add-to-calendar-drop-class',

        // You can pass an ID. If you don't, one will be generated for you
        id: 'add-to-calendar-dropdown'
      },
      data: {
        // Event title
        title: options.data.election.name,

        // Event start date
        start: new Date(options.data.election.dateForCalendar),

        // Event duration (IN MINUTES)
        duration: 1440,

        // You can also choose to set an end time
        // If an end time is set, this will take precedence over duration
        // end: new Date('June 15, 2013 23:00'),     

        // Event Address
        address: formattedAddress,

        // Event Description
        description: options.data.election.name
      }
    });

    $('.info.box').removeClass('expanded-pane');
    $('#polling-location').addClass('expanded-pane')
    $(':not(#polling-location) .right-arrow').removeClass('hidden');
    $(':not(#polling-location) .left-arrow').addClass('hidden');
    $('#polling-location .right-arrow').addClass('hidden');
    $('#polling-location .left-arrow').removeClass('hidden');

    document.querySelector('#calendar-icon').appendChild(myCalendar);

    if ( this.$container.height() < 465 ) {
      this.find('.left-overflow-wrapper').find('.left-wrapper').css({'overflow-y': 'auto', 'overflow-x': 'hidden'});
    }

    fastclick(document.body);
  },

  closePopUps: function (e) {
    if ( !$(e.target).is( $(".add-to-calendar-checkbox") ) ) {
      $(".add-to-calendar-checkbox").attr("checked", false);
    }
  },

  onRemove: function() {
    if (this.autocomplete) google.maps.event.clearInstanceListeners(this.autocomplete);

    this.markers = [];

    this.$container.css({
      'width' : '',
      'height' : '',
      'left' : '',
      'top' : ''
    });

    $('#_vitModal').remove();

    $('#viewport-mobile-web-tag').remove();

    $(window).off('.mapview');
  },

  _switchToLandscape: function(options) {
    if (this.modal) {
      $('html, body')
        .addClass('max-height')
        .find('#_vitModal')
          .show()
          .one('click', function() {
            $('#_vitModal').hide();
            this.triggerRouteEvent('mapViewBack')
          }.bind(this))
        .end()
    }
    $('#map-view').addClass('landscape');

    $('#map-view').prepend(($('.left').detach()));
    $('.left').wrapAll('<div class="left-wrapper" />');
    $('.left-wrapper').wrapAll('<div class="left-overflow-wrapper">');
    $('.left-wrapper').prepend('<div class="left box" id="vip-logo">');
    $('.left-wrapper').append('<div class="dark-blue-box"/>');
    $('#about-resources').css('padding-left', '30px');
    $('.right').wrapAll($('<div class="right-wrapper" />'));
    $('.toggle-image.plus').attr('src', 'https://s3.amazonaws.com/vip-voter-information-tool/images/left-arrow-white.png').addClass('arrow right-arrow');
    $('.toggle-image.minus').attr('src', 'https://s3.amazonaws.com/vip-voter-information-tool/images/right-arrow-white.png').addClass('arrow left-arrow');
    $('#polling-location .right-arrow').addClass('hidden')
    $('#polling-location .left-arrow').removeClass('hidden');
    $('#more-resources').hide();
    $('.contests.right').hide();

    $('#vip-logo').css({
      'background-image': 'url(' + options.smallLogo + ')'
    });

    this.landscape = true;
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
        });
      })


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
        that.map.set('styles', [
          // {
          //   "featureType": "poi",
          //   "stylers": [
          //     { "visibility": "off" }
          //   ]
          // },
            {
    featureType: "road",
    elementType: "labels",
    stylers: [ 
      // { visibility: "simplified" }, 
      { lightness: 20 } 
    ]
  },{
    featureType: "administrative.land_parcel",
    elementType: "all",
    stylers: [ { visibility: "off" } ]
  },{
    featureType: "landscape.man_made",
    elementType: "all",
    stylers: [ { visibility: "off" } ]
  },{
    featureType: "transit",
    elementType: "all",
    stylers: [ { visibility: "off" } ]
  },
  // {
  //   featureType: "road.local",
  //   elementType: "labels",
  //   stylers: [ { visibility: "simplified" } ]
  // },{
  //   featureType: "road.local",
  //   elementType: "geometry",
  //   stylers: [ { visibility: "simplified" } ]
  // },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [ { visibility: "off" } ]
  },{
    featureType: "road.arterial",
    elementType: "labels",
    stylers: [ { visibility: "off" } ]
  },{
    featureType: "water",
    elementType: "all",
    stylers: [ 
      { hue: "#a1cdfc" },
      { saturation: 39 },
      { lightness: 49 }
    ]
  },{
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [ { hue: "#f49935" } ]
  },{
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [ { hue: "#fad959" } ]
  }

        ])

        that._addPollingLocation(position, address);
        google.maps.event.addListener(that.map, 'click', function() {
          that.toggleMap();

          that.find('#location .address').innerHTML = that.addressPartial(address);
        });

        $('#map-canvas').on(that._transitionEnd(), function() {
          google.maps.event.trigger(that.map, 'resize');
          that.map.panTo(that.markers[0].getPosition());
          if (that.map.getZoom() !== 12) that.map.setZoom(12);
          else that._fitMap();
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

  _addPollingLocation: function(position, address) {
      var marker = new google.maps.Marker({
        map: this.map,
        position: position,
        icon: 'https://s3.amazonaws.com/vip-voter-information-tool/images/blue-marker.png'
      });
      var that = this;
      // google.maps.event.addListener(marker, 'click', this._toggleMapZoom.bind(this, marker, address));
      google.maps.event.addListener(marker, 'click', this.toggleMap.bind(this, null, marker, address));
      this.markers.push(marker);
  },

  _toggleMapZoom: function(marker, address) {
      if (this.map.getZoom() !== 12) {
        this.map.panTo(marker.getPosition());
        this.map.setZoom(12);
        this.find('#location .address').innerHTML = this.addressPartial(address);
        $('.polling-location-info').slideDown('slow');
      } else {
        this._fitMap();
        $('.polling-location-info').slideUp('slow');
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
      'address': this._parseAddressWithoutName(location)
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) callback(results[0].geometry.location);
    });
  },

  changeAddress: function(e) {
    var addressInput = this.find('.change-address');
    var that = this;

    // brings up change address bar if you click .address on left, but not if you click .address on map:
    if ( $(e.currentTarget).hasClass("address") && $(e.currentTarget).closest("#location").length > 0 ) return;

    if (addressInput.is(':hidden')) {
      $("#vote-address-edit").hide();
      this.autocomplete = new google.maps.places.Autocomplete(addressInput[0], {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });
      // this.autocomplete = new google.maps.places.SearchBox(addressInput[0]);
      addressInput.prev().hide();
      addressInput.show();
      if (!this.landscape) this.find('#fade').fadeTo('fast', .25);

      $('.pac-container').addClass('pac-nudge');

      addressInput.on('focus', function() {
        addressInput.val("");
      })

      this.autocompleteListener = function() {
        if (this.hasSubmitted) return;
        var address;
        if (this.autocomplete.getPlace()) address = this.autocomplete.getPlace().formatted_address;
        if (typeof address === 'undefined') {
          var autocompleteContainer = $('.pac-container').last().find('.pac-item-query').first();
          address = autocompleteContainer.text() + ' ' +
            autocompleteContainer.next().text();
        }
        this.hasSubmitted = true;

        this._makeRequest({
          address: address,
          success: function(response) {
            this.hasSubmitted = false;
            this.triggerRouteEvent('mapViewSubmit', response);
          }.bind(this),
          error: this.handleAddressNotFound
        });
      }.bind(this);

      $(window).on('keypress', function(e) {
        if (this.hasSubmitted) return;
        var key = e.which || e.keyCode;
        if (key === 13) {
          google.maps.event.trigger(this.autocomplete, 'place_changed');
          if (this.hasSubmitted) return;
          addressInput.replaceWith(addressInput.clone());
        }
      }.bind(this));

      google.maps.event.addListener(this.autocomplete, 'place_changed', this.autocompleteListener);
    } else {
      $("#vote-address-edit").show();
      google.maps.event.clearInstanceListeners(this.autocomplete);

      addressInput.prev().show()
      addressInput.hide()
      this.find('#fade').fadeOut()
    }
  },

  handleAddressNotFound: function() {
    $('.change-address').val("");
    this.hasSubmitted = false;
  },

  changeElection: function(e) {
    var selected = $(this).firstElementChild;

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

  toggleMap: function(e, marker, address) {
    if (typeof marker === 'undefined') marker = this.markers[0];
    if (!this.landscape) {
      var canvas = this.find('#map-canvas');
      var toggle = this.find('#map-toggle');
      if (canvas.height() !== 300) {
        canvas.height(300);
        toggle.find('.minus').removeClass('hidden');
        toggle.find('.plus').addClass('hidden');
        this._scrollTo(toggle, 10);

        if (address) this.find('#location .address').innerHTML = this.addressPartial(address);
        $('.polling-location-info').show();
      } else {
        canvas.height(150);
        toggle.find('.plus').removeClass('hidden');
        toggle.find('.minus').addClass('hidden');

        $('.polling-location-info').hide();
      }
    } else {
      this.find('.right-wrapper').css('overflow', 'hidden');
      if ($('#location').is(':visible')) {
        if (this.map.getZoom() !== 12) {
          this.map.panTo(marker.getPosition());
          this.map.setZoom(12);
          if (address) this.find('#location .address').innerHTML = this.addressPartial(address);
          $('.polling-location-info').slideUp('fast');
        } else {
          this._fitMap();
          $('.polling-location-info').slideDown('fast');
        }
      } else {
        $('.info.box').removeClass('expanded-pane');
        $('#polling-location').addClass('expanded-pane')
        $(':not(#polling-location) .right-arrow').removeClass('hidden');
        $(':not(#polling-location) .left-arrow').addClass('hidden');
        $('#more-resources, .contests').hide();
        $('#map-canvas, #location').show();
        $('#polling-location .right-arrow').addClass('hidden');
        $('#polling-location .left-arrow').removeClass('hidden');
      }


    }
  },

  toggleElections: function(e) {
    if (typeof this.data.otherElections === 'undefined') return;
    e.stopPropagation();
    $('#election-list').slideToggle(100, function() {
      if (!this.landscape) this._scrollTo($('#more-elections span'), 10)
    }.bind(this));
    if (!this.landscape) {
      $('#more-elections')
        .find('.toggle-image').toggleClass('hidden');
    }
  },

  toggleResources: function(e) {
    $('.right-wrapper')
      .css('overflow', 'hidden')
      .scrollTop(0)
      .css({
        'overflow-y': 'scroll',
        'overflow-x': 'hidden'});
    if (!this.landscape) {
      $('#more-resources').slideToggle(500, function() {
        this._scrollTo($('#resources-toggle span'), 10);
        $('#resources-toggle')
          .find('.plus, .minus')
            .toggleClass('hidden');
      }.bind(this));
    } else { 
      $("#about-resources span").show();
      $('#about-resources').css("height", "initial")
      $('#map-canvas, #location, .contests').hide();
      $('#about-resources').show();
      $('.info.box')
        .removeClass('expanded-pane');
      $('#resources-toggle')
        .addClass('expanded-pane')

      $(':not(#resources-toggle) .right-arrow').removeClass('hidden');
      $(':not(#resources-toggle) .left-arrow').addClass('hidden');
      $('#resources-toggle .right-arrow').addClass('hidden');
      $('#resources-toggle .left-arrow').removeClass('hidden');


      $('#more-resources')
        .css({
          'max-height':'2000px'
        }).show();
    }
  },

  toggleBallot: function() {
    $('.right-wrapper')
      .css('overflow', 'hidden')
      .scrollTop(0)
      .css({
        'overflow-y':'scroll',
        'overflow-x':'hidden'
      });
    if (!this.landscape) {
      var ballotInfoIsMaximized = $('#ballot-information').find('.plus').is(":hidden");

      $('#ballot-information').find('.plus, .minus').toggleClass('hidden');
      var that = this;
      $(".contest-toggle").each(function (i, el) {
        var candidateList = $(el).find('.candidate-list');
        var toggleSign = $(el).find('span');
        var subsectionIsMaximized = !candidateList.is(':hidden');

        if (ballotInfoIsMaximized === subsectionIsMaximized) {
          candidateList.slideToggle(500, function() {
            var text = (subsectionIsMaximized ? '+ ' : '\u2013')
            toggleSign.text(text);
          }.bind(this));
        }
      });

      if (!ballotInfoIsMaximized) that._scrollTo($("#ballot-information"), 20);

    } else { 
      $("#about-resources span").hide();

      $('#map-canvas, #location, #more-resources, #about-resources').hide();

      $('.info.box')
        .removeClass('expanded-pane');
      $('#ballot-information')
        .addClass('expanded-pane');


      $(':not(#ballot-information) .right-arrow').removeClass('hidden');
      $(':not(#ballot-information) .left-arrow').addClass('hidden');
      $('#ballot-information .right-arrow').addClass('hidden');
      $('#ballot-information .left-arrow').removeClass('hidden');

      $('.contests').show();

      $('#about-resources').css("height", "initial")
      $('#about-resources').css("height", "0px")
    }
  },

  toggleContest: function(e) {

    if ($(e.target).hasClass('subsection') ||
        $(e.target).hasClass('subsection-plus') ||
        $(e.target).parent().hasClass('subsection') || 
        $(e.target).parent().hasClass('subsection-plus')) {
      var candidateList = $(e.currentTarget).find('.candidate-list');
      var toggleSign = $(e.currentTarget).find('span');

      candidateList.slideToggle(500, function() {
        var isHidden = candidateList.is(':hidden')
        var text = (isHidden ? '+' : '\u2013');
        toggleSign.text(text);
        if (isHidden) {
          toggleSign.css({
            'position' : 'relative',
            'left' : '-2px'
          });
        } else {
          toggleSign.css({
            'position': '',
            'left' : ''
          })
        }

        if (!candidateList.is(':hidden')) this._scrollTo(toggleSign, 20);
      }.bind(this));
    }
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
  },

  _scrollTo: function(target, padding) {
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
    this.find('#about').fadeIn('fast');
    this.find('#fade').fadeTo('fast', .2);
    e.stopPropagation();
  },

  closeAboutModal: function() {
    this.find('#about').fadeOut('fast')
    this.find('#fade').fadeOut('fast')
  },

  closeAlert: function() {
    this.find('#alert').fadeOut('slow');
  }
});