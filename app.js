(function(app) { 'use strict';

app
.config([
    '$httpProvider',
    '$urlRouterProvider',
    '$akChromeProvider',
    function($httpProvider, $urlRouterProvider, $akChromeProvider) {
        $httpProvider.interceptors.push('jsonpInterceptor');
        $urlRouterProvider.otherwise( function($injector) {
            var $state = $injector.get("$state");
            $state.go("main");
        });
        $akChromeProvider.setBadgeColor({color:[0, 0, 0, 190]});
    }])

.run([
    '$state',
    '$rootScope',
    function($state, $rootScope) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            $state.previous = fromState;
            $state.previous.params = fromParams;
        });
    }])

}(angular.module('metrikangular', [
        'ngStorage',
        'ngResource',
        'ui.router',
        'ui.bootstrap',
        'metrikangular.dash',
        'jsonpFix',
        'messages',
        'macros',
        'ak.chrome'
    ])));
