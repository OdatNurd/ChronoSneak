(function ()
{
    "use strict";

    // Once the DOM is loaded, set things up.
    nurdz.contentLoaded (window, function ()
    {
        // Set up the stage.
        new nurdz.game.Stage (nurdz.sneak.constants.STAGE_WIDTH, nurdz.sneak.constants.STAGE_HEIGHT,
                              'gameContent');
    });
} ());
