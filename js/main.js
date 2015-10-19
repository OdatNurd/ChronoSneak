(function ()
{
    "use strict";

    /**
     * The width of the stage, in pixels.
     *
     * @const
     * @type {number}
     */
    var STAGE_WIDTH = 800;

    /**
     * The height of the stage, in pixels.
     *
     * @const
     * @type {number}
     */
    var STAGE_HEIGHT = 600;


    /*1
     * contentloaded.js
     *
     * Author: Diego Perini (diego.perini at gmail.com)
     * Summary: cross-browser wrapper for DOMContentLoaded
     * Updated: 20101020
     * License: MIT
     * Version: 1.2
     *
     * URL:
     * http://javascript.nwbox.com/ContentLoaded/
     * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
     *
     */

    /**
     * Invokes the function provided once the DOM is fully ready to be processed.
     *
     * @param {Window} win reference to the browser window object
     * @param {Function} fn the function to invoke when the DOM is ready.
     */
    function contentLoaded (win, fn)
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

    contentLoaded (window, function ()
    {
        new Stage (STAGE_WIDTH, STAGE_HEIGHT, 'gameContent');
    });
} ());
