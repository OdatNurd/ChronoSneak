/**
 * A Tile that represents the Player start location. Ths class subclasses the FloorTile class but has a
 * different name and underlying ID so that it can be a marker in the level.
 *
 * This should really be an entity reference, but first we need entities.
 *
 * @constructor
 * @see nurdz.sneak.FloorTile
 */
nurdz.sneak.PlayerStartTile = function ()
{
    "use strict";

    // Call the super class constructor. Note that we actually subclass FloorTile (see the method area
    // below) but for purposes of the constructor we need to invoke the Tile constructor, or we will be
    // built like a floor and thus indistinguishable.
    nurdz.game.Tile.call (this, "PLAYER_START", 1);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.PlayerStartTile.prototype = Object.create (nurdz.sneak.FloorTile.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.PlayerStartTile
        }
    });

} ());
