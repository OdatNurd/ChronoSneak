/**
 * This entity is the basis for all guards in the game. All logic common to guards is in this entity, with
 * specific guard types sub-classing as appropriate.
 *
 * A guard is different than a regular entity in that their position is not given at construction time in
 * the normal way. Instead of having an explicit position assigned, they are instead given the id of a
 * waypoint that they should start at. They should also have a a list of waypoints to follow.
 *
 * @param {String} initialWaypoint the waypoint that the guard should spawn at
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.GuardBase = function (initialWaypoint, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {};

    /**
     * This represents the id of the waypoint that the guard should spawn at initially.
     *
     * @type {String}
     */
    this.initialWaypoint = initialWaypoint;

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "GuardBase", null, 0, 0, properties, 1, '#FF0A10');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.GuardBase.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.GuardBase
        }
    });

    /**
     * When invoked, this jumps the location of this guard to the location of the initial waypoint.
     *
     * @param {nurdz.game.Level} level the level that the guard is in
     */
    nurdz.sneak.GuardBase.prototype.jumpToSpawn = function (level)
    {
        // Try to find the spawn entity.
        var spawnPos = level.entitiesByID[this.initialWaypoint];
        if (spawnPos == null || spawnPos instanceof nurdz.sneak.Waypoint == false)
        {
            console.log ("Guard cannot find spawn location; no Waypoint named " + this.initialWaypoint);
            return;
        }

        // Set our location to be the same location as the waypoint we found.
        this.position = spawnPos.position.copy ();
    };

    /**
     * The size (in pixels) of border to apply on all edges of the cell that the guard is in when
     * rendering it.
     *
     * @const
     * @type {Number}
     */
    var MARGIN = 5;

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.GuardBase.prototype.render = function (stage)
    {
        // Draw a small dot to mark the waypoint if it's visible, otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            stage.fillRect (this.position.x + MARGIN, this.position.y + MARGIN,
                            this.width - (2 * MARGIN), this.height - (2 * MARGIN),
                            this.debugColor);
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };
} ());
