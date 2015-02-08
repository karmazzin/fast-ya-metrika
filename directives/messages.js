(function(module){ 'use strict';
    /**
     @usage:
     template example:
     <messages-alert messages="aMessages"></messages-alert>

     emaxple in code:
     $scope.aMessages.push({type:'danger',text: 'Error text'})

     aMessages array [{type, text}]
     */

    module.directive('messagesAlert', [
        function () {
            return {
                restrict:'E',
                scope: {
                    aMessages: '=messages'
                },
                template: "<div ng-repeat=\"oMessage in aMessages\" class=\"alert\" ng-class=\"['alert-' + (oMessage.type || 'warning')]\" role=\"alert\">\n" +
                    "    <button type=\"button\" class=\"close\" ng-click=\"close($index)\">\n" +
                    "        <span aria-hidden=\"true\">&times;</span>\n" +
                    "    </button>\n" +
                    "    <div ng-bind=\"oMessage.text\"></div>\n" +
                    "</div>\n",
                controller: function ($scope) {
                    $scope.close = function($index) {
                        $scope.aMessages[$index].callback();
                        $scope.aMessages.splice($index, 1);
                    }
                }
            };
        }
    ]);
}(angular.module('messages', [])));