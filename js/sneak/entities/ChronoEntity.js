/**
 * A simple subclass of Entity that is meant to be used in ChronoSneak.
 *
 * Here we want entities to be sized like a tile so that they can appear nicely on the level grid. To that
 * end this class does not take a width or a height and instead assumes that the width and height of the
 * entity are the size of tiles.
 *
 * ChronoEntities assume that the coordinates you give them when you create them are in map (tile based)
 * coordinates and not world coordinates. This makes creating them as part of level data easier.
 *
 * This entity supports the following properties:
 *    - 'visible': true or false (default: true)
 *       - controls whether the entity is visible in the map or not; When this property is set to false,
 *         the entity does not render visibly, although it still operates as normal otherwise.
 *    - 'facing': "up", "down", "left" or "right" (default: "right")
 *       - controls what direction the entity is facing. Depending on the entity, this may or may not have
 *         different effects. In the initial property setup, this is a string value, but on instantiation
 *         the facing is converted to an appropriate angle (in degrees).
 *    - 'handedness': "right" or "left" (default: "right")
 *       - This controls if this entity is right or left handed, which affects things such as what
 *         direction it turns when it needs to make an about face. This property is optional, and at
 *         construction time the value is converted to true for "right" and false for "left" to make its
 *         use in code easier.
 *    - 'trigger': string or array of strings (default: none)
 *       - If specified, this is an entity ID or a list of entity ID's for which a trigger should be
 *         invoked whenever this entity gets triggered itself. NOTE: Not all entity subclasses support this
 *         functionality, but all will accept a valid trigger anyway.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x x location for this entity, in map coordinates
 * @param {Number} y y location for this entity, in map coordinates
 * @param {Object} [properties={}] entity specific properties to apply to this entity, or null for none
 * @param {Number} [zOrder=1] the Z-Order of this entity when rendered (smaller numbers go below larger ones)
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.sneak.ChronoEntity = function (name, stage, x, y, properties, zOrder, debugColor)
{
    "use strict";

    // The size of tiles in the game, so that we can use it for our dimensions.
    var tSize = nurdz.game.TILE_SIZE;

    // Modify the list of default properties to make sure that all entities get a visibility property that
    // defaults to true
    this.defaultProperties = nurdz.copyProperties (this.defaultProperties || {}, {
        visible: true,
        facing:  "right"
    });

    /**
     * The position of this entity on the map.
     *
     * The standard position property on an entity is its position on the stage. However, since
     * ChronoSneak is a tile map based game, that requires a lot of converting from world coordinates to
     * map coordinates to be interactive with the map.
     *
     * As a result, ChronoEntity keeps the standard position property and also implements this one that is
     * kept up to date (as long as you use the correct API) so that the entity always knows its map
     * position and still can render itself efficiently.
     *
     * @type {nurdz.game.Point}
     */
    this.mapPosition = new nurdz.game.Point (x, y);

    // Call the super class constructor. We use tile size for the dimensions and we also need to modify
    // the position passed in so that it translates to screen coordinates.
    nurdz.game.Entity.call (this, name, stage, x * tSize, y * tSize, tSize, tSize, properties || {}, zOrder,
                            debugColor);

    // Now convert the facing that we have (which is a string) to the appropriate number value.
    this.setFacing (this.properties.facing);

    // If there is a handedness property, then we will convert it from its string version to a boolean
    // version, where true is used for right handed.
    if (this.properties.handedness)
        this.properties.handedness = (this.properties.handedness == "right");
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.ChronoEntity.prototype = Object.create (nurdz.game.Entity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.ChronoEntity
        }
    });

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.ChronoEntity.prototype.validateProperties = function ()
    {
        // If there is a trigger property and it's a string, convert it to an array with a single element,
        // to make code later easier.
        if (typeof (this.properties.trigger) == "string")
            this.properties.trigger = [this.properties.trigger];

        // The visible property needs to exist and be a boolean, while the trigger does NOT need to exist
        // but has to be an array if it does exist.
        this.isPropertyValid ("visible", "boolean", true);
        this.isPropertyValid ("trigger", "array", false);
        this.isPropertyValid ("facing", "string", true, ["up", "down", "left", "right"]);
        this.isPropertyValid ("handedness", "string", false, ["right", "left"]);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.game.Entity.prototype.validateProperties.call (this);
    };

    /**
     * This helper method takes an angle that is some number of degrees and then normalizes it to ensure
     * that it falls between 0 and 359 degrees (360 becomes 0 on the wrap around).
     *
     * @param {Number} angle the  angle to normalize (in degrees)
     * @returns {Number} the normalized angle
     */
    nurdz.sneak.ChronoEntity.prototype.normalizeAngle = function (angle)
    {
        // Now make sure that the angle is between 0 and 360.
        angle %= 360;
        if (angle < 0)
            angle += 360;
        return angle % 360;
    };

    /**
     * This helper method takes a facing value that is some number of degrees, and then normalizes it.
     * First, the angle is snapped to an increment of 90 degrees. Secondly, it is constrained to values
     * between 0 and 270 (360 becomes 0 on the wrap around).
     *
     * This works even if the new facing is a negative number. in which case it becomes the appropriate
     * positive angle (e.g. -90 becomes 270).
     *
     * @param {Number} facing the facing angle to normalize (in degrees)
     * @returns {Number} the normalized angle
     */
    nurdz.sneak.ChronoEntity.prototype.normalizeFacingAngle = function (facing)
    {
        // Now the facing is a number. We only support multiples of 90, so constrain if needed.
        if (facing % 90)
        {
            // See which increment of 90 we're closer to. If we're closer to the higher value, add
            // whatever else we need in order to get there. If we're smaller, subtract the remainder.
            var remainder = facing % 90;
            if (remainder >= 45)
                facing += 90 - remainder;
            else
                facing -= remainder;
        }

        // Now make sure that the angle is between 0 and 360.
        return this.normalizeAngle(facing);
    };

    /**
     * Given a facing angle in the range of 0-360 (with 360 being interpreted as 0) this method returns
     * the difference between the current facing angle and that facing.
     *
     * This comparison is always done so as to return the minimum possible distance.
     *
     * @param {Number} destinationFacing the destination facing to compare to
     * @returns {Number} the distance in degrees between the current facing of this entity and the
     * destination facing.
     */
    nurdz.sneak.ChronoEntity.prototype.angleToNewFacing = function (destinationFacing)
    {
        return 180 - Math.abs (Math.abs (this.properties.facing - destinationFacing) - 180);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This is a helper method which can be used to determine what facing an entity should take when it
     * wants to alter its facing from its current facing to some destination facing.
     *
     * This assumes that the entity would be smart enough to always want to turn the shortest possible
     * way, such that if it was facing up and wanted to face right, it would turn there directly and not
     * rotate to the left for three steps.
     *
     * In the case of an about face (the two facings are diametrically opposed), the entity chooses to
     * turn either left or right based its handedness property, with a default of turning to the right if
     * such a property is not set.
     *
     * @param {Number} destinationFacing the facing to turn towards
     * @returns {Number} the facing to take in order to turn towards the destination facing
     */
    nurdz.sneak.ChronoEntity.prototype.calculateTurnFacing = function (destinationFacing)
    {
        // Check properties to see if this entity wants to turn to the right (true) or left (false) when
        // it needs to do an about face. We have to do some magic here because the usual trick of using ||
        // does not work with booleans. Here the only time you get a false is when it is explicitly set
        // to false, and everything else (including null and undefined) becomes true.
        var aboutFaceToRight = this.properties.handedness !== false;

        // Calculate the difference between the current facing and the facing that we want to turn
        // towards. This always comes out to a positive value and is the shortest possible turn that can
        // be made to get to the destination (e.g. facing down and wanting to turn to face the right comes
        // out as 90 and not as 270).
        var turnDistance = this.angleToNewFacing (destinationFacing);

        // If the turn distance is only 90 degrees, then we can return the destination facing directly; we
        // can turn 90 degrees at a time and we're 90 degrees away, so just do it.
        if (turnDistance <= 90)
            return destinationFacing;

        // The only other option is 180 degrees, so we are diametrically opposed to where we want to go
        // and we need to make an about face. If we want to turn to the right, we add 90 degrees, and we
        // subtract 90 to turn to the left. The default is to go to the right if we don't otherwise know.
        return this.normalizeFacingAngle (this.properties.facing + (aboutFaceToRight ? 90 : -90));
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
    nurdz.sneak.ChronoEntity.prototype.setFacing = function (newFacing)
    {
        // If we got a string, then convert it to a number.
        if (typeof (newFacing) == "string")
        {
            // These textual facing values should be converted into degrees. Rotations start with 0 on the
            // right and proceeding clockwise as angles get bigger.
            switch (newFacing)
            {
                case "right":
                    newFacing = 0;
                    break;

                case "down":
                    newFacing = 90;
                    break;

                case "left":
                    newFacing = 180;
                    break;

                case "up":
                    newFacing = 270;
                    break;

                // In case something goes awry.
                default:
                    console.log ("Invalid facing string: ", newFacing);
                    newFacing = 0;
                    break;
            }
        }

        // Set the property now.
        this.properties.facing = this.normalizeFacingAngle (newFacing);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this entity by setting its position on the stage (world coordinates). The
     * position of the entity on the map will automatically be updated.
     *
     * @param {nurdz.game.Point} point the point to set the position to.
     */
    nurdz.sneak.ChronoEntity.prototype.setStagePosition = function (point)
    {
        this.setStagePositionXY (point.x, point.y);
    };

    /**
     * Set the position of this entity by setting its position on the stage (world coordinates). The
     * position of the entity on the map will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.sneak.ChronoEntity.prototype.setStagePositionXY = function (x, y)
    {
        this.position.setToXY (x, y);
        this.mapPosition = this.position.copyReduced (nurdz.game.TILE_SIZE);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this entity by setting its position in the level (map coordinates). The
     * position of the entity on the stage will automatically be updated.
     *
     * @param {nurdz.game.Point} point the point to set the position to.
     */
    nurdz.sneak.ChronoEntity.prototype.setMapPosition = function (point)
    {
        this.setMapPositionXY (point.x, point.y);
    };

    /**
     * Set the position of this entity by setting its position in the level (map coordinates). The
     * position of the entity on the stage will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.sneak.ChronoEntity.prototype.setMapPositionXY = function (x, y)
    {
        this.mapPosition.setToXY (x, y);
        this.position = this.mapPosition.copyScaled (nurdz.game.TILE_SIZE);
    };

    /**
     * This method finds all entities on the current level that have an ID that matches the list of ID
     * values in the "trigger" property of this entity, and invokes their trigger methods specifying this
     * object as the source of the trigger event.
     *
     * In order for this to work, the current scene needs to have a property named level that represents
     * the current level, and this object needs to have a property named "trigger" that specifies either a
     * string with the ID of a single entity to trigger, or an array of entity IDs to trigger.
     *
     * If either of these prerequisites are not fulfilled, this silently does nothing.
     */
    nurdz.sneak.ChronoEntity.prototype.triggerLinkedEntities = function ()
    {
        // Get the current stage. If it has a level, get it to trigger all entities for us based on our
        // trigger property.
        var scene = this.stage.currentScene ();
        if (scene.level != null)
            scene.level.triggerEntitiesWithIDs (/** @type {String[]} */this.properties.trigger, this);
    };

    /**
     * ChronoEntity instances are actors, which means tha they have an update and a render function. The
     * update function in a ChronoEntity is meant to do things like visually update its appearance. The step
     * function is used to give the entity a "tick" to see if there is something that it wants to do. This
     * might be initiate a chase, decide a door needs to close, etc.
     *
     * This is a conceit of ChronoSneak, which strictly controls when entities get a chance to update
     * their current state due to its turn based nature.
     *
     * @param {nurdz.game.Level} level the level the entity is contained in
     */
    nurdz.sneak.ChronoEntity.prototype.step = function (level)
    {
    };

    /**
     * In ChronoSneak, all entities are the size of a tile and have an inherent facing which might affect
     * their rendering.
     *
     * For such entities, this method exists as a convenience. It will translate (and optionally rotate)
     * the stage so that the origin is at the center of the canvas location representing the tile that
     * this entity is on.
     *
     * The state of the canvas is saved with this call and restored in the doneRendering() call, which
     * must always pair with this method.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @param {Number|null} [angle=null] the amount to rotate, or null if not required
     * @see nurdz.sneak.ChronoEntity.endRendering
     */
    nurdz.sneak.ChronoEntity.prototype.startRendering = function (stage, angle)
    {
        stage.translateAndRotate (this.position.x + (this.width / 2),
                                  this.position.y + (this.width / 2),
                                  angle);
    };

    /**
     * This undoes the translation and rotation done to the stage provided that was done via a call to
     * startRendering(). This should always be paired with a call to that method.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @see nurdz.sneak.ChronoEntity.startRendering
     */
    nurdz.sneak.ChronoEntity.prototype.endRendering = function (stage)
    {
        stage.restore ();
    };

    /**
     * Render this chrono entity to the stage provided.
     *
     * This base class will render either a rectangle in the debug color (if the entity has a property
     * that indicates that it should be visible) or a small X if the entity is not supposed to be visible.
     *
     * This allows for tracking during initial debugging of the engine by allowing some visible recognition
     * of otherwise invisible entities without having to see their actual representations.
     *
     * NOTE: The base class implementation may use startRendering()/endRendering(), so take care when
     * chaining to this method if you also do your own rendering.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.ChronoEntity.prototype.render = function (stage)
    {
        if (this.properties.visible)
            stage.fillRect (this.position.x, this.position.y, this.width, this.height, this.debugColor);
        else
        {
            this.startRendering (stage);
            var offset = Math.floor (this.width * 0.1875);

            stage.setLineStyle (this.debugColor);
            stage.canvasContext.beginPath ();
            stage.canvasContext.moveTo (-offset, -offset);
            stage.canvasContext.lineTo (offset, offset);
            stage.canvasContext.moveTo (-offset, offset);
            stage.canvasContext.lineTo (offset, -offset);
            stage.canvasContext.stroke ();
            this.endRendering (stage);
        }
    };

    //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * This method queries whether the entity provided is able to interact with this entity. This can be as
     * simple or as introspective as desired, e.g.) any class of entity, only a certain class of entity,
     * or only entities with certain properties.
     *
     * The default is to deny access to all interaction.
     *
     * @returns {Boolean} true if this entity can be interacted with by the passed in entity, or false
     * otherwise.
     */
    nurdz.sneak.ChronoEntity.prototype.canInteractWith = function (otherEntity)
    {
        // By default, nothing is interactive
        return false;
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.ChronoEntity.prototype.toString = function ()
    {
        return String.format ("[ChronoEntity name='{0}' pos={1}]", this.name, this.mapPosition.toString());
    };
} ());
