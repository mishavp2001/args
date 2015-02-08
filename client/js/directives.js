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

angular.module('argums-app').directive('starRating1', ['$location',  function($location) {
    return {
            restrict : 'A',
            template : '<ul ng-init="showValue=show;selected=selected;" ng-mouseleave="showValue=show||false;showUsers=false"  ng-mouseover="showValue=show||true; showUsers=users.length"  class="rating {{color}}" >'
                     + '    <li ng-repeat="star in stars" ng-class="star"  ng-click="toggle($index)">'
                     + '{{code}}'
                     + '</li>'
                     + '</ul>'
                     + '<span ng-show="showValue">{{ratingValue}}</span>' 
                     + '<ul class="voted-users" ng-show="showUsers ">'
                     + '<li ng-repeat="user in users|limitTo:5">{{user.user}}:{{user.comment}}</li></ul>'
                     + '<style>ul.{{color}} li.filled { color:{{color}}}  ul.voted-users {'
                     + 'background-color: #FFD700; list-style: none;'
                     + 'color: #000000;text-align:left;'
                     + 'margin: 5px; pading: 10px; width: 200px; height: 200px; position:absolute;'
                     + 'top: -30px; left: 50px; border-radius: 10px;'
                     + 'z-index: 10;}</style>',
                scope : {
                ratingValue : '@ratingValue',
                users : '=users',
                comment: '=',
                code: '@code',
                color: '@color',
                show: '@show',
                max : '=',
                off : '=',
                onRatingSelected : '&',
                selected: '=selected',
                loggedin: '=loggedin'

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
                            if(scope.loggedin===false) {return;}
                            if(scope.selected===true) {return;}

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

angular.module('argums-app').directive('starRating', ['$location',  function($location) {
    return {
            restrict : 'A',
            template : '<ul ng-init="showValue=show;" ng-mouseleave="showValue=show||false;"  ng-mouseover="showValue=show||true;"  class="rating {{color}}" >'
                     + '    <li ng-repeat="star in stars" ng-class="star"  ng-class="{voted:selected}" ng-click="toggle($index)">'
                     + '{{code}}'
                     + '</li>'
                     + '</ul>'
                     + '<span ng-show="showValue">{{ratingValue}}</span>' 
                     + '<div class="voted-users" ng-show="showUsers "><ul>'
                     + '<li><input type="text" ng-model="lcomment" class="input-group-sm" placeholder="Add comment"/></li>'
                     + '<li><a class="btn btn-success" href="" ng-click="showUsers=false;submitComment()">Submit</a><a href="" ng-click="showUsers=false">Close</a></li>' 
                     + '<li ng-repeat="user in users|limitTo:5"><span class="u-comment" ng-show="user.comment">{{user.user}}: "{{user.comment}}"</span></li></ul</div>'
                     + '<style>ul.{{color}} li.filled { color:{{color}}}'
                     + '.voted-users {color: #000000;text-align:left;'
                     + 'margin: 5px; padding: 10px; width: 200px; height: 200px; position:absolute;z-index: 10;'
                     + 'top: -30px; left: 50px; border-radius: 10px;'
                     + 'background-color: #FFD700; } .voted{border-botom: 5px solid green;} .voted-users ul{list-style: none;padding: 0px;}; .u-comment{ background-color: green; padding: 1px;}'
                     + '</style>',
                scope : {
                ratingValue : '@ratingValue',
                users : '=users',
                comment: '=comment',
                lcomment: '@',
                code: '@code',
                color: '@color',
                show: '@show',
                max : '=',
                off : '=',
                onRatingSelected : '&',
                onCommentSubmited : '&',
                selected: '@selected',
                loggedin: '=loggedin'

            },
            link : function(scope, elem, attrs) {
                scope.submitComment = function() {
                    scope.comment = scope.lcomment;    
                    scope.onCommentSubmited({'comment': scope.lcomment});
                };    

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
                            if(typeof scope.loggedin =='undefined' || scope.loggedin===false) {return;}
                            if(scope.selected==='true') { scope.showUsers = true;  return;}
                            scope.showUsers = true;        
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

