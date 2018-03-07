var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listService', '$localStorage', 'loadingIndicatorService', function ($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listService, $localStorage, loader) {

    if (dialogData.sharedLink)
        $scope.sharedLink = dialogData.sharedLink;
    else {
        $scope.dialogData = dialogData.lists;
        $scope.userName = dialogData.userName;
        $scope.inProgress = false;
        $scope.data = $scope.listName;
        $scope.selectedTab = dialogData.selectedTab;
    }

    $scope.createList = function () {
        listService.createList($scope.dialogData.listName).then(function () {
            $uibModalInstance.close($scope.dialogData.listName);
        });
    };

    $scope.selectedList = function (listName) {
        var items = listService.getWishlist(listName, '', '', $scope.userName).items;
        $scope.selectedList.items = items;
    };

    $scope.submitSettings = function () {
        var listIds = [];
        _.each(dialogData.lists, function (list) {
            if (list.delete)
                listIds.push(list.id);
        });

        listService.deleteListsByIds(listIds).then(function (result) {
            $uibModalInstance.close();
        });
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
