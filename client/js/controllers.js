'use strict';

/* Controllers */

angular.module('argums-app')
.controller('NavCtrl', ['$rootScope', '$scope', '$location', 'Auth', '$state', function($rootScope, $scope, $location, Auth, $state) {
    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;

    $scope.logout = function() {
        Auth.logout(function() {
              $state.go('argums', {}, {reload: true});
        }, function() {
            $rootScope.error = "Failed to logout";
        });
    };
}]);

angular.module('argums-app')
.controller('CategoriesCtrl', 
    ['$rootScope', '$scope', '$location', '$window', 'popupService', 'Auth', 'Argum', 'Categories',  '$sce', 'Data', 'googleFactory',  '$q',
     function($rootScope, $scope, $location, $window, popupService, Auth, Argum, Categories,  $sce, Data, googleFactory, $q){
    
  
    $scope.loading = true;
    $scope.loggedin = Auth.isLoggedIn();
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;
    $scope.user = Auth.user;
    $scope.query = "";
    $scope.catquery = "";
    $scope.internal = true;
    $scope.extUrl = "";
    $scope.curstuf ="";
    $scope.curcat ="";
    $scope.myInterval = 5000;
   
    $scope.loadargums = function(cat){
        $scope.curcat.selected = "";
        $scope.argums=Argum.query({'username':$scope.user.username, 'password':$scope.user.password,  'category': cat});
        $scope.argums.category = cat;  
    }


    Array.prototype.count = function(obj){
        var count = this.length;
        if(typeof(obj) !== "undefined"){
            var i = 0;
            var array = this.slice(0), count = 0; // clone array and reset count
            //alert(array[i].category);
            for(i = 0; i < array.length; i++){
                if(array[i].category == obj){
                    count++;
                    //alert(count);
                }
            }
        }
        return count;
    }
    $scope.allargums=Argum.query({'username':$scope.user.username, 'password':$scope.user.password}); 
    $scope.argums=$scope.allargums;  

      //var deferred = $q.defer();
    var deferred = Categories.query();
    deferred.then(
        function(data){
            $scope.categories = data.data;
            $scope.options = data.data;
            //alert($scope.argum.category);
            $scope.selectedItem = $scope.argums.category;

        },
        function(error) {
                 // $log.error('failure loading movie', errorPayload);
        }
    );


    $scope.countCategory = function(cat){
        return $scope.allargums.count(cat); 
    }
 
    //$scope.total = $scope.argums.length;
    //alert($scope.argums);
    $scope.moto="Welcome to our site!";

    $scope.selectcat=function(cat){
        cat.selected = "catselected";
        $scope.argums=Argum.query({'username':$scope.user.username, 'password':$scope.user.password,  'category': cat.title});
        $scope.curcat.selected = "";
        $scope.curcat =  cat;
        $scope.argums.category = cat.title;
    }   
    

    $scope.deleteArgum=function(Argum){
        if(!$scope.loggedin | Argum.user != $scope.user.username){
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

     $scope.internal = true;
    $scope.extUrl = "";
    $scope.curstuf ="";


    $scope.ifr=function(stuf){
        $scope.internal = false;
        stuf.selected = "g-serach-selected";
        $scope.curstuf.selected = "";
        $scope.curstuf =  stuf;

        //alert(url);
        $scope.extUrl=$sce.trustAsResourceUrl(stuf.unescapedUrl);
    }

    $scope.$watch('query', function(val) {
        Data.setQuery(val);
        var googleResults = function(query) {
            $scope.googleStuff = {};
            googleFactory.getSearchResults(query)
              .then(function (response) {
                $scope.googleStuff = response.data.responseData.results;
              }, function (error) {
                console.error(error);
              });

        };
        $scope.internal = true;
        if (val != "") {
            googleResults(val);
            stLight.options({publisher: "5ef2a14c-fbbc-45a1-96eb-8b6c89f9e010", doNotHash: false, doNotCopy: false, hashAddressBar: false});

        }       
               
    });        

}]);

angular.module('argums-app')
.controller('ArgumCtrl',
    ['$rootScope', '$scope', '$location', '$window', 'popupService', 'Auth', 'Argum', 'googleFactory', '$sce', 'Data',
     function($rootScope, $scope, $location, $window, popupService, Auth, Argum, googleFactory, $sce, Data){
//alert("Hererere ");
    $scope.loading = true;
    $scope.loggedin = Auth.isLoggedIn();

    if (!$scope.loggedin) {
        $location.path("login");
    }

    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;
    $scope.user = Auth.user;
    $scope.query = "";
    $scope.catquery = "";
    
    $scope.internal = true;
    $scope.extUrl = "";
    $scope.curstuf ="";


    $scope.ifr=function(stuf){
        $scope.internal = false;
        stuf.selected = "g-serach-selected";
        $scope.curstuf.selected = "";
        $scope.curstuf =  stuf;

        //alert(url);
        $scope.extUrl=$sce.trustAsResourceUrl(stuf.unescapedUrl);
    }

    $scope.$watch('query', function(val) {
                Data.setQuery(val);
                var googleResults = function(query) {
                    $scope.googleStuff = {};
                    googleFactory.getSearchResults(query)
                      .then(function (response) {
                        $scope.googleStuff = response.data.responseData.results;
                      }, function (error) {
                        console.error(error);
                      });

                };
                $scope.internal = true;
                if (val != "") {
                    googleResults(val);
                    stLight.options({publisher: "5ef2a14c-fbbc-45a1-96eb-8b6c89f9e010", doNotHash: false, doNotCopy: false, hashAddressBar: false});

                }       
               
    });            

    $scope.argums=Argum.query({'username':$scope.user.username, 'password':$scope.user.password});  
    /*$scope.argums=Argum.getAll(  
                {username: $scope.username,
                password: $scope.password} );
    */
    //{name: $scope.username, password:$scope.password }
    //alert($scope.argums);
    $scope.moto="Welcome to our site!";

    $scope.deleteArgum=function(Argum){
        if(!$scope.loggedin | Argum.user != $scope.user.username){
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

angular.module('argums-app')
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
                $location.path('/argums');
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };

    $scope.loginOauth = function(provider) {
        $window.location.href = '/auth/' + provider;
    };
}]);

angular.module('argums-app')
.controller('ArgumViewController',function($scope,$stateParams,Argum){

    $scope.argum=Argum.get({id:$stateParams.id});
    $scope.rating = $scope.argum.vote;
    //updateStars();
    //alert($scope.rating);

}).controller('ArgumCreateController',function($scope,$state,$stateParams,Argum, googleFactory, Auth, Data, $sce){

    $scope.argum=new Argum();
    $scope.argum.title = Data.getQuery();
    $scope.rating = $scope.argum.vote;
    $scope.user = Auth.user;
    $scope.argum.user = $scope.user.username;
    $scope.argum.date = new Date();
    $scope.internal = true;
    $scope.extUrl = "";
    $scope.curstuf ="";
    $scope.query = "";


      $scope.ifr=function(stuf){
        $scope.internal = false;
        stuf.selected = "g-serach-selected";
        $scope.curstuf.selected = "";
        $scope.curstuf =  stuf;

        //alert(url);
        $scope.extUrl=$sce.trustAsResourceUrl(stuf.unescapedUrl);
    }

    $scope.$watch('query', function(val) {
                Data.setQuery(val);
                var googleResults = function(query) {
                    $scope.googleStuff = {};
                    googleFactory.getSearchResults(query)
                      .then(function (response) {
                        $scope.googleStuff = response.data.responseData.results;
                      }, function (error) {
                        console.error(error);
                      });

                };
                $scope.internal = true;
                googleResults(val);   
               
    });          

    $scope.rateFunction = function(rating, obj, solutionargs) {
        //alert("Rating selected - " + rating);
        //$scope.argum.vote = rating;
        if (obj.solutions != null ){
            obj.vote = rating;    
        } else  {
            //PROS or CONS waight
            obj.rating = rating;
            solutionarg.score =  (parseInt(solutionargs.score) + rating)/(solutionargs.length() + 1) ;
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

}).controller('ArgumEditController',
    ['$rootScope', '$scope', '$location', '$window', 'Auth', '$state', '$q', '$stateParams', 'Argum', 'Categories', 'Data', 
        function($rootScope, $scope, $location, $window, Auth, $state, $q, $stateParams, Argum, Categories, Data) {

    $scope.user = Auth.user;
    $scope.userRoles = Auth.userRoles;
    $scope.accessLevels = Auth.accessLevels;


    $scope.loading = true;
    $scope.loggedin = Auth.isLoggedIn();

    if (!$scope.loggedin) {
        $location.path("login");
    }

    $scope.query = "";
    $scope.catquery = "";
    
    $scope.internal = true;
    $scope.extUrl = "";
    $scope.curstuf ="";


    $scope.ifr=function(stuf){
        $scope.internal = false;
        stuf.selected = "g-serach-selected";
        $scope.curstuf.selected = "";
        $scope.curstuf =  stuf;

        //alert(url);
        $scope.extUrl=$sce.trustAsResourceUrl(stuf.unescapedUrl);
    }

    $scope.$watch('query', function(val) {
                Data.setQuery(val);
                var googleResults = function(query) {
                    $scope.googleStuff = {};
                    googleFactory.getSearchResults(query)
                      .then(function (response) {
                        $scope.googleStuff = response.data.responseData.results;
                      }, function (error) {
                        console.error(error);
                      });

                };
                $scope.internal = true;
                if (val != "") {
                    googleResults(val);
                    stLight.options({publisher: "5ef2a14c-fbbc-45a1-96eb-8b6c89f9e010", doNotHash: false, doNotCopy: false, hashAddressBar: false});

                }       
               
    });            

    $scope.argums=Argum.query({'username':$scope.user.username, 'password':$scope.user.password});  


    $scope.deleteArgum=function(Argum){
        if(!$scope.loggedin | Argum.user != $scope.user.username){
            alert("You don't have access");
            return;
        }   
        if(popupService.showPopup('Really delete this?')){
            Argum.$delete(function(){
                $window.location.href='';
            });
        }
    }

    $scope.rateFunction = function(rating, obj, solution) {
        //alert("Rating selected - " + rating);
        //$scope.argum.vote = rating;
        if (obj.solutions != null ){
            obj.vote = rating;    
        } else  {
            //PROS or CONS weight
            solution.score = solution.score || 0;
            obj.rating = rating;
            solution.score =  $scope.addRating(solution.pros) - $scope.addRating(solution.cons);
        }
       // argum.solutions[index].pros[index] = rating;
    };

    $scope.addRating = function(arr){
        var sum =0;
        var i;
        for(i=0; i <= arr.length-1; i++ ){
            arr[i].rating = (parseInt(arr[i].rating)!='NaN')?parseInt(arr[i].rating):0;    
            sum = sum + arr[i].rating;
        }
        return parseInt(sum);

    }

    $scope.addNewSolution=function(){
        //alert("Here"); 
        if(typeof($scope.argum.solutions) == 'underfined'){
            $scope.argum.solutions = [];
        }
        $scope.argum.solutions.push({"title": "Solution"});
    }
    $scope.addNewPro=function(sol){
        if(sol.pros == null){
            sol.pros = [];
        }
        sol.pros.push({"title": "pro", "rating": 0});
    }
    $scope.addNewCon=function(sol){
         if(sol.cons == null){
            sol.cons = [];
        }
        sol.cons.push({"title": "cons", "rating": 0});
    }
   
    $scope.delSol=function(sol, index){
        sol.splice(index+1, 1);
    }
    $scope.delProCon=function(solution, type, index){
        if(type=='pro') {
            solution.pros.splice(index, 1);
        } else {
            solution.cons.splice(index, 1);
        }
       
        solution.score =  $scope.addRating(solution.pros) - $scope.addRating(solution.cons);
        
    }
    
    $scope.updateArgum=function(){
        /*alert($scope.newsolutions.length );
        if($scope.newsolution.title){
            $scope.argum.solutions.push();
        }*/
         if( $scope.argum.user != $scope.user.username){
            var temp = $scope.argum;
            $scope.argum=new Argum();
            var id = $scope.argum._id;
            
            angular.extend($scope.argum, temp);
            $scope.argum._id = id;
            $scope.argum.user = $scope.user.username;
            
            $scope.argum.$save(function(){
                $state.go('argums', {}, {reload: true});
            });
        } else {
            $scope.argum.$update(function(){
                $state.go($state.current, {}, {reload: true});
            });    
        }
    };

    $scope.loadArgum=function(){
        $scope.argum=Argum.get({id:$stateParams.id});
        $scope.rating = $scope.argum.vote;
    };

    $scope.loadArgum();

    var deferred = Categories.query();
    deferred.then(
        function(data){
            $scope.categories = data.data;
            $scope.options = data.data;
            //alert($scope.argum.category);
            $scope.selectedItem = $scope.argum.category;
        },
        function(error) {
                 // $log.error('failure loading movie', errorPayload);
        }
    );

}]);

angular.module('argums-app')
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

angular.module('argums-app')
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

