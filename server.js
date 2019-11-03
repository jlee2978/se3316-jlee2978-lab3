// ASSUMPTION: JSON format is used in the response for simplicity

// server.js

// In this code, the response is an object contains
// {error: error, bear: bear} or
// {error: error, bears: bears} 
//
// where error is an object {code: codeValue, message: errorMessage}
//   and bear/bears is an optional object (for update, delete). 
//   To get bears or after creating a new bear, it is a required object
// =============================================================================

// include the required packages
var express    = require('express');        // call express
var app        = express();                 // define our application
var bodyParser = require('body-parser');

// import the model defined in the models folder
var Bear     = require('./bear');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// include the mongoose object
var mongoose   = require('mongoose');

// connect to the mongoDB "bears"
// which is set up according to the lab pdf
// mongoose.connect("mongodb+srv://wingli:r3e2g1$00@cluster0-n48kg.mongodb.net/test?retryWrites=true&w=majority", 
mongoose.connect("mongodb+srv://jlee2978:jeffrey3316uwo@cluster0-fyxo4.mongodb.net/test?retryWrites=true&w=majority", 
{
	useNewUrlParser: true,
}
)

// Define the port # for listening front end requests
// either the predefined or 8080
var port = process.env.PORT || 8080;        

// Define a router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // logging a general message to indicate a request from the client
	console.log('There is a request.');

	// as a lab requirement, set the character set to UTF-8 for response
	res.setHeader('Content-Type', 'application/json;charset=UTF-8');

	// make sure we go to the next routes and don't stop here
    next();
});

// Define a default route (i.e. http://localhost:8080/api/)
router.get('/', 
			function(req, res) {
    		res.json({ message: 'hooray! welcome to our api!'});   
			}
		);


// Register the router (with all routes) with our app
// with a prefix api
app.use('/api', router);

// Start the server app to listen to the port for requests
app.listen(port);
console.log('Server is listening to port ' + port);