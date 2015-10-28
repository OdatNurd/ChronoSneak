/**
 * A scene is just a wrapper around specific handling for object update, rendering and input handling.
 * This is the case class for all scenes in the game, and its implementation is empty. You should subclass
 * this class in order to provide more specific handling of scenes as appropriate.
 *
 * @param {String} name the name of the scene, for debugging purposes
 * @param {nurdz.game.Stage} stage the stage that will be associated with this scene
 * @constructor
 */
nurdz.game.Scene = function (name, stage)
{
    "use strict";

    /**
     * The name of the scene, as set from the constructor.
     *
     * @const
     * @type {String}
     */
    this.name = name;

    /**
     * The stage that this scene is being displayed to. This is a reference to the stage given at the time
     * that the scene was created.
     *
     * @type {nurdz.game.Stage}
     */
    this.stage = stage;

    /**
     * The list of actors that are currently associated with this stage. These actors will get their
     * update and render methods called by the base implementation of the class.
     * @type {nurdz.game.Actor[]}
     */
    this.actorList = [];

    /**
     * An aliased copy of nurdz.game.keys, to make input handling easier.
     * @see nurdz.game.keys
     * @type {{}}
     */
    this.keys = nurdz.game.keys;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     *
     * This base version invokes the update method for all actors that are currently registered with the
     * stage.
     */
    nurdz.game.Scene.prototype.update = function ()
    {
        for (var i = 0; i < this.actorList.length; i++)
            this.actorList[i].update (this.stage);
    };

    /**
     * This method is invoked every frame after the update() method is invoked to allow this scene to
     * render to the screen everything that it visually wants to appear.
     *
     * This base version invokes the render method for all actors that are currently registered with the
     * stage.
     */
    nurdz.game.Scene.prototype.render = function ()
    {
        for (var i = 0; i < this.actorList.length; i++)
            this.actorList[i].render (this.stage);
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * This method is invoked when this scene is becoming the active scene in the game. This can be used
     * to initialize (or re-initialize) anything in this scene that should be reset when it becomes active.
     *
     * This gets invoked after the current scene is told that it is deactivating. The parameter passed in
     * is the scene that was previously active. This will be null if this is the first ever scene in the game.
     *
     * The next call made of the scene will be its update method for the next frame.
     *
     * @param {nurdz.game.Scene|null} previousScene
     */
    nurdz.game.Scene.prototype.activating = function (previousScene)
    {
        console.log ("Scene activation: " + this.toString ());
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * This method is invoked when this scene is being deactivated in favor of a different scene. This can
     * be used to persist any scene state or do any other house keeping.
     *
     * This gets invoked before the current scene gets told that it is becoming active. The parameter
     * passed in is the scene that will become active.
     *
     * @param {nurdz.game.Scene} newScene the currently active scene which is about to deactivate.
     */
    nurdz.game.Scene.prototype.deactivating = function (newScene)
    {
        console.log ("Scene deactivation: " + this.toString ());
    };

    /**
     * Add an actor to the list of actors that exist in this scene. This will cause the scene to
     * automatically invoke the update and render methods on this actor while this scene is active.
     *
     * @param {nurdz.game.Actor} actor the actor to add to the scene
     * @see nurdz.game.Scene.addActorArray
     */
    nurdz.game.Scene.prototype.addActor = function (actor)
    {
        this.actorList.push (actor);
    };

    /**
     * Add all of the actors from the passed in array to the list of actors that exist in this scene. This
     * will cause the scene to automatically invoke the update and render methods on these actors while
     * the scene is active.
     *
     * @param {nurdz.game.Actor[]} actorArray the list of actors to add
     * @see nurdz.game.Scene.addActorArray
     */
    nurdz.game.Scene.prototype.addActorArray = function (actorArray)
    {
        for (var i = 0 ; i < actorArray.length ; i++)
            this.addActor (actorArray[i]);
    };

    /**
     * Return the complete list of actors that are currently registered with this scene.
     *
     * @returns {nurdz.game.Actor[]}
     */
    nurdz.game.Scene.prototype.actors = function ()
    {
        return this.actorList;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Return a list of actors whose position matches the position passed in.
     *
     * @param {Number} x the X coordinate to search for actors at
     * @param {Number} y the Y coordinate to search for actors at
     * @returns {nurdz.game.Actor[]}
     */
    nurdz.game.Scene.prototype.actorsAt = function (x, y)
    {
       var retVal = [];
        for (var i = 0 ; i < this.actorList.length ; i++)
        {
            var actor = this.actorList[i];
            if (actor.position.x == x && actor.position.y == y)
                retVal.push (actor);
        }
        return retVal;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This method will sort all of the actors that are currently attached to the scene by their current
     * internal Z-Order value, so that when they are iterated for rendering/updates, they get handled in
     * an appropriate order.
     *
     * Note that the sort used is not stable.
     */
    nurdz.game.Scene.prototype.sortActors = function ()
    {
        this.actorList.sort (function (left, right) { return left.zOrder - right.zOrder; });
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Scene.prototype.toString = function ()
    {
        return "[Scene: " + this.name + "]";
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * This gets triggered while the game is running, this scene is the current scene, and a key has been
     * pressed down.
     *
     * The method should return true if the key event was handled or false if it was not. The Stage will
     * prevent the default handling for all key events that are handled.
     *
     * @param {Event} eventObj the event object
     * @returns {Boolean} true if the key event was handled, false otherwise
     */
    nurdz.game.Scene.prototype.inputKeyDown = function (eventObj)
    {
        return false;
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * This gets triggered while the game is running, this scene is the current scene, and a key has been
     * released.
     *
     * The method should return true if the key event was handled or false if it was not. The Stage will
     * prevent the default handling for all key events that are handled.
     *
     * @param {Event} eventObj the event object
     * @returns {Boolean} true if the key event was handled, false otherwise
     */
    nurdz.game.Scene.prototype.inputKeyUp = function (eventObj)
    {
        return false;
    };

    /**
     * This gets triggered while the game is running, this scene is the current scene, and the mouse
     * moves over the stage.
     *
     * @param {Event} eventObj the event object
     * @see nurdz.game.Stage.calculateMousePos
     */
    nurdz.game.Scene.prototype.inputMouseMove = function (eventObj)
    {
    };

    /**
     * This gets triggered while the game is running, this scene is the current scene, and the mouse
     * is clicked on the stage.
     *
     * @param {Event} eventObj the event object
     * @see nurdz.game.Stage.calculateMousePos
     */
    nurdz.game.Scene.prototype.inputMouseClick = function (eventObj)
    {

    };
} ());
