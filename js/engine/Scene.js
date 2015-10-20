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

    /**
     * Add an actor to the list of actors that exist in this scene. This will cause the scene to
     * automatically invoke the update and render methods on this actor while this scene is active.
     *
     * @param {nurdz.game.Actor} actor the actor to add to the scene
     */
    nurdz.game.Scene.prototype.addActor = function (actor)
    {
        this.actorList.push (actor);
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
} ());
