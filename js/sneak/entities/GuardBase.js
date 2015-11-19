/**
 * This entity is the basis for all guards in the game. All logic common to guards is in this entity, with
 * specific guard types sub-classing as appropriate to extend this base as needed.
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
 *    - 'spawnPoint': string (default: none)
 *       - The guard spawns at the waypoint that has this ID value; it is an error if no such waypoint exists.
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
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.GuardBase = function (stage, x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {
        patrolLoop: false
    };

    /**
     * The waypoint where this guard should spawn. This is null when the object is first initialized but gets
     * set after the level is loaded.
     *
     * @type {nurdz.sneak.Waypoint|null}
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

    /**
     * This is an array of points that determine where the vision cone for this guard visually extends.
     * This is only used for display on the map; other mechanisms are used to determine what the guard can
     * actually detect.
     *
     * The contents of this is an array of points that should be joined together in order to form the
     * cone. The array is empty at startup, and then will have 1 or more points. A single point means that
     * no rays have been cast yet.
     *
     * The final result is a list of points which, when connected, form the vision cone. The first point
     * is the eye position of the guard, which is somewhere inside of the tile that the guard is currently
     * sitting in.
     *
     * @type {nurdz.game.Point[]}
     */
    this.visionCone = [];

    /**
     * The arc of vision, in degrees, that this guard has. The facing of the guard is the center of the
     * cone, and the cone itself extends to the left and right at 1/2 of the angle represented here,
     * making the full sweep of the cone the FOV degrees.
     *
     * @type {Number}
     */
    this.visionFOV = 130;
    // TODO the above should be a property

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "GuardBase", stage, x, y, properties, 2, '#EB3B00');
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
     * Our cached copy of the tile size. This value is used extensively in the raycasting process so we
     * want an easier way to access it.
     *
     * @type {Number}
     */
    var TILE_SIZE = nurdz.game.TILE_SIZE;

    /**
     * Convert an angle in degrees to radians.
     *
     * @param {Number} degrees an angle in degrees
     * @returns {number}
     */
    var toRadians = function (degrees)
    {
        return degrees * (Math.PI / 180);
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
        this.isPropertyValid ("spawnPoint", "string", true);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * Change the facing of this entity to the value passed in. You can pass in an angle (in degrees) as a
     * number of one of the strings "up", "down", "left" or "right" to have the routine calculate the
     * correct angle.
     *
     * As a result of ChronoSneak being a grid based game, the facing is constrained to one of the four
     * cardinal directions. The default is the right (0 degrees) if the passed in angle or facing string
     * is not valid.
     * @param {String|Number} newFacing the new facing
     */
    nurdz.sneak.GuardBase.prototype.setFacing = function (newFacing)
    {
        // Invoke the super method to do the actual work, then recalculate what our vision cone is.
        nurdz.sneak.ChronoEntity.prototype.setFacing.call (this, newFacing);
        this.calculateVisionCone ();
    };

    /**
     * Set the position of this entity by setting its position on the stage (world coordinates). The
     * position of the entity on the map will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.sneak.GuardBase.prototype.setStagePositionXY = function (x, y)
    {
        // Invoke the super method to do the actual work, then recalculate what our vision cone is.
        nurdz.sneak.ChronoEntity.prototype.setStagePositionXY.call (this, x, y);
        this.calculateVisionCone ();
    };

    /**
     * Set the position of this entity by setting its position in the level (map coordinates). The
     * position of the entity on the stage will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.sneak.GuardBase.prototype.setMapPositionXY = function (x, y)
    {
        // Invoke the super method to do the actual work, then recalculate what our vision cone is.
        nurdz.sneak.ChronoEntity.prototype.setMapPositionXY.call (this, x, y);
        this.calculateVisionCone ();
    };

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
        var spawnEntity = level.entitiesByID[this.properties.spawnPoint];

        // If there is a patrol, collect the entities for the patrol points.
        if (this.properties.patrol)
            patrolEntities = level.entitiesWithIDs (this.properties.patrol);

        // Validate that the spawn entity exists.
        if (spawnEntity == null)
            throw new ReferenceError ("Guard has invalid spawn location; spawn waypoint not found");

        // Make sure that the collected patrol entities (if any) are also valid. We need to have found as
        // many of them as we asked for.
        if (patrolEntities != null && this.properties.patrol.length != patrolEntities.length)
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
        this.setMapPosition (this.spawnEntity.mapPosition);

        // Lastly, set up our patrol
        this.selectNextPatrolWaypoint ();
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
    var MARGIN = Math.floor (nurdz.game.TILE_SIZE * 0.15);

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.GuardBase.prototype.render = function (stage)
    {
        // Render the guard if its visible, otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            this.startRendering (stage, this.properties.facing);
            stage.fillRect (-(this.width / 2) + MARGIN, -(this.height / 2) + MARGIN,
                            this.width - (2 * MARGIN), this.height - (2 * MARGIN),
                            this.debugColor);
            stage.setArrowStyle ("#000000");
            stage.drawArrow (-(this.width / 2) + MARGIN, 0, (this.width / 2) - MARGIN, 0);
            this.endRendering (stage);

            // If there is a vision cone, render it now.
            if (this.visionCone.length > 1)
            {
                stage.canvasContext.save( );

                // Set up drawing.
                stage.canvasContext.fillStyle = "green";
                stage.canvasContext.globalAlpha = 0.4;

                // Draw the cone now. The path starts at the casting location.
                stage.canvasContext.beginPath ();
                stage.canvasContext.moveTo (this.visionCone[0].x, this.visionCone[0].y);

                // Now connect all of the points with a line
                for (var i = 1 ; i < this.visionCone.length ; i++)
                    this.stage.canvasContext.lineTo (this.visionCone[i].x, this.visionCone[i].y);

                // Fill and restore the canvas context.
                stage.canvasContext.fill ();
                stage.canvasContext.restore ();
            }
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
        // We don't have to do anything if we don't have a patrol point yet.
        if (this.nextPatrolPoint == null)
            return;

        // Duplicate the current position, then translate that position to take a step in the direction of
        // the next waypoint on the patrol route. We also record what the map facing would be in the move
        // were to go in that direction.
        var movePos = this.mapPosition.copy ();
        var moveFacing;
        if (this.mapPosition.x == this.nextPatrolPoint.mapPosition.x)
        {
            moveFacing = (this.mapPosition.y > this.nextPatrolPoint.mapPosition.y) ? 270 : 90;
            movePos.translateXY (0, moveFacing == 270 ? -1 : 1);
        }
        else
        {
            moveFacing = (this.mapPosition.x > this.nextPatrolPoint.mapPosition.x) ? 180 : 0;
            movePos.translateXY (moveFacing == 180 ? -1 : 1, 0);
        }

        // If the direction that we would have to move in is not the direction that we're facing, we just
        // need to change our facing and leave; turning takes a turn.
        if (moveFacing != this.properties.facing)
        {
            this.setFacing (this.calculateTurnFacing (moveFacing));
            return;
        }

        // Get the tile at the position the move would take us to.
        var dTile = level.tileAt (movePos);

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
        var entities = level.entitiesAt (movePos);
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
        this.setMapPosition (movePos);

        // If our current position is the position of the patrol point, it is time to move on to the next
        // point now.
        if (this.mapPosition.equals (this.nextPatrolPoint.mapPosition))
            this.selectNextPatrolWaypoint ();
    };

    /**
     * When invoked, this calculates what the vision cone of this guard should be based on its current
     * location, facing, and vision FOV.
     */
    nurdz.sneak.GuardBase.prototype.calculateVisionCone = function ()
    {
        // Fetch the level that the guard is in. If we don't know what this is, then we have to leave;
        // without the level we can't see where our raycasting should stop.
        //
        // This happens when our position gets set but the scene that we're in is not the current scene.
        var level = this.stage.currentScene ().level;
        if (level == null)
            return;

        // TODO the below eye position should not be the center, but a little forward of center, so that
        // the rays do not hit the intersections of tiles.

        // Calculate the eye position of the guard in its cell and what half of the vision FOV is.
        var eyePosition = this.position.copyTranslatedXY (TILE_SIZE / 2, TILE_SIZE / 2);
        var FOV = this.visionFOV / 2;

        // Reset the vision cone array.
        this.visionCone = [eyePosition];

        // We cast in a sweep. The start of the cone is to the left of the viewing angle and is half of
        // the total view, following all the way to the right over the range of the whole FOV.
        for (var angle = this.properties.facing - FOV ; angle <= this.properties.facing + FOV ; angle += 5)
            this.castRay (level, eyePosition.x, eyePosition.y, this.normalizeAngle (angle));
    };

    /**
     * Calculate the ray information for the provided ray angle, which is expressed in degrees. The ray is
     * cast from the current casting position.
     *
     * @param {nurdz.game.Level} level the level that the guard is in, for determining geometry
     * @param {Number} x the X coordinate (world space not map space) to start the ray from
     * @param {Number} y the Y coordinate (world space not map space) to start the ray from
     * @param {Number} rayAngle the angle (in degrees) to cast for.
     */
    nurdz.sneak.GuardBase.prototype.castRay = function (level, x, y, rayAngle)
    {
        // Convert the incoming angle to radians and then perform a tangent call on it. Tangent is
        // infinite at the vertical asymptotes of 90 and 270 degrees.
        var tanAngle = Math.tan (toRadians (rayAngle));

        // These values are the X and Y intersections of the rays that we are casting. Each set of
        // intersections is a point on the grid that the trace is colliding with.
        var xHorzIntersect, yHorzIntersect;
        var xVertIntersect, yVertIntersect;

        // The calculated distances from the casting location to the horizontal and vertical intersections.
        var horizontalDistance, verticalDistance;

        // After we get our initial intersection points, we know that the distance to the next intersections
        // always have the same values. One of the two values here is always TILE_SIZE (or -TILE_SIZE) and
        // the other is easily calculated by knowing the angle and that the other side is TILE_SIZE.
        var xIncrement, yIncrement;

        //// Store the initial point to start with. This is where the trace begins.
        //this.debugPoint(this.castPos.x, this.castPos.y);

        // The first thing that we do is find horizontal intersections. However, if the angle is exactly 0
        // or 180, there can be no intersections with horizontal lines because the ray is parallel to the
        // grid in the horizontal direction.
        if (rayAngle != 0 && rayAngle != 180)
        {
            // STEP 1: First Horizontal Intersection
            //
            // Determine the location of the first intersection with this ray and a horizontal line. We know
            // that every intersection with this ray and a horizontal line is going to fall where the Y value
            // is an even multiple of the tile size, because rays can only intersect tiles.
            //
            // Based on the direction that the ray is going, select the nearest Y value either above or below
            // the current casting position.
            if (rayAngle > 180)
                yHorzIntersect = Math.floor (y / TILE_SIZE) * TILE_SIZE;
            else
                yHorzIntersect = Math.floor (y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;

            // Using the point-slope version of the line equation, determine where the X point on this
            // intersection is. This equation is:
            //     (y2 - y1) / (x2 - x1) = m
            //
            // This is essentially the slope formula. In order to solve this equation you need two points and
            // the slope of the line. As it happens, we have one point (the casting position), one piece of
            // the other point (the Y intersect) and the slope of the line, which is just the tangent of the
            // line, since the slope is (y/x) and the tangent is opposite/adjacent or (y/x).
            //
            // Note however that our view angles are reversed and so when we calculate the tangent we need to
            // reflect the slope in order to get the correct value.
            xHorzIntersect = x + (y - yHorzIntersect) / tanAngle * -1;

            // STEP 2: Determine the X and Y increment to the next intersection.
            //
            // The ray that we are casting is the hypotenuse of a right triangle. By breaking this down into a
            // series of stacked (and offset) smaller right triangles, we see that each such sub triangle has
            // the same height, which is the height of a tile. Since the tangent of the angle is equal to the
            // opposite (y) over the adjacent (x), we can determine what X increment we need to go with that Y
            // increment.
            //
            // Start with the Y increment, which is either going to increase or decrease depending on the
            // direction the ray is going.
            if (rayAngle > 180)
                yIncrement = -TILE_SIZE;
            else
                yIncrement = TILE_SIZE;

            // Now the X increment. Using the formula for tangent, get the adjacent (x) side of a triangle
            // with an opposite side and angle that we know of. Since the tangent of the angle depends on the
            // quadrant, we need to reflect the tangent by -1 if we're facing downward in order to get the
            // correct sign.
            //
            // Additionally, the tangent is an asymptote at angles of 90 or 270 because the line is purely
            // vertical. In those cases the X increment is 0 for obvious reasons.
            if (rayAngle == 90 || rayAngle == 270)
                xIncrement = 0;
            else
                xIncrement = TILE_SIZE / tanAngle * (rayAngle >= 180 ? -1 : 1);

            // Now we know the position of the first horizontal intersection and the amount to add to that
            // intersection in order to get to the next one. Keep looping, checking intersections until we hit
            // something that stops the ray or hit the edge of the screen.
            while (1)
            {
                // Check to see if the map is blocked or not. Note that the coordinates that we get need
                // to be rounded down to a multiple of the tile size. If the ray is going upwards (the Y
                // increment is negative) we need to subtract one from the value because it's actually the
                // cell above that we want to check.
                if (level.isBlockedAtXY (Math.floor (xHorzIntersect / TILE_SIZE),
                                         Math.floor (yHorzIntersect / TILE_SIZE) + (yIncrement < 0 ? -1 : 0)))
                    break;

                // Stop if this point is out of bounds.
                if (xHorzIntersect <= 0 || yHorzIntersect <= 0 || xHorzIntersect >= this.stage.width || yHorzIntersect >= this.stage.height)
                    break;

                // Find the next point.
                xHorzIntersect += xIncrement;
                yHorzIntersect += yIncrement;
            }

            // Calculate the horizontal distance now
            horizontalDistance = Math.pow (xHorzIntersect - x, 2) + Math.pow (yHorzIntersect - y, 2);
        }

        // We're not casting in this direction, so make the distance to the horizontal intersection
        // arbitrarily large.
        else
            horizontalDistance = Number.MAX_VALUE;

        // Now we do vertical intersections. Like the horizontal intersections above, we can't find
        // intersections with vertical grid points if the angle is 90 or 279 because in those cases the
        // ray is parallel to them.
        if (rayAngle != 90 && rayAngle != 270)
        {
            // STEP 3: First Vertical Intersection
            //
            // This uses the same principles as above, but now we are solving for the Y instead of the X. The
            // constants are still the same because our tiles are square.
            //
            // Here we need the X intersect to be on the right hand side if we're moving to the right or on
            // the left if we are moving left.
            if (rayAngle >= 270 || rayAngle < 90)
                xVertIntersect = Math.floor (x / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
            else
                xVertIntersect = Math.floor(x / TILE_SIZE) * TILE_SIZE;

            // Now calculate the Y intersect. Notice that in this formula the slope (tangent) is multiplied
            // instead of being divided. Work the algebra on the point-slope form of the line to see why this
            // is so.
            yVertIntersect = y + (x - xVertIntersect) * tanAngle * -1;

            // Now as above, calculate the X and Y increment values. Here the formula is slightly flipped,
            // since the X portion is constant instead of the Y portion./
            if (rayAngle >= 270 || rayAngle < 90)
                xIncrement = TILE_SIZE;
            else
                xIncrement = -TILE_SIZE;

            // Now we multiply the tangent instead of dividing it. If the angle is 0 or 180 we set the
            // yIncrement to be 0 because in these cases the line is horizontal. This is not really
            // needed, but just to make the numbers for the intersections be correct, this is what we do.
            //
            // Without this, they will be almost but not quite 0 due to how PI is an irrational number.
            // This is DOUBLE redundant because when the angle is 0, the math actually works out, but this
            // is clearer.
            if (rayAngle == 0 || rayAngle == 180)
                yIncrement = 0;
            else
                yIncrement = TILE_SIZE * tanAngle * (rayAngle >= 270 || rayAngle < 90 ? 1 : -1);

            while (1)
            {
                // Check to see if the map is blocked or not. Note that the coordinates that we get need
                // to be rounded down to a multiple of the tile size. If the ray is going left (the X
                // increment is negative) we need to subtract one from the value because it's actually the
                // cell to the left that we want to check.
                if (level.isBlockedAtXY (Math.floor (xVertIntersect / TILE_SIZE) + (xIncrement < 0 ? -1 : 0),
                                         Math.floor (yVertIntersect / TILE_SIZE)))
                    break;

                // Stop if this point is out of bounds.
                if (xVertIntersect <= 0 || yVertIntersect <= 0 || xVertIntersect >= this.stage.width || yVertIntersect >= this.stage.height)
                    break;

                // Find the next point.
                xVertIntersect += xIncrement;
                yVertIntersect += yIncrement;
            }

            // Calculate the vertical distance now
            verticalDistance = Math.pow(xVertIntersect - x, 2) + Math.pow (yVertIntersect - y, 2);
        }

        // We're not casting in this direction, so make the distance to the vertical intersection
        // arbitrarily large.
        else
            verticalDistance = Number.MAX_VALUE;

        // Choose the point that was closest.
        // If the horizontal distance is smaller and the vertical distance actually exists, the horizontal
        // intersection is closer.
        if (horizontalDistance < verticalDistance)
        {
            this.visionCone.push (new nurdz.game.Point (xHorzIntersect, yHorzIntersect));
            //this.debugPoint(xHorzIntersect, yHorzIntersect);
        }
        else
        {
            this.visionCone.push (new nurdz.game.Point (xVertIntersect, yVertIntersect));
            //this.debugPoint(xVertIntersect, yVertIntersect);
        }
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.GuardBase.prototype.toString = function ()
    {
        return String.format ("[GuardBase id='{0}' pos={1} spawnPos='{2}' patrolLoops={3}]",
                              this.properties.id,
                              this.mapPosition.toString(),
                              this.properties.spawnPoint,
                              this.properties.patrolLoop);
    };
} ());
