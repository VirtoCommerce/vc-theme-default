var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listService', '$translate', function ($scope, $window, $uibModalInstance, dialogData, listService, $translate) {
    $scope.availableLists = [];
    $scope.selectedList = {};
    $scope.dialogData = dialogData;
    $scope.inProgress = false;
    $scope.itemAdded = false;
    $scope.type = dialogData.listType;

    $scope.addProductToList = function () {
        $scope.inProgress = true;
        listService.addLineItem(dialogData.id, $scope.selectedList.name, $scope.selectedList.type).then(function (response) {
            if (response.data) {
                $scope.inProgress = false;
                $scope.itemAdded = true;
            }
        });
    };
    $scope.selectList = function (list) {
        $scope.selectedList = list;
    };

    $scope.close = function () {
        $uibModalInstance.close();
    };

    $scope.redirect = function (url) {
        $window.location = url;
    };

    $scope.initialize = function (defaultLists) {
        listService.searchLists({
            pageSize: 20,
            type: $scope.type
        }).then(function (response) {
            $scope.lists = response.data.results;
            if (response.data.totalCount === 0) {
                $scope.lists = defaultLists.default_lists;
            }
            _.each($scope.lists, function (list) {
                var foundItem = _.find(list.items, function (item) {
                    return item.productId === dialogData.id;
                });

                if (foundItem) {
                    list.contains = true;
                }
            });
        });
    };
}]);
