var apiRequest = function(address, success, electionId) {
  var request = new XMLHttpRequest();
  var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=AIzaSyCLNlhlWcKcozqYRq9M1_j25GLUzqrJxH8&address=' + address;
  
  // note: this shouldn't be necessary but adding in the electionId for time being
  // (Alaska)
  if (electionId) url += '&electionId=' + electionId;
  // else url += '&electionId=2000';

  request.open('GET', url, true);

  request.onreadystatechange = function() {
    if (this.readyState === 4){
      if (this.status >= 200 && this.status < 400){
        success(JSON.parse(this.responseText));
      } else {
        // error();
      }
    }
  };

  request.send();
  request = null;
};

module.exports = apiRequest;