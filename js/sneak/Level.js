/**
 * This sub-namespace contains all of the JSON objects that are built in levels in the ChronoSneak web
 * prototype.
 *
 * @alias nurdz.sneak.levels
 * @type {{}}
 */
nurdz.createNamespace ("nurdz.sneak.levels");

/**
 * This represents the different tiles that are allowed to appear in level maps.
 *
 * @enum {Number}
 */
nurdz.sneak.tiles = (function ()
{
    // The actual definition of tiles that exist and that we know about.
    var tilesByName =
    {
        FLOOR:        0,
        PLAYER_START: 1,
        WALL:         2
    };

    // Convert the object above into an array in which the array elements are the tile ID's and the values
    // are the names of those tiles. This allows us to easily check for valid tile values and also to look
    // up names.
    var tilesByValue = [];
    for (var tileName in tilesByName)
    {
        if (tilesByName.hasOwnProperty (tileName))
            tilesByValue[tilesByName[tileName]] = tileName;
    }

    /**
     * Given a tile ID, returns true if that tile is one of the known tile constants, or false otherwise.
     *
     * @param {Number} tileID the tileID to check.
     * @returns {boolean} true if the tileID given corresponds to a valid tile, false otherwise
     */
    tilesByName.isValidTileID = function (tileID)
    {
        return tilesByValue[tileID] != null;
    };

    /**
     * Given a tileID, return the textual name for that tile, if one exists.
     *
     * @param {Number} tileID the tileID to get the name of
     * @returns {String|null} the string name of that tileID, or null if there is no such tileID
     */
    tilesByName.tileName = function (tileID)
    {
        if (tilesByValue[tileID])
            return tilesByValue[tileID];
        return null;
    };

    return tilesByName;
} ());

/**
 * Objects of this type represent actual levels in the game.
 *
 * Various simple checks are done to ensure that the level data provided is actually valid.
 *
 * @param {String} name the name of this level
 * @param {Number} width width of the level, in tiles
 * @param {Number} height height of the level, in tiles
 * @param {Number[]} levelData the actual data that represents the level
 * @constructor
 */
nurdz.sneak.LevelData = function (name, width, height, levelData)
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

    // Make sure that the level data is a valid length.
    if (this.levelData.length != width * height)
        throw new Error ("Level data '" + this.name + "' has an incorrect length given its dimensions");

    // For now, there is no scrolling of levels, so it is important that the dimensions be the same as the
    // constant for the viewport.
    if (this.width != nurdz.sneak.constants.VIEW_WIDTH || this.height != nurdz.sneak.constants.VIEW_HEIGHT)
        throw new Error ("Scrolling is not implemented; level '" + this.name + "'must be the same size as" +
                         " the viewport");

    // Iterate over the tile data now. When we find a player start, store the location in X,Y values as
    // coordinates relative to the level data.
    //
    // If we find a player start position after we already have one, that's an error. Additionally, if we
    // find a tile with an unknown ID, we also complain.
    for (var y = 0; y < this.height; y++)
    {
        for (var x = 0; x < this.width; x++)
        {
            // Get the tile; yak if this is not a known tile ID.
            var tileID = this.levelData[y * this.width + x];
            if (nurdz.sneak.tiles.isValidTileID (tileID) == false)
                throw new Error ("Invalid tileID '" + tileID + "' found at [" + x + "," + y + "] in level" +
                                 this.name);

            // Is this a player start?
            if (tileID == nurdz.sneak.tiles.PLAYER_START)
            {
                // If we already have a player start, we're mad.
                if (this.playerStartPos != null)
                    throw new Error ("Duplicate PlayerStart found in level '" + this.name + "' at pos [" +
                                     x + ", " + y + "]; first found at [" +
                                     this.playerStartPos.x + ", " + this.playerStartPos.y + "]");

                // Create the player start position.
                this.playerStartPos = new nurdz.game.Point (x, y);
            }
        }
    }

    // If there is no player start position, this level is invalid.
    if (this.playerStartPos == null)
        throw new Error ("No player start position found in level '" + this.name + "'");
};

/**
 * This class represents a single level in the game. It takes an instance of level data to know what to
 * do, and then will render the map and allow queries based on what the level data says.
 *
 * @type {nurdz.sneak.LevelData} levelData the data to display initially
 * @constructor
 */
nurdz.sneak.Level = function (levelData)
{
    "use strict";

    /**
     * The width of the level we represent.
     *
     * @type {Number}
     */
    this.width = levelData.width;

    /**
     * The height of the level we represent.
     *
     * @type {Number}
     */
    this.height = levelData.height;

    /**
     * The level data that we are rendering.
     *
     * @type {Number[]}
     */
    this.levelData = levelData.levelData;

    /**
     * The start position of the player in the level that is currently loaded.
     *
     * @type {nurdz.game.Point}
     */
    this.playerStartPos = levelData.playerStartPos;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * Given coordinates in the map, return back the tileID of the tile at that location. As a safety
     * fallback, when the location is outside the bounds of the map, the wall tile is returned.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {Number} the tileID of the tile at the provided location
     */
    nurdz.sneak.Level.prototype.tileAt = function (x, y)
    {
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return nurdz.sneak.tiles.WALL;

        return this.levelData[y * this.width + x];
    };

    /**
     * Given coordinates in the map, return back a boolean that indicates if that space is blocked or not
     * as far as movement is concerned.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {Boolean} true if the level location is blocked and cannot be moved to, or false otherwise.
     */
    nurdz.sneak.Level.prototype.isBlockedAt = function (x, y)
    {
        // Get the tile; it's blocked if it is a wall.
        var tileID = this.tileAt (x, y);
        return tileID == nurdz.sneak.tiles.WALL;
    };

    /**
     * Render this level to the stage provided.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Level.prototype.render = function (stage)
    {
        var tileSize = nurdz.sneak.constants.TILE_SIZE;

        // Iterate over the tiles.
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                // Get the tile; yak if this is not a known tile ID, then render it.
                var tileID = this.tileAt (x, y);
                switch (tileID)
                {
                    // Display walls as purple squares.
                    case nurdz.sneak.tiles.WALL:
                        stage.colorRect (x * tileSize, y * tileSize, tileSize, tileSize, 'magenta');
                        break;
                }
            }
        }
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Level.prototype.toString = function ()
    {
        return "[Level " + this.levelData.width + "x" + this.levelData.height + "]";
    };
} ());
