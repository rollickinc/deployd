var Server = require('../server')
	,	Client = require('./index')
	, os = require('os')
	, exec = require('child_process').exec
	, sh = require('shelljs');

var server;

module.exports = function (dpd) {
	console.log('type help for a list of commands');
	var repl = require("repl")
	,	context = repl.start("dpd > ", null, replEval, true, true).context
	server = context.dpd = dpd;
}

function replEval(src, ctx, name, fn) {
	var result;

	// first try to match a command
	// trim '(',')', and '\n'
	if(tryCommand(src.replace(/\(|\)|\n/g, ''))) {
		fn();
	} else {
		try {
			result = eval(src);
		} catch(e) {}
		fn(null, result);
	}
}


var commands = {
	help: function () {
		function pad(key) {
			var len = 0, padding = '';
			Object.keys(help).forEach(function (key) {
				if(key.length > len) len = key.length;
			});
			len -= key.length;
			len += 10;
			while(padding.length < len) {padding += ' '}
			return padding;
		}

		Object.keys(help).forEach(function (key) {
			console.log('\t' + key + pad(key) + help[key]);
		});
	},

	resources: function () {
		server.resources && server.resources.forEach(function (r) {
			if(r.settings.type) console.log('\t' + r.settings.path, '(' + r.settings.type + ')');
		})
	},

	dashboard: function () {
		var command = 'open';
		if (os.platform() === 'win32') {
		  command = 'start explorer'; 
		}
		command += ' \"http://localhost:' + server.options.port + '/dashboard/\"';
		sh.exec(command);
	}
}

var help = {
	dashboard: 'open the resource editor in a browser',
	dpd:       'the server object',
	resources: 'list your resources'
}

function tryCommand(cmd) {
	console.info(cmd);
	if(commands[cmd]) {
		return commands[cmd]() || true;
	}
}