/**
 * A subclass of the Scene class that handles all action on the title screen.
 *
 * @param {nurdz.game.Stage} stage the stage that will be associated with this scene
 * @see nurdz.game.Scene
 * @extends nurdz.game.Scene
 * @constructor
 */
nurdz.sneak.GameScene = function (stage)
{
    "use strict";

    // Call the super constructor.
    nurdz.game.Scene.call (this, "Game Screen", stage);

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

    /**
     * When the debugging key is pressed, this will be filled with information that allows the render
     * method to draw arrows that connect all entities at the debugPos with the entities that their
     * properties will trigger. This allows you to visually see what affects what.
     *
     * @type {nurdz.game.Point[][]|null}
     */
    this.debugTargetLinks = null;

    // Spawn all guards now, by having them validate their waypoints and jumping to the initial waypoint
    // where they should start.
    this.spawnGuards ();

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

    // Add the player and all of the entities in the level to the list of actors in the scene, so that the
    // update and render methods of all of them will get invoked automatically.
    //
    // NOTE: Since this is supposed to be a turn based game, the "update" method can be used to change the
    // visual appearance of an actor/entity, but all of the internal logic regarding updates, position
    // changes etc should happen in the step() method. This only gets invoked by the scene when the player
    // actually takes a turn or does something that burns time (like waiting).
    this.addActor (this.player);
    this.addActorArray (this.level.entities);
    this.sortActors ();
};

(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.GameScene.prototype = Object.create (nurdz.game.Scene.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.GameScene
        }
    });

    /**
     * Find all entities in the current level that are guards and have them jump to the start of their
     * patrols.
     */
    nurdz.sneak.GameScene.prototype.spawnGuards = function ()
    {
        // Iterate over all entities and for every guard found, jump them to their spawn location.
        for (var i = 0 ; i < this.level.entities.length ; i++)
        {
            if (this.level.entities[i] instanceof nurdz.sneak.GuardBase)
            {
                this.level.entities[i].validateWaypoints (this.level);
                this.level.entities[i].jumpToSpawn (this.level);
            }
        }
    };

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
    nurdz.sneak.GameScene.prototype.activating = function (previousScene)
    {
        this.stage.canvasContext.font = "20px monospace";

        nurdz.game.Scene.prototype.activating.call (this, previousScene);
    };

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     */
    nurdz.sneak.GameScene.prototype.update = function ()
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
    nurdz.sneak.GameScene.prototype.render = function ()
    {
        // Clear the screen and render the level.
        this.stage.clear ();
        this.level.render (this.stage);

        // Call the super to display all actors registered with the stage. This includes the player.
        nurdz.game.Scene.prototype.render.call (this);

        // Display our debug text at the bottom of the screen now
        if (this.debugTxt != null)
            this.stage.drawTxt (this.debugTxt, 16, this.stage.height - 6, 'white');

        // If there are debug target links, render them now.
        if (this.debugTargetLinks != null)
        {
            // Set the arrow style for the arrows that we are going to draw.
            this.stage.setArrowStyle ("red", 2);

            // The value of debugTargetLinks is an array that contains information about each entity that
            // has targets. Iterate over them.
            for (var i = 0; i < this.debugTargetLinks.length; i++)
            {
                // Get the info out for this set of entity links.
                var info = this.debugTargetLinks[i];

                // The first element in the info array is the position that the actual entity is at. This
                // will be the location where the link arrow starts, and is an array of two numbers.
                var startPos = info[0];

                // All other elements are arrays that specify the end point of a link arrow
                for (var j = 1; j < info.length; j++)
                {
                    var endPos = info[j];
                    this.stage.drawArrow (startPos.x, startPos.y, endPos.x, endPos.y);
                }
            }
        }
    };

    /**
     * This gets triggered while the game is running, this scene is the current scene, and the mouse
     * moves over the stage.
     *
     * @param {Event} eventObj the event object
     * @see nurdz.game.Stage.calculateMousePos
     */
    nurdz.sneak.GameScene.prototype.inputMouseMove = function (eventObj)
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
                for (var i = 0; i < entities.length; i++)
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

            // Remove the target links now because the position has changed. The user can press the button
            // to calculate new ones.
            this.debugTargetLinks = null;
        }
    };

    /**
     * Given an entity, this checks to see if the entity contains any triggers that would trigger another
     * entity. If it does not, null is returned.
     *
     * Otherwise, the return value is an array of points, where the first element is the point that
     * represents the entity passed in and the rest of the elements are the points for each of the linked
     * entities.
     *
     * @param {nurdz.game.Entity} entity the entity to calculate trigger links for
     * @returns {nurdz.game.Point[]|null}
     */
    nurdz.sneak.GameScene.prototype.calculateEntityTriggerLinks = function (entity)
    {
        // If this entity does not have a trigger property, there's nothing to doo.
        if (entity.properties.trigger == null)
            return null;

        // Get the list of entities that this entity will trigger. If the list is empty, we still have
        // nothing to do.
        var links = this.level.entitiesWithIDs (/** @type {String} */ entity.properties.trigger);
        if (links.length == 0)
            return null;

        // Create our return value. This will hold points. The first element is the location of the entity
        // we were given, and the rest of the elements are the positions of the entities that will be
        // triggered. We offset all positions by half a tile so that the arrows render pointing at the
        // center of the associated tiles and not at the corner.
        /** @type nurdz.game.Point[] */
        var retVal = [];
        var offset = nurdz.sneak.constants.TILE_SIZE / 2;

        // Store the location of this entity, and then the positions of all of the linked entities.
        retVal.push (entity.position.copyWithTranslate (offset, offset));
        for (var i = 0; i < links.length; i++)
            retVal.push (links[i].position.copyWithTranslate (offset, offset));

        return retVal;
    };

    /**
     * When this is invoked, the complete entity information for all entities at the current debug
     * location (where the mouse is currently positioned) will be displayed to the console.
     *
     * Additionally, for all entities at the current debug location that have triggers, this will set up
     * the instance variable that allows the rendering function to display the links visually.
     */
    nurdz.sneak.GameScene.prototype.displayEntityInfo = function ()
    {
        // If there is not a debug position right now, there's no information to display.
        if (this.debugPos == null)
            return;

        // Collect all of the entities at the debug location. If there are any, we can display some
        // information about them.
        var entities = this.level.entitiesAt (this.debugPos.x, this.debugPos.y);
        if (entities != null && entities.length > 0)
        {
            // As we display entities, we check to see if they have any targets. If they do, we put
            // information here to render them. At the end, if we put anything here, we set up the
            // instance variable that will use the data to actually render the links.
            var links = [];

            // Iterate all entities now.
            for (var i = 0; i < entities.length; i++)
            {
                var entity = entities[i];

                // Log this entity and then all of its properties. We single out the id property for
                // easier reading.
                console.log (entity.name + ":", entity.properties.id);
                for (var name in entity.properties)
                {
                    // Check if this entity has any triggers and if so, add then to our links array.
                    var triggerLinks = this.calculateEntityTriggerLinks (entity);
                    if (triggerLinks)
                        links.push (triggerLinks);

                    // Now display all properties except for the ID property, which we already displayed.
                    if (entity.properties.hasOwnProperty (name) && name != "id")
                        console.log ("\t" + name + ":", entity.properties[name]);
                }
            }

            // If we got any links, set up the value to display them. This entity might not have any triggers.
            if (links.length > 0)
                this.debugTargetLinks = links;

            console.log ("=-=-=-=-=-=-=-=-=-=-")
        }
    };

    /**
     * Handle keyboard down events for the title screen scene.
     *
     * @param {Event} eventObj the keyboard event
     * @returns {Boolean} true if we handle the key event, false otherwise
     */
    nurdz.sneak.GameScene.prototype.inputKeyDown = function (eventObj)
    {
        var entities, i;

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
            // This key will display information about all entities at the current mouse position to the
            // console and turn on visual arrows that show where the triggers on the entities point (if any).
            case this.keys.KEY_F1:
                this.displayEntityInfo ();
                return true;

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

            // These keys finds all entities where the player is currently standing and tries to trigger
            // them. If there are any to attempt to trigger, this counts as an action even if it has no
            // effect on anything, so other entities get a step.
            case this.keys.KEY_SPACEBAR:
            case this.keys.KEY_Q:
                // Step all entities.
                this.level.stepAllEntities ();

                // Now trigger everything on this tile.
                entities = this.level.entitiesAt (mapX, mapY);
                if (entities.length > 0)
                {
                    for (i = 0; i < entities.length; i++)
                        entities[i].trigger (this.player);
                }
                return true;

            // This key causes a "wait" action, which allows all entities to have a turn without the
            // player doing anything.
            case this.keys.KEY_E:
            case this.keys.KEY_ENTER:
                this.level.stepAllEntities ();
                return true;
        }

        // If a movement happened, then move the player and allow all entities a turn. This also makes
        // sure to check if the player is currently standing on an entity, which will trigger them for a
        // touch if they support that.
        if (targetPos != null && this.level.isBlockedAt (targetPos.x, targetPos.y) == false)
        {
            // Yep, translate the player accordingly and then step all of the entities, as they have a
            // turn now since the player moved.
            this.player.position.translate (translatePos.x, translatePos.y);
            this.level.stepAllEntities ();

            // Now find all entities at the position that the player moved to, and trigger them all.
            //
            // This happens after the move and the entity gets a turn so that the entities have a chance
            // to move during their step such that they are no longer where the player might have ended up.
            entities = this.level.entitiesAt (targetPos.x, targetPos.y);
            for (i = 0; i < entities.length; i++)
                entities[i].triggerTouch (this.player);
            return true;
        }

        // We ignored the key
        return false;
    }
} ());