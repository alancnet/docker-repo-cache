#!/usr/bin/env node
var fs = require('fs'),
	spawn = require('child_process').spawn;
var args = process.argv.slice(2);

// Determine if this is a docker build by looking for a lone 'build' parameter.
var isBuild = args.reduce(function(pv, cv, i) {
	if (pv === null) {
		if (cv[0] === '-') return null;
		if (cv === 'build' && i < args.length - 1) return true;
		return false;
	}
	return pv;
}, null)


if (isBuild) {
	// Finds the index of an argument in the args array by abbreviated form or
	// long form.
	// Example: indexOfArg(['--123', '-abc'], 'b', 'bar') === 1
	// Example: indexOfArg(['--foo', '--bar'], 'b', 'bar') === 1
	// Example: indexOfArg(['--123', '--foo'], 'b', 'bar') === -1
	var indexOfArg = function(args, abbrev, whole) {
		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			if (arg.split('=')[0] === '--' + whole) return i;
			if (arg[0] === '-' && arg[1] !== '-' && arg.split('=')[0].indexOf(abbrev, 1) != -1) return i
		}
		return -1;
	}

	// Determines if an argument exists in the args list.
	var hasArg = function(args, abbrev, whole) {
		return indexOfArg(args, abbrev, whole) != -1;
	}

	// Reads the value of an argument.
	var readArg = function(args, abbrev, whole) {
		var i = indexOfArg(args, abbrev, whole);
		if (i != -1) {
			var arg = args[i];
			if (arg.indexOf('=') == -1) {
				return args[i + 1];
			} else {
				return arg.split('=')[1];
			}
		}
		return null;
	}

	// Locate the Dockerfile.
	var dockerfileFolder = args[args.length - 1];
	var dockerfilePath = (readArg(args, 'f', 'file') || dockerfileFolder + '/Dockerfile').replace(/"/g, '');

	// Read the dockerfile into memory
	var original = fs.readFileSync(dockerfilePath,'utf8');
	var lines = original.split('\n');

	// Add ENV lines to the beginning and end of the file.
	var fromLineIndex = lines.reduce(function(pv, cv, i) {
		if (cv.indexOf('FROM ') == 0) return pv || i;
		return pv;
	}, 0);
	var newLines = lines.slice(0, fromLineIndex + 1)
	.concat([
		'ENV http_proxy=http://172.17.42.1:3142'
	])
	.concat(lines.slice(fromLineIndex + 1))
	.concat([
		'ENV http_proxy=""'
	])

	// Rearrange docker arguments
	var dockerfileTempPath = dockerfilePath + '.tmp~~';
	console.log('dockerfileTempPath:', dockerfileTempPath);
	var fileArgIndex = indexOfArg(args, 'f', 'file');
	console.log('fileArgIndex', fileArgIndex);
	var newArgs;
	if (fileArgIndex == -1) {
		// Insert "--file Dockerfile.tmp~~" as last parameter before path
		newArgs = args.slice(0, args.length - 1).concat(['--file', dockerfileTempPath]).concat(args.slice(-1));
		console.log('newArgs', newArgs);
	} else {
		var fileArg = args[fileArgIndex];
		console.log('fileArg', fileArg);
		// Replace user-specified dockerfile with "Dockerfile.tmp~~"
		if (fileArg.indexOf('=') == -1) {
			newArgs = args.slice(0, fileArgIndex + 1).concat([dockerfileTempPath]).concat(args.slice(fileArgIndex + 2));
			console.log('newArgs', newArgs);
		} else {
			newArgs = args.slice(0, fileArgIndex)
				.concat([fileArg.split('=')[0] + '=' + dockerfileTempPath])
				.concat(args.slice(fileArgIndex + 1));
				console.log('newArgs', newArgs);
		}
	}
	var dockerArgs  = newArgs.map(function(arg) {
		if (arg.indexOf(' ') != -1) return '"' + arg + '"';
		else return arg;
	}).join(' ');

	fs.writeFileSync(dockerfileTempPath, newLines.join('\n'), 'utf8');

	console.log('Proxing exec: /usr/bin/docker ' + dockerArgs)
	spawn('/usr/bin/docker', newArgs, {
		stdio: [process.stdin, process.stdout, process.stderr]
	}).on('close', function(code) {
		fs.unlinkSync(dockerfileTempPath);
		process.exit(code);
	});


} else {
	spawn('/usr/bin/docker', args, {
		stdio: [process.stdin, process.stdout, process.stderr]
	}).on('close', function(code) {
		process.exit(code);
	});

}
