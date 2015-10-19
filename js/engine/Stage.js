/**
 * This sub-namespace contains all of the classes and objects to do with the game engine itself. There
 * should (hopefully) be nothing game specific in this namespace.
 *
 * @alias nurdz.game
 * @type {{}}
 */
nurdz.createNamespace ("nurdz.game");

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
     * A simple alias for the class whose methods we are defining.
     * @type {Stage}
     */
    var Stage = nurdz.game.Stage;

    /**
     * Clear the entire stage with the provided color specification, or a default color if no color is
     * specified.
     *
     * @param {String} [color='black'] the color to clear the canvas with
     */
    Stage.prototype.clear = function (color)
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
    Stage.prototype.colorRect = function (x, y, width, height, fillColor)
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
     Stage.prototype.colorCircle = function (x, y, radius, fillColor)
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
    Stage.prototype.colorText = function (text, x, y, fillColor)
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
    Stage.prototype.drawBitmap = function (bitmap, x, y)
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
    Stage.prototype.drawBitmapCentered = function (bitmap, x, y)
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
    Stage.prototype.drawBitmapCenteredWithRotation = function (bitmap, x, y, angle)
    {
        this.canvasContext.save ();
        this.canvasContext.translate (x, y);
        this.canvasContext.rotate (angle);
        this.canvasContext.drawImage (bitmap, -(bitmap.width / 2), -(bitmap.height / 2));
        this.canvasContext.restore ();
    };
} ());
