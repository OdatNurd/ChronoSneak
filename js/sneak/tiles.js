/**
 * The standard tile set used in the game.
 *
 * @type {nurdz.game.Tileset}
 */
nurdz.sneak.stdTiles = new nurdz.game.Tileset ("standardTiles", [
    new nurdz.sneak.FloorTile (),
    new nurdz.sneak.WallTile (),
    new nurdz.sneak.PlayerStartTile ()
]);
