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
    '$akChrome',
    function($localStorage, $resource, $timeout, $akChrome) {
        var ctrl = this;
        ctrl.messages = [];

        if (!$localStorage.firstOpen) {
            ctrl.messages.push({type: 'info', text: 'Привет, уважаемый! Понравилось расширение? Расскажи друзьям. Есть замечания или предложения - пиши отзыв в Webstore.', callback: function() {
                $localStorage.firstOpen = true;
            }});
        }

        if (!$localStorage.gaFirst) {
            _gaq.push(['_trackEvent', 'Alert', 'Info', 'First open ' + new Date]);
            $localStorage.gaFirst = true;
        }

        var Counters = $resource('https://api-metrika.yandex.ru/counters.json',
            {callback: "JSON_CALLBACK"},
            { get: { method: 'JSONP'}});

        var Counter_info = $resource('https://api-metrika.yandex.ru/stat/traffic/summary.json?id=:id',
            {callback: "JSON_CALLBACK"},
            { get: { method: 'JSONP'}});

        ctrl.fnGetCountersList = function(a) {
            if (a) _gaq.push(['_trackEvent', 'Action', 'Clear cache button']);

            ctrl.messages = [];

            Counters.get({}, function(response) {
                ctrl.counters = $localStorage.counters = response.counters;
                ctrl.counters.length = response.rows;

                if (!$localStorage.manyAlert && ctrl.counters.length > 50) {
                    ctrl.messages.push({type: 'info', text: 'У вас большое количество счетчиков, а API Я.Метрики имеет ' +
                        'ограничение на лимиты в количестве запросов. Если у вас возникнут проблемы с работой расширения,' +
                        'пожалуйста, дайте знать.', callback: function() {
                        $localStorage.manyAlert = true;
                    }});
                    _gaq.push(['_trackEvent', 'Info', 'Many counters ' + ctrl.counters.length]);
                }

                ctrl.fnGetCountersDetail();
            }, function(error) {
                ctrl.counters = $localStorage.counters = null;
                ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте авторизоваться в Яндексе', callback: function() {}});
                _gaq.push(['_trackEvent', 'Error', 'Counters list error']);
            });
        };

        ctrl.fnGetCountersDetail = function() {
            var response_date = new Date;
            $timeout(function() {
                loop(0);
            }, 500, false);

            function loop(i) {
                $timeout(function() {
                    Counter_info.get({id: ctrl.counters[i].id}, function(response) {
                        ctrl.counters[i].traffic = response;
                        ctrl.counters[i].response_date = response_date;
                        if (++i < ctrl.counters.length) loop(i);
                    }, function(error) {
                        ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте сбросить кеш', callback: function() {}});
                        _gaq.push(['_trackEvent', 'Error', 'Counters detail error']);
                    });
                }, 0);
            }
        };

        if (!$localStorage.counters || !$localStorage.counters.length) {
            ctrl.fnGetCountersList();
        } else {
            ctrl.counters = $localStorage.counters;
            ctrl.fnGetCountersDetail();
        }

}]);