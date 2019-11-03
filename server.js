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
        
// get all the bears (accessed at GET http://localhost:8080/api/getbears)
router.route('/getbears')	
	// get all the bears 
	   .get(function(req, res) {
		var error = {};
		var bears = [];
		
		// log a get message to the console
		console.log('Get bears');		
		
        Bear.find(function(err, bears) {
			console.log('bear found');
            if (err) {				
				bears = [];
				error = {code: -1, message: err};
			}
			else
			{
				error = {code: 0, message: 'Bear records are retrieved successfully!'};
			}

			// return the response
            res.json({error: error, bears: bears});
        });
    });	

router.route('/getbearbyname/:bear_name')
    // get the bear by name

    .get(function(req, res) {
        var error = {};

        // assume exact case sensitive match
        var searchName = {name: req.params.bear_name};

        Bear.find(searchName, function(err, bears) {
            if (err) {
                error = {code: -1, message: err};
            }
            else {
                error = {code: 0, message: '1 record retrieved'};
            }

            // package response with error
            res.json({error: error, bears: bears});
        });
    });	

// POST Route: Create a new bear
// accessed http://localhost:8080/api/createbear with POST method
// createbear is the noun+verb
router.route('/createbear')

    // create a bear
    .post(function(req, res) {
		// initialize an error object
		var error = {};
		
		// create an instance of Bear model
		var bear = new Bear();
		
		// bear info is POSTed in the request body
		// corresponding properties assigned to bear
        bear.name = req.body.name;
		bear.type = req.body.type;
		bear.period = req.body.period;
        bear.quantity = req.body.quantity
        
        //error = {code: 0, message: 'Bear created successfully'};
		
		// log a create message to the console
		//console.log('Create bear ' + JSON.stringify(bear));
		
		// call the bear object to save that bear instance
        bear.save(function(err, result) {
			if(err) {
				error = {code: -1, message: 'Fail to create a bear record'};
			} else {
				error = {code: 0, message: 'Bear is created successfully!'};
			}
			
			// since this is a new bear, mongoDB will return an implicit _id property to the bear
			// _id is kept in the front end page to identify the bear for update/delete methods

			// prepare the response
			var response = {error: error, bear: bear};
			
			res.json(response);
        });

    });

// PUT Route: Updating a bear
// accessed http://localhost:8080/api/updatebear/:bear_id with PUT method
// updatebear is the noun-verb
router.route('/updatebear/:bear_id')
	// update the bear with this id
    .put(function(req, res) {
		
        var error = {};
		
		// log a update message to the console
		//console.log('update bear');		
	
		// Use findById() to ensure the bear exists in the database for update
		// since the same bear might have been deleted by other user
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err) {
				error = {code: -1, message: err};

				// if there is an error to locate the bear
				// package response with error
				res.json({error: error});
				return;
			}

			// if bear exists, assign/update bear properties 
			// update bear properties with those in the request body correspondingly
			bear.name = req.body.name;
			bear.type = req.body.type;
			bear.period = req.body.period;
			bear.quantity = req.body.quantity;	
			
			// log an update message to the console
			//console.log('Update Bear: ' + JSON.stringify(bear));

            // save the bear
            bear.save(function(err) {
                if (err) {
					error = {code: -1, message: err};
				}
				else{
					error = {code: 0, message: 'record updated successfully!'};
				}

				// return the response
                res.json({ error: error });
            });
        });
    });

// DELETE Route: To delete a bear
// accessed http://localhost:8080/api/deletebear/:bear_id with DELETE method
// deletebear is the noun-verb
router.route('/deletebear/:bear_id')
	// delete the bear with their id
    .delete(function(req, res) {
        var error = {};
		
		// Use findById to ensure the bear exists
		// as the bear we saw on the web page might have already 
		// been deleted
		Bear.findById(req.params.bear_id, function (err, bear) {

			if (err) {
				error = { code: -1, message: err };

				// return error as response
				res.json({ error: error });
				return;
			}

			// log a delete message to the console ONLY AFTER the bear is found
			//console.log('Delete Bear: ' + JSON.stringify(bear));

			// call the remove function to delete the bear
            Bear.remove({_id: req.params.bear_id}, 
                function (err, bear) {
				if (err) {
					error = { code: -1, message: err };
				}
				else {
					error = { code: 0, message: 'Record deleted successfully!' };
				}

				// return error response
				res.json({ error: error });
			});
		});
    });

// Register the router (with all routes) with our app
// with a prefix api
app.use('/api', router);

// Start the server app to listen to the port for requests
app.listen(port);
console.log('Server is listening to port ' + port);