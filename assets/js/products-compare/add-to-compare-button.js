angular.module('storefrontApp')
    .component('addToCompareButton', {
        templateUrl: 'themes/assets/js/products-compare/add-to-compare-button.tpl.html',
        bindings: {
            productId: '<',
            buttonType: '<',
            customClass: '<',
            buttonWidth: '<'
        },
        controller: ['$rootScope', 'catalogService', 'dialogService', 'compareProductService', function($rootScope, catalogService, dialogService, compareProductService) {
            var $ctrl = this;

            $ctrl.showButtonName = true;
            if ($ctrl.buttonType == 'small') {
                $ctrl.showButtonName = false;
            }

            $ctrl.$onInit = function () {
                $ctrl.containProduct = compareProductService.isInProductCompareList($ctrl.productId);
            }

            $ctrl.addProductToCompareList = function (event) {
                event.preventDefault();
                catalogService.getProduct($ctrl.productId).then(function(response) {
                    var product = response.data[0];
                    var productQuantity = compareProductService.getProductsCount();
                    if (productQuantity == 4) {
                        dialogService.showDialog({ capacityExceeded: true }, 'productCompareListDialogController', 'storefront.product-compare-list-dialog.tpl');
                        return;
                    }
                    if (!$ctrl.containProduct && productQuantity < 4) {
                        compareProductService.addProduct($ctrl.productId);
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
