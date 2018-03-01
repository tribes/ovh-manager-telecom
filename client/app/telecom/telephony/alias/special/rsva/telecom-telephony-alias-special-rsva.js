angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.special.rsva", {
        url: "/rsva",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/special/rsva/telecom-telephony-alias-special-rsva.html",
                controller: "TelecomTelephonyAliasSpecialRsvaCtrl",
                controllerAs: "AliasSpecialRsvaCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/special/rsva"]
    });
});
