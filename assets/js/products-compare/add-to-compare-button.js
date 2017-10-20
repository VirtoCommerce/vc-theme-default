angular.module('storefrontApp')
    .component('addToCompareButton', {
        templateUrl: 'themes/assets/js/products-compare/add-to-compare-button.tpl.html',
        bindings: {
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

            $ctrl.$onInit = function () {
                $ctrl.containProduct = catalogService.isInProductCompareList($ctrl.productId);
            }

            $ctrl.addProductToCompareList = function (event) {
                event.preventDefault();
                catalogService.getProduct($ctrl.productId).then(function(response) {
                    var product = response.data[0];
                    var productQuantity = catalogService.getComparableProductsQuantity();
                    if (productQuantity == 4) {
                        dialogService.showDialog({ capacityExceeded: true }, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                        return;
                    }
                    if (!$ctrl.containProduct && productQuantity < 4) {
                        catalogService.putСomparableProductToStorage($ctrl.productId);
                        dialogService.showDialog(product, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                        $rootScope.$broadcast('productCompareListChanged');
                    }
                    else {
                        var existingProduct = product;
                        dialogService.showDialog(existingProduct, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                        return;
                    }
                    $ctrl.containProduct = true;
                })
            };
        }]
    })
