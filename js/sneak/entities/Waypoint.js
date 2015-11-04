/**
 * This is a simple marker entity that controls how guards move. Guards start at some waypoint and then
 * move between them. The waypoints are simple markers that indicate the locations the guards will move to.
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.Waypoint = function (stage, x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type. Waypoints are not meant to be visible,
    // they're just markers.
    this.defaultProperties = {
        visible: true
    };

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "Waypoint", stage, x, y, properties, 1, 'black');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Waypoint.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Waypoint
        }
    });

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.Waypoint.prototype.blocksActorMovement = function ()
    {
        // These entities are essentially invisible and are only markers, so don't block.
        return false;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Waypoint.prototype.render = function (stage)
    {
        // Draw a small dot to mark the waypoint if it's visible, otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            // Simple dot.
            this.startRendering (stage);
            stage.fillCircle (0, 0, Math.floor (this.width * 0.125), this.debugColor);
            this.endRendering (stage);
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Waypoint.prototype.toString = function ()
    {
        return String.format ("[Waypoint id='{0}' pos={1}]",
                              this.properties.id,
                              this.mapPosition.toString());
    };
} ());
