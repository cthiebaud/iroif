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
        get:    function()         { return localStorageService.get(kiki          ); },
        set:    function(keyParam) { localStorageService.set       (kiki, keyParam); },
        remove: function(keyParam) { localStorageService.remove    (kiki          ); }
      };

    }];
    
    return {
      restrict     : 'E',
      templateUrl  : 'templates/git-workflows-selector.html',
      controller   : controller,
      controllerAs : 'ctrl',
    };

  }]);

})();
