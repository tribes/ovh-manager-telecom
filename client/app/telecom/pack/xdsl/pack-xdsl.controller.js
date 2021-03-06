/* global setTimeout */
angular.module("managerApp").controller("PackXdslCtrl", function ($q, $transitions, $state, $translate, $stateParams, OvhApiPackXdsl, OvhApiXdsl, OvhApiXdslModem, Toast, smoothScroll, ToastError, SidebarMenu) {
    "use strict";

    var animTime = 1500;
    var noModemStatus = 404;
    var self = this;

    self.loading = {
        init: false
    };

    this.content = {
        back: {}
    };

    function getPackXdsl () {
        return OvhApiPackXdsl.Aapi().get({
            packId: $stateParams.packName
        }).$promise;
    }

    function getXdsl () {
        return OvhApiXdsl.v6().get({
            xdslId: $stateParams.serviceName
        }).$promise;
    }

    function setAnim (className) {
        setTimeout(function () {
            self.content.back.class = className;
        }, animTime);
    }

    this.backState = function () {
        return $state.href(this.content.back.state);
    };

    function enableModemIfHaveOne () {
        return OvhApiXdslModem.v6().get({ xdslId: $stateParams.serviceName }).$promise.then(
            function () {
                self.disabledModem = false;
            },
            function (err) {
                if (err.status !== noModemStatus) {
                    ToastError(err);
                    return $q.reject(err);
                }
                return err;
            }
        );
    }

    this.updateUIForState = function (state) {
        self.currentState = state.name;
        if ($stateParams.packName === "sdsl") {
            if (state.name === "telecom.pack.xdsl" || state.name === "telecom.pack.xdsl.modem") {
                setAnim("anim");
                return;
            }
        }

        smoothScroll(document.body);

        switch (state.name) {
        case "telecom.pack.xdsl.modem.wifi":
        case "telecom.pack.xdsl.modem.dmz":
        case "telecom.pack.xdsl.access-notifications":
        case "telecom.pack.xdsl.access-diagnostic":
        case "telecom.pack.xdsl.access-migration":
        case "telecom.pack.xdsl.access-ip":
        case "telecom.pack.xdsl.access-deconsolidation":
        case "telecom.pack.xdsl.access-order":
        case "telecom.pack.xdsl.access-resiliation":
        case "telecom.pack.xdsl.missing-rio":
        case "telecom.pack.xdsl.line-diagnostic":
            setAnim("invert-anim");
            self.content.back.state = "^";
            getXdsl().then(function (xdsl) {
                self.content.status = xdsl.status;
            });
            break;
        case "telecom.pack.xdsl.modem":
        case "telecom.pack.xdsl":
            setAnim("anim");
            self.content.back.state = "telecom.pack";
            getXdsl().then(function (xdsl) {
                self.content.status = xdsl.status;
            });
            break;
        default:
            setAnim("anim");
            self.content.back = {};
            break;
        }
    };

    $transitions.onSuccess({}, function (transition) {
        self.updateUIForState(transition.to());
    });
    self.updateUIForState($state.current);

    /*= =============================
    =            ACTION            =
    ==============================*/

    self.accessDescriptionSave = function (newAccessDescr) {
        self.loading.save = true;

        return OvhApiXdsl.v6().put({
            xdslId: $stateParams.serviceName
        }, {
            description: newAccessDescr
        }).$promise.then(function () {
            self.access.description = newAccessDescr;

            // rename in sidebar menu
            SidebarMenu.updateItemDisplay({
                title: newAccessDescr || self.access.serviceName
            }, $stateParams.serviceName, "telecom-pack-section", $stateParams.packName);
        }, function (error) {
            Toast.error([$translate.instant("xdsl_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
        });
    };

    /* -----  End of ACTION  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        self.disabledModem = true;
        enableModemIfHaveOne();

        return $q.allSettled([
            getPackXdsl().then(function (pack) {
                self.pack = pack;
            }),
            getXdsl().then(function (access) {
                self.access = access;
            })
        ]).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
