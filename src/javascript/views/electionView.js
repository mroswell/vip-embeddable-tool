module.exports = (function() {
  var electionsTemplate = require('./templates/elections.hbs');
  var parentRouter;
  var view;

  var bindHandlers = function() {
    var $nav = document.getElementById('change-your-address');
    var $elections = document.getElementsByClassName('election');
    $nav.addEventListener('click', function() {
      parentRouter.route(view, 'back')
    });
    Array.prototype.forEach.call($elections, function($election) {
      $election.addEventListener('click', function() {
        parentRouter.route(view, 'next');
      })
    });
  }

  return view = {
    initialize: function(router, options) {
      parentRouter  = router;
    },
    render: function($el, elections) {
      $el.innerHTML = electionsTemplate({elections: elections});
      bindHandlers();
    }
  }
})(this);