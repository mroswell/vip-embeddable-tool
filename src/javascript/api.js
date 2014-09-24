var $ = require('jquery');

module.exports = function(options) {
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + options.address;

  // if (options.test) url += '&electionId=2000';
  url += '&production_only=false';
  if (options.officialOnly) url += '&officialOnly=' + options.officialOnly;

  $.support.cors = true;
  $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: false,
      error: function(e){ 
        options.error && options.error();
      },
      success: function(response) {
        if (typeof response.error === 'undefined') {
          options.success(response);
        }
        else options.error && options.error();
      }
  });
}