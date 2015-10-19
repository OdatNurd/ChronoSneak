/**
 * A subclass of the Scene class that handles all action on the title screen.
 *
 * @see nurdz.game.Scene
 * @extends nurdz.game.Scene
 * @constructor
 */
nurdz.game.TitleScene = function ()
{
    "use strict";

    // Call the super constructor.
    nurdz.game.Scene.call (this, "title screen");
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

    /**
     * This method is invoked every frame after the update() method is invoked to allow this scene to
     * render to the screen everything that it visually wants to appear.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.game.TitleScene.prototype.render = function (stage)
    {
        stage.colorRect (80, 80, 200, 100, 'green');
    };
} ());
