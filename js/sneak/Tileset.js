/**
 * This class represents a Tileset, which is jsut an array of 1 or more tiles that will be used to render
 * the level data.
 *
 * @param {String} name the name of this tileset
 * @param {Tile[]} tiles the array of tiles that are contained in this set
 * @constructor
 */
nurdz.sneak.Tileset = function (name, tiles)
{
    "use strict";

    /**
     * The name of this tile set.
     *
     * @type {String}
     */
    this.name = name;

    /**
     * The number of tiles this tileset contains.
     * @type {Number}
     */
    this.length = tiles.length;

    /**
     * The tiles in this tile set, keyed according to their names.
     * @type {Object.<String, Tile>}
     */
    this.tilesByName = {};

    /**
     * The tiles in this tile set, keyed by their internal numeric tile ID's.
     *
     * @type {nurdz.sneak.Tile[]}
     */
    this.tilesByValue = [];

    // Iterate the array of tiles passed in and insert them into our two arrays.
    for (var i = 0 ; i < tiles.length ; i++)
    {
        var thisTile = tiles[i];
        this.tilesByName[thisTile.name] = thisTile;
        this.tilesByValue[thisTile.tileID] = thisTile;
    }
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * Given a tileID, return true if this tileset contains that tile or false if it does not.
     *
     * @param {Number} tileID the tileID to check.
     * @returns {boolean} true if the tileID given corresponds to a valid tile, false otherwise
     */
    nurdz.sneak.Tileset.prototype.isValidTileID = function (tileID)
    {
        return this.tilesByValue[tileID] != null;
    };

    /**
     * Given a tile name, return back the tile object that represents this tile. The value will be null if
     * the tile name provided is not recognized.
     *
     * @param {String} name the name of the tileID to search for
     * @returns {Tile|null} the tile with the provided name, or null if the name is invalid.
     */
    nurdz.sneak.Tileset.prototype.tileForName = function (name)
    {
        return this.tilesByName[name];
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Tileset.prototype.toString = function ()
    {
        return "[Tileset " + this.name + " tileCount=" + this.length + "]";
    };
} ());
