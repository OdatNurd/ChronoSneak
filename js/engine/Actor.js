/**
 * This class represents the base class for simple actors that know how to position and render themselves.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {nurdz.game.Stage|null} stage the stage that will manage this entity or null if it is not known yet
 * @param {Number} x x location for this actor
 * @param {Number} y y location for this actor
 * @param {Number} width width for this actor
 * @param {Number} height height for this actor
 * @param {Number} [zOrder=1] the Z-Order of this actor when rendered (smaller numbers go below larger ones)
 * @param {String} [debugColor='white'] the color specification to use in debug rendering for this actor
 * @constructor
 */
nurdz.game.Actor = function (name, stage, x, y, width, height, zOrder, debugColor)
{
    "use strict";

    /**
     * The name of this actor type, for debugging purposes. There may be many actors with the same name.
     *
     * @type {String}
     */
    this.name = name;

    /**
     * The stage that this entity is being managed by or null if that information is not known yet.
     *
     * @type {nurdz.game.Stage|null}
     */
    this.stage = stage;

    /**
     * The position of this actor.
     *
     * @type {nurdz.game.Point}
     */
    this.position = new nurdz.game.Point (x, y);

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
     * The Z-Order of this actor. When rendered, actors with a lower Z-Order are rendered before actors
     * with a higher Z-Order, allowing some to appear over others.
     *
     * @type {Number}
     */
    this.zOrder = zOrder || 1;

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
        stage.fillRect (this.position.x, this.position.y, this.width, this.height, this.debugColor);
    };

    /**
     * Change the position of this actor to that of the point passed in.
     *
     * @param {nurdz.game.Point} position the new position
     * @see nurdz.game.Actor.setPositionXY
     */
    nurdz.game.Actor.prototype.setPosition = function (position)
    {
        this.position.setToPoint (position);
    };

    /**
     * Change the position of this actor to the coordinates provided.
     *
     * @param {Number} x the new X-coordinate for this actor
     * @param {Number} y the new Y-coordinate for this actor
     * @see nurdz.game.Actor.setPosition
     */
    nurdz.game.Actor.prototype.setPositionXY = function (x, y)
    {
        this.position.setPos (x, y);
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
