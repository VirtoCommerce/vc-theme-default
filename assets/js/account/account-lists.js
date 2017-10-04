angular.module('storefrontApp')
    .component('vcAccountLists', {
        templateUrl: "lists-manager.tpl",
        $routeConfig: [
            { path: '/', name: 'Lists', component: 'vcAccountLists' },
            { path: '/friendsLists', name: 'FriendsLists', component: 'vcAccountFriendsLists' },
            { path: '/myLists', name: 'MyLists', component: 'vcAccountMyLists', useAsDefault: true }
        ],
        controller: ['listService', '$rootScope', '$location', 'customerService', 'cartService', '$translate', 'loadingIndicatorService', '$timeout', 'dialogService', '$localStorage', function (listService, $rootScope, $location, customerService, cartService, $translate, loader, $timeout, dialogService, $localStorage) {
        	var $ctrl = this;

            $ctrl.getCustomer = function () {
                customerService.getCurrentCustomer().then(function (user) {
                    $ctrl.userName = user.data.userName;
                    $ctrl.initialize();
                })
            };

            $ctrl.selectTab = function (tabName) {
                $ctrl.selectedList = [];
                $ctrl.selectedTab = tabName;
                $ctrl.getCustomer();
            };

            $ctrl.initialize = function (lists) {     
                if ($ctrl.selectedTab === 'myLists' && $localStorage && $localStorage['lists']) {
                    $ctrl.lists = listService.getMyLists($ctrl.userName);
                }

                else if ($ctrl.selectedTab === 'friendsLists') {
                    $ctrl.lists = listService.getSharedLists($ctrl.userName);
                }

                if (_.find($ctrl.lists, { default: true })) {
                    var selected = _.find($ctrl.lists, { default: true });
                    $ctrl.selectList(selected);
                }
                else if (!_.isEmpty($ctrl.lists)){
                    _.first($ctrl.lists).default = true;
                    $ctrl.selectList(_.first($ctrl.lists));
                }
            };

            $ctrl.selectList = function (list) {
                $ctrl.selectedList = list;
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
                listService.clearList(listName, $ctrl.userName).then(function (response) {
                    document.location.reload();
                });
            };

            $ctrl.removeLineItem = function (lineItem) {
                listService.removeLineItem(lineItem.id, $ctrl.selectedList.id, $ctrl.userName);
            };

            $ctrl.generateLink = function () {
                $ctrl.sharedLink = $location.absUrl().substr(0, _.lastIndexOf($location.absUrl(), '/')) + '/friendsLists?id=' + $ctrl.selectedList.id;
                $ctrl.selectedList.permission = 'public';
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

            $ctrl.createList = function () {
                var dialogData = $ctrl.lists;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.recently-create-new-list-dialog.tpl');
            };

            $ctrl.listSettings = function () {
                var dialogData = {};
                dialogData.lists = $ctrl.lists;
                dialogData.userName = $ctrl.userName;
                dialogData.selectedTab = $ctrl.selectedTab;
                dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.list-settings-dialog.tpl');
            };

        }]
    })
    .component('vcAccountMyLists', {
        templateUrl: 'themes/assets/js/account/account-lists.tpl.liquid',
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, customerService, loader, $timeout, dialogService, $localStorage) {
            var $ctrl = this;

            $ctrl.listPreSetting = function (lists) {
				if (!$localStorage['lists'])
            		$localStorage['lists'] = { };
				customerService.getCurrentCustomer().then(function (user) {
            		var userName = user.data.userName;
            		if ($localStorage['lists'] && !$localStorage['lists'][userName]) {
            			$localStorage['lists'][userName] = [];
            			$localStorage['sharedListsIds'] = {};
            			$localStorage['sharedListsIds'][userName] = [];
            			_.each(lists, function (list) {
            				list.author = userName;
            				list.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
            			});
            			_.extend($localStorage['lists'][userName], lists);
            			$ctrl.accountLists.selectTab('myLists');
            		}
                })
            }

            $ctrl.$onInit = function (lists) {
                $ctrl.accountLists.selectTab('myLists');
            }
        }]
    })
    .component('vcAccountFriendsLists', {
        templateUrl: "themes/assets/js/account/account-lists.tpl.liquid",
        require: {
            accountLists: '^^vcAccountLists'
        },
        controller: ['$rootScope', 'listService', '$location', 'customerService', 'loadingIndicatorService', '$timeout', 'accountDialogService', '$localStorage', function ($rootScope, listService, $location, customerService, loader, $timeout, dialogService, $localStorage) {
            var $ctrl = this;

            function checkLocation() {
                    var sharedCartId = $location.search().id.toString();
                    customerService.getCurrentCustomer().then(function (user) {
                        var userName = user.data.userName;
                        var myLists = listService.getMyLists(userName);
                        if (!_.some($localStorage['sharedListsIds'][userName], function (x) { return x === sharedCartId }) && (!_.find(myLists, { id: sharedCartId }))) {
                            $localStorage['sharedListsIds'][userName].push(sharedCartId);
                        }
                    })
            }

            $ctrl.$onInit = function () {
                if ($location.search().id)
                    checkLocation();               
                $ctrl.accountLists.selectTab('friendsLists');
            }
        }]
    });
