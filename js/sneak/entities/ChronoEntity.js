/**
 * A simple subclass of Entity that is meant to be used in ChronoSneak.
 *
 * Here we almost always want entities to be sized like a tile so that they can appear nicely on the level
 * grid. To that end this class does not take a width or a height and instead assumes that the width and
 * height of the entity are the size of tiles in ChronoSneak.
 *
 * This entity supports the following properties:
 *    - 'visible': true or false (default: true)
 *       - controls whether the entity is visible in the map or not
 *    - 'trigger': string or array of strings (default: none)
 *       - If specified, this is an entity ID or a list of entity ID's for which a trigger should be
 *         invoked whenever this entity gets triggered. NOTE: Not all entity subclasses support this
 *         functionality, but all will accept a valid trigger anyway.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {nurdz.game.Stage|null} stage the stage that will manage this entity or null if it is not known yet
 * @param {Number} x x location for this entity, in map coordinates
 * @param {Number} y y location for this entity, in map coordinates
 * @param {Object} [properties={}] entity specific properties to apply to this entity, or null for none
 * @param {Number} [zOrder=1] the Z-Order of this actor when rendered (smaller numbers go below larger ones)
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
    this.defaultProperties = nurdz.copyProperties (this.defaultProperties || {}, {visible: true});

    // Call the super class constructor. We use tile size for the dimensions and we also need to modify
    // the position passed in so that it translates to screen coordinates.
    nurdz.game.Entity.call (this, name, stage, x * tSize, y * tSize, tSize, tSize, properties || {}, zOrder,
                            debugColor);
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
        // The visible property needs to exist and be a boolean
        this.isPropertyValid ("visible", "boolean", true);

        // If there is a property named trigger, it should have a type that is either a string or an
        // array. If it's not, we will use a bogus call to isPropertyValid to cause it to generate an
        // error for us.
        if (this.properties.trigger != null)
        {
            // Cache it
            var trigger = this.properties.trigger;

            // If the trigger is not a string and not an array, that's bad. This invocation of instanceof
            // will fail because the type given is not valid.
            if (typeof (trigger) != "string" && Array.isArray (trigger) == false)
                this.isPropertyValid ("trigger", "string|array", false);
        }

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.game.Entity.prototype.validateProperties.call (this);
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
            scene.level.triggerEntitiesWithIDs (/** @type {String} */ this.properties.trigger, this);
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
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.ChronoEntity.prototype.render = function (stage)
    {
        if (this.properties.visible)
            stage.fillRect (this.position.x, this.position.y, this.width, this.height, this.debugColor);
        else
        {
            var x = this.position.x;
            var y = this.position.y;

            stage.setLineStyle (this.debugColor);
            stage.canvasContext.beginPath ();
            stage.canvasContext.moveTo (x + 10, y + 10);
            stage.canvasContext.lineTo (x + this.width - 10, y + this.height - 10);
            stage.canvasContext.moveTo (x + 10, y + this.height - 10);
            stage.canvasContext.lineTo (x + this.width - 10, y + 10);
            stage.canvasContext.stroke ();
        }
    };
} ());
