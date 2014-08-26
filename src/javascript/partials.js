var handlebars = require('hbsfy/runtime');

handlebars.registerPartial('contest', require('./templates/partials/contest.hbs'));
handlebars.registerPartial('normalized-address', require('./templates/partials/normalized-address.hbs'))
handlebars.registerPartial('voting-location', require('./templates/partials/voting-location.hbs'))
handlebars.registerPartial('source', require('./templates/partials/source.hbs'))
handlebars.registerPartial('election-official', require('./templates/partials/election-official.hbs'))
handlebars.registerPartial('election-administration-body', require('./templates/partials/election-administration-body.hbs'))
handlebars.registerPartial('election-information-item', require('./templates/partials/election-information-item.hbs'))

handlebars.registerHelper('if', function(conditional, options) {
  if(conditional) return options.fn(this);
});
