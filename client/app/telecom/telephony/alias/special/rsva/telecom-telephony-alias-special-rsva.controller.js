angular.module("managerApp").controller("TelecomTelephonyAliasSpecialRsvaCtrl", function ($scope, $stateParams, $filter, $translate, OvhApiOrder, OvhApiTelephony, OvhApiTelephonyService, URLS, costs, Toast, ToastError, telephonyBulk) {
    "use strict";

    const self = this;

    self.init = function () {

        self.rsva = {};
        self.rsvaForm = {};

        self.links = _.pick(URLS, ["transferTable", "deontology", "graphicCharter", "svaToSvaPlus"]);
        self.tariffBearingPrice = costs.rsva.tariffBearing.value + " " + (costs.rsva.tariffBearing.currencyCode === "EUR" ? "€" : costs.rsva.tariffBearing.currencyCode);

        self.isLoading = true;
        OvhApiTelephony.Rsva().Lexi().getCurrentRateCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (rateCodeInfos) {
            self.rateCodeInfos = rateCodeInfos;

            OvhApiTelephony.Rsva().Lexi().getScheduledRateCode({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.catch(function () {
                return false;
            }).then(function (scheduledRateCode) {
                if (scheduledRateCode) {
                    self.scheduledRateCode = scheduledRateCode;
                    self.formattedEffectiveDatetime = $filter("date")(self.scheduledRateCode.effectiveDatetime, "dd/MM/yyyy");
                    self.formattedCancelLimitDatetime = $filter("date")(self.scheduledRateCode.cancelLimitDatetime, "dd/MM/yyyy");
                    self.tariffBearingPrice = self.scheduledRateCode.updateRateCodePriceWithoutTax.value ? self.scheduledRateCode.updateRateCodePriceWithoutTax.text : self.tariffBearingPrice;
                }

                OvhApiTelephony.Rsva().Lexi().getAllowedRateCodes({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (allowedRateCodes) {
                    self.allowedRateCodes = allowedRateCodes;
                    self.rsva.rateCode = _.find(self.allowedRateCodes, { code: _.get(rateCodeInfos, "rateCode") });
                    self.rsvaForm.rateCode = self.rsva.rateCode;

                    OvhApiTelephonyService.Lexi().directory({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName
                    }).$promise.then(function (result) {
                        self.rsvaInfos = _.pick(result, ["siret", "email"]);

                        OvhApiOrder.Lexi().schema().$promise.then(function (schema) {
                            if (schema && schema.models["telephony.NumberSpecialTypologyEnum"] && schema.models["telephony.NumberSpecialTypologyEnum"].enum) {
                                self.typologies = _.map(_.filter(schema.models["telephony.NumberSpecialTypologyEnum"].enum, function (elt) {
                                    return elt.match(new RegExp("^" + result.country + "_"));
                                }), function (typo) {
                                    return {
                                        value: typo,
                                        label: $translate.instant("telephony_alias_special_rsva_infos_typology_" + typo.replace(new RegExp("^" + result.country + "_"), "") + "_label")
                                    };
                                });
                                self.rsva.typology = self.typologies[0];
                                self.rsvaForm.typology = self.rsva.typology;
                            }
                        }).catch(function (err) {
                            return new ToastError(err);
                        }).finally(function () {
                            self.isLoading = false;
                        });
                    }).catch(function (err) {
                        return new ToastError(err);
                    });
                }).catch(function (err) {
                    return new ToastError(err);
                });
            }).catch(function (err) {
                return new ToastError(err);
            });
        }).catch(function (err) {
            return new ToastError(err);
        });

    };

    self.additionalInfos = function (rateCode) {
        if (rateCode.pricePerCallWithoutTax.value) {
            return " (" + rateCode.pricePerCallWithoutTax.text + $translate.instant("telephony_alias_special_rsva_tariff_bearing_per_call") + ")";
        } else if (rateCode.pricePerMinuteWithoutTax.value) {
            return " (" + rateCode.pricePerMinuteWithoutTax.text + $translate.instant("telephony_alias_special_rsva_tariff_bearing_per_minute") + ")";
        }
        return "";
    };

    self.onChangeTariffBearing = function () {
        self.rateCodeChanged = !angular.equals(self.rsva.rateCode, self.rsvaForm.rateCode);
        return self.rateCodeChanged;
    };

    self.hasChanges = function () {
        return (self.rateCodeChanged && self.tariffBearingChangeAgreed) || !angular.equals(self.rsva.typology, self.rsvaForm.typology);
    };

    self.applyChanges = function () {
        self.isUpdating = true;
        return OvhApiTelephony.Rsva().Lexi().scheduleRateCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, { rateCode: self.rsvaForm.rateCode.code || "" }).$promise.then(function () {
            self.rsva = angular.copy(self.rsvaForm);
            self.isEditing = false;
            Toast.success($translate.instant("telephony_alias_special_rsva_success"));

            // TODO add PUT /telephony/{billingAccount}/number/{serviceName} for typology

        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isUpdating = false;
        });
    };

    self.cancelEdition = function () {
        self.isEditing = false;
        self.rsvaForm.rateCode = self.rsva.rateCode;
        self.rsvaForm.typology = self.rsva.typology;
        self.rateCodeChanged = false;
    };

    /* =====================================
    =                  BULK                =
    ====================================== */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "rsva",
            actions: [{
                name: "scheduleRateCode",
                route: "/telephony/{billingAccount}/rsva/{serviceName}/scheduleRateCode",
                method: "POST",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        // TODO check why filter does nothing good

        return _.filter(services, function (service) {
            return ["easyHunting"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        return {
            rateCode: self.rsvaForm.rateCode.code
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_alias_special_rsva_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_alias_special_rsva_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_alias_special_rsva_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        OvhApiTelephonyService.Lexi().resetCache();
        self.init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_alias_special_rsva_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    self.init();
});
