vip-embeddable-tool
===================

The Voting Information Project is developing a white-label, easily embedded web tool that will provide voters with ballot and polling place information based on their registered address.

# Setup Instructions

1. `npm install -g gulp`
2. `npm install`
3. `bundle`
4. `gulp`

# Testing Instructions

1. Download [PhantomJS](http://phantomjs.org/download.html)
2. `bundle`
3. `rspec spec/examples.rb`


## TODO

### UI
* Build out remaining views
* Figure out about Google Maps collateral issue

### Structure
* Separate out router events for different views
* Figure out routing for separate elections, re-request API
* Dropbox WA, OR edge case
* Load S3 Voter ID data

### Testing
* Write mocks / stubs for different API use cases (ie one or more elections)
