(function ()
{
    "use strict";

    /**
     * This sub-namespace contains all of the classes and objects to do with the game engine itself. There
     * should (hopefully) be nothing game specific in this namespace.
     *
     * @alias nurdz.game
     * @type {{}}
     */
    nurdz.createNamespace ("nurdz.game");

    /**
     * This sub-namespace contains definitions for key codes in key events, for use in input handling.
     */
    nurdz.game.keys =
    {
        /**
         * The left arrow key.
         *
         * @const
         * @type {Number}
         */
        KEY_LEFT: 37,

        /**
         * The up arrow key.
         *
         * @const
         * @type {Number}
         */
        KEY_UP: 38,

        /**
         * The right arrow key.
         *
         * @const
         * @type {Number}
         */
        KEY_RIGHT: 39,

        /**
         * The down arrow key.
         *
         * @const
         * @type {Number}
         */
        KEY_DOWN: 40
    };
} ());
