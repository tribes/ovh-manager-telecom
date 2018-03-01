angular.module("managerApp").controller("TelecomTelephonyAliasSpecialFeesCtrl", function ($stateParams, $filter, OvhApiTelephony, ToastError, OvhApiTelephonyService) {
    "use strict";

    var self = this;

    self.init = function () {

        self.serviceName = $stateParams.serviceName;
        self.notSupported = false;
        self.fees = [];
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
        OvhApiTelephony.Rsva().Lexi().getCurrentRateCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function () {
            OvhApiTelephonyService.RepaymentConsumption().Lexi().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(function (fees) {
                _.each(fees, function (fee) {
                    OvhApiTelephonyService.RepaymentConsumption().Lexi().get({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        consumptionId: fee
                    }).$promise.then(function (data) {
                        if (data.price < 0) {
                            data.price = Math.abs(data.price);
                            self.fees.push(data);
                            self.totalRepayment.calls++;
                            self.totalRepayment.duration += data.duration;
                            self.totalRepayment.price += data.price;
                        }
                    });
                });
            }).finally(function () {
                self.isLoading = false;
            });
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

    self.init();
});
