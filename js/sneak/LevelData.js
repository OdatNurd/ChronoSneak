/**
 * This sub-namespace contains all of the JSON objects that are built in levels in the ChronoSneak web
 * prototype.
 *
 * @alias nurdz.sneak.levels
 * @type {Object.<String,nurdz.sneak.Level>}
 */
nurdz.createNamespace ("nurdz.sneak.levels");

/**
 * Objects of this type represent actual levels in the game.
 *
 * Various simple checks are done to ensure that the level data provided is actually valid.
 *
 * @param {String} name the name of this level
 * @param {Number} width width of the level, in tiles
 * @param {Number} height height of the level, in tiles
 * @param {Number[]} levelData the actual data that represents the level
 * @param {nurdz.sneak.Tileset} tileset the tileset that this level is using
 * @throws {Error} if the level data is not valid
 * @constructor
 */
nurdz.sneak.LevelData = function (name, width, height, levelData, tileset)
{
    "use strict";

    /**
     * The coordinate in the level data that the player start position was found at; this is null if no
     * player start location was found.
     *
     * @type {nurdz.game.Point}
     */
    this.playerStartPos = null;

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
    nurdz.sneak.LevelData.prototype.validateData = function ()
    {
        // Ask the tileset for the tile that is the player start; If this is not found, that's bad.
        var startTile = this.tileset.tileForName ("PLAYER_START");
        if (startTile == null)
            error ("Level data '" + this.name + "'; unable to determine start tile: tileset invalid");

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

                // Is this a player start?
                if (tileID == startTile.tileID)
                {
                    // If we already have a player start, we're mad.
                    if (this.playerStartPos != null)
                        error ("Duplicate PlayerStart found in level '" + this.name + "' at pos [" +
                               x + ", " + y + "]; first found at [" +
                               this.playerStartPos.x + ", " + this.playerStartPos.y + "]");

                    // Create the player start position.
                    this.playerStartPos = new nurdz.game.Point (x, y);
                }
            }
        }

        // If there is no player start position, this level is invalid.
        if (this.playerStartPos == null)
            error ("No player start position found in level '" + this.name + "'");
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.LevelData.prototype.toString = function ()
    {
        return "[LevelData tileset=" + this.tileset.name + " size=" + this.width + "x" + this.height + "]";
    };
} ());
