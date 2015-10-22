/**
 * The standard tile set used in the game.
 *
 * @type {nurdz.sneak.Tileset}
 */
nurdz.sneak.stdTiles = new nurdz.sneak.Tileset ("standardTiles", [
    new nurdz.sneak.FloorTile (),
    new nurdz.sneak.WallTile (),
    new nurdz.sneak.PlayerStartTile ()
]);
