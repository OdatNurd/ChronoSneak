/**
 * The base class that represents a Tile in the game. This encapsulates information as to what the textual
 * and numeric ID's for a tile are as well as the ability to render to a stage.
 *
 * @param {String} name the textual name of this tile
 * @param {Number} internalID the numeric ID that represents this tile
 * @param {String} [debugColor='yellow'] the color to render the tile as for debugging
 * @constructor
 */
nurdz.game.Tile = function (name, internalID, debugColor)
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
     * The color that the base class uses to render this tile if it is not overridden.
     *
     * @type {String}
     */
    this.debugColor = debugColor || 'yellow';

    /**
     * The size of tiles, cached here for clarity.
     *
     * @type {Number}
     */
    this.size = nurdz.game.TILE_SIZE;
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
        stage.fillRect (x, y, this.size, this.size, this.debugColor);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Tile.prototype.toString = function ()
    {
        return String.format ("[Tile name='{0}' id={1}]", this.name, this.tileID);
    };
} ());
