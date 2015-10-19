/**
 * This sub-namespace contains all of the classes and objects to do with the game engine itself. There
 * should (hopefully) be nothing game specific in this namespace.
 *
 * @alias nurdz.game
 * @type {{}}
 */
nurdz.createNamespace ("nurdz.game");

/**
 * A scene is just a wrapper around specific handling for object update, rendering and input handling.
 * This is the case class for all scenes in the game, and its implementation is empty. You should subclass
 * this class in order to provide more specific handling of scenes as appropriate.
 *
 * @param {String} name the name of the scene, for debugging purposes
 * @constructor
 */
nurdz.game.Scene = function (name)
{
    "use strict";

    /**
     * The name of the scene, as set from the constructor.
     *
     * @const
     * @type {String}
     */
    this.name = name;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     */
    nurdz.game.Scene.prototype.update = function ()
    {

    };

    /**
     * This method is invoked every frame after the update() method is invoked to allow this scene to
     * render to the screen everything that it visually wants to appear.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.game.Scene.prototype.render = function (stage)
    {

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
