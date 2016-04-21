// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var config = require('./config');
var cors = require('cors');

require('./models/compile')();
var registration = require('./providers/registration');


registration.configure(function(err,options){
  if(err) return console.log("Error"+ err);
  console.log("Configured: ");
  console.log(options);
})
// Connect to database. If failed write message and exit with error status
mongoose.connect(config.database, function(err){
  if(err){
    console.error("Failed to connect to database.")
    console.error(err);
    process.exit(1);
  }
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// HTTP request logger - use it to log
app.use(morgan('dev'));
var port = process.env.PORT || 8080;        // set our port with --port arg, default: 8080

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
app.use('*', cors()); // enable cors

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Hooray! welcome to our api!' });
});

// Mount authentification Ctrl
var UserCtrl = require('./controllers/user.controller');
router.use('/user', UserCtrl);

// Mount Bar Controller on /api/bars route
var BarCtrl = require('./controllers/bars.controller');
router.use('/bars', BarCtrl);

// Mount Post Controller on /api/posts route
var PostCtrl = require('./controllers/posts.controller');
router.use('', PostCtrl);

// Mount Review Controller on /api/reviews route
var ReviewCtrl = require('./controllers/reviews.controller');
router.use('', ReviewCtrl);

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
