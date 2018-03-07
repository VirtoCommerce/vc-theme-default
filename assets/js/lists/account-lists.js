angular.module('storefront.account')
    .component('vcAccountLists',
        {
            templateUrl: "lists-manager.tpl",
            $routeConfig: [
                { path: '/', name: 'Lists', component: 'vcAccountLists' },
                { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true }
            ],
            controller: [
                'listService', '$rootScope', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'dialogService',
                function (listService, $rootScope, cartService, $translate, loader, $timeout, dialogService) {
                    var $ctrl = this;

                    $ctrl.loader = loader;
                    $ctrl.selectedList = {};
                    $ctrl.predefinedLists = [];
                    $ctrl.selectedTab = "myLists";

                    $ctrl.initialize = function (lists) {
                        var listNames = _.pluck(lists, "name");
                        listService.createPredefinedLists(listNames).then(function () {
                            getLists();
                        });
                    };

                    function getLists() {
                        loader.wrapLoading(function() {
                            return listService.searchLists({ }).then(function (response) {
                                $ctrl.lists = response.data;
                                $ctrl.selectedList = _.first(response.data);
                            });
                        });
                    }

                    $ctrl.selectTab = function (tabName) {
                        $ctrl.selectedList = {};
                        $ctrl.selectedTab = tabName;
                    };

                    $ctrl.selectList = function(list) {
                        $ctrl.selectedList = list;
                        loader.wrapLoading(function() {
                            return listService.getWishlist(list.name).then(function(response) {
                                $ctrl.selectedList.items = response.data.items;
                            });
                        });
                    };

                    $ctrl.removeLineItem = function(lineItem, list) {
                        loader.wrapLoading(function() {
                            return listService.removeLineItem(lineItem.id, list.name).then(function(response) {
                                $ctrl.selectList(list);
                            });
                        });
                    };

                    $ctrl.addToCart = function(lineItem) {
                        loader.wrapLoading(function() {
                            return cartService.addLineItem(lineItem.productId, 1).then(function(response) {
                                $ctrl.productAdded = true;
                                $timeout(function() {
                                        $ctrl.productAdded = false;
                                    }, 2000);
                            });
                        });
                    }

                    $ctrl.addToCartAllProducts = function (listName) {
                        loader.wrapLoading(function() {
                            return listService.mergeWithCurrentCart(listName).then(function (response) {
                                $rootScope.$broadcast('cartItemsChanged');
                            });
                        });
                    }

                    $ctrl.createList = function () {
                        var dialogData = $ctrl.lists;
                        dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl', function (result) {
                            if (result) {
                                getLists();
                            }
                        });
                    };

                    $ctrl.listSettings = function () {
                        var dialogData = { };
                        dialogData.lists = $ctrl.lists;
                        dialogData.userName = $ctrl.userName;
                        dialogData.selectedTab = $ctrl.selectedTab;
                        dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl', getLists);
                    };
                }]
        })
    .component('vcAccountMyLists',
        {
            templateUrl: 'themes/assets/js/lists/account-lists.tpl.liquid',
            require: {
                accountLists: '^^vcAccountLists'
            },
            controller: [
                '$rootScope', 'listService', 'customerService', 'loadingIndicatorService', function($rootScope,
                    listService,
                    customerService,
                    loader) {
                    var $ctrl = this;

                    $ctrl.$onInit = function(lists) {
                        $ctrl.accountLists.selectTab('myLists');
                    }
                }
            ]
        });
