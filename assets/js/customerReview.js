angular.module('storefrontApp').controller('CustomerReviewController',
    [
        '$scope', 'reviewService', 'dialogService', function ($scope, reviewService, dialogService) {

            var _productId;
            $scope.pageSize = 5;
            $scope.searchCriteria = { pageSize: $scope.pageSize, pageNumber: 1 };
            $scope.review = '';

            $scope.prev = function() {
                $scope.searchCriteria.pageNumber--;
                findReviews();
                return false;
            };


            $scope.next = function() {
                $scope.searchCriteria.pageNumber++;
                findReviews();
                return false;
            };

            function findReviews() {
                reviewService.searchReviews($scope.searchCriteria).then(function (response) {
                    $scope.data = response.data.data;
                    $scope.pageCount = response.data.pages;
                });
            }

            $scope.showAnswers = function (reviewId) {
                 var data = { reviewId: reviewId, callback: findReviews };
                dialogService.showDialog(data, 'AnswersController', 'storefront.customer-review-answers-dialog.tpl');
            };

            $scope.addReview = function () {
                if (!$scope.review) {
                    return;
                }
                var review = $scope.review;
                $scope.review = '';
                reviewService.addReview({
                    productId: _productId,
                    authorNickname: $scope.nickname,
                    content: review
                }).then(function () {
                    findReviews();
                });
            }

            $scope.init = function (productId) {
                _productId = productId;
                $scope.searchCriteria.productIds = [productId];
                findReviews();
            };


           
        }
    ]);
