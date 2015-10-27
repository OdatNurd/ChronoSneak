/**
 * The actor that
 * Description of class and its parameters
 *
 * @param {nurdz.game.Stage|null} stage the stage that will manage this entity or null if it is not known yet
 * @param {Number} x the initial X location for this player actor
 * @param {Number} y the initial Y location for this player actor
 * @constructor
 */
nurdz.sneak.Player = function (stage, x, y)
{
    "use strict";

    // Pull the size of tiles.
    var tileSize = nurdz.sneak.constants.TILE_SIZE;

    // Call the super class constructor.
    nurdz.game.Actor.call (this, 'PlayerActor', stage, x, y, tileSize, tileSize, 'green');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Player.prototype = Object.create (nurdz.game.Actor.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Player
        }
    });

    /**
     * Called every frame to update the player object. We make sure it never leaves the bounds of the screen.
     *
     * @param {nurdz.game.Stage} stage the stage the player is on
     */
    nurdz.sneak.Player.prototype.update = function (stage)
    {
        // Make sure the player does not leave the stage.
        this.position.clampX (0, stage.width - this.width);
        this.position.clampY (0, stage.height - this.height);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Player.prototype.toString = function ()
    {
        return "[Player Actor: pos=" + this.position.toString () +  "]";
    };
} ());
