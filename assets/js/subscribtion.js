var storefrontApp = angular.module('storefrontApp');
storefrontApp.controller('subscribtionController', ['$scope', 'feedbackService', function ($scope, feedbackService) {
    $scope.submit = function () {
        feedbackService.postFeedback({email:$scope.email}).then(function (resp) {
        })
    }
}]);