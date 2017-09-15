angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.displayExternalNumber", {
        url: "/displayExternalNumber",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/calls/displayExternalNumber/telecom-telephony-line-calls-displayExternalNumber.html",
                controller: "TelecomTelephonyLineCallsDisplayExternalNumberCtrl",
                controllerAs: "LineDisplayExternalNumberCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/displayExternalNumber"]
    });
});
