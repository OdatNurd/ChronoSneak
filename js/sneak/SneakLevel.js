/**
 * This is a subclass of Level for ChronoSneak. It contains extra code that can invoke the step() function
 * on all entities, which are expected to be instances of ChronoEntity.
 *
 * @param {nurdz.game.Stage} stage the stage that owns the level
 * @param {nurdz.game.LevelData} levelData the data to display initially
 * @constructor
 */
nurdz.sneak.SneakLevel = function (stage, levelData)
{
    "use strict";

    // Call the super class constructor.
    nurdz.game.Level.call (this, stage, levelData);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.SneakLevel.prototype = Object.create (nurdz.game.Level.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.SneakLevel
        }
    });

    /**
     * This method will invoke the step method on all entities that currently exist on the map. In
     * ChronoSneak, this gets invoked every time we move the player, so that all entities can get a logic
     * step whenever the player takes an action.
     */
    nurdz.sneak.SneakLevel.prototype.stepAllEntities = function ()
    {
        for (var i = 0 ; i < this.entities.length ; i++)
            this.entities[i].step (this);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.SneakLevel.prototype.toString = function ()
    {
        return "[SneakLevel data=" + this.levelData + "]";
    };
} ());