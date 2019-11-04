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
	// verb (e.g. getbears, updateBear) maps to the corresponding method
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

function getBears()
{	
	var verb = 'getbears';
	
	// Define callBack function
	var callBack = function(response) {
		// display error if any, then stop further processing
		if (response.error.code !== 0)
		{
			alert('Error: ' + response.error.message);
			return;
		}

		// get the retreived bears from server response
		var bears = response.bears;

		resetTable();
		
		// convert bears into an array so that we have the same logic to add array element to the table row
		if (!Array.isArray(bears))
		{
			var bearsArray = [];
			bearsArray.push(bears);
			bears = bearsArray;
		}
				
		// process each bear
		bears.forEach(function(bear, index) {
			// add a table row for bear
			addRow(bear);			
		})
	}
	
	// call the submit function to send request GET is the R operation for READ data
	submit('GET', verb, null, callBack)
}

function getBearsByName()
{
	// Get the name for searching bear
	var name = getElement('search-name').value;

	// if name is not provided for searching then ignore it and simply call getBears() to return all bears in the database
	if (name.length == 0)
	{
		getBears();
		return;
	}
	
	// if name is provided, prepare the verb
	var verb = 'getbearsbyname/' + name;
	
	// define callBack function
	var callBack = function(response) {
		// display any errors from server's response and stop further processing
		if (response.error.code !== 0)
		{
			alert('Error: ' + response.error.message);
			return;
		}

		// get the bears from server response
		var bears = response.bears;

        //reset the table
		resetTable();
		
		// convert bears into an array so that we have the same logic to add array element to the table row
		if (!Array.isArray(bears))
		{
			var bearsArray = [];
			bearsArray.push(bears);
			bears = bearsArray;
		}
				
		bears.forEach(function(bear, index) {

			// add a table row for bear
			addRow(bear);
			
		})
	}

	var caseSensitivity = getElement('case-sensitivity').value;

	console.log('caseSensitivity: '+ caseSensitivity);
	
	// call the submit function to send request
	// Post is used to get bears as we are pssing sensitivity option for searching
	submit('POST', verb, JSON.stringify({"sensitivity" : caseSensitivity}), callBack)
}

function createBear()
{	
	// define a callBack function
	var callBack = function(response) {

		if (response.error.code == 0) {
			addRow(response.bear);
            
            //reset the form
			getElement('createbear').reset();
		}
		else {
			alert('Error: ' + response.error.message);
		}	
	}

	// prepare general querySelector
	var selector = '#createbear input[id="';

	// get the data from the form
	var name = document.querySelector(selector + 'name"]').value;
	var type = document.querySelector('#createbear select[id="type"]').value;;
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
	submit('POST', 'createbear', formJSONData, callBack);
}

function deleteBear(id) {
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
		// id is all we need to pass and is used to identify the bear record for delete so we don't need to pass any form data and pass null
		submit('DELETE', 'deletebear/' + id.toString(), null, callBack);
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
		
		getElement('sign-in').style.display = 'none';
		loginSection.style.display = 'block';
		
		if (role == 'admin') {
			getElement('createbear').style.display = 'block';
		}
		else {
			getElement('createbear').style.display = 'none';
		}
			
		getElement('signedinuser').innerHTML = userid;
		
		getBears();

		polling = setInterval(

			function () {
				
				if (role.length == 0 || role == 'admin') {
					return
				}
				
				if (getElement('search-name').value.length == 0) {
					getBears();
				}
				else {
					getBearsByName();
				}
			},
			pollingSec);
	}
}

function logout() {
	clearInterval(polling);
	
	getElement('signinform').reset();
	getElement('createbear').reset();
	
	getElement('sign-in').style.display = 'block';
	getElement('loggedin-section').style.display = 'none';
	
	getElement('userid').focus();
	
}

// reset the table rows
function resetTable() {
    // get table element for displaying bears
    var table  = getElement('bear-list');
            
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