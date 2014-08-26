var View = require('./view.js');

module.exports = View.extend({

  $id : 'information-view',

  template: require('./templates/electionInformationTemplate.hbs'),

  events: {
    '.nav click' : 'back'
  },

  back: function() {
    this.triggerRouteEvent('voterResourcesBack');
  }
});

// module.exports = (function() {
//   var electionInformationTemplate = require('./templates/electionInformationTemplate.hbs');
//   var parentRouter;
//   var view;

//   var bindHandlers = function() {
//     var $nav = document.getElementById('all-elections');
//     $nav.addEventListener('click', function() {
//       parentRouter.route(view, 'back')
//     })
//   }

//   return view = {
//     initialize: function(router, options) {
//       parentRouter = router;
//     },
//     render: function($el, information) {
//       console.log(information)
//       $el.innerHTML = electionInformationTemplate({
//         name: information.name,
//         electionAdministrationBody: information.electionAdministrationBody,
//         localJurisdiction: information.local_jurisdiction,
//         sources: information.sources
//       });
//       bindHandlers();
//     }
//   }
// })(this);