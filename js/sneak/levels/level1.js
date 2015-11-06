/**
 * When invoked, this returns the data for ChronoSneak test level one.
 *
 * @param {nurdz.game.Stage} stage the stage that the level will be displayed on
 * @returns {nurdz.game.LevelData} the level data for level one
 */
nurdz.sneak.levels.getLevelOne = function (stage)
{
    // Create and return the object.
    return new nurdz.sneak.SneakLevelData (stage, "level1", 25, 18, [
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
    /***************************************************
     * The Player
     **************************************************/

        {
            class:   "Player", position: [23, 11],
            facing:  'left',
            visible: true
        },

    /***************************************************
     * Level Goals
     **************************************************/

        {
            class: "LevelGoal", position: [1, 5],
            id:    'winGoal'
        },

        {
            class: "LevelGoal", position: [0, 4],
            id:    'loseGoal'
        },

    /***************************************************
     * Doors
     **************************************************/

        {
            class:    "Door", position: [4, 8],
            id:       "exitDoor",

            open:     false,
            openTime: 16
        },

        {
            class:    "Door", position: [19, 11],
            id:       "autoDoor1",

            open:     true,
            openTime: 4
        },

        {
            class:    "Door", position: [19, 15],

            open:     false,
            openTime: 2
        },

        {
            class: "Door", position: [11, 10],
            id:    "door2",

            open:  false
        },

        {
            class:      "Door", position: [14, 4],
            id:         "door1",

            open:       false,
            horizontal: true
        },

        {
            class:      "Door", position: [22, 5],
            id:         "door3",

            horizontal: true,
            open:       false
        },

        {
            class:    "Door", position: [15, 15],
            id:       "guardBlock",

            open:     false,
            openTime: 3

        },

    /***************************************************
     * Buttons
     **************************************************/

        {
            class:   "Button", position: [22, 9],
            facing: "up",

            trigger: "loseGoal",
            pressed: false
        },

        {
            class:     "Button", position: [20, 13],
            facing: "left",

            trigger:   "autoDoor1",
            pressed:   true,
            cycleTime: 3
        },

        {
            class:   "Button", position: [15, 6],
            facing:  "right",

            trigger: ["door1", "door3"]
        },

        {
            class:   "Button", position: [14, 1],
            facing:  "up",

            trigger: "door2"
        },

        {
            class:   "Button", position: [10, 11],
            id:      "exitBtn",
            facing:  "down",

            trigger: ["exitDoor", "prepExitBtn"],
            pressed: true
        },

        {
            class:   "Button", position: [10, 15],
            id:      "prepExitBtn",
            facing:  "up",

            trigger: "exitBtn"
        },

    /***************************************************
     * Waypoints
     **************************************************/
        {class: "Waypoint", position: [21, 11], id: "gStart1"},
        {class: "Waypoint", position: [18, 11], id: "pStart1"},
        {class: "Waypoint", position: [18, 8], id: "way1"},
        {class: "Waypoint", position: [18, 15], id: "way2"},
        {class: "Waypoint", position: [12, 15], id: "way3"},
        {class: "Waypoint", position: [12, 13], id: "way3a"},
        {class: "Waypoint", position: [7, 13], id: "way3b"},
        {class: "Waypoint", position: [12, 8], id: "way4"},

    /***************************************************
     * Guards
     **************************************************/
        {
            class:      "GuardBase", position: [0, 0],
            handedness: "left",
            facing:     "left",
            spawnPoint: "gStart1",

            patrolLoop: true,
            patrol:     ["pStart1", "way2", "way3", "way3a", "way3b", "way3a", "way4", "way1"]
        }
    ], nurdz.sneak.stdTiles);
};

