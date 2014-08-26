var address              = require('../templates/partials/normalized-address.html')
  , contests             = require('../templates/contests.html')
  , pollingLocations     = require('../templates/polling-locations.html')
  , state                = require('../templates/state.html')
  , addressView          = require('./addressView.js')
  // , electionView         = require('./electionView.js')
var apiRequest           = require('./api.js')
  // , route                = require('./route.js')
  , handlebars           = require('hbsfy/runtime')
  , autocomplete
  , parser = new DOMParser();

var $container = document.getElementById('container');
var append = function (html) { document.body.innerHTML += html; };

append(addressView.render());

handlebars.registerPartial('contest', require('../templates/partials/contest.html'))
handlebars.registerPartial('normalized-address', require('../templates/partials/normalized-address.html'))
handlebars.registerPartial('voting-location', require('../templates/partials/voting-location.html'))
handlebars.registerPartial('source', require('../templates/partials/source.html'))
handlebars.registerPartial('election-official', require('../templates/partials/election-official.html'))
handlebars.registerPartial('election-administration-body', require('../templates/partials/election-administration-body.html'))
// handlebars.registerPartial('election', require('../templates/partials/election.html'))

handlebars.registerHelper('if', function(conditional, options) {
  if(conditional) return options.fn(this);
});

apiRequest('10635 e ali palmer 99645', function(data) {
  console.log(data);
  // document.body.removeChild(document.getElementById('address-input'));
  append(state(data.state[0]));
  // append(electionView.render(data.election));
  append(address(data.normalizedInput));
  append(pollingLocations(data));

  var myData = data;
  myData.contests = data.contests.sort(function(contest) { return parseInt(contest.ballotPlacement); })
  console.log(data);
  append(contests(myData));


  // remove all fields for which no information was provided by the API
  Array.prototype.filter.call(document.querySelectorAll('div'), function(div) {
    return div.innerHTML.trim() === "";
  }).map(function(empty) { empty.parentNode.removeChild(empty); });
});

google.maps.event.addDomListener(window, 'load', initializeMaps);

function initializeMaps() {

  setTimeout(function() {
      var addressInput = document.getElementById('address-input');
      autocomplete = new google.maps.places.Autocomplete(addressInput);

      google.maps.event.addListener(autocomplete, 'place_changed', function () {
        enteredAddress = autocomplete.getPlace().formatted_address;
        console.log(enteredAddress);

        apiRequest(enteredAddress, function(data) {
          console.log(data);
          append(state(data.state[0]));
          // append(election(data.election));
          append(address(data.normalizedInput));
          append(pollingLocations(data));
          append(contests(data));


          // remove all fields for which no information was provided by the API
          Array.prototype.filter.call(document.querySelectorAll('div'), function(div) {
            return div.innerHTML.trim() === "";
          }).map(function(empty) { empty.parentNode.removeChild(empty); });
        });

      });
  }, 1000);
};