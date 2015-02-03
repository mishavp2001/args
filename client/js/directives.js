'use strict';

angular.module('argums-app')
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

angular.module('argums-app').directive('activeNav', ['$location', function($location) {
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

angular.module('argums-app').directive('starRating', ['$location', function($location) {
    return {
            restrict : 'A',
            template : '<ul ng-init="showValue=show" ng-mouseleave="showValue=show||false" ng-mouseover="showValue=show||true"  class="rating {{color}}" >'
                     + '    <li ng-repeat="star in stars" ng-class="star"  ng-click="toggle($index)">'
                     + '{{code}}'
                     + '</li>'
                     + '</ul>'
                     + '<span ng-show="showValue">{{ratingValue}}</span>' 
                     + '<style>ul.{{color}} li.filled { color:{{color}}}</style>',
            scope : {
                ratingValue : '@ratingValue',
                code: '@code',
                color: '@color',
                show: '@show',
                max : '=',
                off : '=',
                onRatingSelected : '&'
            },
            link : function(scope, elem, attrs) {
                attrs.$observe('ratingValue', function(val) {
                    // val will have the value of the attribute
                    scope.ratingValue =     val;
                  
                    scope.code = attrs.code|| '\u2605';
                    scope.color = attrs.color;
//alert(scope.code);
                  
                var updateStars = function() {
                    //scope.ratingValue = 9;
                    //alert(scope.star_code + scope.ratingValue);
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

