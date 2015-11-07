;(function(){

  angular.module( 'gitWorkflowsApplication', ['LocalStorageModule'] )
         .config( function(localStorageServiceProvider) {
            localStorageServiceProvider.setPrefix('git-workflows');
          });

  /////////////////////////////////////////////////////////////////////////////
  angular.module('gitWorkflowsApplication').directive('gitWorkflowsSelector', [function(){
    
    var controller = ['$scope', 'localStorageService', function($scope, localStorageService) {

      var kiki = 'worflow-key';

      _ANGULAR_LOCAL_STORAGE_PROXY_ = {
        get:    function(key)        { return localStorageService.get(key          ); },
        set:    function(key, value) { localStorageService.set       (key, value); },
        remove: function(key)        { localStorageService.remove    (key          ); }
      };

    }];
    
    return {
      restrict     : 'E',
      // templateUrl  : 'templates/git-workflows-selector.html',
      controller   : controller,
      controllerAs : 'ctrl',
    };

  }]);

})();
