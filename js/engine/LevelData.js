/**
 * This class represents raw map and entity data that represents the level in a game.
 *
 * The map data is just a series of integer tile ID values that associate with the tile set that has been
 * provided. The data also contains a list of entities that are attached to the map.
 *
 * Various simple checks are done to ensure that the level data provided is actually valid.
 *
 * @param {nurdz.game.Stage} stage the stage that will own the data
 * @param {String} name the name of this level
 * @param {Number} width width of the level, in tiles
 * @param {Number} height height of the level, in tiles
 * @param {Number[]} levelData the actual data that represents the level
 * @param {nurdz.game.Entity[]} entityList the list of entities contained in the map (may be 0).
 * @param {nurdz.game.Tileset} tileset the tileset that this level is using
 * @throws {Error} if the level data is not valid
 * @constructor
 */
nurdz.game.LevelData = function (stage, name, width, height, levelData, entityList, tileset)
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
     * This is a representation of the entities from the entity list, keyed by their ID values so that
     * they can be looked up at runtime by id.
     *
     * @type {Object.<String,nurdz.game.Entity>}
     */
    this.entitiesByID = {};

    /**
     * The tileset that is associated with this level data.
     *
     * @type {nurdz.game.Tileset}
     */
    this.tileset = tileset;

    // Iterate over all entities. For each one, insert it into the entitiesByID table, and then set in the
    // current stage.
    for (var i = 0 ; i < this.entities.length ; i++)
    {
        // Get the entity and it's ID property. If there is no ID property, generate an error.
        var entity = this.entities[i];
        var entityID = entity.properties.id;

        if (entityID == null)
            throw new Error ("LevelData passed an entity with no 'id' property");

        // Give the entity the stage
        if (entity.stage == null)
            throw new Error ("LevelData passed an entity that has no stage, id=" + entityID);

        // Now store this entity in the lookup table; generate a warning if such an ID already exists, as
        // it will clobber.
        if (this.entitiesByID[entityID])
            console.log ("LevelData has an entity with a duplicate 'id' property: " + entityID);

        this.entitiesByID[entityID] = entity;
    }

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
        if (this.width != nurdz.game.STAGE_TILE_WIDTH || this.height != nurdz.game.STAGE_TILE_HEIGHT)
            error ("Scrolling is not implemented; level '" + this.name + "'must be the same size as the viewport");

        // Validate that all tiles are valid.
        for (var y = 0 ; y < this.height ; y++)
        {
            for (var x = 0 ; x < this.width ; x++)
            {
                // Pull a tileID out of the level data, and validate that the tileset knows what it is.
                var tileID = this.levelData[y * this.width + x];
                if (this.tileset.isValidTileID(tileID) == false)
                    error (
                        "Invalid tileID '" + tileID + "' found at [" + x + "," + y + "] in level" + this.name);
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
        return String.format ("[LevelData size={0}x{1} tileset={2}]",
                              this.width, this.height,
                              this.tileset.toString());
    };
} ());
