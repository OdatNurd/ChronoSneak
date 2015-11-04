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

    // Now convert the facing that we have (which is a string) to the appropriate number value. Right is 0
    // and angles increase in a clockwise manner.
    switch (this.properties.facing)
    {
        case "right":
            this.properties.facing = 0;
            break;

        case "down":
            this.properties.facing = 90;
            break;

        case "left":
            this.properties.facing = 180;
            break;

        case "up":
            this.properties.facing = 270;
            break;
    }
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

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.game.Entity.prototype.validateProperties.call (this);
    };

    /**
     * This method queries whether the player is able to interact with this entity using the interaction
     * keys. Any entity which returns false from this cannot be interacted with. Examples of that include
     * marker entities like waypoints.
     *
     * @returns {Boolean} true if this entity is interactive, or false otherwise.
     */
    nurdz.sneak.ChronoEntity.prototype.isInteractive = function ()
    {
        // By default, nothing is interactive
        return false;
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
