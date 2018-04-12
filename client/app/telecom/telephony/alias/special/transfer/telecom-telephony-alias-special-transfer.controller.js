angular.module("managerApp").controller("TelecomTelephonyAliasSpecialTransferCtrl", function ($stateParams, $filter, OvhApiTelephony, ToastError, OvhApiTelephonyService) {
    "use strict";

    var self = this;

    self.$onInit = function () {

        self.serviceName = $stateParams.serviceName;
        self.notSupported = false;
        self.repayments = [];
        self.totalRepayment = {
            calls: 0,
            duration: 0,
            price: 0
        };

        self.state = {
            orderBy: "date",
            orderDesc: false
        };

        self.isLoading = true;
        OvhApiTelephonyService.RepaymentConsumption().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (repayments) {
            _.each(repayments, function (repayment) {
                OvhApiTelephonyService.RepaymentConsumption().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    consumptionId: repayment
                }).$promise.then(function (data) {
                    if (data.price > 0) {
                        self.repayments.push(data);
                        self.totalRepayment.calls++;
                        self.totalRepayment.duration += data.duration;
                        self.totalRepayment.price += data.price;
                    }
                });
            });
        }).finally(function () {
            self.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.state.raw);
        data = $filter("orderBy")(
            data,
            self.state.orderBy,
            self.state.orderDesc
        );
        self.state.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.state.orderBy === by) {
            self.state.orderDesc = !self.state.orderDesc;
        } else {
            self.state.orderBy = by;
        }
        self.applySorting();
    };
});
