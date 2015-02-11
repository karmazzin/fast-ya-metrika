'use strict';

(function(module, chrome) {
    module.provider('$akChrome', function() {
        var self = this;

        this.setBadgeColor = chrome.browserAction.setBadgeBackgroundColor;
        this.setBadgeText = function(text) {
            chrome.browserAction.setBadgeText({text: text + ''});
        };

        this.$get = function() {

            function Chrome() {
                this.setBadgeColor = self.setBadgeColor;
                this.setBadgeText = self.setBadgeText;
            }

            return new Chrome();

        };

    });

}(angular.module('ak.chrome', []), chrome));