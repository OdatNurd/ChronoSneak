/**
 * Create the stage on which all rendering for the game will be done.
 *
 * A canvas will be created at the provided dimensions and will be inserted into the DOM as the last child
 * of the container DIV provided.
 *
 * The CSS of the DIV will be modified to have a width and height of the canvas, with options that cause
 * it to center itself.
 *
 * @param {Number} width the width of the stage (in pixels)
 * @param {Number} height the height of the stage (in pixels)
 * @param {String} containerDivID the ID of the DIV that should contain the created canvas
 * @constructor
 */
function Stage (width, height, containerDivID)
{
    "use strict";

    // Get the container that will hold the canvas.
    var container = document.getElementById (containerDivID);
    if (container == null)
        throw new Error ("Unable to create stage: No such element with ID '" + containerDivID + "'");

    // Now create the canvas and give it the appropriate dimensions.
    var canvas = document.createElement ("canvas");
    canvas.width = width;
    canvas.height = height;

    // Modify the style of the container div to make it center horizontally.
    container.style.width = width + "px";
    container.style.height = height + "px";
    container.style.marginLeft = "auto";
    container.style.marginRight = "auto";

    // Get the context for the canvas and then clear it.
    var context = canvas.getContext ('2d');
    context.fillStyle = 'black';
    context.fillRect (0, 0, canvas.width, canvas.height);

    // Append the canvas to the container
    container.appendChild (canvas);
}
