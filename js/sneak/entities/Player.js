/**
 * The ChronoEntity that represents the player in the game. Actions that the player takes are carried out
 * on this entity type.
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.Player = function (stage, x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type. Waypoints are not meant to be visible,
    // they're just markers.
    this.defaultProperties = {
        id:         "player",
        handedness: "right"
    };

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, 'Player', stage, x, y, properties, 10, '#009000');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Player.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Player
        }
    });

    /**
     * The size (in pixels) of border to apply on all edges of the cell that the player is in when
     * rendering it.
     *
     * @const
     * @type {number}
     */
    var MARGIN = Math.floor (nurdz.game.TILE_SIZE * 0.15);

    /**
     * Render this actor to the stage provided. We simply render a box using the debug color.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Player.prototype.render = function (stage)
    {
        this.startRendering (stage, this.properties.facing);
        stage.fillRect (-(this.width / 2) + MARGIN, -(this.height / 2) + MARGIN,
                        this.width - (2 * MARGIN), this.height - (2 * MARGIN),
                        this.debugColor);
        stage.setArrowStyle("#000000");
        stage.drawArrow (-(this.width / 2) + MARGIN, 0, (this.width / 2) - MARGIN, 0);
        this.endRendering (stage);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Player.prototype.toString = function ()
    {
        return String.format ("[Player id='{0}' pos={1}]",
                              this.properties.id,
                              this.mapPosition.toString());
    };
} ());
