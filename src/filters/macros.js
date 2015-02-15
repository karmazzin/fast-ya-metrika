(function(module){ 'use strict';

module.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
})
.filter('yandexDate', ['$filter', function($filter) {
    return function(input) {
        if(input == null){ return ""; }

        return  input.substr(6,2) + '.' + input.substr(4,2) + '.' + input.substr(2,2);
    };
}]);

}(angular.module('macros', [])));

