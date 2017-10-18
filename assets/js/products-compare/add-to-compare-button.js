angular.module('storefrontApp')
    .component('addToCompareButton', {
        templateUrl: 'themes/assets/js/products-compare/add-to-compare-button.tpl.html',
        bindings: {
            selectedVariation: '<'
        },
        controller: ['$rootScope', '$scope', '$localStorage', '$window', 'catalogService', 'dialogService', function ($rootScope, $scope, $localStorage, $window, catalogService, dialogService) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.containProduct = catalogService.isInProductCompareList($ctrl.selectedVariation.id);
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
                    //должен добавить и вернуть продукт
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
