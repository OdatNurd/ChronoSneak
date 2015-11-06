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
    this.level = new nurdz.sneak.SneakLevel (stage, nurdz.sneak.levels.getLevelOne (stage));

    /**
     * The size of tiles in the game. Cached for quicker access.
     *
     * @type {Number}
     */
    this.tileSize = nurdz.game.TILE_SIZE;

    /**
     * The current position of the mouse, or null if we don't know yet. The mouse position is stored in
     * world coordinates.
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

    /**
     * When the debugging key is pressed, if there is a guard entity in the tile, this will be filled with
     * an array of points that specify the patrol path that the guard will take. The patrol path starts at
     * the start position of the guard and will display all of the waypoint stops along the way.
     *
     * @type {nurdz.game.Point[][]|null}
     */
    this.debugTargetPatrol = null;

    /**
     * The player in the game. This comes from the entity information attached to the level, although we
     * verify that the ID is correct and that it is an instance of the appropriate class.
     *
     * @type {nurdz.sneak.Player}
     */
    this.player = this.level.entitiesByID["player"];
    if (this.player == null || this.player instanceof nurdz.sneak.Player == false)
        throw new Error ("Unable to find player entity or entity is not a player");

    // Add the player and all of the entities in the level to the list of actors in the scene, so that the
    // update and render methods of all of them will get invoked automatically.
    //
    // NOTE: Since this is supposed to be a turn based game, the "update" method can be used to change the
    // visual appearance of an actor/entity, but all of the internal logic regarding updates, position
    // changes etc should happen in the step() method. This only gets invoked by the scene when the player
    // actually takes a turn or does something that burns time (like waiting).
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
        var i, startPos, endPos;

        // Clear the screen and render the level.
        this.stage.clear ();
        this.level.render (this.stage);

        // Call the super to display all actors registered with the stage. This includes the player.
        nurdz.game.Scene.prototype.render.call (this);

        // Display our debug text at the bottom of the screen now
        if (this.debugTxt != null)
            this.stage.drawTxt (this.debugTxt, 16, this.stage.height - 6, 'white');

        // Render the current FPS to the screen
        this.stage.drawTxt(this.stage.fps ().toFixed (0), 6, 20, "red");

        // If there are debug target links, render them now.
        if (this.debugTargetLinks != null)
        {
            // Set the arrow style for the arrows that we are going to draw.
            this.stage.setArrowStyle ("red", 2);

            // The value of debugTargetLinks is an array that contains information about each entity that
            // has targets. Iterate over them.
            for (i = 0 ; i < this.debugTargetLinks.length ; i++)
            {
                // Get the info out for this set of entity links.
                var info = this.debugTargetLinks[i];

                // The first element in the info array is the position that the actual entity is at. This
                // will be the location where the link arrow starts, and is an array of two numbers.
                startPos = info[0];

                // All other elements are arrays that specify the end point of a link arrow
                for (var j = 1 ; j < info.length ; j++)
                {
                    endPos = info[j];
                    this.stage.drawArrow (startPos.x, startPos.y, endPos.x, endPos.y);
                }
            }
        }

        // If there are debug target patrols, render them now.
        if (this.debugTargetPatrol != null)
        {
            // Set the arrow style for the arrows that we are going to draw.
            this.stage.setArrowStyle ("blue", 2);

            // Connect all of the points with lines.
            for (i = 0 ; i < this.debugTargetPatrol.length - 1 ; i++)
            {
                startPos = this.debugTargetPatrol[i];
                endPos = this.debugTargetPatrol[i + 1];

                this.stage.drawArrow (startPos.x, startPos.y, endPos.x, endPos.y);
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
        // Calculate the mouse position.
        this.mousePos = this.stage.calculateMousePos (eventObj);

        // Now convert that position into a map position.
        var mapPos = this.mousePos.copyReduced (this.tileSize);

        // If there is no debug position, or there is but it is different than where the mouse is now,
        // calculate new debug text.
        if (this.debugPos == null || (this.debugPos.x != mapPos.x || this.debugPos.y != mapPos.y))
        {
            // Get the tile and any entities under the mouse.
            var mTile = this.level.tileAt (mapPos);
            var entities = this.level.entitiesAt (mapPos);

            this.debugTxt = mapPos.toString ();
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
                this.debugPos = mapPos.copy ();
            else
                this.debugPos.setTo (mapPos);

            // Remove the target links now because the position has changed. The user can press the button
            // to calculate new ones.
            this.debugTargetLinks = null;
            this.debugTargetPatrol = null;
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
        var links = this.level.entitiesWithIDs (entity.properties.trigger);
        if (links.length == 0)
            return null;

        // Create our return value. This will hold points. The first element is the location of the entity
        // we were given, and the rest of the elements are the positions of the entities that will be
        // triggered. We offset all positions by half a tile so that the arrows render pointing at the
        // center of the associated tiles and not at the corner.
        /** @type nurdz.game.Point[] */
        var retVal = [];
        var offset = nurdz.game.TILE_SIZE / 2;

        // Store the location of this entity, and then the positions of all of the linked entities.
        retVal.push (entity.position.copyTranslatedXY (offset, offset));
        for (var i = 0 ; i < links.length ; i++)
            retVal.push (links[i].position.copyTranslatedXY (offset, offset));

        return retVal;
    };

    /**
     * Given an entity that is a guard, return back an array of points that specify all of the points on
     * the patrol.
     *
     * @param {nurdz.sneak.GuardBase} guard the guard whose patrol
     * @returns {nurdz.game.Point[]} the list of patrol waypoint locations
     */
    nurdz.sneak.GameScene.prototype.calculateGuardPatrol = function (guard)
    {
        /** @type nurdz.game.Point[] */
        var retVal = [];
        var offset = nurdz.game.TILE_SIZE / 2;

        // Get the list of waypoints and the spawn position of the guard.
        var waypoints = this.level.entitiesWithIDs (guard.properties.patrol);
        var spawnPos = this.level.entitiesByID[guard.properties.spawnPoint];

        // Store the spawn position as the first point and the waypoints as the following positions. Each
        // point is offset by half the tile size so that when the patrol path is displayed, it centers in
        // the tiles instead of pointing at the corners of the tiles.
        retVal.push (spawnPos.position.copyTranslatedXY (offset, offset));
        for (var i = 0 ; i < waypoints.length ; i++)
            retVal.push (waypoints[i].position.copyTranslatedXY (offset, offset));

        // If the guard is supposed to loop its patrol, add the first waypoint again to cycle the path
        // back to where it started.
        if (guard.properties.patrolLoop)
            retVal.push (waypoints[0].position.copyTranslatedXY (offset, offset));

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
        var entities = this.level.entitiesAt (this.debugPos);
        if (entities != null && entities.length > 0)
        {
            // As we display entities, we check to see if they have any targets. If they do, we put
            // information here to render them. At the end, if we put anything here, we set up the
            // instance variable that will use the data to actually render the links.
            var links = [];

            // Iterate all entities now.
            for (var i = 0 ; i < entities.length ; i++)
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

                    // If this entity is a guard and has a patrol and we don't already have a patrol to
                    // display, calculate it now.
                    if (entity instanceof nurdz.sneak.GuardBase && entity.properties.patrol && this.debugTargetPatrol == null)
                        this.debugTargetPatrol = this.calculateGuardPatrol (entity);
                }
            }

            // If we got any links, set up the value to display them. This entity might not have any triggers.
            if (links.length > 0)
                this.debugTargetLinks = links;

            console.log ("=-=-=-=-=-=-=-=-=-=-")
        }
    };

    /**
     * This does a check to determine the list of entities that the player can currently interact with.
     *
     * This first checks the tile that the player is standing on for entities, then the tile that the
     * player is facing directly, then the tile that is adjacent to the player to the right or left (based
     * on the handedness of the player), and lastly the other side.
     *
     * These checks stop as soon as any entities are found, so it does not include every entity that could
     * be interacted with on the tile and in the three adjacent tiles.
     *
     * The list of found entities (if any) are filtered down to only those entities that are currently
     * willing to interact with the player entity.
     *
     * @returns {nurdz.sneak.ChronoEntity[]} list of entities to interact with (may be an empty array)
     */
    nurdz.sneak.GameScene.prototype.getInteractionEntities = function ()
    {
        /**
         * A cached copy of the map location of the player.
         *
         * @type {nurdz.game.Point}
         */
        var mapPos = this.player.mapPosition;

        /**
         * A cached copy of the facing direction of the player.
         *
         * @type {Number}
         */
        var facing = this.player.properties.facing;

        /**
         * A cached copy of the handedness of the Player (true means right handed, false means left handed.)
         *
         * @type {Boolean}
         */
        var handedness = this.player.properties.handedness;

        // Start off by collecting all of the entities that are on the tile that the player is currently
        // standing on.
        var entities = this.level.entitiesAt (this.player.mapPosition);

        // If we didn't find anything, then try to look up entities on the tile that the player is
        // currently facing instead. Note that since we checked the player location, and the player is an
        // entity, it shows up in this list, so we need to exclude it.
        if (entities == null || entities.length <= 1)
            entities = this.level.entitiesAtFacing (mapPos, facing);

        // If we STILL didn't find anything, then check 90 degrees to the left or right. We search in the
        // direction of the handedness of the player (true means right).
        if (entities == null || entities.length == 0)
            entities = this.level.entitiesAtFacing (mapPos,
                                                    this.player.normalizeFacingAngle (
                                                        facing + (handedness ? +90 : -90)));

        // Do one last check for the other side.
        if (entities == null || entities.length == 0)
            entities = this.level.entitiesAtFacing (mapPos,
                                                    this.player.normalizeFacingAngle (
                                                        facing + (handedness ? -90 : +90)));

        // If we still didn't find anything, return back an empty array.
        if (entities == null || entities.length == 0)
            return entities || [];

        // At this point we have found something that we might be able to interact with. Filter this down
        // to the list of entities that are curently willing to interact with the player and return that list.
        return entities.filter (function (entity)
                                {
                                    return entity.canInteractWith (this.player);
                                }, this);
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

        // Get the map location of the player and his facing.
        var mapPos = this.player.mapPosition;
        var mapFacing = this.player.properties.facing;

        /**
         * When the input represents a movement key, this stores the map position the player would move to
         * for later checking, as long as the movement key is in the direction that the player is already
         * facing. Otherwise this remains null.
         *
         * @type {nurdz.game.Point|null} */
        var targetPos = null;

        /**
         * When the input represents a movement key that is not the direction that the player is moving
         * in, this is set to the facing that the player should turn in response to this move so that they
         * can continue moving in that direction on the next turn.
         * @type {Number|null}
         */
        var newFacing = null;

        // Check for valid keys.
        // If a valid movement key was seen, check to see if the position that was moved to is blocked.

        switch (eventObj.keyCode)
        {
            // This key will display information about all entities at the current mouse position to the
            // console and turn on visual arrows that show where the triggers on the entities point (if any).
            case this.keys.KEY_F1:
                this.displayEntityInfo ();
                return true;

            // This key opens a new tab/window with a copy of the current frame displayed.
            case this.keys.KEY_F5:
                this.screenshot ("ChronoSneak_", "ChronoSneak Screenshot");
                return true;

            case this.keys.KEY_UP:
            case this.keys.KEY_W:
                if (mapFacing == 270)
                    targetPos = mapPos.copyTranslatedXY (0, -1);
                else
                    newFacing = 270;
                break;

            case this.keys.KEY_DOWN:
            case this.keys.KEY_S:
                if (mapFacing == 90)
                    targetPos = mapPos.copyTranslatedXY (0, 1);
                else
                    newFacing = 90;
                break;

            case this.keys.KEY_LEFT:
            case this.keys.KEY_A:
                if (mapFacing == 180)
                    targetPos = mapPos.copyTranslatedXY (-1, 0);
                else
                    newFacing = 180;
                break;

            case this.keys.KEY_RIGHT:
            case this.keys.KEY_D:
                if (mapFacing == 0)
                    targetPos = mapPos.copyTranslatedXY (1, 0);
                else
                    newFacing = 0;
                break;

            // These keys are the interaction keys: If there are any entities on the same tile as the
            // player is on, they get triggered, which may or may not cause them to do something.
            //
            // Doing this counts as an action, which means that all other entities step and thus get a turn.
            // An attempt to activate when there is nothing to activate has no effect. If you want to kill
            // time, use the wait key instead.
            case this.keys.KEY_SPACEBAR:
            case this.keys.KEY_Q:
                // Get the entities that we might interact with. This could be an empty list.
                entities = this.getInteractionEntities ();
                if (entities.length > 0)
                {
                    // Step all entities.
                    this.level.stepAllEntities ();

                    // Now trigger everything that is on the same tile as us, except for ourselves.
                    for (i = 0 ; i < entities.length ; i++)
                    {
                        entities[i].trigger (this.player);
                    }

                    return true;
                }
                else
                    console.log ("Cannot activate: no eligible entities found");
                return false;

            // This key causes a "wait" action, which allows all entities to have a turn without the
            // player doing anything.
            case this.keys.KEY_E:
            case this.keys.KEY_ENTER:
                this.level.stepAllEntities ();
                return true;
        }

        // If a turn happened, OR a move happened that is not blocked, then move the player and allow all
        // entities a turn. This will also trigger entities that the player is now standing on.
        if (newFacing != null ||
            (targetPos != null && this.level.isBlockedAt (targetPos) == false))
        {
            // Turn if we're turning.
            if (newFacing != null)
                this.player.setFacing (this.player.calculateTurnFacing (newFacing));

            // Move if we're moving.
            if (targetPos != null)
                this.player.setMapPosition (targetPos);

            // Now let all entities have a turn.
            this.level.stepAllEntities ();

            // If we moved, then find all entities at the position that the player moved to and trigger them.
            //
            // This happens after the move and the entity gets a turn so that the entities have a chance
            // to move during their step such that they are no longer where the player might have ended up.
            if (this.targetPosition != null)
            {
                entities = this.level.entitiesAt (targetPos);
                for (i = 0 ; i < entities.length ; i++)
                    entities[i].triggerTouch (this.player);
            }
            return true;
        }

        // We ignored the key
        return false;
    }
} ());
