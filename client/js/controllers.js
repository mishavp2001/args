'use strict';

/* Controllers */

angular.module('angular-client-side-auth')
.controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    $scope.logout = function() {
        Auth.logout(function() {
            $location.path('/login');
        }, function() {
            $rootScope.error = "Failed to logout";
        });
    };
}]);

angular.module('angular-client-side-auth')
.controller('ArgumCtrl',
    ['$rootScope', '$scope', '$location', '$window', 'popupService', 'Auth', 'Argum', function($rootScope, $scope, $location, $window, popupService, Auth, Argum){
//alert("Hererere ");
    $scope.loading = true;
    $scope.loggedin = Auth.isLoggedIn();
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    $scope.argums=Argum.query();
    
    //alert($scope.argums);
    $scope.moto="Welcome to our site!";

    $scope.deleteArgum=function(Argum){
        if(!$scope.loggedin){
            alert("You don't have access");
            return;
        }   
        if(popupService.showPopup('Really delete this?')){
            Argum.$delete(function(){
                $window.location.href='';
            });
        }
    }
    $scope.rememberme = true;
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberme: $scope.rememberme
            },
            function(res) {
                $location.path('/');
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };

}]);

angular.module('angular-client-side-auth')
.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

    $scope.rememberme = true;
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password,
                rememberme: $scope.rememberme
            },
            function(res) {
                $location.path('/');
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

angular.module('angular-client-side-auth')
.controller('ArgumViewController',function($scope,$stateParams,Argum){
    
    $scope.rateFunction = function(rating) {
        //alert("Rating selected - " + rating);
        //$scope.argum.vote = rating;
    };

    $scope.argum=Argum.get({id:$stateParams.id});
    $scope.rating = $scope.argum.vote;
    //updateStars();
    //alert($scope.rating);

}).controller('ArgumCreateController',function($scope,$state,$stateParams,Argum){

    $scope.argum=new Argum();
    $scope.rating = $scope.argum.vote;

    $scope.rateFunction = function(rating, obj) {
        //alert("Rating selected - " + rating);
        //$scope.argum.vote = rating;
        if (obj.solutions != null ){
            obj.vote = rating;    
        } else if (obj.rating != null) {
             obj.rating = rating;    
        }
       // argum.solutions[index].pros[index] = rating;
    };
     $scope.addNewSolution=function(){
        //alert("Here"); 
        if(typeof($scope.argum.solutions) == 'undefined'){
            $scope.argum.solutions = [];
        }
        $scope.argum.solutions.push({"title": "Solution"});
    }

    $scope.addNewPro=function(sol){
        alert(sol);    
        if(sol.pros == null){
            sol.pros = [];
        }
        sol.pros.push({"title": "pro"});
    }
    $scope.addNewCon=function(sol){
         if(sol.cons == null){
            sol.cons = [];
        }
        sol.cons.push({"title": "cons"});
    }
    
    $scope.addArgum=function(){
        $scope.argum.$save(function(){
            $state.go('argums');
        });
    }

}).controller('ArgumEditController',function($scope,$state,$stateParams,Argum){
    $scope.rateFunction = function(rating, obj) {
        //alert("Rating selected - " + rating);
        //$scope.argum.vote = rating;
        if (obj.solutions != null ){
            obj.vote = rating;    
        } else if (obj.rating != null) {
             obj.rating = rating;    
        }
       // argum.solutions[index].pros[index] = rating;
    };

    $scope.addNewSolution=function(){
        //alert("Here"); 
        if(typeof($scope.argum.solutions) == 'underfined'){
            $scope.argum.solutions = [];
        }
        $scope.argum.solutions.push({"title": "Solution"});
    }
    $scope.addNewPro=function(sol){
        alert(sol);    
        if(sol.pros == null){
            sol.pros = [];
        }
        sol.pros.push({"title": "pro"});
    }
    $scope.addNewCon=function(sol){
         if(sol.cons == null){
            sol.cons = [];
        }
        sol.cons.push({"title": "cons"});
    }
   
     $scope.updateArgum=function(){
        /*alert($scope.newsolutions.length );
        if($scope.newsolution.title){
            $scope.argum.solutions.push();
        }*/
        $scope.argum.$update(function(){
            $state.go('argums');
        });
    };

    $scope.loadArgum=function(){
        $scope.argum=Argum.get({id:$stateParams.id});
        $scope.rating = $scope.argum.vote;

    };

    $scope.loadArgum();
});

angular.module('angular-client-side-auth')
.controller('RegisterCtrl',
['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
    $scope.role = Auth.userRoles.user;
    $scope.userRoles = Auth.userRoles;

    $scope.register = function() {
        Auth.register({
                username: $scope.username,
                password: $scope.password,
                role: $scope.role
            },
            function() {
                $location.path('/');
            },
            function(err) {
                $rootScope.error = err;
            });
    };
}]);

angular.module('angular-client-side-auth')
.controller('AdminCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
    $scope.loading = true;
    $scope.userRoles = Auth.userRoles;

    Users.getAll(function(res) {
        $scope.users = res;
        $scope.loading = false;
    }, function(err) {
        $rootScope.error = "Failed to fetch users.";
        $scope.loading = false;
    });

}]);

