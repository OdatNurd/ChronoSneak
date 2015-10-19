/**
 * This namespace contains all of the global nurdz objections, functions, classes and other sub-namespaces.
 *
 * @type {{}}
 */
var nurdz = (function ()
{
    "use strict";

    return {
        /**
         * Create a namespace. The namespace is a name with dots separating the different parts.
         *
         * The result is a global variable that contains the appropriate tables. Any parts of previously
         * existing variables are left as is, so you can create 'boobs.jiggly' and 'boobs.round' and end up
         * with a single global named boobs with the two properties.
         *
         * This code was written by Michael Schwarz (as far as I know) and was taken from his blog at:
         *     http://weblogs.asp.net/mschwarz/archive/2005/08/26/423699.aspx
         *
         * @alias nurdz.createNamespace
         * @param {String} namespace the specification for the namespace to create (e.g. "nurdz.moduleName")
         */
        createNamespace: function (namespace)
                         {
                             // Split the namespace apart into it's constituent parts, and then set up the
                             // root of the namespace, which is the global window object (this is the place
                             // where all global variables end up when JavaScript runs in the browser.
                             var nsParts = namespace.split (".");
                             var root = window;

                             // Loop over all of the parts of the requested namespace.
                             for (var i = 0; i < nsParts.length; i++)
                             {
                                 // If the current part is not defined, then create it as a new object.
                                 if (typeof root[nsParts[i]] == "undefined")
                                     root[nsParts[i]] = {};

                                 // Now switch the root to be the current part of the next iteration.
                                 root = root[nsParts[i]];
                             }
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
