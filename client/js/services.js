'use strict';

angular.module('angular-client-side-auth')
.factory('Auth', function($http, $cookieStore){
     //alert("Here Auth");
    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

    $cookieStore.remove('user');

    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined) {
                role = currentUser.role;
            }
        //alert(accessLevel);
            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined) {
                user = currentUser;
            }
            return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('/login', user).success(function(user){
                changeUser(user);
                success(user);
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});

angular.module('angular-client-side-auth')
.factory('Users', function($http) {
        return {
        getAll: function(success, error) {
            $http.get('/users').success(success).error(error);
        }
    };
});


angular.module('angular-client-side-auth')
.factory('Argum',function($resource){
    return $resource('/api/argums/:id?username=:username',{id:'@_id', username:'@username'},{
        update: {
            method: 'PUT'
        }

    });
})

angular.module('angular-client-side-auth').service('popupService',function($window){
    this.showPopup=function(message){
        return $window.confirm(message);
    }
});
