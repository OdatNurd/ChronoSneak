/**
 * This entity is the basis for all guards in the game. All logic common to guards is in this entity, with
 * specific guard types sub-classing as appropriate.
 *
 * A guard is different than a regular entity in that their position is not given at construction time in
 * the normal way. Instead of having an explicit position assigned, they are instead given the id of a
 * waypoint that they should start at. They should also have a a list of waypoints to follow.
 *
 *    - 'patrol': string or array of strings (default: none)
 *       - If specified, this is an entity ID or a list of entity ID's of waypoints that this guard should
 *         follow. The guard will start walking towards the first waypoint in the list, then to the next
 *         waypoint after that, until it reaches the end of the list.
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
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.GuardBase.prototype.validateProperties = function ()
    {
        // If there is a property named patrol, it should have a type that is either a string or an
        // array. If it's not, we will use a bogus call to isPropertyValid to cause it to generate an
        // error for us.
        if (this.properties.patrol != null)
        {
            // Cache it
            var patrol = this.properties.patrol;

            // If the trigger is not a string and not an array, that's bad. This invocation of instanceof
            // will fail because the type given is not valid.
            if (typeof (patrol) != "string" && Array.isArray (patrol) == false)
                this.isPropertyValid ("patrol", "string|array", false);
        }

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * This validates that the path between the spawn position and each of the points in the patrol are
     * valid for the guard.
     *
     * @param {nurdz.sneak.Waypoint} startPoint the point the guard spawns at
     * @param {nurdz.sneak.Waypoint[]} patrolPoints the list of patrol points the guard will patrol.
     */
    nurdz.sneak.GuardBase.prototype.validatePatrol = function (startPoint, patrolPoints)
    {
        // We iterate over all of the patrol points, comparing each point to the point that comes after
        // it. For each comparison, either the X value or the Y value needs to be the same while the other
        // value is different. This ensures that each waypoint is horizontally or vertically aligned with
        // the previous one.
        for (var i = 0 ; i < patrolPoints.length ; i++)
        {
            // Get the two points that we're going to compare. We compare this point to the point that
            // comes before it. When the patrol point is the first in the list, it is compared with the
            // start point instead, which is where the guard spawns.
            var startPos = (i == 0 ? startPoint.position : patrolPoints[i - 1].position);
            var endPos = patrolPoints[i].position;

            if (startPos.x != endPos.x && startPos.y != endPos.y)
                throw new RangeError ("Invalid patrol for guard; waypoints are not properly aligned");
        }
    };

    /**
     * When invoked, this ensures that all of the waypoints that are in this guards patrol list (if any)
     * are valid. If any are not, an error is thrown.
     *
     * @param {nurdz.game.Level} level the level that the guard is in
     */
    nurdz.sneak.GuardBase.prototype.validateWaypoints = function (level)
    {
        // If there is no patrol list, we can leave now.
        if (this.properties.patrol == null)
            return;

        // Get the list of all waypoints as well as the spawn location.
        var waypoints = level.entitiesWithIDs (this.properties.patrol);
        var spawnPos = level.entitiesByID[this.initialWaypoint];

        // If the spawn location was not found OR the list of found waypoints is not the same length as the
        // list we asked for, this waypoint list is invalid.
        if ((spawnPos == null) ||
            (typeof (this.properties.patrol) == "string" && waypoints.length != 1) ||
            (this.properties.patrol.length != waypoints.length))
            throw new ReferenceError ("Guard has invalid patrol list; one or more waypoints not found");

        // If any of the entities found are not waypoints, they are invalid.
        for (var i = 0; i < waypoints.length; i++)
        {
            if (waypoints[i] instanceof nurdz.sneak.Waypoint == false)
                throw new ReferenceError ("Guard has invalid patrol; one or more entries are not waypoints");
        }

        // If the spawn location is not a waypoint, that's also bad.
        if (spawnPos instanceof nurdz.sneak.Waypoint == false)
            throw new ReferenceError ("Guard cannot find spawn location; no Waypoint named " + this.initialWaypoint);

        // Lastly, validate that the patrol is valid in that the guard can find the points it needs to.
        this.validatePatrol (spawnPos, waypoints);
    };

    /**
     * When invoked, this jumps the location of this guard to the location of the initial waypoint.
     *
     * @param {nurdz.game.Level} level the level that the guard is in
     */
    nurdz.sneak.GuardBase.prototype.jumpToSpawn = function (level)
    {
        // Find the spawn entity and copy its location. We know this will work because we validated that
        // Set our location to be the same location as the waypoint we found.
        this.position = level.entitiesByID[this.initialWaypoint].position.copy ();
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
