var storefrontApp = angular.module('storefrontApp');
storefrontApp.controller('productCompareListController', ['$rootScope', '$scope', 'catalogService',
    function ($rootScope, $scope, catalogService) {

        $scope.properties = [];
        $scope.products = [];

        function initialize() {
            $scope.loaded = false;

            var productsIds = catalogService.getComparableProductsIds();
            if (_.isEmpty(productsIds)) {
                $scope.loaded = true;
                return;
            }
            catalogService.getProduct(productsIds).then(function(response) {
                if (_.indexOf(productsIds, '&') != -1) {
                    $scope.products = response.data;
                    _.each($scope.products, function(product) {
                        modifyProperty(product);
                    })
                }
                else {
                    var product = response.data[0];
                    modifyProperty(product);
                    $scope.products.push(product);
                }
                $scope.properties = catalogService.getProductProperties($scope.products);
                $scope.loaded = true;
            })
        };

        function modifyProperty(product) {
            _.each(product.properties, function(property) {
                property.productId = product.id;
                if (property.valueType.toLowerCase() === 'number') {
                    property.value = formatNumber(property.value);
                }
            })
            return product;
        }

        $scope.hasValues = function (properties, onlyDifferences) {
            var uniqueValues = _.uniq(_.map(properties, function (p) { return p.value }));
            if (onlyDifferences && properties.length > 1 && uniqueValues.length == 1) {
                return false;
            }
            return true;
        };

        $scope.clearCompareList = function() {
            catalogService.clearProductsComapreList();
            $scope.products = [];
            $rootScope.$broadcast('productCompareListChanged');
            $scope.properties = [];
        };

        $scope.removeProduct = function (product) {
            catalogService.removeProductFromCompareList(product.id)
            $scope.products = _.without($scope.products, product);
            $rootScope.$broadcast('productCompareListChanged');
            $scope.properties = catalogService.getProductProperties($scope.products);
        };

        function formatNumber(number) {
            var float = parseFloat(number);
            return !isNaN(float) ? float : number;
        };
        initialize();
    }
])

.component('productCompareListBar', {
    templateUrl: "product-compare-bar.tpl.html",
    controller: ['$scope', 'catalogService',
    function ($scope, catalogService) {
        var $ctrl = this;
        $ctrl.$onInit = function () {
            $ctrl.itemsCount = catalogService.getComparableProductsQuantity();
        }
        $scope.$on('productCompareListChanged', function (event, data) {
            $ctrl.itemsCount = catalogService.getComparableProductsQuantity();
        });
    }]
})

.controller('productCompareListDialogController', ['$scope', '$window', 'dialogData', '$uibModalInstance',
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
