/**
 * This sub-namespace contains everything specific to ChronoSneak.
 *
 * @alias nurdz.sneak
 * @type {{}}
 */
nurdz.createNamespace ("nurdz.sneak");

/**
 * The global constant values that control ChronoSneak.
 * @type {Object<String, *>}
 */
nurdz.sneak.constants = (function ()
{
    // Used to set the values below, so we can do some math on them.
    var width = 800;
    var height = 600;
    var tileSize = 32;

    return {
        /**
         * The width of the stage, in pixels.
         *
         * @const
         * @type {Number}
         */
        STAGE_WIDTH: width,

        /**
         * The height of the stage, in pixels.
         *
         * @const
         * @type {Number}
         */
        STAGE_HEIGHT: height,

        /**
         * The size of tiles and sprites in the game, in pixels.
         *
         * @const
         * @type {Number}
         */
        TILE_SIZE: tileSize,

        /**
         * The width of the viewport, in tiles.
         *
         * @const
         * @type {Number}
         */
        VIEW_WIDTH: Math.floor (width / tileSize),

        /**
         * The height of the viewport, in tiles.
         *
         * @const
         * @type {Number}
         */
        VIEW_HEIGHT: Math.floor (height / tileSize),

        /**
         * The title page scene in the game.
         *
         * @const
         * @type {String}
         */
        SCENE_TITLE: "title"
    };
} ());
