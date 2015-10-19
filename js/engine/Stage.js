/**
 * Create the stage on which all rendering for the game will be done.
 *
 * A canvas will be created at the provided dimensions and will be inserted into the DOM as the last child
 * of the container DIV with the ID provided.
 *
 * The CSS of the DIV will be modified to have a width and height of the canvas, with options that cause
 * it to center itself.
 *
 * @param {Number} width the width of the stage (in pixels)
 * @param {Number} height the height of the stage (in pixels)
 * @param {String} containerDivID the ID of the DIV that should contain the created canvas
 * @param {String} [initialColor] the color to clear the canvas to once it is created
 * @constructor
 * @throws {ReferenceError} if there is no element with the ID provided
 */
nurdz.game.Stage = function (width, height, containerDivID, initialColor)
{
    "use strict";

    /**
     * The width of the stage, in pixels.
     *
     * @type {number}
     * @const
     */
    this.width = width;

    /**
     * The height of the stage, in pixels.
     *
     * @type {Number}
     * @const
     */
    this.height = height;

    /**
     * The canvas that the stage renders itself to.
     *
     * @type {HTMLCanvasElement}
     * @const
     */
    this.canvas = null;

    /**
     * The rendering context for our canvas.
     *
     * @type {CanvasRenderingContext2D}
     */
    this.canvasContext = null;

    // Get the container that will hold the canvas, and error if it does not exist.
    var container = document.getElementById (containerDivID);
    if (container == null)
        throw new ReferenceError ("Unable to create stage: No such element with ID '" + containerDivID + "'");

    // Now create the canvas and give it the appropriate dimensions.
    this.canvas = document.createElement ("canvas");
    this.canvas.width = width;
    this.canvas.height = height;

    // Modify the style of the container div to make it center horizontally.
    container.style.width = width + "px";
    container.style.height = height + "px";
    container.style.marginLeft = "auto";
    container.style.marginRight = "auto";

    // Get the context for the canvas and then clear it.
    this.canvasContext = this.canvas.getContext ('2d');
    this.clear (initialColor);

    // Append the canvas to the container
    container.appendChild (this.canvas);
};

// Now define the various member functions and any static state.
(function ()
{
    "use strict";

    /**
     * The currently active scene on the stage. This is the scene which will get its render and update
     * methods called.
     *
     * @type {nurdz.game.Scene}
     */
    var currentScene = new nurdz.game.Scene ("defaultScene");

    /**
     * The scene that should become active next, if any. When a scene change request happens, the scene to
     * be switched to is stored in this value, to ensure that the switch happens after a complete frame
     * update.
     *
     * The value is null when there is no scene change scheduled.
     *
     * @type {nurdz.game.Scene|null}
     */
    var nextScene = null;

    /**
     * A list of all of the registered scenes in the stage. The keys are a symbolic string name and the
     * values are the actual instances of the scene object to use when that scene is active.
     * @type {{}}
     */
    var sceneList = {};

    /**
     * When the game is running, this is the timer ID of the system that keeps the game loop running.
     * Otherwise, this is null.
     *
     * @type {Number}
     */
    var gameTimerID = null;

    /**
     * This method runs one game frame for the current scene. The scene will get a change to update itself
     * and it will then be asked to render itself.
     *
     * This should be invoked, say 30 or 60 times a second, to make the game run.
     *
     * @param {nurdz.game.Stage} stage the stage to use to render the game during the loop
     */
    var sceneLoop = function (stage)
    {
        // If there is a scene change scheduled, change it now.
        if (nextScene != null)
        {
            console.log ("Changing scene to: " + nextScene);
            currentScene = nextScene;
            nextScene = null;
        }

        // Do the frame update now
        currentScene.update ();
        currentScene.render (stage);
    };

    /**
     * Start the game running. This will start with the scene that is currently the default scene. The
     * game will run (or attempt to) at the frame rate you provide.
     *
     * When the stage is created, a default empty scene is initialized that will do nothing.
     *
     * @see nurdz.game.Scene.switchToScene.
     * @see nurdz.game.Stage.stop
     * @param {Number} [fps=30] the FPS to attempt to run at
     */
    nurdz.game.Stage.prototype.run = function (fps)
    {
        fps = fps | 30;

        if (gameTimerID != null)
            throw new Error ("Attempt to start the game running when it is already running");

        // Note: In order to pass the stage to the sceneLoop function, we need to create a new bound
        // function. The first argument specifies what "this" will refer to, and the second is an argument
        // that is always passed. Here we do it twice.
        //
        // NOTE: Technically this method takes a variable number of arguments, and the third argument
        // onward get passed to the timeout function, but we do it this way because WebStorm is inherently
        // stupid about this.
        gameTimerID = setInterval (sceneLoop.bind (this, this), 1000 / fps);
    };

    /**
     * Stop a running game. This halts the update loop but otherwise has no effect. Thus after this call,
     * the game just stops where it was.
     *
     * It is legal to start the game running again via another call to run(), so long as your scenes are
     * not time sensitive.
     *
     * @see nurdz.game.Stage.run
     */
    nurdz.game.Stage.prototype.stop = function ()
    {
        // Make sure the game is running.
        if (gameTimerID == null)
            throw new Error ("Attempt to stop the game when it is not running");

        // Stop it.
        clearInterval (gameTimerID);
        gameTimerID = null;
    };

    /**
     * Register a scene object with the stage using a textual name. This scene can then be switched to via
     * the switchToScene method.
     *
     * You can invoke this with null as a scene object to remove a scene from the internal scene list. You
     * can also register the same object multiple times with different names, if that's interesting to you.
     *
     * @param {String} name the symbolic name to use for this scene
     * @param {nurdz.game.Scene|null} sceneObj the scene object to add
     * @see nurdz.game.Scene.switchToScene
     */
    nurdz.game.Stage.prototype.addScene = function (name, sceneObj)
    {
        // If this name is in use and we were given a scene object
        if (sceneList[name] != null && sceneObj != null)
            console.log ("Warning: overwriting scene registration for scene named " + name);

        sceneList[name] = sceneObj;
    };

    /**
     * Register a request to change the current scene to a different scene. The change will take effect at
     * the start of the next frame.
     *
     * If null is provided, a pending scene change will be cancelled.
     *
     * This method has no effect if the scene specified is already the current scene, is already going to
     * be switched to, or has a name that we do not recognize.
     *
     * @param {String|null} sceneName the name of the new scene to change to, or null to cancel a pending
     * change
     */
    nurdz.game.Stage.prototype.switchToScene = function (sceneName)
    {
        // Get the actual new scene.
        var newScene = sceneList[sceneName];

        // Display an error if there is no such scene.
        if (newScene == null)
        {
            console.log ("Attempt to switch to unknown scene named " + sceneName);
            return;
        }

        nextScene = newScene;
    };

    /**
     * Clear the entire stage with the provided color specification, or a default color if no color is
     * specified.
     *
     * @param {String} [color='black'] the color to clear the canvas with
     */
    nurdz.game.Stage.prototype.clear = function (color)
    {
        color = color || 'black';
        this.colorRect (0, 0, this.width, this.height, color);
    };

    /**
     * Render a filled rectangle with its upper left corner at the position provided and with the provided
     * dimensions.
     *
     * @param {Number} x X location of the upper left corner of the rectangle
     * @param {Number} y Y location of the upper left corner of the rectangle
     * @param {Number} width width of the rectangle to render
     * @param {Number} height height of the rectangle to render
     * @param {String} fillColor the color to fill the rectangle with
     */
    nurdz.game.Stage.prototype.colorRect = function (x, y, width, height, fillColor)
    {
        this.canvasContext.fillStyle = fillColor;
        this.canvasContext.fillRect (x, y, width, height);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Render a filled circle with its center at the position provided.
     *
     * @param {Number} x X location of the center of the circle
     * @param {Number} y Y location of the center of the circle
     * @param {Number} radius radius of the circle to draw
     * @param {String} fillColor the color to fill the circle with
     */
    nurdz.game.Stage.prototype.colorCircle = function (x, y, radius, fillColor)
    {
        this.canvasContext.fillStyle = fillColor;
        this.canvasContext.beginPath ();
        this.canvasContext.arc (x, y, radius, 0, Math.PI * 2, true);
        this.canvasContext.fill ();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Display text to the stage at the position provided. How the the text anchors to the point provided
     * needs to be set by you prior to calling. By default, the location specified is the top left corner.
     *
     * This method will set the color to the color provided but all other font properties will be as they were
     * last set for the canvas.
     *
     * @param {String} text the text to draw
     * @param {Number} x X location of the text
     * @param {Number} y Y location of the text
     * @param {String} fillColor the color to draw the text with
     */
    nurdz.game.Stage.prototype.colorText = function (text, x, y, fillColor)
    {
        this.canvasContext.fillStyle = fillColor;
        this.canvasContext.fillText (text, x, y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Displays a bitmap to the stage such that its upper left corner is at the point provided.
     *
     * @param {Image} bitmap the bitmap to display
     * @param {Number} x X location to display the bitmap at
     * @param {Number} y Y location to display the bitmap at
     * @see drawBitmapCentered
     */
    nurdz.game.Stage.prototype.drawBitmap = function (bitmap, x, y)
    {
        this.canvasContext.drawImage (bitmap, x, y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Displays a bitmap to the stage such that its center is at the point provided.
     *
     * @param {Image} bitmap the bitmap to display
     * @param {Number} x X location to display the center of the bitmap at
     * @param {Number} y Y location to display the center of the bitmap at
     * @see drawBitmapCentered
     */
    nurdz.game.Stage.prototype.drawBitmapCentered = function (bitmap, x, y)
    {
        this.canvasContext.save ();
        this.canvasContext.translate (x, y);
        this.canvasContext.drawImage (bitmap, -(bitmap.width / 2), -(bitmap.height / 2));
        this.canvasContext.restore ();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Display a bitmap to the stage such that its center is at the point provided. The bitmap is also
     * rotated according to the rotation value, which is an angle in radians.
     *
     * @param {Image} bitmap the bitmap to display
     * @param {Number} x X location to display the center of the bitmap at
     * @param {Number} y Y location to display the center of the bitmap at
     * @param {Number} angle the angle to rotate the bitmap to (in radians)
     * @see drawBitmapCentered
     */
    nurdz.game.Stage.prototype.drawBitmapCenteredWithRotation = function (bitmap, x, y, angle)
    {
        this.canvasContext.save ();
        this.canvasContext.translate (x, y);
        this.canvasContext.rotate (angle);
        this.canvasContext.drawImage (bitmap, -(bitmap.width / 2), -(bitmap.height / 2));
        this.canvasContext.restore ();
    };
} ());