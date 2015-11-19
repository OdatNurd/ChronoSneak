/**
 * This class represents the base class for simple actors that know how to position and render themselves.
 *
 * @param {String} name the internal name of this actor instance, for debugging
 * @param {nurdz.game.Stage} stage the stage that will manage this actor
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
     * The stage that this entity is being managed by.
     *
     * @type {nurdz.game.Stage}
     */
    this.stage = stage;

    /**
     * The position of this actor on the stage. These coordinates are in pixels
     *
     * @type {nurdz.game.Point}
     */
    this.position = new nurdz.game.Point (x, y);

    /**
     * The position of this entity on the map. These coordinates are in tiles.
     *
     * This is just a version of the position we were given as our regular position scaled to be tile map
     * coordinates instead of world coordinates.
     *
     * @type {nurdz.game.Point}
     */
    this.mapPosition = this.position.copyReduced (nurdz.game.TILE_SIZE);

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

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this actor by setting its position on the stage (world coordinates). The position
     * of the actor on the map will automatically be updated.
     *
     * @param {nurdz.game.Point} point the point to set the position to.
     */
    nurdz.game.Actor.prototype.setStagePosition = function (point)
    {
        this.setStagePositionXY (point.x, point.y);
    };

    /**
     * Set the position of this actor by setting its position on the stage (world coordinates). The position
     * of the actor on the map will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.game.Actor.prototype.setStagePositionXY = function (x, y)
    {
        this.position.setToXY (x, y);
        this.mapPosition = this.position.copyReduced (nurdz.game.TILE_SIZE);
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Set the position of this actor by setting its position in the level (map coordinates). The position of
     * the entity on the stage will automatically be updated.
     *
     * @param {nurdz.game.Point} point the point to set the position to.
     */
    nurdz.game.Actor.prototype.setMapPosition = function (point)
    {
        this.setMapPositionXY (point.x, point.y);
    };

    /**
     * Set the position of this actor by setting its position in the level (map coordinates). The position of
     * the entity on the stage will automatically be updated.
     *
     * @param {Number} x the X coordinate of the new stage position
     * @param {Number} y the Y coordinate of the new stage position
     */
    nurdz.game.Actor.prototype.setMapPositionXY = function (x, y)
    {
        this.mapPosition.setToXY (x, y);
        this.position = this.mapPosition.copyScaled (nurdz.game.TILE_SIZE);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.game.Actor.prototype.toString = function ()
    {
        return String.format ("[Actor name='{0}]", this.name);
    };
} ());
