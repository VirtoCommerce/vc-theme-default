/*this file called bAnswer because if it has name just answers.js it would be minifued before app.js
 so we got error of no angular module
 */
angular.module('storefrontApp').controller('AnswersController', [
    '$scope', 'reviewService', 'dialogData', function($scope, reviewService, dialogData) {
        $scope.answer = '';
        $scope.edited = null;
        $scope.pageSize = 5;
        $scope.searchCriteria = { pageSize: $scope.pageSize, pageNumber: 1, customerReviewIds: [dialogData.reviewId] };
        $scope.curentUser = curentUser;

        function findAnswers() {
            reviewService.searchAnswers($scope.searchCriteria).then(function (response) {
                $scope.data = response.data.data;
                $scope.pageCount = response.data.pages;
            });
        }

        function vote(isPositive, answerId) {
            reviewService.addAssessment({ isPositive: isPositive, customerReviewAnswerId: answerId }).then(function () {
                findAnswers();
                dialogData.callback();
            });
        }

        $scope.delete = function(answerId) {
            reviewService.deleteAnswer({ id: answerId }).then(function () {
                findAnswers();
                dialogData.callback();
            });
        }

        $scope.save = function () {
            var edited = $scope.edited;
            $scope.edited = null;
            reviewService.editAnswer({ id: edited.id, customerReviewId: edited.customerReviewId, content: edited.content })
                .then(
                    function() {
                        findAnswers();
                    });
        }

        $scope.edit = function(answer) {
            $scope.edited = angular.copy(answer);
        }

        $scope.upvote = function (answerId) {
            vote(true, answerId);
        }

        $scope.downvote = function (answerId) {
            vote(false, answerId);
        }

        $scope.prev = function () {
            $scope.searchCriteria.pageNumber--;
            findAnswers();
        };

        $scope.next = function () {
            $scope.searchCriteria.pageNumber++;
            findAnswers();
        };

        $scope.editAnswer = function () {
            var answer = $scope.answer;
            $scope.answer = '';
            reviewService.editAnswer({ customerReviewId: dialogData.reviewId, content: answer }).then(function() {
                findAnswers();
            });
        };

        findAnswers();
    }
]);
