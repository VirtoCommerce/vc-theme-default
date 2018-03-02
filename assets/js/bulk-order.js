var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('bulkOrderController', ['$scope',
    function ($scope) {
        $scope.atLeastOneNotEmpty = function () {
            var bulkOrder = $scope.bulkOrder;
            $scope.skuRowsIsEmpty = true;
            if (angular.isDefined(bulkOrder)) {
                angular.forEach(bulkOrder.skuRows, function (rows) {
                    angular.forEach(rows, function (row) {
                        if (row.length > 0)
                            $scope.skuRowsIsEmpty = false;
                    })
                });
            }
        }

    }]);