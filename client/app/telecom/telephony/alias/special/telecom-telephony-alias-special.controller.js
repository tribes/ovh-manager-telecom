angular.module("managerApp").controller("TelecomTelephonyAliasSpecialCtrl", function ($stateParams, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    function init () {

        self.serviceName = $stateParams.serviceName;
        self.notSupported = false;
        self.repayments = [];

        self.isLoading = true;
        OvhApiTelephony.Rsva().Lexi().getCurrentRateCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.catch(function (err) {
            if (err && err.status === 404) {
                self.notSupported = true;
            } else {
                ToastError(err);
            }
        }).finally(function () {
            self.isLoading = false;
        });
    }

    init();
});
