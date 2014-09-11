var apiRequest = function(options) {
  var request = new XMLHttpRequest();
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + options.address;
  
  // note: this shouldn't be necessary but adding in the electionId for time being
  // (Alaska)
  if (options.electionId) url += '&electionId=' + options.electionId;
  else url += '&electionId=2000';

  request.open('GET', url, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4){
      if (this.status >= 200 && this.status < 400){
        options.success(JSON.parse(this.responseText));
      } else {
        options.error && options.error();
      }
    }
  };

  request.send();
  request = null;
};

module.exports = apiRequest;