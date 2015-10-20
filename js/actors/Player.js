/**
 * Description of class and its parameters
 *
 * @param {Number} x the initial X location for this player actor
 * @param {Number} y the initial Y location for this player actor
 * @constructor
 */
nurdz.sneak.Player = function (x, y)
{
    "use strict";

    // Call the super class constructor.
    nurdz.game.Actor.call (this, 'PlayerActor', x, y, 64, 64, 'green');
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
        if (this.x < 0)
            this.x = 0;

        if (this.y < 0)
            this.y = 0;

        if (this.x > stage.width - this.width)
            this.x = stage.width - this.width;

        if (this.y > stage.height - this.height)
            this.y = stage.height - this.height;
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Player.prototype.toString = function ()
    {
        return "[Player Actor: " + this.x + ", " + this.y + "]";
    };
} ());