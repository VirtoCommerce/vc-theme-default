var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcContentPlace', ['$compile', 'marketingService', function ($compile, marketingService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            marketingService.getDynamicContent(attrs.id).then(function (response) {
                element.html($compile(response.data)(scope));
            });
        },
        replace: true
    }
}]);

storefrontApp.directive('fallbackSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('error', errorHandler);

            scope.$on('$destroy', function() {
                element.off('error', errorHandler);
            });

            function errorHandler(event) {
                if (element.attr('src') !== attrs.fallbackSrc) {
                    element.attr('src', attrs.fallbackSrc);
                }
                else {
                    element.off(event);
                }
            };
        }
    }
});

storefrontApp.directive('imageResizing', [function () {
    return {
        restrict: 'A',
        scope: {
            imageHeight: '@',
            imageWidth: '@',
        },
        link: function (scope, element, attrs) {
            element.bind('load', function () {
                var imageElement = element[0];
                var imageSizeCSSClass = {};
                imageSizeCSSClass["max-width"] = scope.imageWidth;
                imageSizeCSSClass["max-height"] = scope.imageHeight;
                angular.element(imageElement).css(imageSizeCSSClass);
            });
        }
    };
}]);
