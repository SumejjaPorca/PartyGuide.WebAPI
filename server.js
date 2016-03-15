// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan')
mongoose.connect('mongodb://localhost:27017/nwt');

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

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Hooray! welcome to our api!' });
});

var Dummy = require('./models/dummy')

// test route GET http://localhost:8080/api/dummies
router.get('/dummies', function(req, res){
  Dummy.find(function(err, bars){
    if(err) return console.log(err);
    res.json(bars);
  });
});

// Mount Bar Controller on /api/bars route
var BarCtrl = require('./controllers/bars.controller');
router.use('/bars', BarCtrl);

// Mount Post Controller on /api/posts route
var PostCtrl = require('./controllers/posts.controller');
router.use('', PostCtrl);

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
