(function ()
{
    "use strict";

    // Once the DOM is loaded, set things up.
    nurdz.contentLoaded (window, function ()
    {
        var cv = nurdz.sneak.constants;

        // Set up the stage.
        var stage = new nurdz.game.Stage (cv.STAGE_WIDTH, cv.STAGE_HEIGHT, 'gameContent');

        // Register all of our scenes.
        stage.addScene (cv.SCENE_TITLE, new nurdz.game.TitleScene ());

        // Switch to the title screen scene and run the game.
        stage.switchToScene (cv.SCENE_TITLE);
        stage.run ();
    });
} ());
