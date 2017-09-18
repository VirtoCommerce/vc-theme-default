var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('recentlyCreateNewListDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'customerService', 'dialogData', 'listService', '$localStorage', 'loadingIndicatorService', '$translate', function($rootScope, $scope, $window, $uibModalInstance, customerService, dialogData, listService, $localStorage, loader, $translate) {
    $scope.avaliableListTypes = [
        { title: 'Shopping list', subtitle: 'Add items you want to shop for.' },
        { title: 'Wish List', subtitle: 'Let people know what gifts you`d like.' }
    ];
    var public = {};
    var private = {};

    $scope.dialogData = dialogData.lists;
    $scope.userName = dialogData.userName;
    $scope.inProgress = false;
    $scope.data = $scope.listName;
    $scope.selectedTab = dialogData.selectedTab;

    $scope.createList = function () {
        console.log($scope.dialogData);
        if (!$scope.dialogData.permission)
            $scope.dialogData.permission = 'private';
        $scope.dialogData.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
        customerService.getCurrentCustomer().then(function (user) {
            $scope.userName = user.data.userName;
            console.log(user.data.userName);
            listService.getWishlist($scope.dialogData.listName, $scope.dialogData.permission, $scope.dialogData.id, user.data.userName);
            $uibModalInstance.close();
            document.location.reload();
        })

    };

    $scope.setDefault = function (list) {
        _.each($scope.dialogData, function (x) {
            x.default = list === x;
        })
    };

    $scope.removeList = function (list) {
        if ($scope.selectedTab === 'friendsLists') {
            listService.removeFromFriendsLists(list.id, $scope.userName);
        }
        else
            listService.clearList(list.id, $scope.userName);
        $uibModalInstance.close();
        document.location.reload();
    };

    $scope.selectedList = function (listName) {
        var items = listService.getWishlist(listName, '', '', $scope.userName).items;
        $scope.selectedList.items = items;
    };

    $scope.submitSettings = function () {
        angular.forEach(dialogData.lists, function (list) {
            if (list.delete)
                $scope.removeList(list);
        })
        $uibModalInstance.close();
    };

    $scope.close = function() {
        $uibModalInstance.close();
    };

    $scope.redirect = function (url) {
        $window.location = url;
    };
}]);
