/**
 * This subclass represents data used in a ChronoSneak level.
 *
 * For clarity, this class changes the original in that the entity data passed in is expected to be tables
 * that represent the entities for the level instead of being previously constructed instances of the class.
 *
 * The array of entities passed in are assumed to be objects that have all of the properties that the
 * entity would have passed in its properties parameter, plus extra parameters that carry the class that
 * represents the entity and its position.
 *
 * In effect, what happens is that for each such object, the "class", "x" and "y" fields are removed and
 * whatever is left is used to initialize the properties in the newly created object.
 *
 * For clarity, the "x" and "y" are the location to create the entity at and the "class" field is a string
 * which represents the name of the constructor function. This function is assumed to be in the
 * nurdz.sneak namespace.
 *
 * In all other regards, this class operates as a regular LevelData instance.
 *
 * @param {nurdz.game.Stage} stage the stage that will own the data
 * @param {String} name the name of this level
 * @param {Number} width width of the level, in tiles
 * @param {Number} height height of the level, in tiles
 * @param {Number[]} levelData the actual data that represents the level
 * @param {Object[]} entityList the list of entities contained in the map (may be 0).
 * @param {nurdz.game.Tileset} tileset the tileset that this level is using
 * @throws {Error} if the level data is not valid
 * @constructor
 */
nurdz.sneak.SneakLevelData = function (stage, name, width, height, levelData, entityList, tileset)
{
    "use strict";

    // Convert the entity list that we get as a parameter to an actual array of entities like our super
    // expects to get.
    entityList = this.createEntities (stage, entityList);

    // Call the super class constructor.
    nurdz.game.LevelData.call (this, stage, name, width, height, levelData, entityList, tileset);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.SneakLevelData.prototype = Object.create (nurdz.game.LevelData.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.SneakLevelData
        }
    });

    /**
     * The namespace that contains all of the entity constructors.
     *
     * @type {{}}
     */
    var sneakNamespace = nurdz.createOrGetNamespace ("nurdz.sneak");

    /**
     * Throws an error that explains why an entity could not be created.
     *
     * @param {String} reason the reason for the failure
     */
    var creationError = function (reason)
    {
        throw new TypeError ("Unable to create entity: " + reason);
    };

    /**
     * Given an entity descriptor, create and return the entity object that it represents. This ensures
     * that the descriptor has the keys needed and that the result is an instance of ChronoEntity or one
     * of its subclasses.
     *
     * @param {nurdz.game.Stage} stage the stage to create the entity  on
     * @param {Object} descriptor the entity descriptor to use to create the entity
     * @param {String} descriptor.class the name of the constructor function to use
     * @param {Number[]} descriptor.position the position to create the entity at
     */
    var createEntity = function (stage, descriptor)
    {
        /**
         * The properties for the created entity. This is a duplicate of the descriptor that we get which
         * has the key elements that tell us how to create the entity removed.
         *
         * @type {Object}
         */
        var properties = nurdz.copyProperties ({}, descriptor);

        /**
         * The constructor function that will create this entity.
         *
         * @type {Function}
         */
        var constructor = sneakNamespace[properties.class];

        /**
         * The position of the entity. This should be an array of two numbers.
         *
         * @type {Number[]}
         */
        var position = properties.position;

        // Ensure that the fields are valid.
        if (constructor == null || position == null)
            creationError ("incomplete entity specification in level data");

        // Make sure that the constructor is a function that takes the appropriate number of parameters.
        if (typeof (constructor) != "function" || constructor.length != 4)
            creationError ("constructor function is not valid");

        // Make sure that the position is valid.
        if (!Array.isArray (position) || position.length != 2 ||
            typeof  (position[0]) != "number" || typeof (position[0]) != "number")
            creationError ("position specification is not valid");

        // Remove the key fields from the entity now.
        delete properties.class;
        delete properties.position;

        /**
         * The created entity.
         *
         * @type {nurdz.sneak.ChronoEntity}
         */
        var entity = new constructor (stage, position[0], position[1], properties);

        // If the entity is not a valid instance, throw an error.
        if (entity instanceof nurdz.sneak.ChronoEntity == false)
            creationError ("constructor function is not a subclass of ChronoEntity");

        // Return the entity now.
        return entity;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This method takes as input an array of objects that represent entities and uses it to create actual
     * entity elements, which it stores in an array and then returns.
     *
     * The passed in array should be an array of objects that have the following keys:
     *   - class: a string representation of the name of the constructor function that is used to create
     *   this entity, which is a function that is assumed to be in the nurdz.sneak namespace
     *   - x, y: numbers that represent the location that the entity should be created at
     *
     * A copy of the entityDescriptor is made, the above keys are removed, and what is left are passed to
     * the constructor as the properties for the object.
     *
     * A test is done to ensure that the result is an object that is an instance of ChronoEntity.
     *
     * @param {nurdz.game.Stage} stage the stage to create the entities on
     * @param {Object[]} entityDescriptors The table that represents the entities to create
     * @returns {nurdz.sneak.ChronoEntity[]}
     */
    nurdz.sneak.SneakLevelData.prototype.createEntities = function (stage, entityDescriptors)
    {
        /**
         * The resulting list of entities.
         *
         * @type {nurdz.sneak.ChronoEntity[]}
         */
        var retVal = [];

        // Create the entities now
        for (var i = 0 ; i < entityDescriptors.length ; i++)
            retVal.push (createEntity (stage, entityDescriptors[i]));

        return retVal;
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.SneakLevelData.prototype.toString = function ()
    {
        return String.format ("[SneakLevelData size={0}x{1} tileset={2}]",
                              this.width, this.height,
                              this.tileset.toString());
    };
} ());
