/**
 * An Entity is a specific subclass of Actor that is designed to fit the same size as a tile. They act
 * like regular actors but have the ability to reference other entities, such as a button being linked to
 * a door to open it, and so on.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {Number} x x location for this actor
 * @param {Number} y y location for this actor
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.game.Entity = function (name, x, y, debugColor)
{
    "use strict";

    // Pull in the tile size that we're using.
    var tileSize = nurdz.sneak.constants.TILE_SIZE;

    // Call the super class constructor.
    nurdz.game.Actor.call (this, name, x, y, tileSize, tileSize, debugColor);
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
