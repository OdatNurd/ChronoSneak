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
 *    - 'panel': true or false (default: false)
 *       - When this is set to true, the button renders as a wall panel instead of a button. Visually this
 *         means that the panel does not change size but does show a green light when it is open and a red
 *         light when it is closed.
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
        panel:     false,
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
     * When rendering as a button, this determines how wide the button is.
     *
     * @const
     * @type {Number}
     */
    var BUTTON_WIDTH = Math.floor (nurdz.game.TILE_SIZE / 2);

    /**
     * When rendering as a button, this determines how thick the button is when it appears pressed.
     *
     * @const
     * @type {Number}
     */
    var BUTTON_IN_SIZE = Math.floor (nurdz.game.TILE_SIZE * 0.20);

    /**
     * When rendering as a button, this determines how thick the button is when it is not pressed.
     *
     * @const
     * @type {Number}
     */
    var BUTTON_OUT_SIZE = Math.floor (nurdz.game.TILE_SIZE * 0.45);

    /**
     * When rendering as a wall panel, this determines how tall the panel appears.
     *
     * @const
     * @type {Number}
     */
    var PANEL_HEIGHT = Math.floor (nurdz.game.TILE_SIZE / 2);

    /**
     * When rendering as a wall panel, this determines how wide the panel appears.
     *
     * @const
     * @type {Number}
     */
    var PANEL_WIDTH = Math.floor (nurdz.game.TILE_SIZE * 0.30);

    /**
     * When rendering as a wall panel, this is how far away from the "floor" edge of the tile the panel
     * appears.
     *
     * @const
     * @type {Number}
     */
    var PANEL_MARGIN = 3;

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.Button.prototype.validateProperties = function ()
    {
        // Validate properties
        this.isPropertyValid ("panel", "boolean", true);
        this.isPropertyValid ("pressed", "boolean", true);
        this.isPropertyValid ("cycleTime", "number", true);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * This method queries whether the entity provided is able to interact with this entity. This can be as
     * simple or as introspective as desired, e.g.) any class of entity, only a certain class of entity,
     * or only entities with certain properties.
     *
     * The default is to deny access to all interaction.
     *
     * @returns {Boolean} true if this entity can be interacted with by the passed in entity, or false
     * otherwise.
     */
    nurdz.sneak.Button.prototype.canInteractWith = function (otherEntity)
    {
        // The player can interact with the button if they are no more than 90 degrees turned away from
        // its facing. Any more than that and they have their back to it.
        if (otherEntity instanceof nurdz.sneak.Player)
        {
            // If this is a panel, the player has to be facing in the direction opposite us; panels are
            // too complicated to operate without your full attention.
            //
            // When we are a button you can be facing the button or have it on your left or right, but you
            // have to be on the same map tile.
            if (this.properties.panel)
                return this.angleToNewFacing (otherEntity.properties.facing) == 180;
            else
                return this.angleToNewFacing (otherEntity.properties.facing) <= 90 &&
                    this.mapPosition.equals (otherEntity.mapPosition);
        }

        // No other entity can interact with this.
        return false;
    };

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.Button.prototype.blocksActorMovement = function ()
    {
        // When we're a panel, we should block movement because we should be affixed to a wall. As a
        // button, the player has to stand on the button to activate it.
        return this.properties.panel == true;
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
            // Now draw the button as if we are on the right hand side of the map tile. The rotation will
            // handle positioning things on the appropriate side of the tile.
            this.startRendering (stage, this.properties.facing);

            // We render differently as a panel than we do as a button.
            if (this.properties.panel)
            {
                // Now that this seems backwards because width and height as in the wrong order, but the
                // constants are named for what they do and we happen to be visually drawing the panel
                // rotated 90 degrees from what you might think.
                stage.fillRect ((this.width / 2) - PANEL_HEIGHT - PANEL_MARGIN, -(PANEL_WIDTH / 2),
                                PANEL_HEIGHT, PANEL_WIDTH, '#787878');

                // Now an indication of whether the panel is currently pressed or not.
                stage.fillCircle(0, 0, PANEL_WIDTH / 2, this.properties.pressed ? "#00cc00" : "#cc0000");
            }
            else
            {
                // Calculate the Y position of the top of the button graphic.
                var renderY = -((this.height / 2) - (BUTTON_WIDTH / 2));

                if (this.properties.pressed)
                    stage.fillRect ((this.width / 2) - BUTTON_IN_SIZE, renderY,
                                    BUTTON_IN_SIZE, BUTTON_WIDTH, this.debugColor);
                else
                    stage.fillRect ((this.width / 2) - BUTTON_OUT_SIZE, renderY,
                                    BUTTON_OUT_SIZE, BUTTON_WIDTH, this.debugColor);
            }

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
