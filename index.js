// Expose `IntlPolyfill` as global to add locale data into runtime later on.
global.IntlPolyfill = require('./lib/core.js');

// Require all locale data for `Intl`. This module will be
// ignored when bundling for the browser with Browserify/Webpack.
require('./locale-data/complete.js');

// hack to export the polyfill as global Intl if needed
if (!global.Intl) {
    global.Intl = global.IntlPolyfill;
    global.IntlPolyfill.__applyLocaleSensitivePrototypes();
}

// providing an idiomatic api for the nodejs version of this module
module.exports = global.IntlPolyfill;

let x= 'pl-u-hc-h12-ca-buddhist-cu-eur-nu-arab-kn-true';
let loc3 = new global.IntlPolyfill.Locale(x, {
  hourCycle: 'h24',
  calendar: 'gregory',
  currency: 'usd',
  numberingSystem: 'mlym',
  numeric: false,
  caseFirst: "false"
});
console.log(loc3);
console.log(loc3.toString());
