var $ = require('jquery')
module.exports = function(options) {
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + options.address;
  // note: this shouldn't be necessary but adding in the electionId for time being
  // (Alaska)
  if (options.electionId) url += '&electionId=' + options.electionId;
  else url += '&electionId=2000';
  console.log('making ajax request...');
  $.support.cors = true;
  $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: false,
      error: function(e){ 
        console.log(e);
        options.error && options.error();
      },
      success: function(response) {
        console.log(response)
        options.success(response);
      },
      timeout: 15000
  });
}