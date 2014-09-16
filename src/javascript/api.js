var $ = require('jquery')
module.exports = function(options) {
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + options.address;
  // note: this shouldn't be necessary but adding in the electionId for time being
  // (Alaska)
  if (options.electionId) url += '&electionId=' + options.electionId;
  else url += '&electionId=2000';
  $.ajax({
      url: url,
      dataType: 'json',
      error: function(){ options.error && options.error() },
      success: function(response) { options.success(response) },
      timeout: 15000
  });
}