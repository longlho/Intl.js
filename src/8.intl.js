import {
    CanonicalizeLocaleList,
    UnicodeExtensionSubtags
} from "./9.negotiation.js";

import {
    IsStructurallyValidLanguageTag,
    CanonicalizeLanguageTag
} from "./6.locales-currencies-tz.js";

// 8 The Intl Object
export const Intl = {};

// 8.2 Function Properties of the Intl Object

// 8.2.1
// @spec[tc39/ecma402/master/spec/intl.html]
// @clause[sec-intl.getcanonicallocales]
function getCanonicalLocales (locales) {
    // 1. Let ll be ? CanonicalizeLocaleList(locales).
    let ll = CanonicalizeLocaleList(locales);
    // 2. Return CreateArrayFromList(ll).
    {
        let result = [];

        let len = ll.length;
        let k = 0;

        while (k < len) {
            result[k] = ll[k];
            k++;
        }
        return result;
    }
}

Object.defineProperty(Intl, 'getCanonicalLocales', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: getCanonicalLocales
});

const optionValues = {
  calendar: {
    values: ['buddhist', 'chinese', 'coptic', 'ethioaa', 'ethiopic', 'gregory', 'hebrew', 'indian', 'islamic', 'islamicc', 'iso8601', 'japanese', 'persian', 'roc'],
    key: 'ca'
  },
  collation: {
    values: ["big5han", "dict", "direct", "ducet",  "gb2312", "phonebk", "phonetic", "pinyin", "reformed", "searchjl", "stroke", "trad", "unihan", "standard", "search"],
    key: 'co'
  },
  currency: {
    values: ["eur", "usd", "pln"],
    key: 'cu'
  },
  hourCycle: {
    values: ['h12', 'h24'],
    key: 'hc'
  },
  caseFirst: {
    values: ["upper", "lower", "false"],
    key: 'kf'
  },
  numeric: {
    values: ["true", "false"],
    key: 'kn'
  },
  numberingSystem: {
    values: ["arab", "arabext", "bali", "beng", "deva", "fullwide", "gujr", "guru", "hanidec", "khmr", "knda", "laoo", "latn", "limb", "mlym", "mong", "mymr", "orya", "tamldec", "telu", "thai", "tibt"],
    key: 'nu'
  },
  timeZone: {
    key: 'tz'
  }
};

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


const expExSeq = /-([xtu])(?:-[0-9a-z]{2,8})+/gi;

function deconstructLocaleString(locale) {
    let res = {
      locale: null,
      extensions: {}
    };

    let r;
    let extensionIndex;
    while ((r = expExSeq.exec(locale)) !== null) {
        if (extensionIndex === undefined) {
          extensionIndex = r.index;
        }
        res.extensions[r[1]] = r[0];
    }
    if (extensionIndex !== undefined) {
      res.locale = locale.substring(0, extensionIndex);
    } else {
      res.locale = locale;
    }
    return res;
}

class Locale {
  constructor(locale, options = {}) {
    if (!IsStructurallyValidLanguageTag(locale)) {
        throw new RangeError(`${locale} is not a structurally valid language tag`);
    }
    let loc = CanonicalizeLanguageTag(locale);
    console.log(loc);
    let res = deconstructLocaleString(loc);
    this.locale = res.locale;

    for (let name in options) {
      if (!optionValues.hasOwnProperty(name)) {
        continue;
      }

      let value = options[name];

      if (value === false) value = "false";
      if (value === true) value = "true";

      if (optionValues[name].hasOwnProperty('values') &&
          !optionValues[name].values.includes(value)) {
          throw new RangeError(`Invalid value ${value} for option ${name}`);
      }
      this[name] = options[name];
    }

    if (!res.extensions.hasOwnProperty('u')) {
      return;
    }
    let extensionSubtags = UnicodeExtensionSubtags(res.extensions['u']);

    for (let i = 0; i < extensionSubtags.length; i++) {
        let key = extensionSubtags[i];
        if (keyToOptionMap.hasOwnProperty(key)) {
            let value = extensionSubtags[++i];

            let name = keyToOptionMap[key];
            if (this.hasOwnProperty(name)) {
                continue;
            }
            if (optionValues[name].hasOwnProperty('values') &&
                !optionValues[name].values.includes(value)) {
                  throw new RangeError(`Invalid value ${value} for key ${key}`);
            }
            this[name] = value;
        }
    }
  }
  
  toString() {
    let exts = [];

    for (let key in keyToOptionMap) {
      let name = keyToOptionMap[key];
      if (!this.hasOwnProperty(name)) {
        continue;
      }
      exts.push(`${key}-${this[name]}`);
    }
    if (exts.length) {
      return `${this.locale}-u-${exts.join('-')}`;
    }
    return this.locale;
  }
}

Object.defineProperty(Intl, 'Locale', {
  enumerable: false,
  configurable: true,
  writable: true,
  value: Locale
});
