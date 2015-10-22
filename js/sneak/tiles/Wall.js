/**
 * A Tile that represents a wall. Walls block movement.
 *
 * @constructor
 */
nurdz.sneak.WallTile = function ()
{
    "use strict";

    // Call the super class constructor.
    nurdz.sneak.Tile.call (this, "WALL", 2);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * The size of tiles, cached here for clarity.
     *
     * @type {Number}
     */
    var size = nurdz.sneak.constants.TILE_SIZE;

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.WallTile.prototype = Object.create (nurdz.sneak.Tile.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.WallTile
        }
    });

    /**
     * Query whether or not this tile blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.WallTile.prototype.blocksActorMovement = function ()
    {
        return true;
    };

    /**
     * Render this tile to the location provided.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     * @param {Number} x the X-coordinate to draw the tile at
     * @param {Number} y the Y-coordinate to draw the tile at
     */
    nurdz.sneak.WallTile.prototype.render = function (stage, x, y)
    {
        stage.colorRect (x, y, size, size, '5030ff');
    };
} ());
