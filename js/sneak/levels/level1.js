/**
 * When invoked, this returns the data for ChronoSneak test level one.
 *
 * @param {nurdz.game.Stage} stage the stage that the level will be displayed on
 * @returns {nurdz.game.LevelData} the level data for level one
 */
nurdz.sneak.levels.getLevelOne = function (stage)
{
    // Create and return the object.
    return new nurdz.game.LevelData (stage, "level1", 25, 18, [
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 0, 2, 2, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 2, 2,
        2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
        2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2,
        2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
    ], [
        // The location the player will start at.
        new nurdz.sneak.PlayerStartEntity (23, 11, {id: 'playerStart', visible: false}),

        new nurdz.sneak.LevelGoal (1, 5, {id: 'winGoal'}),
        new nurdz.sneak.LevelGoal (0, 4, {id: 'loseGoal', winLevel: false}),

        new nurdz.sneak.Door (4, 8, {open: false, openTime: 14, id: "exitDoor"}),
        new nurdz.sneak.Door (19, 11, {open: true, openTime: 3, id: "autoDoor1"}),
        new nurdz.sneak.Door (19, 15, {open: false, openTime: 2}),
        new nurdz.sneak.Door (11, 10, {open: false, id: "door2"}),
        new nurdz.sneak.Door (14, 4, {open: false, horizontal: true, id: "door1"}),
        new nurdz.sneak.Door (22, 5, {open: false, horizontal: true, id: "door3"}),

        new nurdz.sneak.Door (15, 15, {open: false, openTime: 1, id: "guardBlock"}),

        new nurdz.sneak.Button (22, 9, {orientation: "top", pressed: false, trigger: "loseGoal"}),
        new nurdz.sneak.Button (20, 13,
                                {orientation: "left", pressed: true, cycleTime: 3, trigger: "autoDoor1"}),
        new nurdz.sneak.Button (15, 6, {orientation: "right", trigger: ["door1", "door3"]}),
        new nurdz.sneak.Button (14, 1, {orientation: "top", trigger: "door2"}),
        new nurdz.sneak.Button (10, 11,
                                {orientation: "bottom", trigger: "exitDoor", pressed: true, id: "exitBtn"}),
        new nurdz.sneak.Button (10, 15, {orientation: "top", trigger: "exitBtn"}),

        new nurdz.sneak.Waypoint (21, 11, {visible: true, id: "gStart1"}),
        new nurdz.sneak.Waypoint (18, 11, {visible: true, id: "pStart1"}),
        new nurdz.sneak.Waypoint (18, 8, {visible: true, id: "way1"}),
        new nurdz.sneak.Waypoint (18, 15, {visible: true, id: "way2"}),
        new nurdz.sneak.Waypoint (12, 15, {visible: true, id: "way3"}),
        new nurdz.sneak.Waypoint (12, 8, {visible: true, id: "way4"}),

        new nurdz.sneak.GuardBase ("gStart1", {
            patrolLoop: true,
            patrol:     ["pStart1", "way2", "way3", "way4", "way1"]
        })
    ], nurdz.sneak.stdTiles);
};

