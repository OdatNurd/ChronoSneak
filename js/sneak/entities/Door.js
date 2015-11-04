/**
 * This entity allows for doors, which block the movement of other entities unless they are open.
 *
 * Doors can be in either a horizontal or vertical orientation, open or closed, and can automatically open
 * and/or close after a set number of triggers. Every time the door is triggered, its state changes to the
 * alternate of its current state, regardless of what the current state is.
 *
 * This entity supports the following properties:
 *    - 'open': true or false (default: false)
 *       - controls whether the door is open or closed. Toggles on trigger.
 *    - 'horizontal': true or false (default: false)
 *       - controls whether the door is rendered as a vertical or horizontal door.
 *    - 'openTime': integer (default: -1)
 *       - An open door will only stay open this many turns, and will then close. The value resets every
 *         time the door opens. A value of -1 means always open (unless manually closed).
 *    - 'closeTime': integer (default: -1)
 *       - A closed door will automatically open after this many turns. The value resets every time the
 *        door closes. A value of -1 means always closed (unless manually opened).
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.Door = function (stage, x, y, properties)
{
    "use strict";

    // Set up the default properties for entities of this type.
    this.defaultProperties = {
        open:       true,
        horizontal: false,
        openTime:   -1,
        closeTime:  -1
    };

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "Door", stage, x, y, properties, 100, '#7a00f4');

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
    this.turnsUntilToggle = (this.properties.open ? this.properties.openTime : this.properties.closeTime);
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.Door.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.Door
        }
    });

    /**
     * How thick doors render.
     *
     * @const
     * @type {Number}
     */
    var DOOR_THICKNESS = Math.floor (nurdz.game.TILE_SIZE / 4);

    /**
     * When doors are open, this specifies how much of the door remains sticking out of the wall to let
     * you know that there is a door there which is open.
     *
     * @const
     * @type {number}
     */
    var DOOR_STUB = Math.floor (nurdz.game.TILE_SIZE * 0.125);

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.Door.prototype.validateProperties = function ()
    {
        // Validate our special properties.
        this.isPropertyValid ("open", "boolean", true);
        this.isPropertyValid ("horizontal", "boolean", true);
        this.isPropertyValid ("openTime", "number", true);
        this.isPropertyValid ("closeTime", "number", true);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.Door.prototype.blocksActorMovement = function ()
    {
        // We block movement when we're not open and don't when we ARE open.
        return !this.properties.open;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.Door.prototype.render = function (stage)
    {
        // If the entity is visible, draw the door. Otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            // The drawing code renders a horizontal door, so if this is a vertical door we need some
            // rotation. It doesn't matter if it's 90 or 270; both work.
            this.startRendering (stage, this.properties.horizontal ? null : 90);

            // Based on the door thickness, determine the position of the top left corners of the door
            // segments.
            var renderY = -(DOOR_THICKNESS / 2);
            if (this.properties.open)
            {
                // Render a left and right side.
                stage.fillRect (-(this.width / 2), renderY, DOOR_STUB, DOOR_THICKNESS, this.debugColor);
                stage.fillRect ((this.width / 2) - DOOR_STUB, renderY,
                                DOOR_STUB, DOOR_THICKNESS, this.debugColor);
            }
            else
                stage.fillRect (-(this.width / 2), renderY, this.width, DOOR_THICKNESS, this.debugColor);

            this.endRendering (stage);
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };

    /**
     * When invoked, this toggles the state of the door from open to closed, and will also reset the
     * appropriate timers for door stage.
     */
    nurdz.sneak.Door.prototype.toggleDoorState = function ()
    {
        // If the door is currently open, we're going to close it. Before we do that, we need to make sure
        // that we're not blocked. If we are, we should leave without doing anything. We don't want to
        // close the door on anything.
        //
        // We can only do this when we have access to the current level information, so that we can check
        // if anything is blocking, and to get that we need the stage.
        if (this.properties.open && this.stage)
        {
            // Get the current scene.
            var scene = this.stage.currentScene ();

            // Get the list of actors in the scene and see if any of them are at our position or not. We
            // count as an actor, so there should be exactly one item in the list (us). Any other number
            // and we are blocked.
            //
            // NOTE: This only works because we bound all of our actors to tile coordinates.
            var actors = scene.actorsAt (this.position);
            if (actors.length != 1)
            {
                console.log ("Can't toggle door this step; currently blocked");
                return;
            }
        }

        // Toggle the state of the door every time we're triggered.
        this.properties.open = !this.properties.open;

        // Reset the automatic timers for changing the door state.
        this.turnsUntilToggle = (this.properties.open ? this.properties.openTime : this.properties.closeTime);
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
    nurdz.sneak.Door.prototype.step = function (level)
    {
        // If we are timing when the door should toggle, count this as a turn.
        if (this.turnsUntilToggle > 0)
            this.turnsUntilToggle--;

        // If the turn count hits 0 exactly, it's time to toggle. The value will be -1 (and thus never
        // decrement) if the stage should not toggle at all.
        if (this.turnsUntilToggle == 0)
            this.toggleDoorState ();
    };

    //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
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
    nurdz.sneak.Door.prototype.trigger = function (activator)
    {
        // Toggle the door stage.
        this.toggleDoorState ();
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.Door.prototype.toString = function ()
    {
        return String.format ("[Door id='{0}' pos={1} type={2}]",
                              this.properties.id,
                              this.mapPosition.toString(),
                              (this.properties.horizontal ? "horizontal" : "vertical"));
    };
} ());
