angular.module('storefrontApp')
    .component('vcAccountLists', {
        templateUrl: "lists-manager.tpl",
        $routeConfig: [
            { path: '/', name: 'Lists', component: 'vcAccountLists' },
            { path: '/friendsLists', name: 'FriendsLists', component: 'vcAccountFriendsLists' },
            { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true },
            { path: '/listsSearch', name: 'ListsSearch', component: 'vcAccountListsSearch' },
        ],
        controller: ['$filter', 'listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'dialogService', '$localStorage', '$window', function ($filter, listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage, $window) {
            var $ctrl = this;

            $ctrl.getCustomer = function () {
                customerService.getCurrentCustomer().then(function (user) {
                    $ctrl.userName = user.data.userName;
                    $ctrl.initialize();
                })
            };

            $ctrl.selectTab = function (tabName) {
                $ctrl.getCustomer();
                $ctrl.selectedTab = tabName;
                $ctrl.selectedList = [];
            };

            $ctrl.initialize = function (lists) {
                if ($ctrl.selectedTab === 'myLists' && $localStorage && $localStorage['lists']) {
                    $ctrl.lists = _.filter($localStorage['lists'][$ctrl.userName], function (x) { return !x.friendList });
                    console.log($ctrl.lists);
                    $localStorage['lists'][$ctrl.userName] = _.flatten($localStorage['lists'][$ctrl.userName]);//1
                    //remove duplication
                    $localStorage['lists'][$ctrl.userName] = _.map(_.groupBy($localStorage['lists'][$ctrl.userName], function (item) {
                        return item.name;
                    }), function (grouped) {
                        if (grouped.length > 1)
                            if (!_.isEqual(grouped[0], grouped[1])) {
                                return [grouped[0], grouped[1]];
                            }
                        return grouped[0];
                    });
                    // $ctrl.lists = lists;

                    $localStorage['lists'][$ctrl.userName] = _.flatten($localStorage['lists'][$ctrl.userName]);//2
                }
                // friendList
                else if ($ctrl.selectedTab === 'friendsLists') {
                    $ctrl.lists = listService.getSharedLists($ctrl.userName);
                    console.log($localStorage['lists'][$ctrl.userName]);
                    console.log($ctrl.lists);
                }

                //setDefault
                if (_.find($ctrl.lists, { default: true })) {
                    var selected = _.find($ctrl.lists, { default: true });
                    $ctrl.selectList(selected);
                }

            };

            $ctrl.selectList = function (list) {
                console.log(list);
                $ctrl.selectedList = list;
                customerService.getCurrentCustomer().then(function (user) {
                    $ctrl.userName = user.data.userName;
                    var items = list.items;
                    $ctrl.selectedList.items = items;

                })
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
            };

            $ctrl.removeList = function (listName) {
                console.log($ctrl.userName);
                listService.clearList(listName, $ctrl.userName).then(function (response) {
                    document.location.reload();
                });
            };

            $ctrl.removeLineItem = function (lineItem, list) {
                listService.removeLineItem(lineItem.id, list.id, $ctrl.userName);
                //$ctrl.selectList(list);
            };

            $ctrl.generateLink = function () {
                $ctrl.sharedLink = $location.absUrl().substr(0, _.lastIndexOf($location.absUrl(), '/')) + '/friendsLists?id=' + $ctrl.selectedList.id;
                $ctrl.selectedList.shared = true;
                var dialogData = {sharedLink:$ctrl.sharedLink};
                    dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-shared-link-dialog.tpl');
            };

            $ctrl.addToCartAllProducts = function () {
                _.each($ctrl.selectedList.items, function (item) {
                    loader.wrapLoading(function () {
                        return cartService.addLineItem(item.productId, 1).then(function (response) {
                            $ctrl.productAdded = true;
                            $timeout(function () {
                                $ctrl.productAdded = false;
                            }, 6000);
                        });
                    });
                })

            }
            $ctrl.getCustomer();

        }]
    })
    .component('vcAccountMyLists', {
        templateUrl: 'themes/assets/js/account/account-lists.tpl.liquid',
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', '$window', function (listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage, $window) {
            var $ctrl = this;

            $ctrl.listPreSetting = function (lists) {
                if ($localStorage && !$localStorage['lists']) {
                    _.each(lists, function (list) {
                        list.author = $scope.accountLists.userName;
                        list.id = Math.floor(Math.random() * 230910443210623294 + 1).toString()
                    });
                    $localStorage['lists'] = {};
                    $localStorage['lists'][dialogData.userName].push(lists);
                }
            }

            $ctrl.loader = loader;
            $ctrl.selectedList = {};

            $ctrl.sharedLists = {};

            $ctrl.initialize = function (lists) {
                $ctrl.accountLists.selectedTab = 'myLists';
                $ctrl.lists = $ctrl.accountLists.lists;
                if (_.find($ctrl.lists, { default: true })) {
                    var selected = _.find($ctrl.lists, { default: true });
                    $ctrl.selectList(selected);
                }
            }

            $ctrl.$onInit = function (lists) {
                $ctrl.accountLists.selectTab('myLists');
                $ctrl.selectedTab = $ctrl.accountLists.selectedTab;
                // $ctrl.accountLists.getCustomer();
                $ctrl.accountLists.initialize();
                $ctrl.initialize($ctrl.accountLists.lists);

            }

            $ctrl.generateLink = function () {
                $ctrl.accountLists.generateLink();
                $ctrl.showSharedLink = !$ctrl.showSharedLink;
                $ctrl.sharedLink = $ctrl.accountLists.sharedLink;
            };

            $ctrl.addToCartAllProducts = function () {
                _.each($ctrl.selectedList.items, function (item) {
                    loader.wrapLoading(function () {
                        return cartService.addLineItem(item.productId, 1).then(function (response) {
                            $ctrl.productAdded = true;
                            $timeout(function () {
                                $ctrl.productAdded = false;
                            }, 6000);
                        });
                    });
                })

            }

            $ctrl.selectList = function (list) {
                $ctrl.accountLists.selectList(list);
                $ctrl.selectedList = list;
            };

            $ctrl.removeList = function (listName) {
                $ctrl.accountLists.removeList(listName);
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
            };

            $ctrl.listSettings = function () {
                var dialogData = {};
                dialogData.lists = $ctrl.lists;
                dialogData.userName = $ctrl.accountLists.userName;
                dialogData.selectedTab = $ctrl.selectedTab;
                console.log($ctrl.accountLists.userName, 'userName');
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl');
            };

            $ctrl.createList = function () {
                var dialogData = $ctrl.lists;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl');
            };

        }]
    })
    .component('vcAccountFriendsLists', {
        templateUrl: "themes/assets/js/account/account-lists.tpl.liquid",
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', '$window', function (listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage, $window) {
            var $ctrl = this;

            $ctrl.initialize = function (lists) {
                $ctrl.accountLists.initialize(lists);
                $ctrl.lists = $ctrl.accountLists.lists;
                if (_.find($ctrl.lists, { default: true })) {
                    var selected = _.find($ctrl.lists, { default: true });
                    $ctrl.selectList(selected);
                }
            };

            $ctrl.$onInit = function () {
                $ctrl.accountLists.selectedTab = 'friendsLists';
                $ctrl.selectedTab = 'friendsLists';

                if ($location.search().id) {

                    //1)get id of shared list
                    var cartId = $location.search().id;

                    customerService.getCurrentCustomer().then(function (user) {
                        $ctrl.userName = user.data.userName;

                        //2)put cartid in my sharedlistsIds
                        if (!$localStorage['sharedListsIds'][$ctrl.userName])
                            $localStorage['sharedListsIds'][$ctrl.userName] = [];

                        $localStorage['sharedListsIds'][$ctrl.userName].push(cartId);
                        //3)getSharedLists
                        $ctrl.lists = listService.getSharedLists($ctrl.userName);
                        $ctrl.lists.default = false;
                        $ctrl.accountLists.selectList($ctrl.lists);
                        console.log($ctrl.lists);
                    })
                }
            }

            $ctrl.addToCart = function (lineItem) {
                loader.wrapLoading(function () {
                    return cartService.addLineItem(lineItem.productId, 1).then(function (response) {
                        $ctrl.productAdded = true;
                        $timeout(function () {
                            $ctrl.productAdded = false;
                        }, 2000);
                    });
                });
            };

            $ctrl.addToCartAllProducts = function () {
                _.each($ctrl.selectedList.items, function (item) {
                    loader.wrapLoading(function () {
                        return cartService.addLineItem(item.productId, 1).then(function (response) {
                            $ctrl.productAdded = true;
                            $timeout(function () {
                                $ctrl.productAdded = false;
                            }, 6000);
                        });
                    });
                })
            };

            $ctrl.listSettings = function () {
                var dialogData = {};
                dialogData.lists = $ctrl.lists;
                dialogData.userName = $ctrl.accountLists.userName;
                dialogData.selectedTab = $ctrl.selectedTab;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl');
            };

            $ctrl.selectList = function (list) {
                $ctrl.accountLists.selectList(list);
                $ctrl.selectedList = list;
            };
        }]
    });
