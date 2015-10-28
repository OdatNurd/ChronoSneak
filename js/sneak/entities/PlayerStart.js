/**
 * An entity whose job it is to record the location at which the player starts in a level.
 *
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.PlayerStartEntity = function (x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {};

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "PlayerStartEntity", null, x, y, properties, -10, 'white');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.PlayerStartEntity.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.PlayerStartEntity
        }
    });

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.PlayerStartEntity.prototype.blocksActorMovement = function ()
    {
        // The player start entity is just a marker, so don't make it block anything.
        return false;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.PlayerStartEntity.prototype.render = function (stage)
    {
        // If the entity is visible, draw a target. Otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            var x = this.position.x;
            var y = this.position.y;

            stage.canvasContext.strokeStyle = this.debugColor;
            stage.canvasContext.lineWidth = 3;
            stage.canvasContext.lineCap = 'round';
            stage.canvasContext.beginPath ();
            stage.canvasContext.moveTo (x + 5, y + 5);
            stage.canvasContext.lineTo (x + this.width - 5, y + this.height - 5);
            stage.canvasContext.moveTo (x + 5, y + this.height - 5);
            stage.canvasContext.lineTo (x + this.width - 5, y + 5);
            stage.canvasContext.stroke ();
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };
} ());
