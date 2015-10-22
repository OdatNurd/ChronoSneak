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
     * The tileset that is associated with this level.
     *
     * @type {nurdz.sneak.Tileset}
     */
    this.tileset = levelData.tileset;

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
     * Given coordinates in the map, return back the tile at that location. This will be represented as
     * null if the coordinates are not valid.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {nurdz.sneak.Tile|null} the tile at the provided location or null if the location is invalid
     */
    nurdz.sneak.Level.prototype.tileAt = function (x, y)
    {
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return null;

        // This is safe because the level data validates that all of the tiles in its data are also
        // represented in its tileset.
        return this.tileset.tilesByValue[this.levelData[y * this.width + x]];
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
        var tile = this.tileAt (x, y);
        if (tile == null)
            return true;
        return tile.blocksActorMovement ();
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
                var tile = this.tileAt (x, y);

                // Get the tile and render it.
                if (tile != null)
                    tile.render (stage, x * tileSize, y * tileSize);
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
