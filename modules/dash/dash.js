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
    '$filter',
    '$localStorage',
    '$resource',
    '$interval',
    '$timeout',
    '$akChrome',
    function($filter, $localStorage, $resource, $interval, $timeout, $akChrome) {
        var ctrl = this;
        ctrl.messages = [];

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

        ctrl.fnGetCountersList = function(clear_cache) {
            if (clear_cache) _gaq.push(['_trackEvent', 'Action', 'Clear cache button']);

            ctrl.messages = [];

            Counters.get({}, function(response) {
                ctrl.counters = $localStorage.counters = response.counters;

                if (!$localStorage.manyAlert && ctrl.counters.length > 50) {
                    ctrl.messages.push({type: 'info', text: 'У вас большое количество счетчиков, а API Я.Метрики имеет ' +
                        'ограничение на лимиты в количестве запросов. Если у вас возникнут проблемы с работой расширения,' +
                        'пожалуйста, дайте знать.', callback: function() {
                        $localStorage.manyAlert = true;
                    }});
                    _gaq.push(['_trackEvent', 'Info', 'Many counters ' + ctrl.counters.length]);
                }

                ctrl.fnGetCountersDetail(clear_cache);
            }, function(error) {
                ctrl.counters = $localStorage.counters = null;
                ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте авторизоваться в Яндексе', callback: function() {}});
                _gaq.push(['_trackEvent', 'Error', 'Counters list error']);
            });
        };

        ctrl.fnGetCountersDetail = function(clear_cache) {
            var today = moment().format('YYYYMMDD');
            var yesterday = moment().subtract(1, 'days').format('YYYYMMDD');

            $akChrome.setBadgeText(ctrl.counters.length);
            if (!$localStorage.ttl || new Date($localStorage.ttl) < new Date() || clear_cache) {

                var i = 0;
                var isError = false;
                var stop = $interval(function() {
                    if (i < ctrl.counters.length) {
                        loop(i);
                        i++;
                    } else {
                        $localStorage.response_date = ctrl.response_date = new Date;
                        $localStorage.ttl = new Date(ctrl.response_date.getTime() + 60000);//one minute
                        $interval.cancel(stop);
                    }
                }, 20);
            } else {
                ctrl.response_date = new Date($localStorage.response_date);
            }

            function loop(i) {
                    Counter_info.get({
                        id: ctrl.counters[i].id,
                        date1: yesterday,
                        date2: today
                    }, function(response) {

                        response.data =$filter('orderBy')(response.data, 'date', true); //fix sorting
                        ctrl.counters[i].traffic = response;

                    }, function(error) {

                        if (error.status == '404') {
                            ctrl.counters[i].traffic = {
                                errors: [{
                                    text: 'Нет данных за последние 2 дня'
                                }]
                            };
                        } else if (!isError) {

                            isError = true;
                            $interval.cancel(stop);

                            ctrl.messages.push({type: 'danger', text: 'Непредвиденная ошибка, попробуйте сбросить кеш', callback: function() {}});
                            _gaq.push(['_trackEvent', 'Error', 'Counters detail error']);
                        }
                    });
            }
        };

        $akChrome.setBadgeText('...');
        $timeout(function() {
            if (!$localStorage.counters || !$localStorage.counters.length) {
                ctrl.fnGetCountersList();
            } else {
                ctrl.counters = $localStorage.counters;
                ctrl.fnGetCountersDetail();
            }
        }, 100);

}]);