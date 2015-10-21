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
     * @type {nurdz.game.Point|null}
     */
    this.mousePos = null;

    /**
     * Load the level that we will be displaying.
     *
     * @type {nurdz.sneak.LevelData}
     */
    this.level = new nurdz.sneak.Level (nurdz.sneak.levels.level1);

    /**
     * The player in the game. We create the player at the location of the player start in our level.
     *
     * @type {nurdz.sneak.Player}
     */
    this.player = new nurdz.sneak.Player (this.level.playerStartPos.x * nurdz.sneak.constants.TILE_SIZE,
                                          this.level.playerStartPos.y * nurdz.sneak.constants.TILE_SIZE);


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
            this.player.setPosition (this.mousePos);

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
        // Clear the screen, display the level, then get the super to render. Since the player is
        // registered as an actor on the stage, it will get drawn by the super.
        this.stage.clear ();
        this.level.render (this.stage);
        nurdz.game.Scene.prototype.render.call (this);
    };


    /**
     * Handle keyboard down events for the title screen scene.
     *
     * @param {Event} eventObj the keyboard event
     * @returns {Boolean} true if we handle the key event, false otherwise
     */
    nurdz.sneak.TitleScene.prototype.inputKeyDown = function (eventObj)
    {
        switch (eventObj.keyCode)
        {
            case this.keys.KEY_UP:
                this.player.position.translate (0, -this.player.height);
                return true;

            case this.keys.KEY_DOWN:
                this.player.position.translate (0, this.player.height);
                return true;

            case this.keys.KEY_LEFT:
                this.player.position.translate (-this.player.width, 0);
                return true;

            case this.keys.KEY_RIGHT:
                this.player.position.translate (this.player.width, 0);
                return true;
        }
        return false;
    }
} ());
