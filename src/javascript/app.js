var util = require('./util.js');
var router           = require('./router.js');
var handlebars       = require('hbsfy/runtime');

handlebars.registerPartial('election', require('./views/templates/partials/election.hbs'))
handlebars.registerPartial('election-information-item', require('./views/templates/partials/election-information-item.hbs'))
handlebars.registerPartial('election-administration-body', require('./views/templates/partials/election-administration-body.hbs'))
handlebars.registerPartial('normalized-address', require('./views/templates/partials/normalized-address.hbs'))
handlebars.registerPartial('election-official', require('./views/templates/partials/election-official.hbs'))
handlebars.registerPartial('source', require('./views/templates/partials/source.hbs'))
// require('./partials.js');


google.maps.event.addDomListener(window, 'load', function() {
  router.start();
});