/**
 * This namespace contains all of the global nurdz objections, functions, classes and other sub-namespaces.
 *
 * @type {{}}
 */
var nurdz = (function ()
{
    "use strict";

    // This polyfill was obtained from the following URL:
    //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    //
    // it adds the Array.filter method if no such method happens to exist.
    if (!Array.prototype.filter)
    {
        Array.prototype.filter = function (fun/*, thisArg*/)
        {
            'use strict';

            if (this === void 0 || this === null)
            {
                throw new TypeError ();
            }

            var t = Object (this);
            var len = t.length >>> 0;
            if (typeof fun !== 'function')
            {
                throw new TypeError ();
            }

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0 ; i < len ; i++)
            {
                if (i in t)
                {
                    var val = t[i];

                    // NOTE: Technically this should Object.defineProperty at
                    //       the next index, as push can be affected by
                    //       properties on Object.prototype and Array.prototype.
                    //       But that method's new, and collisions should be
                    //       rare, so use the more-compatible alternative.
                    if (fun.call (thisArg, val, i, t))
                    {
                        res.push (val);
                    }
                }
            }

            return res;
        };
    }

    // This polyfill was obtained from the following URL:
    //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    //
    // it adds the Array.indexOf method if no such method happens to exist.
    //
    // Production steps of ECMA-262, Edition 5, 15.4.4.14
    // Reference: http://es5.github.io/#x15.4.4.14
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function (searchElement, fromIndex)
        {

            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null)
            {
                throw new TypeError ('"this" is null or not defined');
            }

            var O = Object (this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0)
            {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs (n) === Infinity)
            {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len)
            {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max (n >= 0 ? n : len - Math.abs (n), 0);

            // 9. Repeat, while k < len
            while (k < len)
            {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement)
                {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }

    // This polyfill was obtained from the following URL:
    //   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
    //
    // it adds the Array.isArray method if no such method happens to exist.
    if (!Array.isArray)
    {
        Array.isArray = function (arg)
        {
            return Object.prototype.toString.call (arg) === '[object Array]';
        };
    }

    // Include a string format function if one does not already exist.
    if (!String.format)
    {
        //noinspection JSPrimitiveTypeWrapperUsage
        /**
         * Takes a format string and one or more other strings, and does a replacement, returning a copy
         * of the newly formatted string.
         *
         * The format string can contain sequences like {0} or {1} or {n}, where that text (including the
         * braces) will get replaced with the argument at that location.
         *
         * Example: String.format ("Hello, {0}", "Terence"); returns the string "Hello, Terence".
         *
         * @param {String} format the format string
         * @returns {String} the string
         */
        String.format = function (format)
        {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number)
            {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }

    // Now the actual contents of the namespace.
    return {
        /**
         * Copy all properties that don't already exist from the source to the destination. This is meant
         * to be used in instances where you want to provide default values for properties that have not
         * already been defined.
         *
         * The destination object is returned, to allow for on the fly extension of object literals that
         * need to be captured into a variable.
         *
         * @alias nurdz.copyProperties
         * @param {Object} destination the object to receive copied properties
         * @param {Object} source the object to copy properties from
         * @returns {Object} the destination object passed in
         */
        copyProperties:       function (destination, source)
                              {
                                  for (var name in source)
                                  {
                                      if (source.hasOwnProperty (name) && destination[name] == null)
                                          destination[name] = source[name];
                                  }

                                  return destination;
                              },
        /**
         * Create or get a namespace table. The namespace is a name with dots separating the different parts.
         *
         * The result is a global variable that contains the appropriate tables. Any parts of previously
         * existing variables are left as is, so you can create 'boobs.jiggly' and 'boobs.round' and end up
         * with a single global named boobs with the two properties.
         *
         * As this takes care not to clobber over any existing tables, this can be used to not only create
         * a namespace, but also to obtain the table for a namespace that has already been created. This
         * API is in part due to how stupid WebStorm is about documentation, as I would rather have the
         * same function have two different names for clarity, but what can you do? Use better tools, I guess.
         *
         * This code was written by Michael Schwarz (as far as I know) and was taken from his blog at:
         *     http://weblogs.asp.net/mschwarz/archive/2005/08/26/423699.aspx
         *
         * @alias nurdz.createOrGetNamespace
         * @param {String} namespace the specification for the namespace to create (e.g. "nurdz.moduleName")
         * @returns {{}} the namespace table for the namespace spec (e.g. the "moduleName" table)
         */
        createOrGetNamespace: function (namespace)
                              {
                                  // Split the namespace apart into it's constituent parts, and then set up
                                  // the root of the namespace, which is the global window object (this is
                                  // the place where all global variables end up when JavaScript runs in the
                                  // browser.
                                  var nsParts = namespace.split (".");
                                  var root = /** @type {{}} */ window;

                                  // Loop over all of the parts of the requested namespace.
                                  for (var i = 0 ; i < nsParts.length ; i++)
                                  {
                                      // If the current part is not defined, then create it as a new object.
                                      if (typeof root[nsParts[i]] == "undefined")
                                          root[nsParts[i]] = {};

                                      // Now switch the root to be the current part of the next iteration.
                                      root = root[nsParts[i]];
                                  }

                                  return root;
                              },

        /**
         * In a browser non-specific way, watch to determine when the DOM is fully loaded and then invoke
         * the function that is provided.
         *
         * This code was written by Diego Perini (diego.perini at gmail.com) and was taken from the
         * following URL:
         *     http://javascript.nwbox.com/ContentLoaded/
         *
         * @alias nurdz.contentLoaded
         * @param {Window} win reference to the browser window object
         * @param {Function} fn the function to invoke when the DOM is ready.
         */
        contentLoaded: function (win, fn)
                       {
                           var done = false, top = true,

                               doc = win.document,
                               root = doc.documentElement,
                               modern = doc.addEventListener,

                               add = modern ? 'addEventListener' : 'attachEvent',
                               rem = modern ? 'removeEventListener' : 'detachEvent',
                               pre = modern ? '' : 'on',

                               init = function (e)
                               {
                                   if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                                   (e.type == 'load' ? win : doc)[rem] (pre + e.type, init, false);
                                   if (!done && (done = true)) fn.call (win, e.type || e);
                               },

                               poll = function ()
                               {
                                   try
                                   { root.doScroll ('left'); }
                                   catch (e)
                                   {
                                       setTimeout (poll, 50);
                                       return;
                                   }
                                   init ('poll');
                               };

                           if (doc.readyState == 'complete') fn.call (win, 'lazy');
                           else
                           {
                               if (!modern && root.doScroll)
                               {
                                   try
                                   { top = !win.frameElement; }
                                   catch (e)
                                   { }
                                   if (top) poll ();
                               }
                               doc[add] (pre + 'DOMContentLoaded', init, false);
                               doc[add] (pre + 'readystatechange', init, false);
                               win[add] (pre + 'load', init, false);
                           }
                       }
    }
} ());
