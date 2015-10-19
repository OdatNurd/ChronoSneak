(function ()
{
    "use strict";

    // Once the DOM is loaded, set things up.
    nurdz.contentLoaded (window, function ()
    {
        // Set up the stage.
        var stage = new nurdz.game.Stage (nurdz.sneak.constants.STAGE_WIDTH,
                                          nurdz.sneak.constants.STAGE_HEIGHT,
                                          'gameContent');

        // Register all of our scenes.
        stage.addScene (nurdz.sneak.constants.SCENE_TITLE, new nurdz.game.TitleScene ());

        // Switch to the title screen scene and run the game.
        stage.switchToScene (nurdz.sneak.constants.SCENE_TITLE);
        stage.run ();
    });
} ());
