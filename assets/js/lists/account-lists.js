angular.module('storefront.account')
    .component('vcAccountLists',
        {
            templateUrl: "lists-manager.tpl",
            $routeConfig: [
                { path: '/', name: 'Lists', component: 'vcAccountLists' },
                { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true }
            ],
            controller: [
                'listService', '$rootScope', 'cartService', '$translate', 'loadingIndicatorService', '$timeout',
                function (listService, $rootScope, cartService, $translate, loader, $timeout) {
                    var $ctrl = this;

                    $ctrl.loader = loader;
                    $ctrl.selectedList = {};

                    $ctrl.selectTab = function (tabName) {
                        $ctrl.selectedList = {};
                        $ctrl.selectedTab = tabName;
                    };

                    $ctrl.selectList = function (list) {
                        $ctrl.selectedList = list;
                        loader.wrapLoading(function () {
                            return listService.getWishlist(list.name).then(function (response) {
                                $ctrl.selectedList.items = response.data.items;
                            });
                        });
                    };

                    $ctrl.removeLineItem = function (lineItem, list) {
                        loader.wrapLoading(function () {
                            return listService.removeLineItem(lineItem.id, list.name).then(function (response) {
                                $ctrl.selectList(list);
                            });
                        });
                    };

                    $ctrl.addToCart = function (lineItem) {
                        loader.wrapLoading(function () {
                            return cartService.addLineItem(lineItem.productId, 1).then(function (response) {
                                $ctrl.productAdded = true;
                                $timeout(function () {
                                    $ctrl.productAdded = false;
                                }, 2000);
                            });
                        });
                    }

                    $ctrl.addToCartAllProducts = function (listName) {
                        loader.wrapLoading(function () {
                            return listService.mergeWithCurrentCart(listName).then(function (response) {
                                $rootScope.$broadcast('cartItemsChanged');
                            });
                        });
                    }
                }]
        })
    .component('vcAccountMyLists',
        {
            templateUrl: 'themes/assets/js/lists/account-lists.tpl.liquid',
            require: {
                accountLists: '^^vcAccountLists'
            },
            controller: [
                '$rootScope', 'listService', 'customerService', 'loadingIndicatorService', '$q', 'dialogService', function ($rootScope, listService, customerService, loader, $q, dialogService) {

                    var $ctrl = this;
                    $ctrl.predefinedLists = [];

                    $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 3, numPages: 3 };

                    $ctrl.pageSettings.pageChanged = function () {
                        $ctrl._searchLists();
                    };

                    $ctrl._searchLists = function () {
                        loader.wrapLoading(function () {
                            return listService.searchLists({
                                pageNumber: $ctrl.pageSettings.currentPage,
                                pageSize: $ctrl.pageSettings.itemsPerPageCount
                            }).then(function (response) {
                                $ctrl.accountLists.lists = response.data.results;
                                $ctrl.pageSettings.totalItems = response.data.totalCount;

                                $ctrl.accountLists.selectedList = _.first(response.data.results);
                            });
                        });
                    };

                    $ctrl.initialize = function (lists) {
                        $ctrl.predefinedLists = lists;

                        var listNames = _.pluck(lists, "name");
                        var promises = [];
                        _.each(listNames, function (listName) {
                            promises.push(createList(listName));
                        });

                        $q.all(promises).then(function () {
                            $ctrl._searchLists();
                        });
                    };

                    $ctrl.$onInit = function () {
                        $ctrl.accountLists.selectTab('myLists');
                    }

                    $ctrl.createList = function () {
                        var dialogData = {
                            lists: $ctrl.lists
                        }
                        dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl', function (result) {
                            if (result) {
                                $ctrl.pageSettings.currentPage = 1;
                                $ctrl._searchLists();
                            }
                        });
                    };

                    $ctrl.listSettings = function () {
                        //get all
                        loader.wrapLoading(function () {
                            return listService.searchLists({
                                pageSize: 10000
                            }).then(function (response) {
                                var dialogData = {
                                    lists: response.data.results,
                                    predefinedLists: $ctrl.predefinedLists
                                }
                                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl', function (result) {
                                    $ctrl.pageSettings.currentPage = 1;
                                    $ctrl._searchLists();
                                });
                            });
                        });


                    };

                    function createList(listName) {
                        return listService.createList(listName);
                    }
                }
            ]
        });
