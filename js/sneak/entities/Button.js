/**
 * This is the entity which, when triggered via interaction with the player, causes a trigger to occur on
 * other entities.
 *
 * This entity supports the following properties:
 *    - 'pressed': true or false (default: false)
 *       - Controls whether the button appears pressed or not
 *    - 'cycleTime': integer (default: -1)
 *       - Specifies how many turns a button appears pressed before it resets. -1 means that the button
 *         never resets unless something else triggers it to.
 *    - 'orientation': "right", "left", "top", "bottom" (default: "right")
 *       - The side of the tile the button appears to be on.
 *
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.Button = function (x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {pressed: false, cycleTime: -1, orientation: "right"};

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "Button", null, x, y, properties, 100, '#cA0000');

    // NOTE: The code below is below the constructor call because it is the super constructor that will
    // apply the defaults to the properties given, so it's not until that call returns that we can access
    // the values in the properties safely.

    /**
     * This value counts the number of turns until the door should automatically swap states. When the
     * door is open, this counts down turns until it should close and vice-versa. A value of -1 indicates
     * that the state is stable until triggered by outside forces.
     *
     * @type {Number}
     */
    this.turnsUntilToggle = (this.properties.pressed ? this.properties.cycleTime : -1);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Button.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Button
        }
    });

    /**
     * How wide a button is on the wall.
     *
     * @const
     * @type {Number}
     */
    var BUTTON_WIDTH = Math.floor (nurdz.sneak.constants.TILE_SIZE / 2);

    /**
     * How thick a button is when it is pressed.
     *
     * @const
     * @type {number}
     */
    var BUTTON_IN_SIZE = 6;

    /**
     * How thick a button is when it is not pressed.
     *
     * @const
     * @type {number}
     */
    var BUTTON_OUT_SIZE = 14;

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.Button.prototype.validateProperties = function ()
    {
        // Validate properties
        this.isPropertyValid ("pressed", "boolean", true);
        this.isPropertyValid ("cycleTime", "number", true);
        this.isPropertyValid ("orientation", "string", true, ["top", "bottom", "left", "right"]);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.Button.prototype.blocksActorMovement = function ()
    {
        // The player needs to stand on the button to activate it, so we can't block.
        return false;
    };

    /**
     * Renders the entity as a button on the left side of the tile that is either pressed or released,
     * depending on the flag passed in.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @param {Boolean} pressed true to render the button as pressed or false to render it as released
     */
    nurdz.sneak.Button.prototype.drawButtonLeft = function (stage, pressed)
    {
        // Based on the button thickness, determine the position of the top left corners of the doors.
        var renderY = this.position.y + ((this.height / 2) - (BUTTON_WIDTH / 2));

        // Render for pressed or released
        if (pressed)
            stage.colorRect (this.position.x, renderY, BUTTON_IN_SIZE, BUTTON_WIDTH, this.debugColor);
        else
            stage.colorRect (this.position.x, renderY, BUTTON_OUT_SIZE, BUTTON_WIDTH, this.debugColor);
    };

    /**
     * Renders the entity as a button on the right side of the tile that is either pressed or released,
     * depending on the flag passed in.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @param {Boolean} pressed true to render the button as pressed or false to render it as released
     */
    nurdz.sneak.Button.prototype.drawButtonRight = function (stage, pressed)
    {
        // Based on the button thickness, determine the position of the top left corners of the doors.
        var renderY = this.position.y + ((this.height / 2) - (BUTTON_WIDTH / 2));

        // Render for pressed or released
        if (pressed)
            stage.colorRect (this.position.x + this.width - BUTTON_IN_SIZE, renderY,
                             BUTTON_IN_SIZE, BUTTON_WIDTH, this.debugColor);
        else
            stage.colorRect (this.position.x + this.width - BUTTON_OUT_SIZE, renderY,
                             BUTTON_OUT_SIZE, BUTTON_WIDTH, this.debugColor);

    };

    /**
     * Renders the entity as a button on the top side of the tile that is either pressed or released,
     * depending on the flag passed in.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @param {Boolean} pressed true to render the button as pressed or false to render it as released
     */
    nurdz.sneak.Button.prototype.drawButtonTop = function (stage, pressed)
    {
        // Based on the button thickness, determine the position of the top left corners of the doors.
        var renderX = this.position.x + ((this.width / 2) - (BUTTON_WIDTH / 2));

        // Render for pressed or released
        if (pressed)
            stage.colorRect (renderX, this.position.y, BUTTON_WIDTH, BUTTON_IN_SIZE, this.debugColor);
        else
            stage.colorRect (renderX, this.position.y, BUTTON_WIDTH, BUTTON_OUT_SIZE, this.debugColor);
    };

    /**
     * Renders the entity as a button on the bottom side of the tile that is either pressed or released,
     * depending on the flag passed in.
     *
     * @param {nurdz.game.Stage} stage the stage to render on
     * @param {Boolean} pressed true to render the button as pressed or false to render it as released
     */
    nurdz.sneak.Button.prototype.drawButtonBottom = function (stage, pressed)
    {
        // Based on the button thickness, determine the position of the top left corners of the doors.
        var renderX = this.position.x + ((this.width / 2) - (BUTTON_WIDTH / 2));

        // Render for pressed or released
        if (pressed)
            stage.colorRect (renderX, this.position.y + this.height - BUTTON_IN_SIZE,
                             BUTTON_WIDTH, BUTTON_IN_SIZE, this.debugColor);
        else
            stage.colorRect (renderX, this.position.y + this.height - BUTTON_OUT_SIZE,
                             BUTTON_WIDTH, BUTTON_OUT_SIZE, this.debugColor);
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Button.prototype.render = function (stage)
    {
        // If the entity is visible, draw a target. Otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            switch (this.properties.orientation)
            {
                case "left":
                    this.drawButtonLeft (stage, this.properties.pressed);
                    break;
                case "right":
                    this.drawButtonRight (stage, this.properties.pressed);
                    break;
                case "top":
                    this.drawButtonTop (stage, this.properties.pressed);
                    break;
                case "bottom":
                    this.drawButtonBottom (stage, this.properties.pressed);
                    break;
            }

        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };

    /**
     * Entities are actors, which means tha they have an update and a render function. The update function
     * in an entity is meant to do things like visually update its appearance. The step function is used
     * to give the entity a "tick" to see if there is something that it wants to do. This might be
     * initiate a chase, decide a door needs to close, etc.
     */
    nurdz.sneak.Button.prototype.step = function ()
    {
        // A step during a pressed state might cause the button to be released. If We are pressed and
        // there are any turns left until the reset happens, then count down.
        if (this.properties.pressed && this.turnsUntilToggle > 0)
            this.turnsUntilToggle--;

        // If there are any turns, toggle the button now.
        if (this.turnsUntilToggle == 0)
            this.properties.pressed = false;
    };

    /**
     * This method is invoked whenever this entity gets triggered by another entity. This can happen
     * programmatically or in response to interactions with other entities, which does not include
     * collision (see triggerTouch() for that).
     *
     * The method gets passed the Actor that caused the trigger to happen, although this can be null
     * depending on how the trigger happened.
     *
     * @param {nurdz.game.Actor|null} activator the actor that triggered this entity, or null if unknown
     * @see nurdz.game.Entity.triggerTouch
     */
    nurdz.sneak.Button.prototype.trigger = function (activator)
    {
        // If the button is not pressed, this counts as a press for it.
        if (this.properties.pressed == false)
        {
            // Flip the state and set the counter for when it should release.
            this.properties.pressed = true;
            this.turnsUntilToggle = this.properties.cycleTime;

            // Trigger all of the entities that have an ID that matches an ID in our trigger list.
            this.triggerLinkedEntities ();
        }
        else
        {
            // The button is currently visually pressed in. If the actor that initiated the trigger is not
            // the player, then handle the trigger by swapping back to the unpressed state. The player is
            // not allowed to reset a button, but other entities (e.g. other buttons) are.
            if (activator instanceof nurdz.sneak.Player == false)
                this.properties.pressed = false;
        }
    };
} ());
