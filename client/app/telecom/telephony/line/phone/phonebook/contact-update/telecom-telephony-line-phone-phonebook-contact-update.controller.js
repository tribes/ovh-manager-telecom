angular.module("managerApp").controller("TelecomTelephonyLinePhonePhonebookContactUpdateCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, TelephonyMediator, OvhApiTelephony, Phonebookcontact, data) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isValidNumber = function (value) {
        return !_.isEmpty(value) ? TelephonyMediator.IsValidNumber(value) : true;
    };

    self.hasChanged = function () {
        var fields = ["name", "surname", "group", "homePhone", "homeMobile", "workPhone", "workMobile"];
        return !_.isEqual(_.pick(self.phonecontactForm, fields), _.pick(data.contact, fields));
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            EVENTS            =
    ===============================*/

    self.handleContactPhoneNumber = function () {
        return Phonebookcontact.hasAtLeastOnePhoneNumber(self.phonecontactForm);
    };

    /* -----  End of EVENTS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setGroup = function ($event, group) {
        $event.preventDefault();
        self.phonecontactForm.group = group;
    };

    self.update = function () {
        self.phonecontactForm.isAdding = true;
        return $q.all([
            OvhApiTelephony.Line().Phone().Phonebook().PhonebookContact().v6().update({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                bookKey: self.phonebook.bookKey,
                id: self.contact.id
            }, Phonebookcontact.getContactData(self.phonecontactForm)).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.phonecontactForm.isAdding = false;
            self.phonecontactForm.hasBeenAdded = true;
            return $timeout(self.close, 1500);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebook = angular.copy(data.phonebook);
        self.contact = angular.copy(data.contact);
        self.groupsAvailable = angular.copy(data.groupsAvailable);
        self.phonecontactForm = {
            name: null,
            surname: null,
            group: null,
            homePhone: null,
            homeMobile: null,
            workPhone: null,
            workMobile: null,
            isAdding: false,
            hasBeenAdded: false
        };
        _.assign(self.phonecontactForm, self.contact);
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
