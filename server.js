var express =           require('express')
    , http =            require('http')
    , passport =        require('passport')
    , path =            require('path')
    , morgan =          require('morgan')
    , bodyParser =      require('body-parser')
    , methodOverride =  require('method-override')
    , cookieParser =    require('cookie-parser')
    , cookieSession =   require('cookie-session')
    , session =         require('express-session')
    , csrf =            require('csurf')
    ,mongoose = require('mongoose')
    , User =            require('./server/models/User.js');

var argums = require('./server/argum_routes.js');

var app = module.exports = express();
    
app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'client')));
//app.use(cookieParser());
app.use(session(
    {
        secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));

var env = process.env.NODE_ENV || 'development';
/*if ('development' === env || 'production' === env) {
    app.use(csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
}*/

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);
//passport.use(User.twitterStrategy());   Uncomment this line if you don't want to enable login via Twitter
//passport.use(User.facebookStrategy());  Uncomment this line if you don't want to enable login via Facebook
//passport.use(User.googleStrategy());    Uncomment this line if you don't want to enable login via Google
//passport.use(User.linkedInStrategy());  Uncomment this line if you don't want to enable login via LinkedIn

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//connect to our database
//Ideally you will obtain DB details from a config file

var dbName='argumDB';

//var connectionString='mongodb://localhost:27017/'+dbName;
//var connectionString='mongodb://admin:moldova@proximus.modulusmongo.net:27017/dagy4Gug';
var connectionString='mongodb://admin:moldova@ds031661.mongolab.com:31661/heroku_app33214390';
//mongodb://<dbuser>:<dbpassword>@ds031661.mongolab.com:31661/heroku_app33214390
// url : 'mongodb://admin:moldova@proximus.modulusmongo.net:27017/dagy4Gug'
mongoose.connect(connectionString);

require('./server/routes.js')(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
