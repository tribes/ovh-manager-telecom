angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.special.transfer", {
        url: "/transfer",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/special/transfer/telecom-telephony-alias-special-transfer.html",
                controller: "TelecomTelephonyAliasSpecialTransferCtrl",
                controllerAs: "AliasSpecialTransferCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/special/transfer"]
    });
});
