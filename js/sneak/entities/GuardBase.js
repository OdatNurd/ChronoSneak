/**
 * This entity is the basis for all guards in the game. All logic common to guards is in this entity, with
 * specific guard types sub-classing as appropriate to extend this base as needed.
 *
 * A base guard is different than regular entities in that their position is not given at construction
 * time by providing a map position. Instead, they are provided the ID value of a waypoint that specifies
 * where they spawn.
 *
 * Guards respond to the step function primarily by attempting to follow a patrol route. This is laid out in
 * a property which lists the id values of one or more waypoints, with the guard moving one step between
 * then for each step call. The patrol can loop, in which case the guard moves from the last point back to
 * the first point; otherwise they just stop at the last point.
 *
 * Guards will permanently halt their patrol if they run into level geometry. Entities that block movement
 * will stop them on this step() but they will try again; they attempt to trigger the entity to see if
 * that allows for passage before continuing.
 *
 * Base guards only know how to move in horizontal or vertical lines, and so they validate that their
 * patrol route is navigable in that regard when they are instantiated.
 *
 * This entity supports the following properties:
 *    - 'patrol': string or array of strings (default: none)
 *       - If specified, this is an entity ID or a list of entity ID's of waypoints that this guard should
 *         follow. The guard will start walking towards the first waypoint in the list, then to the next
 *         waypoint after that, until it reaches the end of the list.
 *    - 'patrolLoop': true or false (default: false)
 *        - This only has an effect when a patrol is specified, but it indicates that when the last waypoint
 *          in the patrol is reached, the patrol should walk back to the first waypoint in the patrol and
 *          continue.
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {String} initialWaypoint the waypoint that the guard should spawn at
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.GuardBase = function (stage, initialWaypoint, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {patrolLoop: false};

    /**
     * This represents the id of the waypoint that the guard should spawn at initially. The actual entity
     * can be found in the spawnEntity value once the map is fully loaded.
     *
     * @type {String}
     * @see nurdz.sneak.GuardBase.spawnEntity
     * @see nurdz.sneak.GuardBase.collectWaypoints
     */
    this.initialWaypoint = initialWaypoint;

    /**
     * The waypoint where this guard should spawn. This is null when the object is first initialized but gets
     * set after the level is loaded.
     *
     * @type {nurdz.sneak.Waypoint|null}
     * @see nurdz.sneak.GuardBase.initialWaypoint
     * @see nurdz.sneak.GuardBase.collectWaypoints
     */
    this.spawnEntity = null;

    /**
     * If this guard has a patrol route specified, this lists the waypoint objects in the same order as
     * they appear in the patrol property. The value is initially null but gets set when the map is fully
     * loaded. It may still be null if the guard has no patrol route set.
     *
     * @type {nurdz.sneak.Waypoint[]|null}
     * @see nurdz.sneak.GuardBase.collectWaypoints
     */
    this.patrolPoints = null;

    /**
     * When this guard has a patrol route that it is following, this specifies the index in the patrol
     * points list that represents where the current patrol point target is. Once the guard reaches this
     * point, the index bumps up. At the end of the patrol route, this either loops around or terminates
     * the patrol by becoming -2. The value is -1 to begin with so that the first time a patrol point is
     * selected, things work.
     *
     * @type {Number}
     */
    this.patrolIndex = -1;

    /**
     * If this guard is actively patrolling, this specifies the point that the guard is trying to get to
     * next. Every time the step() function is called, the guard will move one step closer to this waypoint.
     *
     * If the guard is not patrolling, or if the guard has reached the end of a non-looping patrol, this
     * will be null.
     *
     * When the patrol reaches this point during a step, it will be updated to the next position in the
     * patrol or null as appropriate.
     *
     * This is just an alias for patrolPoints[patrolIndex].
     *
     * @type {nurdz.sneak.Waypoint|null}
     */
    this.nextPatrolPoint = null;

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "GuardBase", stage, 0, 0, properties, 1, '#FF0A10');
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
     * Every time this is invoked, it causes the guard to select the next patrol point in its patrol. If
     * the patrol is looping and we are currently targeting the last patrol waypoint, this will loop
     * around to the start.
     *
     * This maintains all internal state for patrolling, but this should only be invoked when the guard is
     * currently at the current patrol point (or at the spawn point about to start patrolling).
     */
    nurdz.sneak.GuardBase.prototype.selectNextPatrolWaypoint = function ()
    {
        // If there is no patrol, OR the patrol index is smaller than -1, leave now. In the first case,
        // there is no patrol, and in the second case there is but it's not looping and the loop is complete.
        if (this.patrolPoints == null || this.patrolIndex < -1)
        {
            this.nextPatrolPoint = null;
            return;
        }

        // Increment to the next patrol index. If it goes off the end of the list of patrol points, we
        // need to either wrap around or terminate the patrol.
        this.patrolIndex++;
        if (this.patrolIndex == this.patrolPoints.length)
        {
            // If we're looping, set the patrol index back to 0. Otherwise the patrol is over, so set it
            // to -2 and leave.
            if (this.properties.patrolLoop == false)
            {
                this.patrolIndex = -2;
                this.nextPatrolPoint = null;
                return;
            }

            this.patrolIndex = 0;
        }

        // Cache the patrol point.
        this.nextPatrolPoint = this.patrolPoints[this.patrolIndex];
    };

    /**
     * The spawn location of guards as well as their patrols (if they have one) are given in the form of
     * the id of waypoint objects in the level. As such, until the level is fully loaded, the guard does
     * not know its starting position or how to move.
     *
     * This method will use the level provided to collect the waypoint entities that it needs in order to
     * function in the game.
     *
     * Validation is done to ensure that all of the waypoints exist, are actually waypoint object and (as
     * much as is possible) that the patrol path is valid.
     *
     * Additionally, this will set the location of the guard.
     *
     * @param {nurdz.game.Level} level the level that the guard is in
     */
    nurdz.sneak.GuardBase.prototype.collectWaypoints = function (level)
    {
        // This is either null or an array of entities that represent the waypoints of the patrol path of
        // this guard.
        var patrolEntities = null;

        // Get the entity that is the spawn entity.
        var spawnEntity = level.entitiesByID[this.initialWaypoint];

        // If there is a patrol, collect the entities for the patrol points.
        if (this.properties.patrol)
            patrolEntities = level.entitiesWithIDs (this.properties.patrol);

        // Validate that the spawn entity exists.
        if (spawnEntity == null)
            throw new ReferenceError ("Guard has invalid spawn location; spawn waypoint not found");

        // Make sure that the collected patrol entities (if any) are also valid. We need to have found as
        // many of them as we asked for.
        if (patrolEntities != null &&
            ((typeof (this.properties.patrol) == "string" && patrolEntities.length != 1) ||
            (this.properties.patrol.length != patrolEntities.length)))
            throw new ReferenceError ("Guard has invalid patrol list; one or more waypoints not found");

        // The spawn entity needs to be a waypoint object.
        if (spawnEntity instanceof nurdz.sneak.Waypoint == false)
            throw new ReferenceError ("Guard has invalid spawn location; spawn entity is not a waypoint");

        // If there are any patrol entities and they're not waypoints, they are invalid as well.
        if (patrolEntities != null)
        {
            for (var i = 0 ; i < patrolEntities.length ; i++)
            {
                if (patrolEntities[i] instanceof nurdz.sneak.Waypoint == false)
                    throw new ReferenceError ("Guard has invalid patrol; one or more entries are not waypoints");
            }
        }

        // Attempt to validate the patrol now, if there is one.
        if (patrolEntities != null)
            this.validatePatrol (/** @type {nurdz.sneak.Waypoint} */ spawnEntity, patrolEntities);

        // All good, store the spawn location and the locations of all of the patrol points.
        this.spawnEntity = spawnEntity;
        this.patrolPoints = patrolEntities;

        // Set our position now.
        this.position = this.spawnEntity.position.copy ();

        // Lastly, set up our patrol
        this.selectNextPatrolWaypoint ();
    };

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.GuardBase.prototype.validateProperties = function ()
    {
        // If there is a patrol property and it's a string, convert it to an array with a single element
        // to make code later easier.
        if (typeof (this.properties.patrol) == "string")
            this.properties.patrol = [this.properties.patrol];

        // Validate all properties.
        this.isPropertyValid ("patrol", "array", false);
        this.isPropertyValid ("patrolLoop", "boolean", false);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * Validate the path that goes from the spawn location to the first patrol point, and then from that
     * patrol point onwards to the next, until the end of the patrol is reached. This will also loop back
     * ground to the first patrol point if the patrol loops.
     *
     * The validation attempts to ensure that we can at least reasonably ensure that the guard can
     * complete the patrol.
     *
     * @param {nurdz.sneak.Waypoint} startPoint the point the guard spawns at
     * @param {nurdz.sneak.Waypoint[]} patrolPoints the list of patrol points the guard will patrol.
     */
    nurdz.sneak.GuardBase.prototype.validatePatrol = function (startPoint, patrolPoints)
    {

        /**
         * Validate that the line that connects the two points provided is a horizontal or vertical line.
         * @param {nurdz.game.Point} startPos first point of path to validate
         * @param {nurdz.game.Point} endPos second point of path to validate
         */
        function validatePath (startPos, endPos)
        {
            // If both components of both points are different, the line connecting them is not horizontal
            // or vertical. This DOES allow for the points to be coincident though, which is no big whoop.
            if (startPos.x != endPos.x && startPos.y != endPos.y)
                throw new RangeError ("Invalid patrol for guard; waypoints are not properly aligned");
        }

        // This naive implementation of guard movement requires the guards to make only horizontal or
        // vertical movement. As a result, the path leading from one waypoint to the next needs to be
        // either a horizontal or vertical line.
        //
        // To accomplish this, we compare the X and Y of each waypoint and ensure that one component is
        // the same. If both are different, the points are connected via a diagonal line and the path is
        // rejected.
        for (var i = 0 ; i < patrolPoints.length ; i++)
        {
            // Compare this point with the point that comes before it in the patrol. When this is the
            // first point on the actual patrol route, the previous point is the spawn location,
            // validating that the guard can get from the spawn location to the first patrol location.
            validatePath ((i == 0 ? startPoint.position : patrolPoints[i - 1].position),
                          patrolPoints[i].position);
        }

        // If the patrol is supposed to loop, we need to validate that the last point on the patrol can
        // get to the first point the same way.
        if (this.properties.patrolLoop)
        {
            validatePath (patrolPoints[patrolPoints.length - 1].position,
                          patrolPoints[0].position);
        }
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

    //noinspection JSUnusedLocalSymbols
    /**
     * Entities are actors, which means tha they have an update and a render function. The update function
     * in an entity is meant to do things like visually update its appearance. The step function is used
     * to give the entity a "tick" to see if there is something that it wants to do. This might be
     * initiate a chase, decide a door needs to close, etc.
     *
     * The entity is given a reference to the level that contains it to assist in this.
     *
     * @param {nurdz.game.Level} level the level the entity is contained in
     */
    nurdz.sneak.GuardBase.prototype.step = function (level)
    {

        // We don;'t have to do anything if we don't have a patrol point yet.
        if (this.nextPatrolPoint == null)
            return;

        // Duplicate the current position, then translate that position to take a step in the direction of
        // the current patrol route.
        var movePos = this.position.copy ();
        if (this.position.x == this.nextPatrolPoint.position.x)
        {
            // The X is the same, so translate on Y.
            movePos.translateXY (0,
                                 (this.position.y > this.nextPatrolPoint.position.y)
                                     ? -this.height
                                     : this.height);
        }
        else
        {
            // The X is different, so translate on X.
            movePos.translateXY ((this.position.x > this.nextPatrolPoint.position.x)
                                     ? -this.width
                                     : this.width,
                                 0);
        }

        // Create a duplicate of the move position that is converted from world coordinates to map
        // coordinates, then get the tile at the position that we want to move to.
        var mapPos = movePos.reduce (this.width);
        var dTile = level.tileAt (mapPos);

        // If we did not find a tile or we did but it blocks movement, that's bad for us and we can't move.
        if (dTile == null || dTile.blocksActorMovement ())
        {
            console.log ("Halting patrol; move is blocked by map geometry or is out of world");
            this.nextPatrolPoint = null;
            this.patrolIndex = -2;
            return;
        }

        // There is not a world block. Check to see if there are any entities that block movement on the
        // target square. Note that we know that the entities will never be null because if the location
        // was invalid, the movement test would have blocked the move already.
        var entities = level.entitiesAt (mapPos);
        if (entities.length > 0)
        {
            // TODO Opening of doors should be deferred
            // Specifically, instead of immediately invoking trigger right now on the door, the movement
            // should be blocked right now but the attempt to trigger the door should be registered with a
            // global action queue, so that the door opens the turn after the turn that the guard triggers it.
            //
            // In fact, all such triggers everywhere should work this way, with all triggers going to a
            // queue to be invoked at the start of the next step. This should also include actions like
            // moving. This is important for the ability to scroll time back and forth. So it doesn't need
            // to be implemented right away.

            // There is at least one entity in the position that we want to move to. Using the filter
            // method, check to see which ones block actor movement, and only keep the entities that block
            // movement.
            //
            // In the filter, if we find any entities that block us but which we think we can trigger so
            // that they don't, we try to trigger them and then check again to see if they still block.
            entities = entities.filter (function (entity)
                                        {
                                            // Does this entity block movement by actors?
                                            if (entity.blocksActorMovement ())
                                            {
                                                // Doors can be triggered to open, so try to open the door
                                                // and then  check again.
                                                if (entity instanceof nurdz.sneak.Door)
                                                {
                                                    entity.trigger (this);
                                                    return entity.blocksActorMovement ();
                                                }

                                                return true;
                                            }

                                            return false;
                                        });

            // If the number of entities in the array is not 0, the movement is currently blocked because
            // something is in the way. In that case, just leave and maybe the situation will resolve.
            if (entities.length != 0)
            {
                console.log ("Patrol blocked by one or more entities; skipping this step");
                return;
            }
        }

        // The move must be valid, so move to the new position.
        this.position = movePos;

        // If our current position is the position of the patrol point, it is time to move on to the next
        // point now.
        if (this.position.equals (this.nextPatrolPoint.position))
            this.selectNextPatrolWaypoint ();
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.GuardBase.prototype.toString = function ()
    {
        return "[GuardBase id=" + this.properties.id + "]";
    };
} ());
