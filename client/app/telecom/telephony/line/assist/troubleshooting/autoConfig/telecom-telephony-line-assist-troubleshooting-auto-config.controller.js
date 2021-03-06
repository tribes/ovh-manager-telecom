angular.module("managerApp").controller("TelecomTelephonyLineAssistTroubleshootingAutoConfigCtrl", function ($q, troubleshootingProcess, validator, OvhApiMyIp) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        resetConfig: false
    };

    self.model = {
        ip: null
    };

    self.process = null;
    self.step = null;
    self.myIpInfos = null;
    self.validator = null;
    self.status = "CHECKIP";
    self.resetConfigError = null;
    self.resetConfigResult = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.startAutoConfig = function () {
        self.resetConfigError = null;
        self.resetConfigResult = null;

        self.loading.resetConfig = true;

        return self.process.line.phone.resetConfig(self.model.ip).then(function (resetResult) {
            self.status = "OK";
            self.step.isFinalized = true;
            self.resetConfigResult = resetResult;
        }).catch(function (error) {
            self.resetConfigError = error;
            return $q.reject(error);
        }).finally(function () {
            self.loading.resetConfig = false;
        });
    };

    self.resetIp = function () {
        self.status = "CHECKIP";
        self.step.isFinalized = false;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;
        self.process = troubleshootingProcess;
        self.step = self.process.activeStep;
        self.validator = validator;

        return $q.all({
            myIp: OvhApiMyIp.Aapi().get().$promise,
            lineIp: self.process.line.getIps()
        }).then(function (responses) {
            self.myIpInfos = _.get(responses, "myIp[0]");
            self.model.ip = _.get(responses, "lineIp[0].ip");
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
