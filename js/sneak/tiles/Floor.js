/**
 * A Tile that represents the floor. Floors do not block movement.
 *
 * @constructor
 */
nurdz.sneak.FloorTile = function ()
{
    "use strict";

    // Call the super class constructor.
    nurdz.game.Tile.call (this, "FLOOR", 0, '#b0b0c0');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.FloorTile.prototype = Object.create (nurdz.game.Tile.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.FloorTile
        }
    });

    /**
     * Query whether or not this tile blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.FloorTile.prototype.blocksActorMovement = function ()
    {
        return false;
    };

    /**
     * Render this tile to the location provided.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     * @param {Number} x the X-coordinate to draw the tile at
     * @param {Number} y the Y-coordinate to draw the tile at
     */
    nurdz.sneak.FloorTile.prototype.render = function (stage, x, y)
    {
        // Let the base class render, then do a bit of a fill.
        nurdz.game.Tile.prototype.render.call (this, stage, x, y);
        stage.fillRect (x + 1, y + 1, this.size - 2, this.size - 2, '#c8c8c8');
    };
} ());
