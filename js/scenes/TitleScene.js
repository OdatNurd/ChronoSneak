/**
 * A subclass of the Scene class that handles all action on the title screen.
 *
 * @param {nurdz.game.Stage} stage the stage that will be associated with this scene
 * @see nurdz.game.Scene
 * @extends nurdz.game.Scene
 * @constructor
 */
nurdz.sneak.TitleScene = function (stage)
{
    "use strict";

    // Call the super constructor.
    nurdz.game.Scene.call (this, "title screen", stage);

    /**
     * The current or last known mouse position on the canvas. It's null before the mouse enters the
     * canvas for the first time.
     *
     * @type {{x: number, y: number}|null}
     */
    this.mousePos = null;

    /**
     * The player in the game.
     *
     * @type {nurdz.sneak.Player}
     */
    this.player = new nurdz.sneak.Player (80, 80);

    // Stick a player onto the screen. This will make the update and render methods of the player get
    // automatically invoked every frame.
    this.addActor (this.player);
};

(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.TitleScene.prototype = Object.create (nurdz.game.Scene.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.TitleScene
        }
    });

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     */
    nurdz.sneak.TitleScene.prototype.update = function ()
    {
        // If we have a mouse position, warp the player to it.
        if (this.mousePos != null)
        {
            this.player.x = this.mousePos.x;
            this.player.y = this.mousePos.y;
        }

        // Call the super class version now.
        nurdz.game.Scene.prototype.update.call (this);
    };

    /**
     * This method is invoked every frame after the update() method is invoked to allow this scene to
     * render to the screen everything that it visually wants to appear.
     *
     * This base version invokes the render method for all actors that are currently registered with the
     * stage.
     */
    nurdz.sneak.TitleScene.prototype.render = function ()
    {
        // Clear the screen, then get the super to render.
        this.stage.clear ();
        nurdz.game.Scene.prototype.render.call (this);
    };


    /**
     * This gets triggered while the game is running, this scene is the current scene, and the mouse
     * moves over the stage.
     *
     * @param {Event} eventObj the event object
     * @see nurdz.game.Stage.calculateMousePos
     */
    nurdz.sneak.TitleScene.prototype.inputMouseMove = function (eventObj)
    {
        // Capture the mouse location.
        this.mousePos = this.stage.calculateMousePos (eventObj);
    };
} ());
