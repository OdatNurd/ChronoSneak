/**
 * This class represents the idea of a level in the game as based on a tile map. It takes an instance of
 * level data, which tells it the layout of the level, which includes all entities and tiles used. An API
 * is provided which renders the map and allows for queries to be made as to the contents of the map
 * itself, such as finding all entities with a particular name or at a particular location.
 *
 * @param {nurdz.game.Stage} stage the stage that owns the level
 * @param {nurdz.game.LevelData} levelData the data to display initially
 * @constructor
 */
nurdz.game.Level = function (stage, levelData)
{
    "use strict";

    /**
     * The stage that owns this level.
     *
     * @type {nurdz.game.Stage}
     */
    this.stage = stage;

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
     *
     * @type {Object.<String,nurdz.game.Entity>}
     */
    this.entitiesByID = levelData.entitiesByID;

    /**
     * The tileset that is associated with this level.
     *
     * @type {nurdz.game.Tileset}
     */
    this.tileset = levelData.tileset;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    //noinspection JSUnusedGlobalSymbols
    /**
     * Given an entity type, return back a list of all entities of that type that the level data contains.
     * There could be 0 or more such entries.
     *
     * @param {Function} type the entity type to search for
     * @returns {nurdz.game.Entity[]} an array of entities of this type, which might be empty
     */
    nurdz.game.Level.prototype.entitiesWithType = function (type)
    {
        // The return value.
        var retVal = [];
        for (var i = 0 ; i < this.entities.length ; i++)
        {
            var entity = this.entities[i];
            if (entity instanceof type)
                retVal.push (entity);
        }

        return retVal;
    };

    /**
     * Given coordinates in the map (e.g. tile based) domain, return back a list of all entities in the
     * level that exist at this location, which might be 0. This also detects when the coordinates are
     * outside of the world.
     *
     * @param {Number} x the X coordinate to search
     * @param {Number} y the Y coordinate to search
     * @returns {nurdz.game.Entity[]|null} the entities at the provided location or null if the location is
     * invalid
     */
    nurdz.game.Level.prototype.entitiesAtMapXY = function (x, y)
    {
        // Return null if the coordinate is out of bounds.
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return null;

        // Iterate over all entities to see if they are at the map location provided.
        var retVal = [];
        for (var i = 0 ; i < this.entities.length ; i++)
        {
            // Get the entity.
            var entity = this.entities[i];

            // If the location matches, add it to the array.
            if (entity.mapPosition.equalsXY (x, y))
                retVal.push (entity);
        }

        return retVal;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Given coordinates in the map (e.g. tile based) domain, return back a list of all entities in the
     * level that exist at this location, which might be 0. This also detects when the coordinates are
     * outside of the world.
     *
     * @param {nurdz.game.Point} location the location in the map to check
     * @returns {nurdz.game.Entity[]|null} the entities at the provided location or null if the location is
     * invalid
     */
    nurdz.game.Level.prototype.entitiesAtMapPosition = function (location)
    {
        return this.entitiesAtMapXY (location.x, location.y);
    };


    /**
     * Given coordinates in the map (e.g. tile based) domain and a facing, this calculates which map tile
     * is in the facing direction given and then returns back a list of all entities that exist at the map
     * tile that is adjacent in that direction, which might be 0. This also detects when either the input or
     * facing adjusted coordinates are outside of the world.
     *
     * @param {Number} x the X coordinate to search
     * @param {Number} y the Y coordinate to search
     * @param {Number} facing the facing to search
     * @returns {nurdz.game.Entity[]|null} the entities at the provided location or null if the location is
     * invalid
     */
    nurdz.game.Level.prototype.entitiesAtMapXYFacing = function (x, y, facing)
    {
        // Based on the facing angle, adjust the map position as needed.
        switch (facing)
        {
            case 0:
                x++;
                break;

            case 90:
                y++;
                break;

            case 180:
                x--;
                break;

            case 270:
                y--;
                break;
        }

        // Now we can do a normal lookup.
        return this.entitiesAtMapXY (x, y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Given coordinates in the map (e.g. tile based) domain and a facing, this calculates which map tile
     * is in the facing direction given and then returns back a list of all entities that exist at the map
     * tile that is adjacent in that direction, which might be 0. This also detects when either the input or
     * facing adjusted coordinates are outside of the world.
     *
     * @param {nurdz.game.Point} location the location in the map to check
     * @param {Number} facing the facing to search
     * @returns {nurdz.game.Entity[]|null} the entities at the provided location or null if the location is
     * invalid
     */
    nurdz.game.Level.prototype.entitiesAtMapPositionFacing = function (location, facing)
    {
        return this.entitiesAtMapXYFacing (location.x, location.y, facing);
    };

    /**
     * Scan over all entities in the level and return back a list of all entities with the id or ids
     * given, which may be an empty array.
     *
     * NOTE: No care is taken to not include duplicate entities if the entity list provided contains the
     * same entity ID more than once. It's also not an error if no such entity exists, although a warning
     * will be generated to the console in this case.
     *
     * @param {String[]} idSpec the array of entity IDs to find
     * @returns {nurdz.game.Entity[]} list of matching entities (may be an empty array)
     */
    nurdz.game.Level.prototype.entitiesWithIDs = function (idSpec)
    {
        var retVal = [];

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
     * Find all entities that match the id list passed in and then, for each such entity found, fire their
     * trigger method using the provided activator as the source of the trigger.
     *
     * As a convenience, if the idSpec provided is null, nothing happens. This allows for entities to use
     * this method without having to first verify that they actually have a trigger.
     *
     * @param {String[]|null} idSpec the id or ids of entities to find or null too do nothing
     * @param {nurdz.game.Actor|null} activator the actor that is activating the entities, or null
     */
    nurdz.game.Level.prototype.triggerEntitiesWithIDs = function (idSpec, activator)
    {
        // If there is not an idSpec, do nothing.
        if (idSpec == null)
            return;

        // Get the list of entities that match the idSpec provided and trigger them all.
        var entities = this.entitiesWithIDs (idSpec);
        for (var i = 0 ; i < entities.length ; i++)
            entities[i].trigger (activator);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Given coordinates in the map (e.g. tile based) domain, return back the tile at that location. If
     * the coordinates are outside of the world, this is detected and null is returned back.
     *
     * @param {nurdz.game.Point} location the location to check
     * @returns {nurdz.game.Tile|null} the tile at the provided location or null if the location is invalid
     */
    nurdz.game.Level.prototype.tileAt = function (location)
    {
        return this.tileAtXY (location.x, location.y);
    };

    /**
     * Given coordinates in the map (e.g. tile based) domain, return back the tile at that location. If
     * the coordinates are outside of the world, this is detected and null is returned back.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {nurdz.game.Tile|null} the tile at the provided location or null if the location is invalid
     */
    nurdz.game.Level.prototype.tileAtXY = function (x, y)
    {
        // Bounds check the location.
        if (x < 0 || y < 0 || x >= this.width || y >= this.width)
            return null;

        // This is safe because the level data validates that all of the tiles in its data are also
        // represented in its tileset.
        return this.tileset.tilesByValue[this.levelData[y * this.width + x]];
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Given coordinates in the map, return back a boolean that indicates if that space is blocked or not
     * as far as movement is concerned.
     *
     * @param {nurdz.game.Point} location the location to check
     * @returns {Boolean} true if the level location is blocked and cannot be moved to, or false otherwise.
     */
    nurdz.game.Level.prototype.isBlockedAt = function (location)
    {
        return this.isBlockedAtXY (location.x, location.y);
    };

    /**
     * Given coordinates in the map, return back a boolean that indicates if that space is blocked or not
     * as far as movement is concerned.
     *
     * @param {Number} x the X-coordinate to check
     * @param {Number} y the Y-coordinate to check
     * @returns {Boolean} true if the level location is blocked and cannot be moved to, or false otherwise.
     */
    nurdz.game.Level.prototype.isBlockedAtXY = function (x, y)
    {
        // Get the tile; it's blocked if it is a wall.
        var tile = this.tileAtXY (x, y);
        if (tile == null)
            return true;

        // If the tile at this location blocks actor movement, then the move is blocked.
        if (tile.blocksActorMovement ())
            return true;

        // Get the list of entities that are at this location on the map. If there are any and any of them
        // blocks actor movement, the move is blocked.
        var entities = this.entitiesAtMapXY (x, y);
        if (entities != null)
        {
            for (var i = 0 ; i < entities.length ; i++)
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
        for (var y = 0 ; y < this.height ; y++)
        {
            for (var x = 0 ; x < this.width ; x++)
            {
                var tile = this.tileAtXY (x, y);

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
        return String.format ("[Level size={0}x{1} tileset={2}]",
                              this.width, this.height,
                              this.tileset.toString());
    };
} ());
