/**
 * This is the primary user controlled entity trigger for triggering other arbitrary entities. They can
 * render themselves as either pressed or released in one of four orientations.
 *
 * Buttons are either pressed or released. A trigger (by any entity) when they are in their released state
 * causes them to change to a pressed state and also trigger all linked entities. In the released state
 * any entity but the player can trigger them, which causes the button to reset.
 *
 * Properties on the button allow it to cycle back to a released state after it is pressed.
 *
 * The facing of the button determines what side of the map tile it is rendered on.
 *
 * This entity supports the following properties:
 *    - 'pressed': true or false (default: false)
 *       - Controls whether the button appears pressed or not
 *    - 'cycleTime': integer (default: -1)
 *       - Specifies how many turns a button appears pressed before it resets. -1 means that the button
 *         never resets unless something else triggers it to do so (Player entities cannot do this)
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.Button = function (stage, x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {
        pressed:   false,
        cycleTime: -1
    };

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "Button", stage, x, y, properties, 100, '#CC5200');

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
    var BUTTON_WIDTH = Math.floor (nurdz.game.TILE_SIZE / 2);

    /**
     * How thick a button is when it is pressed.
     *
     * @const
     * @type {number}
     */
    var BUTTON_IN_SIZE = Math.floor (nurdz.game.TILE_SIZE * 0.20);

    /**
     * How thick a button is when it is not pressed.
     *
     * @const
     * @type {number}
     */
    var BUTTON_OUT_SIZE = Math.floor (nurdz.game.TILE_SIZE * 0.45);

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

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * This method queries whether the player is able to interact with this entity using the interaction
     * keys. Any entity which returns false from this cannot be interacted with. Examples of that include
     * marker entities like waypoints.
     *
     * @returns {Boolean} true if this entity is interactive, or false otherwise.
     */
    nurdz.sneak.Button.prototype.isInteractive = function ()
    {
        // The player can interact with a button in order to trigger it and thus trigger some other entity.
        return true;
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
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Button.prototype.render = function (stage)
    {
        // Are we visible?
        if (this.properties.visible)
        {
            // Calculate the Y position of the top of the button graphic.
            var renderY = -((this.height / 2) - (BUTTON_WIDTH / 2));

            // Now draw the button as if we are on the right hand side of the map tile. The rotation will
            // handle positioning things on the appropriate side of the tile.
            this.startRendering (stage, this.properties.facing);

            if (this.properties.pressed)
                stage.fillRect ((this.width / 2) - BUTTON_IN_SIZE, renderY,
                                BUTTON_IN_SIZE, BUTTON_WIDTH, this.debugColor);
            else
                stage.fillRect ((this.width / 2) - BUTTON_OUT_SIZE, renderY,
                                BUTTON_OUT_SIZE, BUTTON_WIDTH, this.debugColor);

            this.endRendering (stage);
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * Entities are actors, which means tha they have an update and a render function. The update function
     * in an entity is meant to do things like visually update its appearance. The step function is used
     * to give the entity a "tick" to see if there is something that it wants to do. This might be
     * initiate a chase, decide a door needs to close, etc.
     *
     * The entity is given a reference to the level that contains it to assist in this.
     *
     * @param {nurdz.game.Level} level the level the entity is contained in
     */
    nurdz.sneak.Button.prototype.step = function (level)
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

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Button.prototype.toString = function ()
    {
        return String.format ("[Button id='{0}' pos={1} pressed={2}]",
                              this.properties.id,
                              this.mapPosition.toString(),
                              this.properties.pressed);
    };
} ());
