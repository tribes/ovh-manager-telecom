angular.module("managerApp")
    .controller("TelecomTelephonyAliasOrderInternationalCtrl", function ($q, $translate, $stateParams, OvhApiTelephony, OvhApiTelephonyNumber, OvhApiOrder, TelecomTelephonyBillingAccountOrderAliasService, Toast, ToastError, TELEPHONY_NUMBER_OFFER) {
        "use strict";

        var self = this;

        /**
     * Get a preselection of specific numbers
     * @param  {String} country be | ch | de | es | fr | gb
     * @return {Promise}
     */
        function getSpecificNumbers (country, zone) {
            if (country && zone) {
                return OvhApiTelephony.Number().Aapi().orderableByRange({
                    country: country,
                    billingAccount: $stateParams.billingAccount,
                    type: "international",
                    range: zone
                }).$promise.then(
                    function (data) {
                        self.predefinedNumbers = data.pool;
                        self.prices = data.prices;
                        self.contracts = data.contracts;
                        _.forEach(Object.keys(self.prices), function (name) {
                            self.prices[name].title = $translate.instant(["telephony", "order", "number", "type", name, "label"].join("_"));
                        });
                        if (self.predefinedNumbers) {
                            self.form.premium = _.first(self.predefinedNumbers.premium);
                            self.form.common = _.first(self.predefinedNumbers.common);
                        }
                        return data;
                    },
                    function (err) {
                        ToastError($translate.instant("telephony_order_specific_numbers_error"));
                        return $q.reject(err);
                    }
                );
            }
            return $q.reject();
        }

        /*= =============================
    =            EVENTS            =
    ==============================*/

        this.resetZone = function (country) {
            this.form.country = country.code;
            delete this.form.zone;
        };

        /**
     * Get the Total of the order
     * @returns {String}
     */
        this.getTotal = function () {
            var count = this.form.amount.value;
            if (this.prices) {
                var price = this.prices[this.form.numberType].withTax.text;
                return price.replace(/^([\d\.,]*)/, function (forOne) {
                    return forOne * count;
                });
            }
            return null;
        };

        /**
     * When quantity changes
     */
        this.changeQty = function () {
            this.form.pool = this.form.amount.value;
            this.form.numberType = this.form.amount.value === 1 ? this.form.numberType : "common";
        };

        this.changeZone = function () {
            this.loading.init = true;
            getSpecificNumbers(self.form.country, self.form.zone).finally(function () {
                self.loading.init = false;
            });
        };

        /**
     * Get the list of specific zones
     * @param {String} country be | ch | de | es | fr | gb
     * @returns {Promise}
     */
        this.getGeographicalZone = function (axiom) {
            return OvhApiTelephonyNumber.v6().getZones(
                {
                    country: self.form.country,
                    axiom: axiom
                },
                null
            ).$promise.then(
                function (zones) {
                    return zones;
                }
            );
        };

        /**
     * Launch the order process
     * @returns {Promise}
     */
        this.order = function () {
            this.loading.order = true;
            var filter = [
                "city",
                "displayUniversalDirectory",
                "email",
                "firstname",
                "legalform",
                "name",
                "phone",
                "pool",
                "retractation",
                "streetName",
                "zip",
                "zone",
                "country"
            ];
            if (this.form.legalform === "corporation") {
                filter = filter.concat([
                    "ape",
                    "organisation",
                    "siret",
                    "socialNomination"
                ]);
            }
            var form = _.pick(this.form, filter);
            form.offer = "alias";

            if (form.pool === 1) {
                delete form.pool;
            }
            if (!form.pool) {
                form.specificNumber = this.form[this.form.numberType];
            }
            OvhApiOrder.Telephony().v6().orderNumberGeographical(
                {
                    billingAccount: self.billingAccount
                },
                form
            ).$promise.then(
                function (response) {
                    self.orderInformations = response;
                    Toast.success($translate.instant("telephony_order_international_order_success"));
                    self.orderDone = true;
                    return response;
                },
                function (err) {
                    self.loading.order = false;
                    if (err && err.data && err.data.message) {
                        switch (err.data.message) {
                        case /^Invalid city parameter \(([^\)]*)\)/.test(err.data.message) ? err.data.message : false:
                            Toast.error($translate.instant("telephony_order_order_error_city", form));
                            break;
                        case /^The following specified number is not longer available/.test(err.data.message) ? err.data.message : false:
                            Toast.error($translate.instant("telephony_order_order_error_available"));
                            delete self.loading.order;
                            break;
                        default:
                            Toast.error($translate.instant("telephony_order_international_order_error"));
                        }
                    } else {
                        Toast.error($translate.instant("telephony_order_international_order_error"));
                    }
                    return $q.reject(err);
                }
            );
        };


        /* -----  End of EVENTS  ------*/

        /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

        /**
     * Controller initialization
     */
        function init () {
            self.billingAccount = $stateParams.billingAccount;
            self.loading = {
                init: true
            };

            self.preAmount = TELEPHONY_NUMBER_OFFER.preAmount.map(
                function (elt) {
                    return {
                        label: $translate.instant(elt.label, elt),
                        value: elt.value
                    };
                }
            );

            self.form = {
                amount: _.find(
                    self.preAmount,
                    {
                        value: 1
                    }
                ),
                numberType: "common",
                retractation: false,
                pool: 1,
                displayUniversalDirectory: false
            };

            $q.all([
                TelecomTelephonyBillingAccountOrderAliasService.getUser()
                    .then(function (user) {
                        self.user = user;
                        self.form.email = user.email;
                        self.form.firstname = user.firstname;
                        self.form.name = user.name;
                        self.form.legalform = user.legalform;
                        self.form.organisation = user.organisation;
                        return user;
                    }),
                TelecomTelephonyBillingAccountOrderAliasService.getForeignCountries()
                    .then(function (countries) {
                        self.countries = _.map(countries, function (country) {
                            var countryFlag = country.toLowerCase() === "uk" ? "gb" : country;
                            return {
                                code: country,
                                "class": "flag-icon flag-icon-squared flag-icon-" + countryFlag,
                                name: $translate.instant("country_" + country.toUpperCase())
                            };
                        });
                    },
                          function (err) {
                              ToastError($translate.instant("telephony_order_international_countries_error"));
                              return $q.reject(err);
                          })
            ]).finally(function () {
                self.loading.init = false;
            });
        }

        init();

    });
