const http = require('http');
const { parse } = require('querystring');

unlock = false
var ipArray = [];
var banHistory = 20;
var banCount = 3;

var unlock = false

const server = http.createServer((request, res) => {
	if (request.method === 'POST') {
		collectRequestData(request, result => {

			console.log(ipArray);

			if ( banner(ipArray, request.connection.remoteAddress, banHistory, banCount) ) {
				//Catch if empty post request
				if (result.pin  != null) {
					console.log("Attempt pin: " + result.pin + " from " + request.connection.remoteAddress)   
					//Check if pin is valid
					if (result.pin == "7325") {
						res.end('Pin correct')
						console.log("pin correct")
						unlock = true
						//remove the correct pin ip from array
						ipArray.pop()
						setTimeout(function() {
							console.log("lock timeout")
							unlock = false
						}, 30000);
					}
				}
			}
			res.end('Pin incorrect')
		});
	}
	else if (request.url == '/letmein') {
		console.log("safe ping")
		if (unlock) {
			res.end("True")
		} 
		else {
			res.end("False")
		}
	}
	else {
		res.end(`
			<!doctype html>
			<html>
			<body>
			<h1>Enter your 4 digit pin code</h1>
			<form action="/" method="post">
			<input type="text" name="pin" /><br />
			<button>Submit</button>
			</form>
			</body>
			</html>
		`);
	}
});
server.listen(3000);

function collectRequestData(request, callback) {
	const FORM_URLENCODED = 'application/x-www-form-urlencoded';
	if(request.headers['content-type'] === FORM_URLENCODED) {
		let body = '';
		request.on('data', chunk => {
			body += chunk.toString();
		});
		request.on('end', () => {
			callback(parse(body));
		});
	}
	else {
		callback(null);
	}
}


//Array length controller for IP ban list
/* takes 4 args
array for storing ips
the new ip of the request
an int telling how many ips to store
an int telling how many attempts to ban after

Allow access returns True
Do not allow returns False
*/
function banner(ipArray, ip, banHistory, banCount) {
	
	//Control the length of the history
	if (ipArray.length > banHistory) {
		ipArray.shift();
	}

	//Count the number of occurences of the ip in the array
	var count = 0
	ipArray.forEach( function(element) {
		if (element == ip) {
			count += 1;
		}
	});

	//Check if IP should not be allowed
	if (count >= banCount) {
		console.log("Blocked attempt from banned IP: " + ip)
		return false;
	}

	ipArray.push(ip)
	return true;
}

