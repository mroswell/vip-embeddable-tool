var $ = require('jquery');

module.exports = function(options) {
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?';

  if (options.key) url += 'key=' + options.key;
  if (options.address) url += '&address=' + options.address;
  // window.console && console.log('test: %s', options.test);
  if (options.test) url += '&electionId=2000';
  if (options.officialOnly) url += '&officialOnly=' + options.officialOnly;
  if (typeof options.productionDataOnly !== 'undefined') {
    url += '&productionDataOnly=' + options.productionDataOnly;
  }

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