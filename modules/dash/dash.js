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

        Counters.get({}, function(response) {
            ctrl.counters = response.counters;

            ctrl.counters.map(function(counter) {
                $timeout(function() {
                    Counter_info.get({id: counter.id}, function(response) {
                        counter.traffic = response;
                    }, function(error) {
                        ctrl.messages.push({type: 'error', text: 'Непредвиденная ошибка :-(', response: error});

                    })
                },0, false)
            });
        }, function(error) {
            ctrl.messages.push({type: 'error', text: 'Непредвиденная ошибка, вероятно необходимо авторизоваться в Яндексе', response: error});
        });

}]);