angular.module("managerApp").controller("TelecomTelephonyFaxManagementCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.fax = null;
    self.actions = null;

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function initActions () {
        var actions = [{
            name: "fax_management_information",
            main: true,
            picto: "ovh-font-details",
            sref: "telecom.telephony.fax.management.informations",
            text: $translate.instant("telephony_group_fax_management_action_informations")
        }, {
            name: "fax_management_terminate",
            sref: "telecom.telephony.fax.management.terminate",
            main: true,
            picto: "ovh-font-filled-error",
            text: $translate.instant("telephony_group_fax_management_action_terminate")
        }];

        self.actions = actions;
    }

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            initActions();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_fax_loading_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
