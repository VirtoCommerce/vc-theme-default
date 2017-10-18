var storefrontApp = angular.module('storefrontApp');
storefrontApp.controller('productCompareListController', ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService',
    function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService) {

            if (!$localStorage['productCompareList']) {
                $localStorage['productCompareList'] = [];
            }
            if (!$localStorage['productCompareListIds']) {
                $localStorage['productCompareListIds'] = [];
            }

            function initialize () {
                if ($localStorage['productCompareListIds'].length == 0)
                    $scope.emptyData = true;
                $localStorage['productCompareList'] = [];
                _.uniq($localStorage['productCompareListIds']);
                _.each($localStorage['productCompareListIds'], function (id) {
                    catalogService.getProduct(id).then(function (response) {
                        var product = response.data[0];
                        _.each(product.properties, function (property) {
                            property.productId = product.id;
                            if (property.valueType.toLowerCase() === 'number') {
                                property.value = formatNumber(property.value);
                            }
                        });
                        $localStorage['productCompareList'].push(product);
                        if (_.isEqual($localStorage['productCompareListIds'].length, $localStorage['productCompareList'].length)) {
                            $scope.products = $localStorage['productCompareList'];
                            $scope.properties = catalogService.getProductProperties($scope.products);
                        }
                    });
                })
            };
            $scope.properties = {};
            $scope.products = {};

            $scope.hasValues = function (properties, onlyDifferences) {
                var uniqueValues = _.uniq(_.map(properties, function (p) { return p.value }));
                if (onlyDifferences && properties.length > 1 && uniqueValues.length == 1) {
                    return false;
                }
                return true;
            };

            $scope.clearCompareList = function () {
                $localStorage['productCompareList'] = [];
                $localStorage['productCompareListIds'] = [];
                $rootScope.$broadcast('productCompareListChanged');
                $scope.products = $localStorage['productCompareList'];
            };

            $scope.removeProduct = function (product) {
                $localStorage['productCompareList'] = _.without($localStorage['productCompareList'], product);
                $localStorage['productCompareListIds'] = _.without($localStorage['productCompareListIds'], product.id);
                $scope.products = $localStorage['productCompareList'];
                $rootScope.$broadcast('productCompareListChanged');
                catalogService.getProductProperties($scope.products);
            };

            function formatNumber(number) {
                var float = parseFloat(number);
                return !isNaN(float) ? float : number;
            };
            initialize();
    }]
)

.component('productCompareListBar', {
    templateUrl: "product-compare-bar.tpl.html",
    controller: ['$scope', '$localStorage',
        function ($scope, $localStorage) {
            var $ctrl = this;
           $ctrl.itemsCount = $localStorage['productCompareListIds'] ? $localStorage['productCompareListIds'].length : 0;
            $scope.$on('productCompareListChanged', function (event, data) {
                $ctrl.itemsCount = $localStorage['productCompareListIds'].length;
            });
        }]
})

.controller('productCompareListDialogController', ['$scope','$window', 'dialogData', '$uibModalInstance',
    function ($scope, $window, dialogData, $uibModalInstance) {
        $scope.dialogData = dialogData;

        $scope.close = function () {
            $uibModalInstance.close();
        }

        $scope.redirect = function (url) {
            $window.location = url;
        }
    }
]);
