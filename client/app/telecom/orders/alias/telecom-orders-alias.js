angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.orders.alias", {
        url: "/orders/alias",
        views: {
            "ordersView@telecom.orders": {
                templateUrl: "app/telecom/orders/alias/telecom-orders-alias.html",
                controller: "TelecomOrdersAliasCtrl",
                controllerAs: "OrdersAliasCtrl"
            }
        },
        translations: ["common", "telecom/orders/alias"]
    });
});
