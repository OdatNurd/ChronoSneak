/**
 * This class represents the base class for simple actors that know how to position and render themselves.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {Number} x x location for this actor
 * @param {Number} y y location for this actor
 * @param {Number} width width for this actor
 * @param {Number} height height for this actor
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.game.Actor = function (name, x, y, width, height, debugColor)
{
    "use strict";

    /**
     * The name of this actor type, for debugging purposes. There may be many actors with the same name.
     *
     * @type {String}
     */
    this.name = name;

    /**
     * The current X position of this actor.
     *
     * @type {Number}
     */
    this.x = x;

    /**
     * The current Y position of this actor
     *
     * @type {Number}
     */
    this.y = y;

    /**
     * How wide this actor is, in pixels.
     *
     * @type {Number}
     */
    this.width = width;

    /**
     * How tall this actor is, in pixels.
     *
     * @type {Number}
     */
    this.height = height;

    /**
     * The color to render debug markings for this actor with.
     *
     * @type {String}
     */
    this.debugColor = debugColor || 'white';
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    /**
     * Update internal state for this actor. The default implementation does nothing.
     *
     * @param {nurdz.game.Stage} stage the stage the actor is on
     */
    nurdz.game.Actor.prototype.update = function (stage)
    {
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.game.Actor.prototype.render = function (stage)
    {
        stage.colorRect (this.x, this.y, this.width, this.height, this.debugColor);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Actor.prototype.toString = function ()
    {
        return "[Actor: " + this.name + "]";
    };
} ());
