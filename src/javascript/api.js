var $ = require('jquery')
module.exports = function(options) {
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + options.address;
  // note: this shouldn't be necessary but adding in the electionId for time being
  // (Alaska)
  if (options.electionId) url += '&electionId=' + options.electionId;
  else url += '&electionId=2000';
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
        window.response = response
        if (typeof response.error === 'undefined')
          options.success(response);
        else options.error && options.error();
      },
      timeout: 15000
  });
}