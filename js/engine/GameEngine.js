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
     * @type {Object.<String, Number>}
     */
    nurdz.game.keys =
    {
        /**
         * The spacebar.
         *
         * @const
         * @type {Number}
         */
        KEY_SPACEBAR: 32,

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
        KEY_DOWN: 40,

        /**
         * The A key
         *
         * @const
         * @type {Number}
         */
        KEY_A: 65,

        /**
         * The B key
         *
         * @const
         * @type {Number}
         */
        KEY_B: 66,

        /**
         * The C key
         *
         * @const
         * @type {Number}
         */
        KEY_C: 67,

        /**
         * The D key
         *
         * @const
         * @type {Number}
         */
        KEY_D: 68,

        /**
         * The E key
         *
         * @const
         * @type {Number}
         */
        KEY_E: 69,

        /**
         * The F key
         *
         * @const
         * @type {Number}
         */
        KEY_F: 70,

        /**
         * The G key
         *
         * @const
         * @type {Number}
         */
        KEY_G: 71,

        /**
         * The H key
         *
         * @const
         * @type {Number}
         */
        KEY_H: 72,

        /**
         * The I key
         *
         * @const
         * @type {Number}
         */
        KEY_I: 73,

        /**
         * The J key
         *
         * @const
         * @type {Number}
         */
        KEY_J: 74,

        /**
         * The K key
         *
         * @const
         * @type {Number}
         */
        KEY_K: 75,

        /**
         * The L key
         *
         * @const
         * @type {Number}
         */
        KEY_L: 76,

        /**
         * The M key
         *
         * @const
         * @type {Number}
         */
        KEY_M: 77,

        /**
         * The N key
         *
         * @const
         * @type {Number}
         */
        KEY_N: 78,

        /**
         * The O key
         *
         * @const
         * @type {Number}
         */
        KEY_O: 79,

        /**
         * The P key
         *
         * @const
         * @type {Number}
         */
        KEY_P: 80,

        /**
         * The Q key
         *
         * @const
         * @type {Number}
         */
        KEY_Q: 81,

        /**
         * The R key
         *
         * @const
         * @type {Number}
         */
        KEY_R: 82,

        /**
         * The S key
         *
         * @const
         * @type {Number}
         */
        KEY_S: 83,

        /**
         * The T key
         *
         * @const
         * @type {Number}
         */
        KEY_T: 84,

        /**
         * The U key
         *
         * @const
         * @type {Number}
         */
        KEY_U: 85,

        /**
         * The V key
         *
         * @const
         * @type {Number}
         */
        KEY_V: 86,

        /**
         * The W key
         *
         * @const
         * @type {Number}
         */
        KEY_W: 87,

        /**
         * The X key
         *
         * @const
         * @type {Number}
         */
        KEY_X: 88,

        /**
         * The Y key
         *
         * @const
         * @type {Number}
         */
        KEY_Y: 89,

        /**
         * The Z key
         *
         * @const
         * @type {Number}
         */
        KEY_Z: 90
    };
} ());
