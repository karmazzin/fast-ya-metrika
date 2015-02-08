(function(module){ 'use strict';
    module.factory('jsonpInterceptor', ['$timeout', '$window', '$q', function($timeout, $window, $q) {
        var last_id = 0;
        return {
            'request': function(config) {

                if (config.method === 'JSONP') {
                    var callbackId = last_id.toString(36);
                    last_id++;

                    config.callbackName = 'angularcallbacks_' + callbackId;
                    config.url = config.url.replace('JSON_CALLBACK', config.callbackName);

                    $timeout(function() {
                        $window[config.callbackName] = angular.callbacks['_' + callbackId];
                    }, 0, false);
                }

                return config;
            },

            'response': function(response) {

                var config = response.config;

                if (config.method === 'JSONP') {
                    delete $window[config.callbackName]; // cleanup
                }

                return response;
            },

            'responseError': function(rejection) {
                var config = rejection.config;
                if (config.method === 'JSONP') {
                    delete $window[config.callbackName]; // cleanup
                }

                return $q.reject(rejection);
            }
        };
    }])
}(angular.module('jsonpFix', [])));