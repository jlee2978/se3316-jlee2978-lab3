// ASSUMPTION: JSON format is used in the response for simplicity

// server.js

// In this code, the response is an object contains
// {error: error, item: item} or
// {error: error, items: items} 
//
// where error is an object {code: codeValue, message: errorMessage}
//   and item/items is an optional object (for update, delete). 
//   To get items or after creating a new item, it is a required object
// =============================================================================

// include the required packages
var express    = require('express');        // call express
var app        = express();                 // define our application
var bodyParser = require('body-parser');

// import the model defined in the models folder
var Item     = require('./bear');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// include the mongoose object
var mongoose   = require('mongoose');

// get rid of the deprecation warning in the command prompt
mongoose.set('useUnifiedTopology', true);

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
        
// get all the items (accessed at GET http://localhost:8080/api/getitems)
router.route('/getitems')	
	// get all the items 
	   .get(function(req, res) {
		var error = {};
		var items = [];
		
		// log a get message to the console
		console.log('Get items');		
		
        Item.find(function(err, items) {
			console.log('item found');
            if (err) {				
				items = [];
				error = {code: -1, message: err};
			}
			else
			{
				error = {code: 0, message: 'Item records are retrieved successfully!'};
			}

			// return the response
            res.json({error: error, items: items});
        });
    });	

router.route('/getitemsbyname/:item_name')
    // get the item by name

    .get(function(req, res) {
        var error = {};

        // assume exact case sensitive match
        var searchName = {name: req.params.item_name};

        Item.find(searchName, function(err, items) {
            if (err) {
                error = {code: -1, message: err};
            }
            else {
                error = {code: 0, message: '1 record retrieved'};
            }

            // package response with error
            res.json({error: error, items: items});
        });
    });	

// POST Route: Create a new item
// accessed http://localhost:8080/api/createitem with POST method
// createitem is the noun+verb
router.route('/createitem')

    // create a item
    .post(function(req, res) {
		// initialize an error object
		var error = {};
		
		// create an instance of Item model
		var item = new Item();
		
		// item info is POSTed in the request body
		// corresponding properties assigned to item
        item.name = req.body.name;
		item.type = req.body.type;
		item.period = req.body.period;
        item.quantity = req.body.quantity
        
        //error = {code: 0, message: 'Item created successfully'};
		
		// log a create message to the console
		//console.log('Create item ' + JSON.stringify(item));
		
		// call the item object to save that item instance
        item.save(function(err, result) {
			if(err) {
				error = {code: -1, message: 'Failed to create an item record'};
			} else {
				error = {code: 0, message: 'Item created successfully!'};
			}
			
			// since this is a new item, mongoDB will return an implicit _id property to the item
			// _id is kept in the front end page to identify the item for update/delete methods

			// prepare the response
			var response = {error: error, item: item};
			
			res.json(response);
        });

    });

// PUT Route: Updating a item
// accessed http://localhost:8080/api/updateitem/:item_id with PUT method
// updateitem is the noun-verb
router.route('/updateitem/:item_id')
	// update the item with this id
    .put(function(req, res) {
		
        var error = {};
	
		// Use findById() to ensure the item exists in the database for update
		// since the same item might have been deleted by other user
        Item.findById(req.params.item_id, function(err, item) {

            if (err) {
				error = {code: -1, message: err};

				// if there is an error to locate the item
				// package response with error
				res.json({error: error});
				return;
			}

			// if item exists, assign/update item properties 
			// update item properties with those in the request body correspondingly
			item.name = req.body.name;
			item.type = req.body.type;
			item.period = req.body.period;
			item.quantity = req.body.quantity;	
			
			// log an update message to the console
			//console.log('Update Item: ' + JSON.stringify(item));

            // save the item
            item.save(function(err) {
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

// DELETE Route: To delete a item
// accessed http://localhost:8080/api/deleteitem/:item_id with DELETE method
// deleteitem is the noun-verb
router.route('/deleteitem/:item_id')
	// delete the item with their id
    .delete(function(req, res) {
        var error = {};
		
		// Use findById to ensure the item exists
		// as the item we saw on the web page might have already 
		// been deleted
		Item.findById(req.params.item_id, function (err, item) {

			if (err) {
				error = { code: -1, message: err };

				// return error as response
				res.json({ error: error });
				return;
			}

			// call the remove function to delete the item
            Item.remove({_id: req.params.item_id}, 
                function (err, item) {
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