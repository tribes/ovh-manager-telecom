angular.module("managerApp").controller("PackFaxActivationCtrl", function ($stateParams, OvhApiPackXdsl, OvhApiPackXdslVoipEcofax, URLS) {
    "use strict";

    var self = this;

    var packId = $stateParams.packName;

    self.ecoFaxUrl = URLS.ecoFax;

    function init () {
        if (_.isEmpty(packId)) {
            self.error = {
                key: "fax_activation_total_error"
            };
        } else {
            return OvhApiPackXdsl.v6().getServices({ packId: packId }, function (data) {
                self.loading = false;
                self.serviceData = _.find(data, { name: "voipEcoFax" });
                self.error = null;
            }, function (err) {
                self.loading = false;
                self.message = null;
                self.error = {
                    key: "error_" + err.status,
                    data: err.data
                };
            });
        }
        return self;
    }

    self.activateFax = function () {
        self.loading = true;
        self.error = null;

        return OvhApiPackXdslVoipEcofax.v6().save({ packId: packId }, null, function () {
            self.loading = false;
            self.serviceData.available--;
            self.serviceData.inCreation++;
            self.message = "fax_activation_widget_success";
        }, function (err) {
            self.loading = false;
            self.message = null;
            self.error = {
                key: "error_" + err.status,
                data: err.data
            };
        });
    };

    init();
});
