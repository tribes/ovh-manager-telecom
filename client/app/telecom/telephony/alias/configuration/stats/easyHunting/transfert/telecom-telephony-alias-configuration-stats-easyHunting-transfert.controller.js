angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationStatsEasyHuntingTransfertCtrl", function ($scope, $uibModalInstance, $translate, Telephony, Toast, params) {
    "use strict";

    var self = this;

    self.$onInit = function () {
        self.number = null;
        self.error = null;
        self.isSubmitting = false;
    };

    self.cancel = function () {
        $uibModalInstance.dismiss();
    };

    self.submit = function () {
        self.isSubmitting = true;
        self.error = null;
        return Telephony.EasyHunting().Hunting().Queue().LiveCalls().Lexi().transfer({
            billingAccount: params.billingAccount,
            serviceName: params.serviceName,
            queueId: params.queueId,
            id: params.callId
        }, {
            number: self.number
        }).$promise.then(function () {
            $uibModalInstance.dismiss();
            Toast.success($translate.instant("telephony_alias_configuration_mode_calls_action_transfert_success"));
        }).catch(function (err) {
            self.error = _.get(err, "data.message") || _.get(err, "message") || err;
        }).finally(function () {
            self.isSubmitting = false;
        });
    };
});
