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
     * don't already exist. The Entity class sets this to an empty object if it is not already set by a
     * base class.
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
        // The only property that we thin is strictly needed is an id.
        if (this.properties.id == null)
            throw new Error ("Entity missing required property 'id'");
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
