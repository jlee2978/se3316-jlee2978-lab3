// user id and password
// (admin, admin) or (user, user)
// no strict security for simple demo
var userid=''
var userpwd=''
var role =''

// create an ASYNCHRONOUS HTTP request global object
var xmlHttp = new XMLHttpRequest();

// polling every 2 sec
var pollingSec = 2000;

var polling;

// wait 200ms to get userid element ready, then set the cursor to focus on it
setTimeout(
	function() {
		getElement('userid').focus();
	}, 200);



// Functions for CRUD operations

// all API functionalities will call this submit() function
function submit(method, verb, jsonData, callBack) {
	// generic function which calls the web rest api asynchronously 
	// 
	// parameters:
	// method represents the CRUD operation: get, put, post, or delete
	// verb (e.g. getitems, updateItem) maps to the corresponding method
	// jsonData is the data (json format used in this lab) in the request body passed to the server for processing
	// callBack is a function which performs operations upon receiving response from server
	
	// server is the name under which server.js is running
	var server = 'http://localhost:'
	var port = '8080';
	var prefix = 'api';
    
    //verb is the parameter passed in that maps to the method
	var url = server + port + '/' + prefix + '/' + verb;
    
    // once the XML HTTP request object's ready state changes
	xmlHttp.onreadystatechange = function()
    {
        // the object's ready state equals to 4 (done - the operation is complete) and status equal to 200 (success - OK)
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            // if callBack function is defined, call the callBack function to perform required logic after getting the response
            if (callBack) {
                callBack(JSON.parse(xmlHttp.responseText));
            }
		}
	}
	
	// initializes a newly-created HTTP request, or re-initializes an existing one.
	xmlHttp.open(method, url);

	// set using json format and UTF-8 character set
	xmlHttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

	// send request to server
	xmlHttp.send(jsonData);	
}

function getItems()
{	
	var verb = 'getitems';
	
	// Define callBack function
	var callBack = function(response) {
		// display error if any, then stop further processing
		if (response.error.code !== 0)
		{
			alert('Error: ' + response.error.message);
			return;
		}

        // reset table
        resetTable();
        
		// process each item in the response.items
		response.items.forEach(function(item, index) {
			// add a table row for item
			addRow(item);			
		})
	}
	
	// call the submit function to send request GET is the R operation for READ data
	submit('GET', verb, null, callBack)
}

function getItemsByName()
{
	// Get the name for searching item
	var name = getElement('search-name').value;

	// if name is not provided for searching then ignore it and simply call getItems() to return all items in the database
	if (name.length == 0)
	{
		getItems();
		return;
	}
	
	// if name is provided, prepare the verb
	var verb = 'getitemsbyname/' + name;
	
	// define callBack function
	var callBack = function(response) {
		// display any errors from server's response and stop further processing
		if (response.error.code !== 0)
		{
			alert('Error: ' + response.error.message);
			return;
		}
       
        //reset the table
		resetTable();
                
        // process each item in the response.items
		response.items.forEach(function(item, index) {

			// add a table row for item
			addRow(item);
			
		})
	}
	
	// call the submit function to send request
	submit('GET', verb, null, callBack)
}

function createItem()
{	
	// define a callBack function
	var callBack = function(response) {

		if (response.error.code == 0) {
			addRow(response.item);
            
            //reset the form
			getElement('createitem').reset();
		}
		else {
			alert('Error: ' + response.error.message);
		}	
	}

	// prepare general querySelector
	var selector = '#createitem input[id="';

	// get the data from the form
	var name = document.querySelector(selector + 'name"]').value;
	var type = document.querySelector('#createitem select[id="type"]').value;;
	var period = document.querySelector(selector + 'period"]').value;
	var quantity = document.querySelector(selector + 'quantity"]').value;;
		
	// validate data
	if (!isDataValid(name, type, period, quantity)) {
        return;
    }
	
	// we sanitize the name as it is the only text input
	name = sanitize(name);
	var formJSONData = JSON.stringify({name: name, type: type, period: period, quantity: quantity});
	
	// call the submit function to send request
	// Post is the C operation for Create data
	submit('POST', 'createitem', formJSONData, callBack);
}

function updateItem(id) {
	// Get selector for the row according to id
	var selector = '#item-list tr[id="' + id + '"]';

	// get the data from the row
	var name = document.querySelector(selector + ' input[name="name"]').value;
	var type = document.querySelector(selector + ' select[name="type"]').value;
	var period = document.querySelector(selector + ' input[name="period"]').value;
	var quantity = document.querySelector(selector + ' input[name="quantity"]').value;
	
	// validate data
	if (!isDataValid(name, type, period, quantity)) {
        return;
    }

	// Sanitize the name only, other inputs are controlled by their data type
	name = sanitize(name);
	
	// Define callBack function
	callBack = function(response) {
		if (response.error.code !== 0) {
			alert(response.error.message);
		}
	}

	// store form data in object
	var object = {name : name, type: type, period: period, quantity : quantity};
	
	// convert object into form JSON string
	var formJSONData = JSON.stringify(object);
	
	// call the submit function to send request
	// PUT is the U operation for Update data
	submit('PUT', 'updateitem/' + id.toString(), formJSONData, callBack);	
}

function deleteItem(id) {
	// Define a callBack function
	callBack = function(response) {
		if (response.error.code !== 0) {
            alert(response.error.message);
            return;
		}
		getElement(id).remove();
	}
	
	// confirm before delete
	if (window.confirm('Are you sure you want to delete this record?')) {

		// call the submit function to send request
		// DELETE is the D operation for deleting data
		// id is all we need to pass and is used to identify the item record for delete so we don't need to pass any form data and pass null
		submit('DELETE', 'deleteitem/' + id.toString(), null, callBack);
	}
}

function isDataValid(name, type, period, quantity) {
	// validate data
	if (name.length == 0)
	{
		alert('Error: name is mandatory');
		return false;
	}
		
	if (type.toUpperCase() !== 'CD' && type.toUpperCase() !== 'BOOK')
	{
		alert('Error: type should be either Book or CD!');
		return false;
	}
	
	// if peiod is not a number or less than zero, raise error
	if (period) {
		if (isNaN(period) || period <= 0) {
			alert('Error: period should be a positive number');
			return false;
		}
	}

	// if quantity is not a number, no input, or less than zero, raise error
	if (isNaN(quantity) || quantity.length == 0 || quantity <= 0) {
		alert('Error: quantity should be a positive number');
		return false;
	}

	return true;
}

// Sanitize data
function sanitize(data) {
    return data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}



// Functions for handling front end GUI

// get html element by id
function getElement(id)
{
	// This is a helper function
	// to get element by id
	var element = document.getElementById(id);
	return element;
}

function login() {
	
	var loginSection = getElement('loggedin-section');
	role = '';
	
	userid = getElement('userid').value;
	userpwd = getElement('userpwd').value;
	
	if (userid=='admin' && userpwd=='admin') {
		role = 'admin';
	}
	else if (userid=='user' && userpwd=='user') {
		role = 'user';
	}
	
	if (role.length == 0) {
		alert('Invalid user id or password, please try again');
		loginSection.style.display = 'none';
	} 
	else {
		
		resetTable();
		
		getElement('signinform').style.display = 'none';
		loginSection.style.display = 'block';
		
		if (role == 'admin') {
			getElement('createitem').style.display = 'block';
		}
		else {
			getElement('createitem').style.display = 'none';
		}
			
		getElement('signedinuser').innerHTML = userid;
		
		getItems();

		polling = setInterval(

			function () {
				
				if (role.length == 0 || role == 'admin') {
					return
				}
				
				if (getElement('search-name').value.length == 0) {
					getItems();
				}
				else {
					getItemsByName();
				}
			},
			pollingSec);
	}
}

function logout() {
	clearInterval(polling);
	
	getElement('signinform').reset();
	getElement('createitem').reset();
	
	getElement('signinform').style.display = 'block';
	getElement('loggedin-section').style.display = 'none';
	
	getElement('userid').focus();
	
}

// add new row for item to the table
function addRow(item) {
	// This function accepts an individual object and adds it to the table row for display
	var table = getElement('item-list');

	// Get the # of table rows except header row
	var len = table.rows.length - 1;

	// add a table row to show item information
	var row = table.insertRow(++len);

	// start with a row cell at 0 (zero-based)
	var i = 0;

	// create a new cell
	var cell = row.insertCell(i++);

	// assign the row id from item _id
	row.id = item._id;
	
	if (role == 'admin') {
		// create Edit button						
		cell.innerHTML = '<button onclick="updateItem(' + "'" + item._id + "'" + ')">Update</button>';

		// create Delete button	within the same cell
		cell.innerHTML += '<button onclick="deleteItem(' + "'" + item._id + "'" + ')" style="margin-left:5%; float: right;">Delete</button>';
	}
	else {
        // the role is user
		cell.innerHTML = "<input type='text' value='" + row.id + "' disabled>"
	}

	// create cell for each property in item
	for (var property in item) {
		var inputType;
		var disabled = role == 'user'? 'disabled' : '';
		var selected;
		var required = (property == 'period'? '' : 'required');

		switch (property) {
			case '_id':
				// this is the unique id generated by MongoDB, no need to create a tag for this id
				continue
				break;
			case 'name':
				inputType = 'text';
				break;
			case 'period':
			case 'quantity':
				inputType = 'number';
				break;
		}
		
		// create another new cell for current property
		var cell = row.insertCell(i);

		if (property == 'type') {
			// if it is type, then use SELECT tag
			var selectHtml;

			// generate a select tag for type
			selectHtml = '<select name="' + property + '"' + disabled + '>';
			if (item[property].toUpperCase() == 'BOOK') {
				selectHtml += '<option selected value="Book">Book</option><option value="CD">CD</option>';
			}
			else {
				selectHtml += '<option value="Book">Book</option><option selected value="CD">CD</option>';
			}
			selectHtml += '</select>';

			cell.innerHTML = selectHtml;
		}
		else {
			// generate a INPUT tag for other properties
            cell.innerHTML = '<input type="' + inputType + '" ' + required + ' ' + disabled + ' name = "' + property + '" value = "' + item[property] + '">';
        }
        //increase index for cell
		++i;
	}
}

// reset the table rows
function resetTable() {
    // get table element for displaying items
    var table  = getElement('item-list');
            
    // get the # of existing rows in the table except the column header row
    var len = table.rows.length - 1;
            
    // Refresh table by cleaning up the table rows
    for(var i = len; i > 0; i--)
    {
        table.deleteRow(i);
    }
    
    if (role == 'admin') {
        getElement('heading1').innerHTML = 'Action';
    }
    else {
        getElement('heading1').innerHTML = 'Item ID';
    }
}