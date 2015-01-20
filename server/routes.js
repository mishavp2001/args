var _ =           require('underscore')
    , path =      require('path')
    , passport =  require('passport')
    , AuthCtrl =  require('./controllers/auth')
    , UserCtrl =  require('./controllers/user')
    , User =      require('./models/User.js')
    , userRoles = require('../client/js/routingConfig').userRoles
    , accessLevels = require('../client/js/routingConfig').accessLevels;

var Argum=require('./models/Argum');

var express=require('express');

//configure routes

var router=express.Router();

var routes = [

    // Argums
    {
        path: '/api/argums',
        httpMethod: 'GET',
        middleware: [(function(req,res){
            console.log('Req' + req.query.username)
              Argum.find({"$or" :[{'share':true}, {'user':req.query.username}]},  function(err,argums){
                
               if(err)
                    res.send(err);
               res.json(argums);
           });
        })]
    },
    {
        path: '/api/argums',
        httpMethod: 'POST',
        middleware: [(function(req,res){
             console.log('New argum' + req.body)

            var argums=new Argum(req.body);
            argums.save(function(err){
                if(err)
                    res.send(err);
                res.json({argums:'Argum Added'});
            });
        })]
    },
    {
        path: '/api/argums/*',
        httpMethod: 'POST',
        middleware: [(function(req,res){
             console.log('New argum' + req.body)

            var argums=new Argum(req.body);
            argums.save(function(err){
                if(err)
                    res.send(err);
                res.json({argums:'Argum Added'});
            });
        })]
    },
    {
        path: '/api/argums/:id',
        httpMethod: 'PUT',
        middleware: [(function(req,res){
            Argum.findOne({_id:req.params.id},function(err,argums){

            if(err)
                res.send(err);

           for(prop in req.body){
                argums[prop]=req.body[prop];
           }

            // save the argums
            argums.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Argum updated!' });
            });

           });
        })]
    },
    {
        path: '/api/argums/:id',
        httpMethod: 'GET',
        middleware: [(function(req,res){
             console.log('ID' + req.params.username);
             Argum.findOne({_id:req.params.id},function(err, argums) {
            if(err)
                res.send(err);

            res.send(argums);
           });
        })]
    },
    {
        path: '/api/argums/:id',
        httpMethod: 'DELETE',
        middleware: [(function(req,res){
            console.log('Delete...');
            Argum.remove({
                _id: req.params.id
            }, function(err, argums) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
               });
        })]
    },
    // Views
    {
        path: '/partials/*',
        httpMethod: 'GET',
        middleware: [function (req, res) {
            var requestedView = path.join('./', req.url);
            res.render(requestedView);
        }]
    },

    // OAUTH
    {
        path: '/auth/twitter',
        httpMethod: 'GET',
        middleware: [passport.authenticate('twitter')]
    },
    {
        path: '/auth/twitter/callback',
        httpMethod: 'GET',
        middleware: [passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },
    {
        path: '/auth/facebook',
        httpMethod: 'GET',
        middleware: [passport.authenticate('facebook')]
    },
    {
        path: '/auth/facebook/callback',
        httpMethod: 'GET',
        middleware: [passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },
    {
        path: '/auth/google',
        httpMethod: 'GET',
        middleware: [passport.authenticate('google')]
    },
    {
        path: '/auth/google/return',
        httpMethod: 'GET',
        middleware: [passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },
    {
        path: '/auth/linkedin',
        httpMethod: 'GET',
        middleware: [passport.authenticate('linkedin')]
    },
    {
        path: '/auth/linkedin/callback',
        httpMethod: 'GET',
        middleware: [passport.authenticate('linkedin', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },

    // Local Auth
    {
        path: '/register',
        httpMethod: 'POST',
        middleware: [AuthCtrl.register]
    },
    {
        path: '/login',
        httpMethod: 'POST',
        middleware: [AuthCtrl.login]
    },
    {
        path: '/logout',
        httpMethod: 'POST',
        middleware: [AuthCtrl.logout]
    },

    // User resource
    {
        path: '/users',
        httpMethod: 'GET',
        middleware: [UserCtrl.index],
        accessLevel: accessLevels.admin
    },

    // All other get requests should be handled by AngularJS's client-side routing system
    {
        path: '/*',
        httpMethod: 'GET',
        middleware: [function(req, res) {
            var role = userRoles.public, username = '';
            if(req.user) {
                role = req.user.role;
                username = req.user.username;
            }
            res.cookie('user', JSON.stringify({
                'username': username,
                'role': role
            }));
            res.render('index');
        }]
    }
];



module.exports = function(app) {

    _.each(routes, function(route) {
        route.middleware.unshift(ensureAuthorized);
        var args = _.flatten([route.path, route.middleware]);

        switch(route.httpMethod.toUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });



}

function ensureAuthorized(req, res, next) {
    var role;
    if(!req.user) role = userRoles.public;
    else          role = req.user.role;
    var accessLevel = _.findWhere(routes, { path: req.route.path, httpMethod: req.route.stack[0].method.toUpperCase() }).accessLevel || accessLevels.public;

    if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
    return next();
}


