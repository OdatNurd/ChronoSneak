/**
 * A Tile that represents a wall. Walls block movement.
 *
 * @constructor
 */
nurdz.sneak.WallTile = function ()
{
    "use strict";

    // Call the super class constructor.
    nurdz.game.Tile.call (this, "WALL", 2, '#5030ff');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.WallTile.prototype = Object.create (nurdz.game.Tile.prototype, {
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
} ());
