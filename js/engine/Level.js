/**
 * This class represents a single level in the game. It takes an instance of level data to know what to
 * do, and then will render the map and allow queries based on what the level data says.
 *
 * A stage object can optionally be passed in. If this is done, all of the entities in the level data
 * provided will have that stage set as their stage object if they don't have a stage object set.
 *
 * This allows for entities that are carried with the map data to be constructed and stored prior to level
 * being loaded and yet still have the stage.
 *
 * @param {nurdz.game.LevelData} levelData the data to display initially
 * @param {nurdz.game.Stage|null} stage the stage that owns the level
 * @constructor
 */
nurdz.game.Level = function (levelData, stage)
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
     * The list of entities that are in this level data, in the order they appeared in the level data.
     *
     * @type {nurdz.game.Entity[]}
     */
    this.entities = levelData.entities;

    /**
     * The list of entities that are in this level data, keyed by their ID values for faster lookup.
     * @type {Object.<String,nurdz.game.Entity>}
     */
    this.entitiesByID = {};

    /**
     * The tileset that is associated with this level.
     *
     * @type {nurdz.game.Tileset}
     */
    this.tileset = levelData.tileset;

    // Iterate over all entities. For each one, insert it into the entitiesByID table, and then set in the
    // current stage.
    for (var i = 0; i < this.entities.length; i++)
    {
        // Give the entity the stage.
        var entity = this.entities[i];
        entity.stage = stage;

        // If there is an ID property (there should be), use it to cross reference the entity.
        if (entity.properties.id)
            this.entitiesByID[entity.properties.id] = entity;
    }
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
        for (var i = 0; i < this.entities.length; i++)
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
        for (var i = 0; i < this.entities.length; i++)
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
     * Scan over all entities in the level and return back a list of all entities with the id or ids
     * given, which may be an empty array.
     *
     * The parameter may be a string representing a single entity ID or it may be an array of such IDs.
     *
     * NOTE: No care is taken to not include duplicate entities if the entity list provided contains the
     * same entity ID more than once. It's also not an error if no such entity exists, although a warning
     * will be generated to the console in this case.
     *
     * @param {String[]|String} idSpec the id or ids of entities to find
     * @returns {nurdz.game.Entity[]} list of matching entities (may be an empty array)
     */
    nurdz.game.Level.prototype.entitiesWithIDs = function (idSpec)
    {
        var retVal = [];

        // If the spec given is a string, turn it into an array of itself.
        if (typeof (idSpec) == "string")
            idSpec = [idSpec];

        for (var i = 0 ; i < idSpec.length ; i++)
        {
            var entity = this.entitiesByID[idSpec[i]];
            if (entity)
                retVal.push (entity);
        }

        // This is just for debugging. We should get exactly as many things as were asked for. Less means
        // IDs were given that do not exist, more means that some objects have duplicate ID values, which
        // is also bad.
        if (retVal.length != idSpec.length)
            console.log ("Warning: entitiesWithIDs entity count mismatch. Broken level?");

        return retVal;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Find all entities that match the id spec passed in (see entitiesWithIDs) and then, for each such
     * entity found, fire their trigger method using the provided activator as the source of the trigger.
     *
     * As a convenience, if the idSpec provided is null, nothing happens. This allows for entities to use
     * this method without having to first verify that they actually have a trigger.
     *
     * @param {String[]|String|null} idSpec the id or ids of entities to find or null too do nothing
     * @param {nurdz.game.Actor|null} activator the actor that is activating the entities, or null
     */
    nurdz.game.Level.prototype.triggerEntitiesWithIDs = function (idSpec, activator)
    {
        // If there is not an idSpec, do nothing.
        if (idSpec == null)
            return;

        // Get the list of entities that match the idSpec provided and trigger them all.
        var entities = this.entitiesWithIDs (idSpec);
        for (var i = 0; i < entities.length; i++)
            entities[i].trigger (activator);
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
        if (tile.blocksActorMovement ())
            return true;

        // Get the list of entities that are at this location on the map. If there are any and any of them
        // blocks actor movement, the move is blocked.
        var entities = this.entitiesAt (x, y);
        if (entities != null)
        {
            for (var i = 0; i < entities.length; i++)
            {
                if (entities[i].blocksActorMovement ())
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
