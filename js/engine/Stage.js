/**
 * Create the stage on which all rendering for the game will be done.
 *
 * A canvas will be created and inserted into the DOM as the last child of the container DIV with the ID
 * provided.
 *
 * The CSS of the DIV will be modified to have a width and height of the canvas, with options that cause
 * it to center itself.
 *
 * @param {String} containerDivID the ID of the DIV that should contain the created canvas
 * @param {String} [initialColor] the color to clear the canvas to once it is created
 * @constructor
 * @throws {ReferenceError} if there is no element with the ID provided
 */
nurdz.game.Stage = function (containerDivID, initialColor)
{
    "use strict";

    /**
     * The width of the stage, in pixels.
     *
     * @type {number}
     * @const
     */
    this.width = nurdz.game.STAGE_WIDTH;

    /**
     * The height of the stage, in pixels.
     *
     * @type {Number}
     * @const
     */
    this.height = nurdz.game.STAGE_HEIGHT;

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
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Modify the style of the container div to make it center horizontally.
    container.style.width = this.width + "px";
    container.style.height = this.height + "px";
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
    var currentScene = new nurdz.game.Scene ("defaultScene", this);

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
     * The current FPS that the game is running at, recalculated once per second.
     *
     * @type {Number}
     */
    var fps = 0;

    /**
     * When calculating FPS, this is the time that the most recent frame count started. Once we have
     * counted frames for a second, we reset and start again.
     *
     * @type {Number}
     */
    var startTime = 0;

    /**
     * When calculating FPS, this is the number of frames that we have seen in the last second.
     *
     * @type {Number}
     */
    var frameNumber = 0;

    /**
     * This method runs one game frame for the current scene. The scene will get a change to update itself
     * and it will then be asked to render itself.
     *
     * This should be invoked, say 30 or 60 times a second, to make the game run.
     */
    var sceneLoop = function ()
    {
        // Get the current time for this frame and the elapsed time since we started.
        var currentTime = new Date ().getTime();
        var elapsedTime = (currentTime - startTime) / 1000;

        // This counts as a frame.
        frameNumber++;

        // Calculate the FPS now
        fps = frameNumber / elapsedTime;

        // If a second or more has elapsed, reset the count. We don't want an average over time, we want
        // the most recent numbers so that we can see momentary drops.
        if (elapsedTime > 1)
        {
            startTime = new Date ().getTime ();
            frameNumber = 0;
        }

        try
        {
            // If there is a scene change scheduled, change it now.
            if (nextScene != null && nextScene !== currentScene)
            {
                // Tell the current scene that it is deactivating and what scene is coming next.
                currentScene.deactivating (nextScene);

                // Save the current scene, then swap to the new one
                var previousScene = currentScene;
                currentScene = nextScene;

                // Now tell the current scene that it is activating, telling it what scene used to be in
                // effect.
                currentScene.activating (previousScene);

                // Clear the flag now.
                nextScene = null;
            }

            // Do the frame update now
            currentScene.update ();
            currentScene.render ();
        }
        catch (error)
        {
            console.log ("Caught exception in sceneLoop(), stopping the game");
            clearInterval (gameTimerID);
            gameTimerID = null;
            throw error;
        }
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

        // Reset the variables we use for frame counts.
        startTime = 0;
        frameNumber = 0;

        // Fire off a timer to invoke our scene loop using an appropriate interval.
        gameTimerID = setInterval (sceneLoop, 1000 / fps);

        // Turn on input events.
        enableInputEvents (this.canvas);
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

        // Turn off input events.
        disableInputEvents (this.canvas);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * The stage keeps track of the current frame rate that the update loop is being called at, and this
     * returns the most recently calculated value.
     *
     * @returns {Number}
     */
    nurdz.game.Stage.prototype.fps = function ()
    {
        return fps;
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
        // Get the actual new scene, which might be null if the scene named passed in is null.
        var newScene = sceneName != null ? sceneList[sceneName] : null;

        // If we were given a scene name and there was no such scene, complain before we leave.
        if (sceneName != null && newScene == null)
        {
            console.log ("Attempt to switch to unknown scene named " + sceneName);
            return;
        }

        nextScene = newScene;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Determine what scene is the current scene on this stage.
     *
     * @returns {nurdz.game.Scene}
     */
    nurdz.game.Stage.prototype.currentScene = function ()
    {
        return currentScene;
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
        this.fillRect (0, 0, this.width, this.height, color);
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
    nurdz.game.Stage.prototype.fillRect = function (x, y, width, height, fillColor)
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
    nurdz.game.Stage.prototype.fillCircle = function (x, y, radius, fillColor)
    {
        this.canvasContext.fillStyle = fillColor;
        this.canvasContext.beginPath ();
        this.canvasContext.arc (x, y, radius, 0, Math.PI * 2, true);
        this.canvasContext.fill ();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * This helper method sets all of the styles necessary for rendering lines to the stage. This can be
     * called before drawing operations as a convenience to set all desired values in one call.
     *
     * NOTE: The values set here *do not* persist unless you never change them anywhere else. This
     * includes setting arrow styles.
     *
     * @param {String} color the color to draw lines with
     * @param {String} [lineWidth=3] the pixel width of rendered lines
     * @param {String} [lineCap="round"] the line cap style to use for rendering lines
     * @see nurdz.game.Stage.setArrowStyle
     */
    nurdz.game.Stage.prototype.setLineStyle = function (color, lineWidth, lineCap)
    {
        this.canvasContext.strokeStyle = color;
        this.canvasContext.lineWidth = lineWidth || 3;
        this.canvasContext.lineCap = lineCap || 'round';
    };

    /**
     * This helper function draws the actual arrow head onto the canvas for a line. It assumes that all
     * styles have been set.
     *
     * The original drawArrow code allows its style parameter to be an instance of a function with this
     * signature to allow for custom arrow drawing, but that was removed.
     *
     * The function takes three sets of coordinates, which represent the endpoint of the line that the
     * arrow head is being drawn for (which is where the tip of the arrow should be), and the two
     * endpoints for the ends of the arrow head. These three points connected together form the arrow
     * head, though you are free to join them in any way you like (lines, arcs, etc).
     *
     * @param {CanvasRenderingContext2D} ctx the context to render to
     * @param {Number} x0 the X coordinate of the left end of the arrow head line
     * @param {Number} y0 the Y coordinate of the left end of the arrow head line
     * @param {Number} x1 the X coordinate of the end of the line
     * @param {Number} y1 the Y coordinate of the end of the line
     * @param {Number} x2 the X coordinate of the right end of the arrow head line
     * @param {Number} y2 the Y coordinate of the right end of the arrow head line
     * @param {Number} style the style of arrow to drw
     */
    var drawHead = function (ctx, x0, y0, x1, y1, x2, y2, style)
    {
        var backDistance;

        // First, the common drawing operations. Generate a line from the left of the arrow head to the
        // point of the arrow and then down the other side.
        ctx.save ();
        ctx.beginPath ();
        ctx.moveTo (x0, y0);
        ctx.lineTo (x1, y1);
        ctx.lineTo (x2, y2);

        // Now use the style to finish the arrow head.
        switch (style)
        {
            // The arrow head has a curved line that connects the two sides together.
            case 0:
                backDistance = Math.sqrt (((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                ctx.arcTo (x1, y1, x0, y0, .55 * backDistance);
                ctx.fill ();
                break;

            // The arrow head has a straight line that connects the two sides together.
            case 1:
                ctx.beginPath ();
                ctx.moveTo (x0, y0);
                ctx.lineTo (x1, y1);
                ctx.lineTo (x2, y2);
                ctx.lineTo (x0, y0);
                ctx.fill ();
                break;

            // The arrow head is unfilled, so we're already done.
            case 2:
                ctx.stroke ();
                break;

            // The arrow head has a curved line, but the arc is a quadratic curve instead of just a
            // simple arc.
            case 3:
                var cpx = (x0 + x1 + x2) / 3;
                var cpy = (y0 + y1 + y2) / 3;
                ctx.quadraticCurveTo (cpx, cpy, x0, y0);
                ctx.fill ();
                break;

            // The arrow has a curved line, but the arc is a bezier curve instead of just a simple arc.
            case 4:
                var cp1x, cp1y, cp2x, cp2y;
                var shiftAmt = 5;
                if (x2 == x0)
                {
                    // Avoid a divide by zero if x2==x0
                    backDistance = y2 - y0;
                    cp1x = (x1 + x0) / 2;
                    cp2x = (x1 + x0) / 2;
                    cp1y = y1 + backDistance / shiftAmt;
                    cp2y = y1 - backDistance / shiftAmt;
                }
                else
                {
                    backDistance = Math.sqrt (((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                    var xBack = (x0 + x2) / 2;
                    var yBack = (y0 + y2) / 2;
                    var xMid = (xBack + x1) / 2;
                    var yMid = (yBack + y1) / 2;

                    var m = (y2 - y0) / (x2 - x0);
                    var dX = (backDistance / (2 * Math.sqrt (m * m + 1))) / shiftAmt;
                    var dY = m * dX;
                    cp1x = xMid - dX;
                    cp1y = yMid - dY;
                    cp2x = xMid + dX;
                    cp2y = yMid + dY;
                }

                ctx.bezierCurveTo (cp1x, cp1y, cp2x, cp2y, x0, y0);
                ctx.fill ();
                break;
        }
        ctx.restore ();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the style for all subsequent drawArrow() calls to use when drawing arrows. This needs to be
     * called prior to drawing any arrows to ensure that the canvas style used to draw arrows is updated;
     * the value does not persist. In particular, changing line styles will also change this.
     *
     * @param {String} color the color to draw an arrow with
     * @param {Number} [lineWidth=2} the width of the arrow line
     * @see nurdz.game.Stage.setLineStyle
     */
    nurdz.game.Stage.prototype.setArrowStyle = function (color, lineWidth)
    {
        this.canvasContext.strokeStyle = color;
        this.canvasContext.fillStyle = color;
        this.canvasContext.lineWidth = lineWidth || 2;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * The basis of this code comes from:
     *     http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
     *
     * It has been modified to fit here, which includes things like assuming nobody is going to pass
     * strings, different method for specifying defaults, etc.
     *
     * This will render a line from x1,y1 to x2,y2 and then draw an arrow head on one or both ends of the
     * line in a few different styles.
     *
     * The style parameter can be one of the following values:
     *   0: Arrowhead with an arc end
     *   1: Arrowhead with a straight line end
     *   2: Arrowhead that is unfilled with no end (looks like a V)
     *   3: Arrowhead with a quadratic curve end
     *   4: Arrowhead with a bezier curve end
     *
     * The which parameter indicates which end of the line gets an arrow head. This is a bit field where
     * the first bit indicates the end of the line and the second bit indicates the start of the line.
     *
     * It is also possible to specify the angle that the arrow head makes from the end of the line and the
     * length of the sides of the arrow head.
     *
     * The arrow is drawn using the style set by setArrowStyle(), which is a combination of a stoke and
     * fill color and a line width.
     *
     * @param {Number} x1 the X coordinate of the start of the line
     * @param {Number} y1 the Y coordinate of the start of the line
     * @param {Number} x2 the X coordinate of the end of the line
     * @param {Number} y2 the Y coordinate of the end of the line
     * @param {Number} [style=3] the style of the arrowhead
     * @param {Number} [which=1] the end of the line that gets the arrow head(s)
     * @param {Number} [angle=Math.PI/8} the angle the arrow head makes from the end of the line
     * @param {Number} [d=16] the length (in pixels) of the edges of the arrow head
     * @see nurdz.game.Stage.setArrowStyle
     */
    nurdz.game.Stage.prototype.drawArrow = function (x1, y1, x2, y2, style, which, angle, d)
    {
        // Set defaults
        style = style || 3;
        which = which || 1; // end point gets arrow
        angle = angle || Math.PI / 8;
        d = d || 16;

        // For ends with arrow we actually want to stop before we get to the arrow so that wide lines won't
        // put a flat end on the arrow caused by the rendered line end cap.
        var dist = Math.sqrt ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ratio = (dist - d / 3) / dist;
        var toX, toY, fromX, fromY;

        // When the first bit is set, the end point of the line gets an arrow.
        if ((which & 1) != 0)
        {
            toX = Math.round (x1 + (x2 - x1) * ratio);
            toY = Math.round (y1 + (y2 - y1) * ratio);
        }
        else
        {
            toX = x2;
            toY = y2;
        }

        // When the second bit is set, the start point of the line gets an arrow.
        if ((which & 2) != 0)
        {
            fromX = x1 + (x2 - x1) * (1 - ratio);
            fromY = y1 + (y2 - y1) * (1 - ratio);
        }
        else
        {
            fromX = x1;
            fromY = y1;
        }

        // Draw the shaft of the arrow
        this.canvasContext.beginPath ();
        this.canvasContext.moveTo (fromX, fromY);
        this.canvasContext.lineTo (toX, toY);
        this.canvasContext.stroke ();

        // Calculate the angle that the line is going so that we can align the arrow head properly.
        var lineAngle = Math.atan2 (y2 - y1, x2 - x1);

        // Calculate the line length of the side of the arrow head. We know the length if the line was
        // straight, so we need to have its length when it's rotated to the angle that it is to be drawn at.
        // h is the line length of a side of the arrow head
        var h = Math.abs (d / Math.cos (angle));

        var angle1, angle2, topX, topY, botX, botY;

        // When the first bit is set, we want to draw an arrow head at the end of the line.
        if ((which & 1) != 0)
        {
            angle1 = lineAngle + Math.PI + angle;
            topX = x2 + Math.cos (angle1) * h;
            topY = y2 + Math.sin (angle1) * h;
            angle2 = lineAngle + Math.PI - angle;
            botX = x2 + Math.cos (angle2) * h;
            botY = y2 + Math.sin (angle2) * h;
            drawHead (this.canvasContext, topX, topY, x2, y2, botX, botY, style);
        }

        // WHen the second bit is set, we want to draw an arrow head at the start of the line.
        if ((which & 2) != 0)
        {
            angle1 = lineAngle + angle;
            topX = x1 + Math.cos (angle1) * h;
            topY = y1 + Math.sin (angle1) * h;
            angle2 = lineAngle - angle;
            botX = x1 + Math.cos (angle2) * h;
            botY = y1 + Math.sin (angle2) * h;
            drawHead (this.canvasContext, topX, topY, x1, y1, botX, botY, style);
        }
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Do an (optional) translation and (optional) rotation of the stage canvas. You can perform one or
     * both operations. This implicitly saves the current canvas state on a stack so that it can be
     * restored later via a call to restore().
     *
     * When both an X and a Y value are provided, the canvas is translated so that the origin is moved in
     * the translation direction given. One or both values can be null to indicate that no translation is
     * desired.
     *
     * When the angle is not null, the canvas is rotated by that many degrees around the origin.
     *
     * The order of operations is always translation first and rotation second, because once the rotation
     * happens, the direction of the axes are no longer what you expect. In particular this means that you
     * should be careful about invoking this function when the canvas has already been translated and/or
     * rotation.
     *
     * Note that the current translation and rotation of the canvas is held on a stack, so every call to
     * this method needs to be balanced with a call to the restore() method.
     *
     * @param {Number|null} x the amount to translate on the X axis
     * @param {Number|null} y the amount to translate on the Y axis
     * @param {Number|null} [angle=null] the angle to rotate the canvas, in degrees
     * @see nurdz.game.Stage.restore
     */
    nurdz.game.Stage.prototype.translateAndRotate = function (x, y, angle)
    {
        // First, save the canvas context.
        this.canvasContext.save ();

        // If we are translating, translate now.
        if (x != null && y != null)
            this.canvasContext.translate (x, y);

        // If we are rotating, rotate now.
        if (angle != null)
            this.canvasContext.rotate (angle * (Math.PI / 180));
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Restore the canvas state that was in effect the last time that translateAndRotate was invoked. This
     * needs to be invoked the same number of times as that function was invoked because the canvas state
     * is stored on a stack.
     * @see nurdz.game.Stage.translateAndRotate
     */
    nurdz.game.Stage.prototype.restore = function ()
    {
        this.canvasContext.restore ();
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
    nurdz.game.Stage.prototype.drawTxt = function (text, x, y, fillColor)
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
     * @see drawBmpCentered
     */
    nurdz.game.Stage.prototype.drawBmp = function (bitmap, x, y)
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
     * @see drawBmpCentered
     */
    nurdz.game.Stage.prototype.drawBmpCentered = function (bitmap, x, y)
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
     * @see drawBmpCentered
     */
    nurdz.game.Stage.prototype.drawBmpCenteredRotated = function (bitmap, x, y, angle)
    {
        this.canvasContext.save ();
        this.canvasContext.translate (x, y);
        this.canvasContext.rotate (angle);
        this.canvasContext.drawImage (bitmap, -(bitmap.width / 2), -(bitmap.height / 2));
        this.canvasContext.restore ();
    };

    /**
     * Given an event that represents a mouse event for the stage, calculate the position that the mouse
     * is actually at relative to the top left of the stage. This is needed because the position of mouse
     * events is normally relative to the document itself, which may be larger than the actual window.
     *
     * @param {Event} event the mouse movement or click event
     * @returns {nurdz.game.Point}
     */
    nurdz.game.Stage.prototype.calculateMousePos = function (event)
    {
        // Some math has to be done because the mouse position is relative to document, which may have
        // dimensions larger than the current viewable area of the browser window.
        //
        // As a result, we need to ensure that we take into account the position of the canvas in the document
        // AND the scroll position of the document.
        var rect = this.canvas.getBoundingClientRect ();
        var root = document.documentElement;
        var mouseX = event.clientX - rect.left - root.scrollLeft;
        var mouseY = event.clientY - rect.top - root.scrollTop;

        return new nurdz.game.Point (mouseX, mouseY);
    };

    /**
     * Handler for key down events. This gets triggered whenever the game is running and any key is pressed.
     *
     * @param {Event} evt the event object for this event
     */
    var keyDownEvent = function (evt)
    {
        if (currentScene.inputKeyDown (evt))
            evt.preventDefault ();
    };

    /**
     * Handler for key up events. This gets triggered whenever the game is running and any key is released.
     *
     * @param {Event} evt the event object for this event
     */
    var keyUpEvent = function (evt)
    {
        if (currentScene.inputKeyUp (evt))
            evt.preventDefault ();
    };

    /**
     * Handler for mouse movement events. This gets triggered whenever the game is running and the mouse
     * moves over the canvas.
     *
     * @param {Event} evt the event object for this event
     */
    var mouseMoveEvent = function (evt)
    {
        currentScene.inputMouseMove (evt);
    };

    /**
     * Handler for mouse movement events. This gets triggered whenever the game is running and the mouse is
     * clicked over the canvas.
     *
     * @param {Event} evt the event object for this event
     */
    var mouseClickEvent = function (evt)
    {
        currentScene.inputMouseClick (evt);
    };

    /**
     * Turn on input handling for the game. This will capture keyboard events from the document and mouse
     * events for the canvas provided.
     *
     * @param {HTMLCanvasElement} canvas the canvas to listen for mouse events on.
     */
    var enableInputEvents = function (canvas)
    {
        // Mouse events are specific to the canvas.
        canvas.addEventListener ('mousemove', mouseMoveEvent);
        canvas.addEventListener ('mousedown', mouseClickEvent);

        // Keyboard events are document wide because a canvas can't hold the input focus.
        document.addEventListener ('keydown', keyDownEvent);
        document.addEventListener ('keyup', keyUpEvent);
    };

    /**
     * Turn off input handling for the game. This will turn off keyboard events from the document and
     * mouse events for the canvas provided.
     */
    var disableInputEvents = function (canvas)
    {
        canvas.removeEventListener ('mousemove', mouseMoveEvent);
        canvas.removeEventListener ('mousedown', mouseClickEvent);
        document.removeEventListener ('keydown', keyDownEvent);
        document.removeEventListener ('keyup', keyUpEvent);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Stage.prototype.toString = function ()
    {
        return String.format ("[Stage dimensions={0}x{1} tileSize={2}]",
                              this.width, this.height,
                              nurdz.game.TILE_SIZE);
    };
} ());
