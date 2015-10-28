/**
 * ChronoSneak test level 1.
 *
 * @type {nurdz.game.LevelData}
 */
nurdz.sneak.levels.level1 = new nurdz.game.LevelData ("level1", 25, 18, [
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

    new nurdz.sneak.Door (4, 8, {open: false, openTime: 14, id: "exitDoor"}),
    new nurdz.sneak.Door (19, 11, {open: true, openTime: 3, id: "autoDoor1"}),
    new nurdz.sneak.Door (19, 15, {open: false, openTime: 2}),
    new nurdz.sneak.Door (11, 10, {open: false, id: "door2"}),
    new nurdz.sneak.Door (14, 4, {open: false, horizontal: true, id: "door1"}),
    new nurdz.sneak.Door (22, 5, {open: false, horizontal: true, id: "door3"}),

    new nurdz.sneak.Button (20, 13, {orientation: "left", pressed: true, cycleTime: 3, trigger: "autoDoor1"}),
    new nurdz.sneak.Button (15, 6, {orientation: "right", trigger: ["door1", "door3"]}),
    new nurdz.sneak.Button (14, 1, {orientation: "top", trigger: "door2"}),
    new nurdz.sneak.Button (10, 11, {orientation: "bottom", trigger: "exitDoor", pressed: true, id: "exitBtn"}),
    new nurdz.sneak.Button (10, 15, {orientation: "top", trigger: "exitBtn"}),

    new nurdz.sneak.Waypoint (21, 11, {visible: true, id: "gStart1"}),
    new nurdz.sneak.Waypoint (18, 11, {visible: true, id: "pStart1"}),
    new nurdz.sneak.Waypoint (18, 8, {visible: true, id: "way1"}),
    new nurdz.sneak.Waypoint (18, 15, {visible: true, id: "way2"}),
    new nurdz.sneak.Waypoint (12, 15, {visible: true, id: "way3"}),
    new nurdz.sneak.Waypoint (12, 8, {visible: true, id: "way4"}),

    new nurdz.sneak.GuardBase ("gStart1")
], nurdz.sneak.stdTiles);

