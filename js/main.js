(function ()
{
    "use strict";

    /**
     * Set up the button on the page to toggle the state of the game.
     *
     * @param {nurdz.game.Stage} stage the stage to control.
     * @param {String} buttonID the ID of the button to mark up.
     */
    function setupButton (stage, buttonID)
    {
        // True when the game is running, false when it is not. This state is toggled by the button. We
        // assume that the game is going to start running.
        var gameRunning = true;

        // Get the button.
        var button = document.getElementById (buttonID);
        if (button == null)
            throw new ReferenceError ("No button found with ID '" + buttonID + "'");

        // Set up the button to toggle the stage.
        button.addEventListener ("click", function ()
        {
            if (gameRunning)
                stage.stop ();
            else
                stage.run ();

            gameRunning = !gameRunning;
            button.innerHTML = gameRunning ? "Stop Game" : "Restart Game";
        });
    }

    // Once the DOM is loaded, set things up.
    nurdz.contentLoaded (window, function ()
    {
        // Alias the constant values.
        var cv = nurdz.sneak.constants;

        try
        {
            // Set up the stage.
            var stage = new nurdz.game.Stage (cv.STAGE_WIDTH, cv.STAGE_HEIGHT, 'gameContent');

            // Set up the button that will stop the game if something goes wrong.
            setupButton (stage, "controlBtn");

            // Register all of our scenes.
            stage.addScene (cv.SCENE_TITLE, new nurdz.sneak.TitleScene (stage));

            // Switch to the title screen scene and run the game.
            stage.switchToScene (cv.SCENE_TITLE);
            stage.run ();
        }
        catch (error)
        {
            console.log ("Error starting the game")
        }

    });
} ());
