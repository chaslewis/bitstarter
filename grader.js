#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://stormy-savannah-9943.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var stringify = function(infile) {
    return  infile.toString();
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    var htmlfilestr = fs.readFileSync(htmlfile);
    return checkHtmlFileStr(htmlfilestr, checksfile);
};

var checkHtmlFileUrl = function(htmlfileurl, checksfile) {
    rest.get(htmlfileurl).on('complete', (function() {  return function(resp) {checkHtmlFileStr(resp, checksfile);}})());
}

var checkHtmlFileStr = function(htmlfilestr, checksfile) {
    $ = cheerio.load(htmlfilestr);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    if (require.main == module) {
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
    } else return out;
};

if (require.main == module) {
    program.option('-c, --checks ', "Path to checks.json", assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', "Path to index.html", assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --urlpath <urlpath>', "URL of index.html, overrides --file if both specified", stringify, URL_DEFAULT)
        .parse(process.argv);
    if (typeof program.urlpath == 'string') {
	checkHtmlFileUrl(program.urlpath, program.checks);
    } else {
	checkHtmlFile(program.file, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
