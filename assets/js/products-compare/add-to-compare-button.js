angular.module('storefrontApp')
    .component('addToCompareButton', {
        templateUrl: 'themes/assets/js/products-compare/add-to-compare-button.tpl.html',
        bindings: {
            selectedVariation: '<',
            productId: '<',
            buttonType: '<',
            buttonStyle: '<'
        },
        controller: ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService', function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService) {
            var $ctrl = this;
            $ctrl.showButtonName = true;
            if ($ctrl.buttonType == 'small') {
                $ctrl.showButtonName = false;
            }
            if (!$localStorage['productCompareListIds'])
                $localStorage['productCompareListIds'] = [];

            if (angular.isDefined($ctrl.productId)) {
                catalogService.getProduct($ctrl.productId).then(function (response) {
                    $ctrl.selectedVariation = response.data[0];
                    $ctrl.containProduct = catalogService.isInProductCompareList($ctrl.selectedVariation.id);
                })
            }

            $ctrl.$onInit = function () {
                if ($ctrl.selectedVariation) {
                    $ctrl.containProduct = catalogService.isInProductCompareList($ctrl.selectedVariation.id);
                }
            }

            $ctrl.addProductToCompareList = function (event) {
                event.preventDefault();
                
                var product = $ctrl.selectedVariation;
                if ($window.productCompareListCapacity <= $localStorage['productCompareListIds'].length) {
                    dialogService.showDialog({ capacityExceeded: true }, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                    return;
                }
                if (!_.some($localStorage['productCompareListIds'], function (id) { return id === product.id }) && $localStorage['productCompareListIds'].length < 4) {
                    $localStorage['productCompareListIds'].push(product.id);
                    catalogService.putProductToLocalStorage(product);
                    dialogService.showDialog(product, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                    $rootScope.$broadcast('productCompareListChanged');
                }
                else {
                    var existingProduct = _.find($localStorage['productCompareList'], function (p) { return p.id === product.id });
                    dialogService.showDialog(existingProduct, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                    return;
                }
            };
        }]
    })
