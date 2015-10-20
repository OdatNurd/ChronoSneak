/**
 * A subclass of the Scene class that handles all action on the title screen.
 *
 * @param {nurdz.game.Stage} stage the stage that will be associated with this scene
 * @see nurdz.game.Scene
 * @extends nurdz.game.Scene
 * @constructor
 */
nurdz.game.TitleScene = function (stage)
{
    "use strict";

    // Call the super constructor.
    nurdz.game.Scene.call (this, "title screen", stage);

    this.addActor (new nurdz.sneak.Player (80, 80))
};

(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.game.TitleScene.prototype = Object.create (nurdz.game.Scene.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.game.Scene
        }
    });
} ());
