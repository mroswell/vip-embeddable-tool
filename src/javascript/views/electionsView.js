var View = require('./view.js');

module.exports = View.extend({
  $id : 'elections-view',
  template: require('./templates/elections.hbs'),
  events: {
    '#change-your-address click' : 'back',
    '.election click' : 'election'
  },
  onRender: function() {},
  back: function() {
    this.triggerRouteEvent('electionsViewBack');
  },
  election: function(e) {
    this.triggerRouteEvent('electionsViewSubmit');
  }
});