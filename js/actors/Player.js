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
            value:        nurdz.game.Actor
        }
    });

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
