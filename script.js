// user id and password
// (admin, admin) or (user, user)
// no strict security for simple demo
var userid=''
var userpwd=''
var role =''

var polling;


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