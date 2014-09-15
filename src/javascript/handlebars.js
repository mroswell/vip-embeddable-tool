var handlebars = require('hbsfy/runtime');

module.exports = (function() {
  return {
    registerHelpers: function() {
      handlebars.registerHelper('json', function(context) { return JSON.stringify(context) });
    },

    registerPartials: function() {
      handlebars.registerPartial(
        'election', 
        require('./views/templates/partials/election.hbs')
      );

      handlebars.registerPartial(
        'election-information-item', 
        require('./views/templates/partials/election-information-item.hbs')
      );

      handlebars.registerPartial(
        'election-administration-body', 
        require('./views/templates/partials/election-administration-body.hbs')
      );

      handlebars.registerPartial(
        'normalized-address', 
        require('./views/templates/partials/normalized-address.hbs')
      );

      handlebars.registerPartial(
        'election-official', 
        require('./views/templates/partials/election-official.hbs')
      );

      handlebars.registerPartial(
        'source', 
        require('./views/templates/partials/source.hbs')
      );

      handlebars.registerPartial(
        'contest', 
        require('./views/templates/partials/contest.hbs')
      );

      handlebars.registerPartial(
        'modals', 
        require('./views/templates/partials/modals.hbs')
      );

      handlebars.registerPartial(
        'address', 
        require('./views/templates/partials/address.hbs')
      );

      handlebars.registerPartial(
        'polling-location-info', 
        require('./views/templates/partials/polling-location-info.hbs')
      );
    }
  }
})(this);