'use strict';

angular.module('angular-client-side-auth')
.directive('accessLevel', ['Auth', function(Auth) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var prevDisp = element.css('display')
                , userRole
                , accessLevel;

            $scope.user = Auth.user;
            $scope.$watch('user', function(user) {
                if(user.role)
                    userRole = user.role;
                updateCSS();
            }, true);

            attrs.$observe('accessLevel', function(al) {
                if(al) accessLevel = $scope.$eval(al);
                updateCSS();
            });

            function updateCSS() {
                if(userRole && accessLevel) {
                    if(!Auth.authorize(accessLevel, userRole))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                }
            }
        }
    };
}]);

angular.module('angular-client-side-auth').directive('activeNav', ['$location', function($location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var anchor = element[0];
            if(element[0].tagName.toUpperCase() != 'A')
                anchor = element.find('a')[0];
            var path = anchor.href;

            scope.location = $location;
            scope.$watch('location.absUrl()', function(newPath) {
                path = normalizeUrl(path);
                newPath = normalizeUrl(newPath);

                if(path === newPath ||
                    (attrs.activeNav === 'nestedTop' && newPath.indexOf(path) === 0)) {
                    element.addClass('active');
                } else {
                    element.removeClass('active');
                }
            });
        }

    };

    function normalizeUrl(url) {
        if(url[url.length - 1] !== '/')
            url = url + '/';
        return url;
    }

}]);

angular.module('angular-client-side-auth').directive('starRating', ['$location', function($location) {
    return {
            restrict : 'A',
            template : '<ul class="rating">'
                     + '    <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
                     + '\u2605'
                     + '</li>'
                     + '</ul>',
            scope : {
                ratingValue : '@ratingValue',
                max : '=',
                off : '=',
                onRatingSelected : '&'
            },
            link : function(scope, elem, attrs) {
                 attrs.$observe('ratingValue', function(val) {
                    // val will have the value of the attribute
                    scope.ratingValue =     val;

                var updateStars = function() {
                    //scope.ratingValue = 9;
                    //alert(scope.max + scope.ratingValue);
                    scope.stars = [];
                    for ( var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled : i < scope.ratingValue
                        });
                    }
                };
                
                scope.toggle = function(index) {
                    if (scope.off== true){ return;}
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating : index + 1
                    });
                };
                
                scope.$watch('ratingValue',
                    function(oldVal, newVal) {
                        if (newVal) {
                            updateStars();
                        }
                    }
                );
                updateStars();
                });
            }
        };
   
}]);

