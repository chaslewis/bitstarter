#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if (!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var getHtmlFileStr= function(parms) {
    if (typeof parms.urlpath == 'string') {
	rest.get(parms.urlpath).on('complete', (function() {  return function(resp) {checkHtmlFile(resp, parms.checks);}})());
    } else {
	checkHtmlFile(fs.readFileSync(parms.file), parms.checks);
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfilestr, checksfile) {
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
        .option('-u, --urlpath <urlpath>', "URL of index.html, overrides --file if both specified", true, "http://foo.net")
        .parse(process.argv);
    getHtmlFileStr(program);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
