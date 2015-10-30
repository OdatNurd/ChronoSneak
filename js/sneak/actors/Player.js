/**
 * The actor that represents the player.
 *
 * @param {nurdz.game.Stage|null} stage the stage that will manage this entity or null if it is not known yet
 * @param {Number} x the initial X location for this player actor
 * @param {Number} y the initial Y location for this player actor
 * @constructor
 */
nurdz.sneak.Player = function (stage, x, y)
{
    "use strict";

    // Pull the size of tiles.
    var tileSize = nurdz.game.TILE_SIZE;

    // Call the super class constructor.
    nurdz.game.Entity.call (this, 'PlayerActor', stage, x, y, tileSize, tileSize, {id: "player"}, 10,
                            'green');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Player.prototype = Object.create (nurdz.game.Entity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Player
        }
    });

    /**
     * The size (in pixels) of border to apply on all edges of the cell that the player is in when
     * rendering it.
     *
     * @const
     * @type {number}
     */
    var MARGIN = 5;

    /**
     * Render this actor to the stage provided. We simply render a box using the debug color.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Player.prototype.render = function (stage)
    {
        stage.fillRect (this.position.x + MARGIN, this.position.y + MARGIN,
                        this.width - (2 * MARGIN), this.height - (2 * MARGIN),
                        this.debugColor);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Player.prototype.toString = function ()
    {
        return "[Player Actor: pos=" + this.position.toString () + "]";
    };
} ());
