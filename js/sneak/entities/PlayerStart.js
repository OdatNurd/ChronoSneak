/**
 * An entity whose job it is to record the location at which the player starts in a level.
 *
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties=null] the properties specific to this entity, or null
 * @constructor
 */
nurdz.sneak.PlayerStartEntity = function (x, y, properties)
{
    "use strict";

    // Set the default properties of this property to contain an ID.
    this.defaultProperties = {id: 'playerStart'};

    /**
     * Cache of the tile size that we're using.
     *
     * @type {Number}
     */
    this.tileSize = nurdz.sneak.constants.TILE_SIZE;

    // Call the super class constructor.
    nurdz.game.Entity.call (this, "PlayerStartEntity", x, y, this.tileSize, this.tileSize, properties || {}, 'white');

    // In ChronoSneak, entities are meant to be placed with map data, and so when created they take
    // coordinates in tile space and then convert to pixel space here. This makes specifying the
    // coordinates for the data when hand creating levels easier.
    this.position.x *= this.width;
    this.position.y *= this.height;
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.PlayerStartEntity.prototype = Object.create (nurdz.game.Entity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.PlayerStartEntity
        }
    });

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.PlayerStartEntity.prototype.blocksActorMovement = function ()
    {
        // The player start entity is just a marker, so don't make it block anything.
        return false;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.PlayerStartEntity.prototype.render = function (stage)
    {
        var x = this.position.x;
        var y = this.position.y;

        stage.canvasContext.fillStyle = this.debugColor;
        stage.canvasContext.beginPath ();
        stage.canvasContext.moveTo (x + 5, y + 5);
        stage.canvasContext.lineTo (x + this.width - 5, y + this.height - 5);
        stage.canvasContext.moveTo (x + 5, y + this.height - 5);
        stage.canvasContext.lineTo (x + this.width - 5, y + 5);
        stage.canvasContext.stroke ();
    };
} ());
