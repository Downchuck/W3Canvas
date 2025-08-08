"use strict";
var execSync = require('child_process').execSync;
var args = process.argv.slice(2);
if (args.includes('--test')) {
    console.log('Running in test mode');
    // In the future, we could add test-specific build steps here.
    // For now, just run the standard build.
    execSync('yarn tsc', { stdio: 'inherit' });
}
else {
    execSync('yarn tsc', { stdio: 'inherit' });
}
