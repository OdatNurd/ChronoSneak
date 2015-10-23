/**
 * Objects of this type represent actual levels in a game. Level data is just a series of integer tile
 * ID's that associate with a Tileset that has been provided.
 *
 * Various simple checks are done to ensure that the level data provided is actually valid.
 *
 * @param {String} name the name of this level
 * @param {Number} width width of the level, in tiles
 * @param {Number} height height of the level, in tiles
 * @param {Number[]} levelData the actual data that represents the level
 * @param {nurdz.game.Entity[]} entityList the list of entities contained in the map (may be 0).
 * @param {nurdz.game.Tileset} tileset the tileset that this level is using
 * @throws {Error} if the level data is not valid
 * @constructor
 */
nurdz.game.LevelData = function (name, width, height, levelData, entityList, tileset)
{
    "use strict";

    /**
     * The name of this level.
     *
     * @const
     * @type {String}
     */
    this.name = name;

    /**
     * The width of this map, in tiles.
     *
     * @const
     * @type {Number}
     */
    this.width = width;

    /**
     * The height of this map, in tiles.
     *
     * @const
     * @type {Number}
     */
    this.height = height;

    /**
     * The actual level data for this particular level. This is an array of numbers that are interpreted
     * as tiles.
     *
     * @const
     * @type {Number[]}
     */
    this.levelData = levelData;

    /**
     * The list of all entities that are associated with this particular level data.
     *
     * @type {nurdz.game.Entity[]}
     */
    this.entities = entityList;

    /**
     * The tileset that is associated with this level data.
     *
     * @type {nurdz.sneak.Tileset}
     */
    this.tileset = tileset;

    // Attempt to validate the data now. This will throw an error if the data is invalid.
    this.validateData ();
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Handle a load error if the data is found to be invalid.
    var error = function (message)
    {
        throw new Error (message);
    };

    /**
     * This method does a thing.
     */
    nurdz.game.LevelData.prototype.validateData = function ()
    {
        // Ensure that the length of the level data agrees with the dimensions that we were given, to make
        // sure we didn't get sorted.
        if (this.levelData.length != this.width * this.height)
            error ("Level data '" + this.name + "' has an incorrect length given its dimensions");

        // For now, there is no scrolling of levels, so it is important that the dimensions be the same as the
        // constant for the viewport.
        if (this.width != nurdz.sneak.constants.VIEW_WIDTH || this.height != nurdz.sneak.constants.VIEW_HEIGHT)
            error ("Scrolling is not implemented; level '" + this.name + "'must be the same size as the viewport");

        // Iterate over the tile data now. When we find a player start, store the location in X,Y values as
        // coordinates relative to the level data.
        //
        // If we find a player start position after we already have one, that's an error. Additionally, if we
        // find a tile with an unknown ID, we also complain.
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                // Pull a tileID out of the level data, and validate that the tileset knows what it is.
                var tileID = this.levelData[y * this.width + x];
                if (this.tileset.isValidTileID(tileID) == false)
                    error ("Invalid tileID '" + tileID + "' found at [" + x + "," + y + "] in level" + this.name);
            }
        }
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.LevelData.prototype.toString = function ()
    {
        return "[LevelData tileset=" + this.tileset.name + " size=" + this.width + "x" + this.height + "]";
    };
} ());
