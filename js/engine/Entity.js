/**
 * An Entity is a specific subclass of Actor that is designed to be interactive with other actors and
 * entities. An entity contains properties that can help define it's runtime behaviour.
 *
 * The properties provided may be extended with default values, depending on the subclass. Subclasses can
 * set this.defaultProperties to a set of properties that should be applied if they do not already exist.
 * Each subclass of ChronoEntity is responsible for making sure to blend the defaults with those of their
 * parent class, so that the chained constructor calls set up the properties as appropriate.
 *
 * This entity supports the following properties:
 *    - 'id': string (default: auto generated if not set)
 *       - specifies the id of this entity for use in identifying/finding/triggering this entity.
 *
 * @param {String} name the internal name of this entity instance, for debugging
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x x location for this actor
 * @param {Number} y y location for this actor
 * @param {Number} width the width of this entity
 * @param {Number} height the height of this entity
 * @param {Object} properties entity specific properties to apply to this entity
 * @param {Number} [zOrder=1] the Z-Order of this entity when rendered (smaller numbers go below larger ones)
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.game.Entity = function (name, stage, x, y, width, height, properties, zOrder, debugColor)
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
    this.defaultProperties = this.defaultProperties || {};

    /**
     * The entity properties that describe the specifics of this entity and how it operates.
     *
     * @type {Object}
     */
    this.properties = nurdz.copyProperties (properties || {}, this.defaultProperties);

    // Call the super class constructor, then validate the properties.
    nurdz.game.Actor.call (this, name, stage, x, y, width, height, zOrder, debugColor);
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
    var createDefaultID = function ()
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
     * The values for the expected type (when not null) are whatever the typeof operator can return, plus
     * the extra type "array", which indicates that the value must be an array.
     *
     * @param {String} name the name of the property to check
     * @param {String|null} expectedType the type expected (the result of a typeof operator)
     * @param {Boolean} required true if this property is required and false otherwise.
     * @param {Array} [values=null] if given, a list that contains all possible valid values
     * @throws {Error} if the property is not valid.
     */
    nurdz.game.Entity.prototype.isPropertyValid = function (name, expectedType, required, values)
    {
        // Get the value of the property (if any).
        var propertyValue = this.properties[name];

        // Does the property exist?
        if (propertyValue == null)
        {
            // It does not. If it's not required, then return. Otherwise, complain that it's missing.
            if (required)
                throw new ReferenceError ("Entity " + this.name + ": missing property '" + name + "'");
            else
                return;
        }

        // If we got an expected type and it's not right, throw an error.
        if (expectedType != null)
        {
            // Get the actual type of the value and see if it matched.
            var actualType = (Array.isArray (propertyValue) ? "array" : typeof (propertyValue));
            if (actualType != expectedType)
                throw new TypeError ("Entity " + this.name + ": invalid property '" + name + "': expected " + expectedType);
        }

        // If we got a list of possible values and this property actually exists, make sure that the value is
        // one of them.
        if (values != null && propertyValue != null)
        {
            for (var i = 0 ; i < values.length ; i++)
            {
                if (propertyValue == values[i])
                    return;
            }

            // If we get here, we did not find the value in the list of valid values.
            throw new RangeError ("Entity " + this.name + ": invalid value for property '" + name + "': not in allowable list");
        }
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
        // If there is not an id property, install one.
        if (this.properties.id == null)
            this.properties.id = createDefaultID ();

        // Validate the ID property (in case it was already there).
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
     * programmatically or in response to interactions with other entities, which does not include
     * collision (see triggerTouch() for that).
     *
     * The method gets passed the Actor that caused the trigger to happen, although this can be null
     * depending on how the trigger happened.
     *
     * @param {nurdz.game.Actor|null} activator the actor that triggered this entity, or null if unknown
     * @see nurdz.game.Entity.triggerTouch
     */
    nurdz.game.Entity.prototype.trigger = function (activator)
    {

    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This method is invoked whenever this entity gets triggered by another entity as a result of a
     * direct collision (touch). This can happen programmatically or in response to interactions with other
     * entities. This does not include non-collision interactions (see trigger() for that).
     *
     * The method gets passed the Actor that caused the trigger to happen, although this can be null
     * depending on how the trigger happened.
     *
     * @param {nurdz.game.Actor} activator the actor that triggered this entity
     * @see nurdz.game.Entity.trigger
     */
    nurdz.game.Entity.prototype.triggerTouch = function (activator)
    {
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Entity.prototype.toString = function ()
    {
        return String.format ("[Entity name='{0}']", this.name);
    };
} ());
