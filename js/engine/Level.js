/**
 * This class represents a single level in the game. It takes an instance of level data to know what to
 * do, and then will render the map and allow queries based on what the level data says.
 *
 * @type {nurdz.game.LevelData} levelData the data to display initially
 * @constructor
 */
nurdz.game.Level = function (levelData)
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
     * The list of entities that are in this level data.
     *
     * @type {nurdz.game.Entity[]}
     */
    this.entities = levelData.entities;

    /**
     * The tileset that is associated with this level.
     *
     * @type {nurdz.game.Tileset}
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
     * Given the name of an entity type, return back a list of all such entities that this level data
     * contains. There could be 0 or more such entities.
     *
     * @param {String} entityName the entity name to search for
     * @returns {nurdz.game.Entity[]}
     */
    nurdz.game.Level.prototype.entitiesWithName = function (entityName)
    {
        // The return value.
        var retVal = [];
        for (var i = 0; i < this.entities.length; i++)
        {
            var entity = this.entities[i];
            if (entity.name == entityName)
                retVal.push (entity);
        }

        return retVal;
    };

    /**
     * This method will invoke the step method on all entities that currently exist on the map. In
     * ChronoSneak, this gets invoked every time we move the player, so that all entities can get a logic
     * step whenever the player takes an action.
     */
    nurdz.game.Level.prototype.stepAllEntities = function ()
    {
        for (var i = 0 ; i < this.entities.length ; i++)
            this.entities[i].step ();
    };

    /**
     * Given coordinates in the map, return back the tile at that location. This will be represented as
     * null if the coordinates are not valid.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {nurdz.game.Tile|null} the tile at the provided location or null if the location is invalid
     */
    nurdz.game.Level.prototype.tileAt = function (x, y)
    {
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return null;

        // This is safe because the level data validates that all of the tiles in its data are also
        // represented in its tileset.
        return this.tileset.tilesByValue[this.levelData[y * this.width + x]];
    };

    /**
     * Given coordinates in the map, return back a list of all entities that exist at this location, which
     * may be 0.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {nurdz.game.Entity[]|null} the entities at the provided location or null if the location is
     * invalid
     */
    nurdz.game.Level.prototype.entitiesAt = function (x, y)
    {
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return null;

        // Now that we know the coordinates are valid map coordinates, multiply them by the tile size to
        // get the pixel locations. The coordinates given are in map coordinates but entities live in
        // screen space.
        x *= nurdz.sneak.constants.TILE_SIZE;
        y *= nurdz.sneak.constants.TILE_SIZE;

        // Iterate over all entities to see if they are at the map location provided.
        var retVal = [];
        for (var i = 0 ; i < this.entities.length ; i++)
        {
            // Get the entity.
            var entity = this.entities[i];

            // If the location matches, add it to the array.
            if (entity.position.x == x && entity.position.y == y)
                retVal.push (entity);
        }

        return retVal;
    };

    /**
     * Given coordinates in the map, return back a boolean that indicates if that space is blocked or not
     * as far as movement is concerned.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {Boolean} true if the level location is blocked and cannot be moved to, or false otherwise.
     */
    nurdz.game.Level.prototype.isBlockedAt = function (x, y)
    {
        // Get the tile; it's blocked if it is a wall.
        var tile = this.tileAt (x, y);
        if (tile == null)
            return true;

        // If the tile at this location blocks actor movement, then the move is blocked.
        if (tile.blocksActorMovement())
            return true;

        // Get the list of entities that are at this location on the map. If there are any and any of them
        // blocks actor movement, the move is blocked.
        var entities = this.entitiesAt (x, y);
        if (entities != null)
        {
            for (var i = 0 ; i < entities.length ; i++)
            {
                if (entities[i].blocksActorMovement())
                    return true;
            }
        }

        // Not blocked.
        return false;
    };

    /**
     * Render this level to the stage provided.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.game.Level.prototype.render = function (stage)
    {
        // Iterate over the tiles.
        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                var tile = this.tileAt (x, y);

                // Get the tile and render it.
                if (tile != null)
                    tile.render (stage, x * tile.size, y * tile.size);
            }
        }
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Level.prototype.toString = function ()
    {
        return "[Level " + this.levelData.width + "x" + this.levelData.height + "]";
    };
} ());
