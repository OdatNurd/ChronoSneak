/**
 * An Entity is a specific subclass of Actor that is designed to be interactive with other actors and
 * entities. An entity contains properties that can help define it's runtime behaviour.
 *
 * Entities have a step function which can be used to provide finer control over their logic. In an
 * entity, the update loop is designed to be used to modify the visual appearance of the entity, while the
 * step function is invoked to determine what the next logical action for the entity is.
 *
 * The properties provided may be extended with default values, depending on the subclass. Subclasses can
 * set this.defaultProperties to a set of properties that should be applied directly to the
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {Number} x x location for this actor
 * @param {Number} y y location for this actor
 * @param {Number} width the width of this entity
 * @param {Number} height the height of this entity
 * @param {Object} properties entity specific properties to apply to this entity
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.game.Entity = function (name, x, y, width, height, properties, debugColor)
{
    "use strict";

    /**
     * The list of default properties that will get inserted into the properties object provided if they
     * don't already exist.
     *
     * The entity base class extends this to set a default id into any entity that doesn't already have
     * one or a default of its own.
     *
     * @type {Object}
     */
    this.defaultProperties = nurdz.copyProperties (this.defaultProperties || {}, {id: this.createDefaultID});

    /**
     * The entity properties that describe the specifics of this entity and how it operates.
     *
     * @type {Object}
     */
    this.properties = nurdz.copyProperties (properties || {}, this.defaultProperties);

    // Iterate over all of the properties that are local to the object. Any that have a value that is a
    // function get their value replaced with the return value.
    for (var prop in this.properties)
    {
        if (this.properties.hasOwnProperty (prop) && typeof (this.properties[prop]) == "function")
            this.properties[prop] = this.properties[prop] ();
    }

    // Call the super class constructor, then validate the properties.
    nurdz.game.Actor.call (this, name, x, y, width, height, debugColor);
    this.validateProperties ();
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.game.Entity.prototype = Object.create (nurdz.game.Actor.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.game.Entity
        }
    });

    /**
     * Every time an entity ID is automatically generated, this value is appended to it to give it a
     * unique number.
     *
     * @type {Number}
     */
    var autoEntityID = 0;

    /**
     * Every time this function is invoked, it returns a new unique entity id.
     *
     * @returns {String}
     */
    nurdz.game.Entity.prototype.createDefaultID = function ()
    {
        autoEntityID++;
        return "_ng_entity" + autoEntityID;
    };

    /**
     * A helper function for validating entity properties. The method checks if a property with the name
     * given exists and is also (optionally) of an expected type. You can also specify if the property is
     * required or not; a property that is not required only throws an error if it exists but is not of
     * the type provided.
     *
     * @param {String} name the name of the property to check
     * @param {String|null} expectedType the type expected (the result of a typeof operator)
     * @param {Boolean} required true if this property is required and false otherwise.
     * @throws {Error} if the property is not valid.
     */
    nurdz.game.Entity.prototype.isPropertyValid = function (name, expectedType, required)
    {
        // Does the property exist?
        if (this.properties[name] == null)
        {
            // It does not. If it's not required, then return. Otherwise, complain that it's missing.
            if (required)
                throw new ReferenceError ("Entity " + this.name + ": missing property '" + name + "'");
            else
                return;
        }

        // If we got an expected type and it's not right, throw an error.
        if (expectedType != null && typeof (this.properties[name]) != expectedType)
            throw new TypeError ("Entity " + this.name + ": invalid property '" + name + "': expected " + expectedType);
    };

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This does not need to check if the values are valid as far as the other entities are concerned
     * (i.e. does one specify the ID of another entity) as that happens elsewhere.
     *
     * This should throw an error if any properties are invalid.
     */
    nurdz.game.Entity.prototype.validateProperties = function ()
    {
        this.isPropertyValid ("id", "string", true);
    };

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.game.Entity.prototype.blocksActorMovement = function ()
    {
        // By default, all entities are solid.
        return true;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This method is invoked whenever this entity gets triggered by another entity. This can happen
     * programmatically or in response to interactions with other entities.
     *
     * The method gets passed the Actor that caused the trigger to happen, although this can be null
     * depending on how the trigger happened.
     *
     * @param {nurdz.game.Actor} activator the actor that triggered this entity
     */
    nurdz.game.Entity.prototype.trigger = function (activator)
    {

    };

    /**
     * Entities are actors, which means tha they have an update and a render function. The update function
     * in an entity is meant to do things like visually update its appearance. The step function is used
     * to give the entity a "tick" to see if there is something that it wants to do. This might be
     * initiate a chase, decide a door needs to close, etc.
     */
    nurdz.game.Entity.prototype.step = function ()
    {
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Entity.prototype.toString = function ()
    {
        return "[Entity " + this.name + "]";
    };
} ());
