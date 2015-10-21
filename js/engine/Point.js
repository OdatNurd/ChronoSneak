/**
 * This class represents a single point as a pair of X,Y coordinates. This also includes simple operations
 * such as setting and clamping of values.
 *
 * @param {Number} x X-coordinate of this point
 * @param {Number} y Y-coordinate of this point
 * @constructor
 */
nurdz.game.Point = function (x, y)
{
    "use strict";

    /**
     * X-coordinate of this point.
     *
     * @type {Number}
     */
    this.x = x;

    /**
     * Y-coordinate of this point.
     *
     * @type {Number}
     */
    this.y = y;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * Set the position of this point to the values passed in.
     *
     * @param {Number} x the new X-coordinate
     * @param {Number} y the enw Y-coordinate
     */
    nurdz.game.Point.prototype.setPos = function (x, y)
    {
        this.x = x;
        this.y = y;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this point to the same as the point passed in.
     *
     * @param {nurdz.game.Point} point the point to copy from
     */
    nurdz.game.Point.prototype.setToPoint = function (point)
    {
        this.setPos (point.x, point.y);
    };

    /**
     * Translate the location of this point using the values passed in. No range checking is done.
     *
     * @param {Number} deltaX the change in X-coordinate
     * @param {Number} deltaY the change in Y-coordinate
     */
    nurdz.game.Point.prototype.translate = function (deltaX, deltaY)
    {
        this.x += deltaX;
        this.y += deltaY;
    };

    /**
     * Clamp the value of the X-coordinate of this point so that it is between the min and max values
     * provided, inclusive.
     *
     * @param {Number} minX the minimum X-coordinate to allow
     * @param {Number} maxX the maximum Y-coordinate to allow
     */
    nurdz.game.Point.prototype.clampX = function (minX, maxX)
    {
        if (this.x < minX)
            this.x = minX;
        else if (this.x > maxX)
            this.x = maxX;
    };

    /**
     * Clamp the value of the Y-coordinate of this point so that it is between the min and max values
     * provided, inclusive.
     *
     * @param {Number} minY the minimum Y-coordinate to allow
     * @param {Number} maxY the maximum Y-coordinate to allow
     */
    nurdz.game.Point.prototype.clampY = function (minY, maxY)
    {
        if (this.y < minY)
            this.y = minY;
        else if (this.y > maxY)
            this.y = maxY;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Clamp the X and Y values of the provided point so that they are within the bounds of the stage
     * provided.
     *
     * @param {nurdz.game.Stage} stage the stage to clamp to
     */
    nurdz.game.Point.prototype.clampToStage = function (stage)
    {
        this.clampX (0, stage.width - 1);
        this.clampY (0, stage.height - 1);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Point.prototype.toString = function ()
    {
        return "[Point: " + this.x + ", " + this.y + "]";
    };
} ());
