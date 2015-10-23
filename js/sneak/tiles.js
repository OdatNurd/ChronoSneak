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

// TODO This should not be here, but one thing at a time.
/**
 * This sub-namespace contains all of the JSON objects that are built in levels in the ChronoSneak web
 * prototype.
 *
 * @alias nurdz.sneak.levels
 * @type {Object.<String,nurdz.sneak.Level>}
 */
nurdz.createNamespace ("nurdz.sneak.levels");
