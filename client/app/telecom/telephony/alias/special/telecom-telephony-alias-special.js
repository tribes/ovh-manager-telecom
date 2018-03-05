angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.special", {
        url: "/special",
        views: {
            aliasInnerView: {
                templateUrl: "app/telecom/telephony/alias/special/telecom-telephony-alias-special.html",
                controller: "TelecomTelephonyAliasSpecialCtrl",
                controllerAs: "AliasSpecialCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/special"]
    });
});
