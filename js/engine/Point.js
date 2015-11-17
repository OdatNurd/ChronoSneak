/**
 * This class represents a single point as a pair of X,Y coordinates. This also includes simple operations
 * such as setting and clamping of values, as well as making copies.
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

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this point to the same as the point passed in.
     *
     * @param {nurdz.game.Point} point the point to copy from
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.setTo = function (point)
    {
        this.setToXY (point.x, point.y);
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this point to the values passed in.
     *
     * @param {Number} x the new X-coordinate
     * @param {Number} y the enw Y-coordinate
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.setToXY = function (x, y)
    {
        this.x = x;
        this.y = y;
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Translate the location of this point using the values passed in. No range checking is done.
     *
     * @param {nurdz.game.Point} delta the point that contains both delta values
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.translate = function (delta)
    {
        return this.translateXY (delta.x, delta.y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Translate the location of this point using the values passed in. No range checking is done.
     *
     * @param {Number} deltaX the change in X-coordinate
     * @param {Number} deltaY the change in Y-coordinate
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.translateXY = function (deltaX, deltaY)
    {
        this.x += deltaX;
        this.y += deltaY;
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Calculate and return the value of the point that is some distance away from this point at the angle
     * provided.
     *
     * This works by using trig and assuming that the point desired is the point that describes the
     * hypotenuse of a right triangle.
     *
     * @param {Number} angle the angle desired, in degrees
     * @param {Number} distance the desired distance from this point
     * @returns {nurdz.game.Point}
     */
    nurdz.game.Point.prototype.pointAtAngle = function (angle, distance)
    {
        // Convert the incoming angle to radians.
        angle *= (Math.PI / 180);

        // We treat this like a right angle triangle problem.
        //
        // Since we know that the cosine is the ratio between the lengths of the adjacent and hypotenuse and
        // the sine is the ratio between the opposite and the hypotenuse, we can calculate those values for
        // the angle we were given, realizing that the adjacent side is the X component and the opposite
        // is the Y component (draw it on paper if you need to).
        //
        // By multiplying each value with the distance required (the provided distance is the length of
        // the hypotenuse in the triangle), we determine what the actual X and Y values for the point is.
        //
        // Note that these calculations assume that the origin is the point from which the hypotenuse
        // extends, and so we need to translate the calculated values by the position of that point to get
        // the final location of where the end of the line falls.
        return new nurdz.game.Point (Math.cos (angle), Math.sin (angle)).scale (distance).translate (this);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Reduce the components in this point by dividing each by the factor provided. This allows for some
     * simple coordinate conversions in a single step. After conversion the points are rounded down to ensure
     * that the coordinates remain integers.
     *
     * This is a special case of scale() that is more straight forward for use in some cases.
     *
     * @param {Number} factor the amount to divide each component of this point by
     * @returns {nurdz.game.Point} a copy of this point with its values divided by the passed in factor
     * @see nurdz.game.Point.scale
     * @see nurdz.game.Point.copyScaled
     */
    nurdz.game.Point.prototype.reduce = function (factor)
    {
        this.x = Math.floor (this.x / factor);
        this.y = Math.floor (this.y / factor);
        return this
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Scale the components in this point by multiplying each by the scale factor provided. This allows for
     * some simple coordinate conversions in a single step. After conversion the points are rounded down to
     * ensure that the coordinates remain integers.
     *
     * @param {Number} scale the amount to multiply each component of this point by
     * @returns {nurdz.game.Point} this point after the scale, for chaining calls.
     * @see nurdz.game.Point.reduce
     * @see nurdz.game.Point.copyReduced
     */
    nurdz.game.Point.prototype.scale = function (scale)
    {
        this.x = Math.floor (this.x * scale);
        this.y = Math.floor (this.y * scale);
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Clamp the value of the X-coordinate of this point so that it is between the min and max values
     * provided, inclusive.
     *
     * @param {Number} minX the minimum X-coordinate to allow
     * @param {Number} maxX the maximum Y-coordinate to allow
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.clampX = function (minX, maxX)
    {
        if (this.x < minX)
            this.x = minX;
        else if (this.x > maxX)
            this.x = maxX;
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Clamp the value of the Y-coordinate of this point so that it is between the min and max values
     * provided, inclusive.
     *
     * @param {Number} minY the minimum Y-coordinate to allow
     * @param {Number} maxY the maximum Y-coordinate to allow
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.clampY = function (minY, maxY)
    {
        if (this.y < minY)
            this.y = minY;
        else if (this.y > maxY)
            this.y = maxY;
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Clamp the X and Y values of the provided point so that they are within the bounds of the stage
     * provided.
     *
     * @param {nurdz.game.Stage} stage the stage to clamp to
     * @returns {nurdz.game.Point} this point after the translation, for chaining calls.
     */
    nurdz.game.Point.prototype.clampToStage = function (stage)
    {
        this.clampX (0, stage.width - 1);
        this.clampY (0, stage.height - 1);
        return this;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Return a new point instance that is a copy of this point.
     *
     * @returns {nurdz.game.Point} a duplicate of this point
     * @see nurdz.game.Point.copyTranslatedXY
     */
    nurdz.game.Point.prototype.copy = function ()
    {
        return new nurdz.game.Point (this.x, this.y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Return a new point instance that is a copy of this point, with its values translated by the values
     * passed in.
     *
     * @param {nurdz.game.Point} translation the point to translate this point by
     * @returns {nurdz.game.Point} a duplicate of this point, translated by the value passed in
     * @see nurdz.game.Point.copy
     * @see nurdz.game.Point.copyTranslatedXY
     */
    nurdz.game.Point.prototype.copyTranslated = function (translation)
    {
        return this.copyTranslatedXY (translation.x, translation.y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Return a new point instance that is a copy of this point, with its values translated by the values
     * passed in.
     *
     * @param {Number} x the amount to translate the X value by
     * @param {Number} y the amount to translate the Y value by
     * @returns {nurdz.game.Point} a duplicate of this point, translated by the value passed in
     * @see nurdz.game.Point.copy
     * @see nurdz.game.Point.copyTranslated
     */
    nurdz.game.Point.prototype.copyTranslatedXY = function (x, y)
    {
        var retVal = this.copy ();
        return retVal.translateXY (x, y);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Create and return a copy of this point in which each component is divided by the factor provided.
     * This allows for some simple coordinate conversions in a single step. After conversion the points
     * are rounded down to ensure that the coordinates remain integers.
     *
     * This is a special case of scale() that is more straight forward for use in some cases.
     *
     * @param {Number} factor the amount to divide each component of this point by
     * @returns {nurdz.game.Point} a copy of this point with its values divided by the passed in factor
     * @see nurdz.game.Point.scale
     * @see nurdz.game.Point.copyScaled
     */
    nurdz.game.Point.prototype.copyReduced = function (factor)
    {
        return this.copy ().reduce (factor);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Create and return a copy of this point in which each component is scaled by the scale factor
     * provided. This allows for some simple coordinate conversions in a single step. After conversion the
     * points are rounded down to ensure that the coordinates remain integers.
     *
     * @param {Number} scale the amount to multiply each component of this point by
     * @returns {nurdz.game.Point} a copy of this point with its values scaled by the passed in factor
     * @see nurdz.game.Point.reduce
     * @see nurdz.game.Point.copyReduced
     */
    nurdz.game.Point.prototype.copyScaled = function (scale)
    {
        return this.copy ().scale (scale);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Compares this point to the point passed in to determine if they represent the same point.
     *
     * @param {nurdz.game.Point} other the point to compare to
     * @returns {Boolean} true or false depending on equality
     */
    nurdz.game.Point.prototype.equals = function (other)
    {
        return this.x == other.x && this.y == other.y;
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Compares this point to the point passed in to determine if they represent the same point.
     *
     * @param {Number} x the x value to compare to
     * @param {Number} y the y value to compare to
     * @returns {Boolean} true or false depending on equality
     */
    nurdz.game.Point.prototype.equalsXY = function (x, y)
    {
        return this.x == x && this.y == y;
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Point.prototype.toString = function ()
    {
        return String.format ("[{0}, {1}]", this.x, this.y);
    };
} ());
