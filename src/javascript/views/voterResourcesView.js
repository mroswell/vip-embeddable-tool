var View = require('./view.js');
var voterIdData = require('../voterIdData.js');

module.exports = View.extend({

  $id : 'information-view',

  template: require('./templates/electionInformationTemplate.hbs'),

  events: {
    '.nav click' : 'back'
  },

  onBeforeRender: function(options) {
    var stateData = Array.prototype.filter.call(voterIdData, function(entry) {
      return entry.State === options.data.normalizedInput.state;
    });
    stateData = stateData[0];
    var voterId = {};
    var i = 0;
    for (var key in stateData) {
      voterId[i] = { 
        'question' : key,
        'answer' : stateData[key]
      }
      i += 1;
    }
    options.data.voterId = voterId;
    // options.data.voterIdData = stateData[0];
    console.log(options.data);
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