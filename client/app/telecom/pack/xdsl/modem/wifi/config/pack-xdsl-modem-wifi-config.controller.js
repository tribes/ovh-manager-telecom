angular.module("managerApp")
    .controller("XdslModemWifiConfigCtrl", function ($state, $q, $timeout, $stateParams, $translate, Toast, OvhApiXdsl, PackXdslModemMediator) {
        "use strict";

        var self = this;
        self.mediator = PackXdslModemMediator;
        self.wifi = null;
        self.modem = null;

        self.errors = {
            wifi: false
        };

        self.fields = {
            securityType: {},
            channelMode: _.flatten(["Auto", _.range(1, 14)])
        };

        var wifiFields = [
            "SSID",
            "SSIDAdvertisementEnabled",
            "channel",
            "channelMode",
            "enabled",
            "securityKey",
            "securityType"
        ];

        self.resetKey = function () {
            this.wifi.key = "";
            this.wifi.key2 = "";
        };

        self.update = function () {
            if (!this.wifi) {
                return;
            }

            var wifiTmp = {};

            wifiFields.forEach(function (field) {
                if (self.hasConfigFieldChanged(field)) {
                    _.set(wifiTmp, field, _.get(self.wifi, field));
                }
            });

            if (self.wifi.securityType !== "None" && self.wifi.key) {
                self.wifi.securityKey = self.wifi.key;
                wifiTmp.securityKey = self.wifi.securityKey;
            }

            OvhApiXdsl.Modem().Wifi().v6().update({
                xdslId: $stateParams.serviceName,
                wifiName: this.wifi.wifiName
            }, wifiTmp).$promise.then(function (data) {
                Toast.success($translate.instant(self.wifis.length > 1 ? "xdsl_modem_wifi_config_success" : "xdsl_modem_wifi_config_success_single"));

                if (self.wifis.length > 1) {
                    self.resetKey();

                    // replace wifi in list
                    self.wifis.splice(_.findIndex(self.wifis, {
                        wifiName: self.wifi.wifiName
                    }), 1, self.wifi);
                    self.wifi = null;
                } else {
                    $timeout(function () {
                        $state.go("telecom.pack.xdsl.modem");
                    }, 2000);
                }
                self.mediator.tasks.changeModemConfigWLAN = true;
                return data;
            }, function (err) {
                Toast.error([$translate.instant("xdsl_modem_wifi_write_error"), _.get(err, "data.message")].join(" "));
                return $q.reject(err);
            });
        };

        self.cancelConfig = function () {
            if (self.wifis.length === 1) {
                $state.go("telecom.pack.xdsl.modem");
            } else {
                self.wifi = null;
            }
        };

        self.onChannelChange = function () {
            if (this.wifi.channelCustom !== "Auto") {
                this.wifi.channelMode = "Manual";
                this.wifi.channel = this.wifi.channelCustom;
            } else {
                this.wifi.channelMode = "Auto";
            }
        };

        self.hasConfigFieldChanged = function (field, originalWifi) {
            var original = originalWifi;
            if (!original) {
                original = _.find(self.wifis, {
                    wifiName: self.wifi.wifiName
                });
            }

            return !_.isEqual(_.get(original, field), _.get(self.wifi, field));
        };

        self.hasConfigChange = function () {
            var original = _.find(self.wifis, {
                wifiName: self.wifi.wifiName
            });

            return _.some(_.flatten([wifiFields, ["key", "key2"]]), function (field) {
                return self.hasConfigFieldChanged(field, original);
            });
        };

        /**
         *  Used to avoid refresh of name in section header title when editing
         */
        self.getWifiSsid = function () {
            return _.find(self.wifis, {
                wifiName: self.wifi.wifiName
            }).SSID;
        };

        self.setSelectedWifi = function (wifi) {
            self.wifi = angular.copy(wifi);
        };

        function getModem () {
            return OvhApiXdsl.Modem().v6().get({
                xdslId: $stateParams.serviceName
            }).$promise;
        }

        function getWifi () {
            return OvhApiXdsl.Modem().Wifi().Aapi().getWifiDetails({
                xdslId: $stateParams.serviceName
            }).$promise;
        }

        self.$onInit = function () {
            return $q.all({
                modem: getModem(),
                wifi: getWifi()
            }).then(function (response) {
                self.modem = response.modem;

                self.wifis = _.map(response.wifi, function (wifi) {
                    wifi.channelCustom = wifi.channelMode === "Auto" ? "Auto" : wifi.channel;
                    return wifi;
                }).sort(function (wifiA) {
                    return wifiA.wifiName === "defaultWIFI" ? -1 : 1;
                });

                if (self.wifis.length === 1) {
                    self.setSelectedWifi(_.find(response.wifi, {
                        wifiName: "defaultWIFI"
                    }));
                }

                self.fields.securityType = self.modem.model === "TG799VAC" ? ["None", "WPA2", "WPAandWPA2"] : ["None", "WEP", "WPA", "WPA2", "WPAandWPA2"];
            }, function (err) {
                Toast.error($translate.instant("xdsl_modem_wifi_read_error"));
                return $q.reject(err);
            });
        };

    });
