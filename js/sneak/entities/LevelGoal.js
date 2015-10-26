/**
 * This is the entity which, when triggered, indicates that the level has been completed. This could
 * happen by either stepping onto the goal or also by otherwise triggering it, such as with a button or
 * console.
 *
 * This entity supports the following properties:
 *    - 'visible': true or false (default: true)
 *       - Controls whether the goal is rendered on the screen or or not.
 *
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.LevelGoal = function (x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {visible: true};

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "LevelGoal", x, y, properties, 'yellow');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.LevelGoal.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.LevelGoal
        }
    });

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.LevelGoal.prototype.blocksActorMovement = function ()
    {
        // The player can walk over the goal to trigger it, so we can't block.
        return false;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.LevelGoal.prototype.render = function (stage)
    {
        // If the entity is visible, draw a target. Otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            // For aid of initial debugging of things, if the
            // Calculate the center of the tile that we're on.
            var x = this.position.x + (this.width / 2);
            var y = this.position.y + (this.height / 2);
            var r = this.width / 2;

            // This is redundant, but it turns out that for our purposes here, I don't care. It renders a
            // target as three circles when it could conceivably use only two with a hole in the center of the
            // second one or some such. Life is too short.
            stage.colorCircle (x, y, r - 2, 'red');
            stage.colorCircle (x, y, r - 7, 'white');
            stage.colorCircle (x, y, r - 10, 'red');
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };
} ());