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
        new nurdz.sneak.Waypoint (stage, 23, 11, {
            id:      'playerStart',
            facing:  'left',
            visible: false
        }),

        new nurdz.sneak.LevelGoal (stage, 1, 5, {
            id: 'winGoal'
        }),
        new nurdz.sneak.LevelGoal (stage, 0, 4, {
            id:       'loseGoal',
            winLevel: false
        }),

        new nurdz.sneak.Door (stage, 4, 8, {
            id:       "exitDoor",
            open:     false,
            openTime: 16
        }),
        new nurdz.sneak.Door (stage, 19, 11, {
            id:       "autoDoor1",
            open:     true,
            openTime: 4
        }),
        new nurdz.sneak.Door (stage, 19, 15, {
            open:     false,
            openTime: 2
        }),
        new nurdz.sneak.Door (stage, 11, 10, {
            id:   "door2",
            open: false
        }),
        new nurdz.sneak.Door (stage, 14, 4, {
            id:         "door1",
            open:       false,
            horizontal: true
        }),
        new nurdz.sneak.Door (stage, 22, 5, {
            id:         "door3",
            open:       false,
            horizontal: true
        }),

        new nurdz.sneak.Door (stage, 15, 15, {
            id:       "guardBlock",
            open:     false,
            openTime: 3
        }),

        new nurdz.sneak.Button (stage, 22, 9, {
            trigger: "loseGoal",
            facing:  "up",
            pressed: false
        }),
        new nurdz.sneak.Button (stage, 20, 13, {
            trigger:   "autoDoor1",
            facing:    "left",
            pressed:   true,
            cycleTime: 3
        }),
        new nurdz.sneak.Button (stage, 15, 6, {
            facing:  "right",
            trigger: ["door1", "door3"]
        }),
        new nurdz.sneak.Button (stage, 14, 1, {
            facing:  "up",
            trigger: "door2"
        }),
        new nurdz.sneak.Button (stage, 10, 11, {
            id:      "exitBtn",
            facing:  "down",
            trigger: ["exitDoor", "prepExitBtn"],
            pressed: true
        }),
        new nurdz.sneak.Button (stage, 10, 15, {
            id: "prepExitBtn",
            facing:  "up",
            trigger: "exitBtn"
        }),

        new nurdz.sneak.Waypoint (stage, 21, 11, {id: "gStart1"}),
        new nurdz.sneak.Waypoint (stage, 18, 11, {id: "pStart1"}),
        new nurdz.sneak.Waypoint (stage, 18, 8, {id: "way1"}),
        new nurdz.sneak.Waypoint (stage, 18, 15, {id: "way2"}),
        new nurdz.sneak.Waypoint (stage, 12, 15, {id: "way3"}),
        new nurdz.sneak.Waypoint (stage, 12, 13, {id: "way3a"}),
        new nurdz.sneak.Waypoint (stage, 7, 13, {id: "way3b"}),
        new nurdz.sneak.Waypoint (stage, 12, 8, {id: "way4"}),

        new nurdz.sneak.GuardBase (stage, "gStart1", {
            facing:     "left",
            patrolLoop: true,
            handedness: "left",
            patrol:     ["pStart1", "way2", "way3", "way3a", "way3b", "way3a", "way4", "way1"]
        })
    ], nurdz.sneak.stdTiles);
};

