/**
 * This sub-namespace contains everything specific to ChronoSneak.
 *
 * @alias nurdz.sneak
 * @type {{}}
 */
nurdz.createOrGetNamespace ("nurdz.sneak");

/**
 * The global constant values that control ChronoSneak.
 * @type {Object<String, *>}
 */
nurdz.sneak.constants = (function ()
{
    return {
        /**
         * The game scene in the game. This is where the game is actually played.
         *
         * @const
         * @type {String}
         */
        SCENE_GAME: "game"
    };
} ());

/**
 * This sub-namespace contains all of the JSON objects that are built in levels in the ChronoSneak web
 * prototype.
 *
 * @alias nurdz.sneak.levels
 * @type {Object.<String,nurdz.game.Level>}
 */
nurdz.createOrGetNamespace ("nurdz.sneak.levels");
