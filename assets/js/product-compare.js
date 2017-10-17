var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productCompareListController', ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService',
function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService) {
    if (!$localStorage['productCompareList']) {
        $localStorage['productCompareList'] = [];
    }
    if (!$localStorage['productCompareListIds']) {
        $localStorage['productCompareListIds'] = [];
    }

    function initialize() {
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
                if ($localStorage['productCompareListIds'].length === $localStorage['productCompareList'].length) {
                    $scope.products = $localStorage['productCompareList'];
                    $scope.getProductProperties();
                }
            });
        })
    };
    $scope.properties = {};
    $scope.products = {};
        
    $scope.isInProductCompareList = function (productId) {
        return _.some($localStorage['productCompareListIds'], function (id) { return id === productId });
    }

    $scope.getProductProperties = function () {
        var grouped = {};
        var properties = _.flatten(_.map($scope.products, function (product) { return product.properties; }));
        var propertyDisplayNames = _.uniq(_.map(properties, function (property) { return property.displayName; }));
        _.each(propertyDisplayNames, function (displayName) {
            grouped[displayName] = [];
            var props = _.where(properties, { displayName: displayName });
            _.each($scope.products, function (product) {
                var productProperty = _.find(props, function (prop) { return prop.productId === product.id });
                if (productProperty) {
                    grouped[displayName].push(productProperty);
                } else {
                    grouped[displayName].push({ valueType: 'ShortText', value: '-' });
                }
            });
        });
        $scope.properties = grouped;
    }

    $scope.hasValues = function (properties, onlyDifferences) {
        var uniqueValues = _.uniq(_.map(properties, function (p) { return p.value }));
        if (onlyDifferences && properties.length > 1 && uniqueValues.length == 1) {
            return false;
        }
        return true;
    }

    $scope.clearCompareList = function () {
        $localStorage['productCompareList'] = [];
        $localStorage['productCompareListIds'] = [];
        $rootScope.$broadcast('productCompareListChanged');
        $scope.products = $localStorage['productCompareList'];
    }

    $scope.removeProduct = function (product) {
        $localStorage['productCompareList'] = _.without($localStorage['productCompareList'], product);
        $localStorage['productCompareListIds'] = _.without($localStorage['productCompareListIds'], product.id);
        $scope.products = $localStorage['productCompareList'];
        $rootScope.$broadcast('productCompareListChanged');
        $scope.getProductProperties();
    }

    function formatNumber(number) {
        var float = parseFloat(number);
        return !isNaN(float) ? float : number;
    }

    initialize();
}]);

storefrontApp.controller('addProductToCompareListController', ['$scope', '$rootScope', '$window', '$localStorage', 'catalogService', 'dialogService',
function ($scope, $rootScope, $window, $localStorage, catalogService, dialogService) {
    $scope.addProductToCompareList = function (productId, event) {
        event.preventDefault();

        if ($window.productCompareListCapacity <= $localStorage['productCompareListIds'].length) {
            dialogService.showDialog({ capacityExceeded: true }, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
            return;
        }
        if (!_.some($localStorage['productCompareListIds'], function (id) { return id === productId }) && $localStorage['productCompareListIds'].length < 4) {
            $localStorage['productCompareListIds'].push(productId);
            addProductToLocalStorage(productId);
        }
        else {
            var existingProduct = _.find($localStorage['productCompareList'], function (p) { return p.id === productId });
            dialogService.showDialog(existingProduct, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
            return;
        }
    }

    function formatNumber(number) {
        var float = parseFloat(number);
        return !isNaN(float) ? float : number;
    }

    function addProductToLocalStorage(id) {
        _.uniq($localStorage['productCompareListIds']);
        catalogService.getProduct(id).then(function (response) {
            var product = response.data[0];
            _.each(product.properties, function (property) {
                property.productId = product.id;
                if (property.valueType.toLowerCase() === 'number') {
                    property.value = formatNumber(property.value);
                }
            });
            $localStorage['productCompareList'].push(product);
            dialogService.showDialog(product, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
            $rootScope.$broadcast('productCompareListChanged');
        });
    };
}]);

storefrontApp.controller('productCompareListDialogController', ['$scope', '$window', 'dialogData', '$uibModalInstance',
function ($scope, $window, dialogData, $uibModalInstance) {
    $scope.dialogData = dialogData;

    $scope.close = function () {
        $uibModalInstance.close();
    }

    $scope.redirect = function (url) {
        $window.location = url;
    }
}]);

storefrontApp.controller('productCompareListBarController', ['$scope', '$localStorage',
    function ($scope, $localStorage) {
        $scope.itemsCount = $localStorage['productCompareListIds'] ? $localStorage['productCompareListIds'].length : 0;
        $scope.$on('productCompareListChanged', function (event, data) {
            $scope.itemsCount = $localStorage['productCompareListIds'].length;
    });
}]);
