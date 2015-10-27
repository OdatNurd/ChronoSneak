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
     * Load the level that we will be displaying.
     *
     * @type {nurdz.game.Level}
     */
    this.level = new nurdz.game.Level (nurdz.sneak.levels.level1, stage);

    /**
     * The size of tiles in the game. Cached for quicker access.
     *
     * @type {Number}
     */
    this.tileSize = nurdz.sneak.constants.TILE_SIZE;

    /**
     * The current position of the mouse, or null if we don't know yet.
     *
     * @type {nurdz.game.Point|null}
     */
    this.mousePos = null;

    /**
     * When debugging, this is the map location that the current debug information is for, or null if
     * there is no debug info yet.
     *
     * @type {nurdz.game.Point|null}
     */
    this.debugPos = null;

    /**
     * The debug text to render. This contains the map location the mouse is over, the tile, and any
     * entities. When the location the mouse is over changes, this gets recalculated. It's null when there
     * is no text yet.
     *
     * @type {String|null}
     *
     */
    this.debugTxt = null;

    // Attempt to find the player start entity so that we know where to start the player for this run. If
    // this does not have exactly one entity, the level is invalid.
    var playerStartPos = this.level.entitiesWithName ("PlayerStartEntity");
    if (playerStartPos.length != 1)
        throw new Error ("Unable to determine player start position.");
    else
        console.log ("Using entity '" + playerStartPos[0].properties.id + "' as player start location");

    /**
     * The player in the game. We create the player at the location of the player start in our level.
     *
     * @type {nurdz.sneak.Player}
     */
    this.player = new nurdz.sneak.Player (stage,
                                          playerStartPos[0].position.x,
                                          playerStartPos[0].position.y);


    // Stick a player onto the screen. This will make the update and render methods of the player get
    // automatically invoked every frame.
    this.addActor (this.player);

    // Add the list of entities in the level to the list of actors to be displayed. These come after the
    // player, so that they render over the player.
    this.addActorArray (this.level.entities);
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
     * Invoked when we become active. We use this to make sure some persistent rendering properties are
     * set the way we want them for this scene.
     *
     * This gets invoked after the current scene is told that it is deactivating. The parameter passed in
     * is the scene that was previously active. This will be null if this is the first ever scene in the game.
     *
     * The next call made of the scene will be its update method for the next frame.
     *
     * @param {nurdz.game.Scene|null} previousScene
     */
    nurdz.sneak.TitleScene.prototype.activating = function (previousScene)
    {
        this.stage.canvasContext.font = "20px monospace";

        nurdz.game.Scene.prototype.activating.call (this, previousScene);
    };

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     */
    nurdz.sneak.TitleScene.prototype.update = function ()
    {
        // Let the super class call update on all registered actors.
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
        // Clear the screen and render the level.
        this.stage.clear ();
        this.level.render (this.stage);

        // Call the super to display all actors registered with the stage. This includes the player.
        nurdz.game.Scene.prototype.render.call (this);

        // Display our debug text at the bottom of the screen now
        if (this.debugTxt != null)
            this.stage.colorText (this.debugTxt, 16, this.stage.height - 6, 'white');
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
        /**
         * The current position of the mouse, or null if we don't know yet.
         * @type {nurdz.game.Point|null}
         */
        this.mousePos = this.stage.calculateMousePos (eventObj);

        // Calculate the map positions of where the mouse is.
        var mX = Math.floor (this.mousePos.x / this.tileSize);
        var mY = Math.floor (this.mousePos.y / this.tileSize);

        // If there is no debug position, or there is but it is different than where the mouse is now,
        // calculate new debug text.
        if (this.debugPos == null || (this.debugPos.x != mX || this.debugPos.y != mY))
        {
            // Get the tile and any entities under the mouse.
            var mTile = this.level.tileAt (mX, mY);
            var entities = this.level.entitiesAt (mX, mY);

            this.debugTxt = "[" + mX + ", " + mY + "]";
            if (mTile != null)
                this.debugTxt += "=> " + mTile.name;
            if (entities != null && entities.length > 0)
            {
                for (var i = 0 ; i < entities.length ; i++)
                {
                    this.debugTxt += ", " + entities[i].name + "{" + (entities[i].properties.id || "?") + "}";
                }
            }

            // Save the debug position now.
            if (this.debugPos == null)
                this.debugPos = new nurdz.game.Point (mX, mY);
            else
            {
                this.debugPos.x = mX;
                this.debugPos.y = mY;
            }
        }
    };

    /**
     * Handle keyboard down events for the title screen scene.
     *
     * @param {Event} eventObj the keyboard event
     * @returns {Boolean} true if we handle the key event, false otherwise
     */
    nurdz.sneak.TitleScene.prototype.inputKeyDown = function (eventObj)
    {
        // Calculate the map location where the player is by converting from screen coordinates to map
        // coordinates. This is kind of nasty.
        var mapX = this.player.position.x / this.tileSize;
        var mapY = this.player.position.y / this.tileSize;

        /**
         * When the input represents a movement key, this stores the map position the player would move to
         * for later checking.
         *
         * @type {nurdz.game.Point|null} */
        var targetPos = null;

        /**
         * When the input represents a movement key, this stores the translation to apply to the player to
         * perform the move, if the move is valid.
         *
         * @type {nurdz.game.Point|null} */
        var translatePos = null;

        // Check for valid keys.
        // If a valid movement key was seen, check to see if the position that was moved to is blocked.

        switch (eventObj.keyCode)
        {
            case this.keys.KEY_UP:
            case this.keys.KEY_W:
                targetPos = new nurdz.game.Point (mapX, mapY - 1);
                translatePos = new nurdz.game.Point (0, -this.player.height);
                break;

            case this.keys.KEY_DOWN:
            case this.keys.KEY_S:
                targetPos = new nurdz.game.Point (mapX, mapY + 1);
                translatePos = new nurdz.game.Point (0, this.player.height);
                break;

            case this.keys.KEY_LEFT:
            case this.keys.KEY_A:
                targetPos = new nurdz.game.Point (mapX - 1, mapY);
                translatePos = new nurdz.game.Point (-this.player.width, 0);
                break;

            case this.keys.KEY_RIGHT:
            case this.keys.KEY_D:
                targetPos = new nurdz.game.Point (mapX + 1, mapY);
                translatePos = new nurdz.game.Point (this.player.width, 0);
                break;

            case this.keys.KEY_SPACEBAR:
            case this.keys.KEY_Q:
                console.log ("Interacting with things is not implemented yet");
                break;
        }
        if (targetPos != null && this.level.isBlockedAt (targetPos.x, targetPos.y) == false)
        {
            // Yep, translate the player accordingly and then step all of the entities, as they have a
            // turn now since the player moved.
            this.player.position.translate (translatePos.x, translatePos.y);
            this.level.stepAllEntities ();

            // Now find all entities at the position that the player moved to, and trigger them all.
            var entities = this.level.entitiesAt (targetPos.x, targetPos.y);
            for (var i = 0 ; i < entities.length ; i++)
                entities[i].triggerTouch (this.player);
            return true;
        }

        // We ignored the key
        return false;
    }
} ());
