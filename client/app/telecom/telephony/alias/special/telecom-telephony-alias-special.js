angular.module("managerApp").config(($stateProvider) => {

    $stateProvider.state("telecom.telephony.alias.special", {
        url: "/special",
        views: {
            "aliasInnerView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/special/telecom-telephony-alias-special.html"
            }
        },
        translations: ["common", "telecom/telephony/alias/special"],
        resolve: {
            specialAliasDetails: ($stateParams, OvhApiTelephony) =>
                OvhApiTelephony.Rsva().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then((details) => details).catch(() => ({}))
        }
    });
});
