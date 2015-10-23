/**
 * The base class that represents a Tile in the game. This encapsulates information as to what the textual
 * and numeric ID's for a tile are as well as the ability to render to a stage.
 *
 * @param {String} name the textual name of this tile
 * @param {Number} internalID the numeric ID that represents this tile
 * @constructor
 */
nurdz.game.Tile = function (name, internalID)
{
    "use strict";

    /**
     * The name of this tile
     *
     * @type {String}
     */
    this.name = name;

    /**
     * The internal tileID of this tile
     *
     * @type {Number}
     */
    this.tileID = internalID;

    /**
     * The size of tiles, cached here for clarity.
     *
     * @type {Number}
     */
    this.size = nurdz.sneak.constants.TILE_SIZE;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";


    /**
     * Query whether or not this tile blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.game.Tile.prototype.blocksActorMovement = function ()
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
    nurdz.game.Tile.prototype.render = function (stage, x, y)
    {
        stage.colorRect (x, y, this.size, this.size, 'yellow');
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Tile.prototype.toString = function ()
    {
        return "[Tile " + this.name + " id=" + this.tileID + "]";
    };
} ());
