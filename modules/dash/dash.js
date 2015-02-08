'use strict';

angular.module('metrikangular.dash', [])
.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('main', {
            url: "/main",
            controllerAs: 'main',
            controller: "metrikangular.dash.main",
            templateUrl: "modules/dash/view/main.html",
            resolve: {

            },
            data: {
                viewTitle: 'Dashboard'
            }
        })
}])
.controller('metrikangular.dash.main', [
    '$localStorage',
    '$resource',
    '$timeout',
    function($localStorage, $resource, $timeout) {
        var ctrl = this;
        ctrl.messages = [];

        if (!$localStorage.firstOpen) {
            ctrl.messages.push({type: 'info', text: 'Привет, уважаемый! Понравилось расширение? Расскажи друзьям. Есть замечания или предложения - пиши отзыв в Webstore.', callback: function() {
                $localStorage.firstOpen = true;
            }});
        }

        var Counters = $resource('https://api-metrika.yandex.ru/counters.json',
            {callback: "JSON_CALLBACK"},
            { get: { method: 'JSONP'}});

        var Counter_info = $resource('https://api-metrika.yandex.ru/stat/traffic/summary.json?id=:id',
            {callback: "JSON_CALLBACK"},
            { get: { method: 'JSONP'}});

        ctrl.fnGetCountersList = function() {
            ctrl.messages = [];

            Counters.get({}, function(response) {
                ctrl.counters = $localStorage.counters = response.counters;
                ctrl.fnGetCountersDetail();
            }, function(error) {
                ctrl.counters = $localStorage.counters = null;
                ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте авторизоваться в Яндексе', callback: function() {}});
            });
        };

        ctrl.fnGetCountersDetail = function() {
            var bError = false;
            ctrl.counters.map(function(counter) {
                Counter_info.get({id: counter.id}, function(response) {
                    counter.traffic = response;
                }, function(error) {
                    if (!bError) {
                        bError =true;
                        ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте сбросить кеш', callback: function() {}});
                    }
                });
            });
        };

        if (!$localStorage.counters) {
            ctrl.fnGetCountersList();
        } else {
            ctrl.counters = $localStorage.counters;
            ctrl.fnGetCountersDetail();
        }

}]);