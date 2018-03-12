var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyAddedListItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', 'listService', '$translate', function ($scope, $window, $uibModalInstance, dialogData, listService, $translate) {
    $scope.availableLists = [];
    $scope.selectedList = {};
    $scope.dialogData = dialogData;
    $scope.inProgress = false;
    $scope.itemAdded = false;

    $scope.addProductToList = function () {
        $scope.inProgress = true;
        listService.addLineItem(dialogData.id, $scope.selectedList.name).then(function (response) {
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

    $scope.initialize = function () {

        listService.searchLists({
            pageSize: 1000
        }).then(function (response) {
            $scope.lists = response.data.results;

            var listNames = _.pluck(response.data.results, "name");
            listService.getListsWithProduct(dialogData.id, listNames).then(function (result) {
                var filteredNames = result.data;

                angular.forEach($scope.lists, function (list) {
                    list.contains = _.contains(filteredNames, list.name);
                });
            });

        });
    };

    $scope.initialize();
}]);