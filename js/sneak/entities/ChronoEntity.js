/**
 * A simple subclass of Entity that is meant to be used in ChronoSneak.
 *
 * Here we almost always want entities to be sized like a tile so that they can appear nicely on the level
 * grid. To that end this class does not take a width or a height and instead assumes that the width and
 * height of the entity are the size of tiles in ChronoSneak.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {Number} x x location for this entity, in map coordinates
 * @param {Number} y y location for this entity, in map coordinates
 * @param {Object} [properties={}] entity specific properties to apply to this entity, or null for none
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.sneak.ChronoEntity = function (name, x, y, properties, debugColor)
{
    "use strict";

    // The size of tiles in the game, so that we can use it for our dimensions.
    var tSize = nurdz.sneak.constants.TILE_SIZE;

    // Modify the list of default properties to make sure that all entities get a visibility property that
    // defaults to true
    this.defaultProperties = nurdz.copyProperties (this.defaultProperties || {}, {visible: true});

    // Call the super class constructor. We use tile size for the dimensions and we also need to modify
    // the position passed in so that it translates to screen coordinates.
    nurdz.game.Entity.call (this, name, x * tSize, y * tSize, tSize, tSize, properties || {}, debugColor);
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
        // The visible property is not strictly required, but if it exists, it needs to be false.
        this.isPropertyValid ("visible", "boolean", false);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.game.Entity.prototype.validateProperties.call (this);
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
            stage.colorRect (this.position.x, this.position.y, this.width, this.height, this.debugColor);
        else
        {
            var x = this.position.x;
            var y = this.position.y;

            stage.canvasContext.fillStyle = this.debugColor;
            stage.canvasContext.beginPath ();
            stage.canvasContext.moveTo (x + 10, y + 10);
            stage.canvasContext.lineTo (x + this.width - 10, y + this.height - 10);
            stage.canvasContext.moveTo (x + 10, y + this.height - 10);
            stage.canvasContext.lineTo (x + this.width - 10, y + 10);
            stage.canvasContext.stroke ();
        }
    };
} ());
