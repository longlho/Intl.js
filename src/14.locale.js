import {
  Intl
} from "./8.intl.js";

import {
  UnicodeExtensionSubtags,
  expUnicodeExSeq
} from "./9.negotiation.js";

import {
  IsStructurallyValidLanguageTag,
  CanonicalizeLanguageTag,
  toLatinUpperCase,
  IsWellFormedCurrencyCode
} from "./6.locales-currencies-tz.js";

import {
  numSys
} from "./11.numberformat.js";

import {
  defineProperty,
  Record
} from "./util.js";

const keyToOptionMap = {
  'ca': 'calendar',
  'co': 'collation',
  'cu': 'currency',
  'hc': 'hourCycle',
  'kf': 'caseFirst',
  'kn': 'numeric',
  'nu': 'numberingSystem',
  'tz': 'timeZone'
};

const optionToKeyMap = {};
for (let key in keyToOptionMap) {
  let option = keyToOptionMap[key];
  optionToKeyMap[option] = key;
}

function DeconstructLanguageTag(locale) {
  let result = new Record();
  
  let noExtensionsLoc = String(locale).replace(expUnicodeExSeq, '');
  let extension = locale.match(expUnicodeExSeq)[0];
  result['[[Locale]]'] = noExtensionsLoc;
  result['[[Extension]]'] = extension;

  return result;
}

function IsOptionValueSupported(option, value) {
  switch (option) {
    case 'calendar':
      //XXX: Get the list of available calendars
      return true;
    case 'collation':
      //XXX: Get the list of available collations
      return true;
    case 'currency':
      return IsWellFormedCurrencyCode(value);
    case 'hourCycle':
      return ['h12', 'h24'].includes(value);
    case 'caseFirst':
      return ['upper', 'lower', false].includes(value);
    case 'numeric':
      return typeof value === 'boolean';
    case 'numberingSystem':
      return numSys.hasOwnProperty(value);
    case 'timeZone':
      //XXX: accept more time zones
      return toLatinUpperCase(value) === 'UTC';
  }
  throw new RangeError(`Unknown option ${option}`);
}

class Locale {
  constructor(tag, options = {}) {
    if (!IsStructurallyValidLanguageTag(tag)) {
        throw new RangeError(`${tag} is not a structurally valid language tag`);
    }
    let locale = this; 
    let canonicalizedTag = CanonicalizeLanguageTag(tag);
    let r = DeconstructLanguageTag(canonicalizedTag);
    this.locale = r['[[Locale]]'];

    let optionKeys = Object.keys(options);
    for (let key in optionKeys) {
      if (optionToKeyMap.hasOwnProperty(key)) {
        let value = options[key];
        if (!IsOptionValueSupported(key, value)) {
          throw new RangeError(`Invalid value ${value} for option ${key}`);
        }
        locale[key] = value;
      }
    }
    if (r['[[Extension]]']) {
      let unicodeSubtags = UnicodeExtensionSubtags(r['[[Extension]]']);
      let i = 0;
      let len = unicodeSubtags.length;
      while (i < len) {
        let key = unicodeSubtags[i];
        if (keyToOptionMap.hasOwnProperty(key)) {
          i += 1;
          let value = unicodeSubtags[i];

          if (value === 'true') value = true;
          if (value === 'false') value = false;
          let name = keyToOptionMap[key];
          if (!IsOptionValueSupported(name, value)) {
            throw new RangeError(`Invalid value ${value} for option ${name}`);
          }
          if (!locale.hasOwnProperty(name)) {
            locale[name] = value;
          }
        }
        i += 1;
      }
    }
    Object.freeze(locale);
  }
  
  toString() {
    let loc = this;

    if (typeof loc !== 'object') {
      throw new TypeError();
    }
    let locale = loc.locale;
    let unicodeExt = '';

    for (let name of Object.keys(optionToKeyMap)) {
      let key = optionToKeyMap[name];
      if (loc.hasOwnProperty(name)) {
        let value = loc[name];
        let kvp = `${key}-${value}`;
        if (unicodeExt.length) {
          unicodeExt = `${unicodeExt}-`;
        }
        unicodeExt = `${unicodeExt}${kvp}`;
      } 
    }
    //XXX: Consider caching the value since the object is frozen
    if (unicodeExt.length) {
      return `${locale}-${unicodeExt}`;
    }
    return locale;
  }
}

defineProperty(Intl, 'Locale', {
  configurable: true,
  writable: true,
  value: Locale
});
