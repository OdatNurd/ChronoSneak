/**
 * The base class for all scenes in a game; a scene is just a simple wrapper around specific handling for
 * object update, rendering and input handling, allowing for better object isolation.
 *
 * This base class defines the behaviour of a scene as it applies to a game; you should subclass it to
 * implement your own specific handling as needed.
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
     * Every time a screenshot is generated, this value is used in the filename. It is then incremented.
     *
     * @type {Number}
     */
    var ss_number = 0;

    /**
     * This the template for the number added to the end of screenshot filenames. The end characters
     * are replaced with the current number of the screenshot.
     *
     * @const
     * @type {string}
     */
    var ss_format = "0000";

    /**
     * This method is invoked at the start of every game frame to allow this scene to update the state of
     * all objects that it contains.
     *
     * This base version invokes the update method for all actors that are currently registered with the
     * stage.
     */
    nurdz.game.Scene.prototype.update = function ()
    {
        for (var i = 0 ; i < this.actorList.length ; i++)
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
        for (var i = 0 ; i < this.actorList.length ; i++)
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

    //noinspection JSUnusedGlobalSymbols
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
     * Return a list of actors whose position matches the position passed in. This is probably most useful
     * when actors are at rigidly defined locations, such as in a tile based game.
     *
     * @param {nurdz.game.Point} location the location to search for actors at
     * @returns {nurdz.game.Actor[]}
     */
    nurdz.game.Scene.prototype.actorsAt = function (location)
    {
        var retVal = [];
        for (var i = 0 ; i < this.actorList.length ; i++)
        {
            var actor = this.actorList[i];
            if (actor.position.equals(location))
                retVal.push (actor);
        }
        return retVal;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Return a list of actors whose position matches the position passed in. This is probably most useful
     * when actors are at rigidly defined locations, such as in a tile based game.
     *
     * @param {Number} x the X coordinate to search for actors at
     * @param {Number} y the Y coordinate to search for actors at
     * @returns {nurdz.game.Actor[]}
     */
    nurdz.game.Scene.prototype.actorsAtXY = function (x, y)
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

    /**
     * Open a new tab that displays the current contents of the stage. The generated page will display the
     * image and is set up so that a click on the image will cause the browser to download the file.
     *
     * The filename you provide is the filename that is automatically suggested for the image, and the
     * title passed in will be the title of the window opened and also the alternate text for the image on
     * the page.
     *
     * The filename provided will have an identifying number and an extension appended to the end. The
     * window title will also have the screenshot number appended to the end of it. This allows you to
     * easily distinguish multiple screenshots.
     *
     * This all requires support from the current browser. Some browsers may not support the notion of
     * automatically downloading the image on a click, some might not use the filename provided.
     *
     * In particular, the browser in use needs to support data URI's. I assume most decent ones do.
     *
     * @param {String} [filename="screenshot"] the name of the screenshot image to create
     * @param {String} [windowTitle="Screenshot"] the title of the window
     */
    nurdz.game.Scene.prototype.screenshot = function (filename, windowTitle)
    {
        filename = filename || "screenshot";
        windowTitle = windowTitle || "Screenshot";

        // Create a window to hold the screen shot.
        var wind = window.open ("about:blank", "screenshot");

        // Create a special data URI which the browser will interpret as an image to display.
        var imageURL = this.stage.canvas.toDataURL ();

        // Append the screenshot number to the window title and also to the filename for the generated
        // image, then advance the screenshot counter for the next image.
        filename += ((ss_format + ss_number).slice (-ss_format.length)) + ".png";
        windowTitle += " " + ss_number;
        ss_number++;

        // Now we need to write some HTML into the new document. The image tag using our data URL will
        // cause the browser to display the image. Wrapping it in the anchor tag with the same URL and a
        // download attribute is a hint to the browser that when the image is clicked, it should download
        // it using the name provided.
        //
        // This might not work in all browsers, in which case clicking the link just displays the image.
        // You can always save via a right click.
        wind.document.write ("<head><title>" + windowTitle + "</title></head>");
        wind.document.write ('<a href="' + imageURL + '" download="' + filename + '">');
        wind.document.write ('<img src="' + imageURL + '" title="' + windowTitle + '"/>');
        wind.document.write ('</a>');
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Scene.prototype.toString = function ()
    {
        return String.format ("[Scene name='{0}']", this.name);
    };
} ());
