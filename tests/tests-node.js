var qunit = require('./lib/qunit/qunit').QUnit, all_passed, global_passed;
qunit.log = function (output) {
    var message = (output.result ? 'PASS: ' : 'FAIL: ') + output.message + '\n';
    if (!output.result) all_passed = false;
    if (output.expected) message += '  expected: ' + output.expected + '\n';
    if (output.actual) message += '  actual: ' + output.actual + '\n';
    if (!output.result) message = '\033[31m' + message + '\033[39m'; // red!
    console[output.result ? 'log' : 'error'](message);
};
console.log('Tests for routemap.js');
global_passed = all_passed = true;
require('./lib/tests').RouteMapTests(qunit, require('../routemap').RouteMap);
console[all_passed ? 'log' : 'error']('Tests for routemap.js => ' + 
    (all_passed ? 'ALL TESTS PASSED' : '\033[31mSOME TESTS FAILED\033[39m'));
console.log('Tests for routemap.compressed.js');
global_passed = all_passed;
all_passed = true;
require('./lib/tests').RouteMapTests(qunit, require('../routemap.compressed').RouteMap);
console[all_passed ? 'log' : 'error']('Tests for routemap.compressed.js => ' + 
    (all_passed ? 'ALL TESTS PASSED' : '\033[31mSOME TESTS FAILED\033[39m'));
global_passed = global_passed && all_passed;
if (!global_passed) console.error('\n\n\n\033[31mONE OR BOTH FILES FAILED\033[39m');
process.exit(global_passed ? 0 : 1);