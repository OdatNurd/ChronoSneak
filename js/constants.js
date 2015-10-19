/**
 * This sub-namespace contains everything specific to ChronoSneak.
 *
 * @alias nurdz.sneak
 * @type {{}}
 */
nurdz.createNamespace ("nurdz.sneak");

/**
 * The global constant values that control ChronoSneak.
 *
 * @type {{}}
 */
nurdz.sneak.constants = (function ()
{
    return {
        /**
         * The width of the stage, in pixels.
         *
         * @const
         * @type {Number}
         */
        STAGE_WIDTH: 800,

        /**
         * The height of the stage, in pixels.
         *
         * @const
         * @type {Number}
         */
        STAGE_HEIGHT: 600,

        /**
         * The title page scene in the game.
         *
         * @const
         * @type {String}
         */
        SCENE_TITLE: "title"
    }
} ());
