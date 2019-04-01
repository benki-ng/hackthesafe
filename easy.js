const http = require('http');
const { parse } = require('querystring');

var unlock = false

const server = http.createServer((request, res) => {
	if (request.method === 'POST') {
		collectRequestData(request, result => {

			console.log("Attempt pin: " + result.pin + " from " + request.connection.remoteAddress) 

			//Catch if empty post request
			if (result  != null) {
				//Check if pin is valid
				if (result.pin == "5794") {
					res.end('Pin correct')
					console.log("pin correct")
					unlock = true
					setTimeout(function() {
						console.log("lock timeout")
						unlock = false
					}, 30000);
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
