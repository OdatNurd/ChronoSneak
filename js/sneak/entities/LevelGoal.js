/**
 * This is the entity which, when triggered, indicates that the level has been completed. This could
 * happen by either stepping onto the goal or also by otherwise triggering it, such as with a button or
 * console.
 *
 * This entity supports the following properties:
 *    - 'winLevel': true or false (default: true)
 *       - Controls whether the trigger causes a level win or failure
 *
 * @param {nurdz.game.Stage} stage the stage that will manage this entity
 * @param {Number} x the X coordinate of the entity, in map coordinates
 * @param {Number} y the Y coordinate of the entity, in map coordinates
 * @param {Object|null} [properties={}] the properties specific to this entity, or null for none
 * @constructor
 */
nurdz.sneak.LevelGoal = function (stage, x, y, properties)
{
    "use strict";

    // By default, triggering a level goal wins the level.
    this.defaultProperties = {winLevel: true};

    // Call the super class constructor.
    nurdz.sneak.ChronoEntity.call (this, "LevelGoal", stage, x, y, properties, 1, 'yellow');
};

// Now define the various member functions and any static stage.
(function ()
{
    "use strict";

    // Now set our prototype to be an instance of our super class, making sure that the prototype knows to
    // use the correct constructor function.
    nurdz.sneak.LevelGoal.prototype = Object.create (nurdz.sneak.ChronoEntity.prototype, {
        constructor: {
            configurable: true,
            enumerable:   true,
            writable:     true,
            value:        nurdz.sneak.LevelGoal
        }
    });

    /**
     * This is automatically invoked at the end of the constructor to validate that the properties object
     * that we have is valid as far as we can tell (i.e. needed properties exist and have a sensible value).
     *
     * This validates that
     */
    nurdz.sneak.LevelGoal.prototype.validateProperties = function ()
    {
        // A property that indicates if this causes a level success or failure
        this.isPropertyValid ("winLevel", "boolean", true);

        // Chain to the super to check properties it might have inserted or know about.
        nurdz.sneak.ChronoEntity.prototype.validateProperties.call (this);
    };

    /**
     * Query whether or not this entity blocks movement of actors or not.
     *
     * @returns {Boolean} true if actor movement is blocked by this tile, or false otherwise
     */
    nurdz.sneak.LevelGoal.prototype.blocksActorMovement = function ()
    {
        // The player can walk over the goal to trigger it, so we can't block.
        return false;
    };

    /**
     * Render this actor to the stage provided. The base class version renders a positioning box for this
     * actor using its position and size, using the debug color provided in the constructor.
     *
     * @param {nurdz.game.Stage} stage the stage to render to
     */
    nurdz.sneak.LevelGoal.prototype.render = function (stage)
    {
        // If the entity is visible, draw a target. Otherwise, chain to the superclass version.
        if (this.properties.visible)
        {
            // For aid of initial debugging of things, if the
            // Calculate the center of the tile that we're on.
            var x = this.position.x + (this.width / 2);
            var y = this.position.y + (this.height / 2);
            var r = this.width / 2;

            // This is redundant, but it turns out that for our purposes here, I don't care. It renders a
            // target as three circles when it could conceivably use only two with a hole in the center of the
            // second one or some such. Life is too short.
            stage.fillCircle (x, y, r - 2, 'red');
            stage.fillCircle (x, y, r - 7, 'white');
            stage.fillCircle (x, y, r - 10, 'red');
        }
        else
            nurdz.sneak.ChronoEntity.prototype.render.call (this, stage);
    };

    //noinspection JSUnusedLocalSymbols
    /**
     * This method gets invoked by the other trigger functions and abstracts what actually happens when
     * this entity gets triggered, since the circumstances of who can trigger us is different depending on
     * how it happens.
     * @param {nurdz.game.Actor|null} activator the actor that triggered this entity, or null if unknown
     */
    nurdz.sneak.LevelGoal.prototype.handleTrigger = function (activator)
    {
        if (this.properties.winLevel)
            console.log ("You have completed the level successfully!");
        else
            console.log ("You lose!");
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
    nurdz.sneak.LevelGoal.prototype.trigger = function (activator)
    {
        this.handleTrigger (activator);
    };

    /**
     * This method is invoked whenever this entity gets triggered by another entity as a result of a
     * direct collision (touch). This can happen programmatically or in response to interactions with other
     * entities. This does not include non-collision interactions (see trigger() for that).
     *
     * The method gets passed the Actor that caused the trigger to happen, although this can be null
     * depending on how the trigger happened.
     *
     * @param {nurdz.game.Actor} activator the actor that triggered this entity
     * @see nurdz.game.Entity.trigger
     */
    nurdz.sneak.LevelGoal.prototype.triggerTouch = function (activator)
    {
        // The only entity type that can trigger a level goal by touch is the player.
        if (activator instanceof nurdz.sneak.Player)
            this.handleTrigger (activator);
    };

    /**
     * Return a string representation of the object, for debugging purposes.
     *
     * @returns {String}
     */
    nurdz.sneak.ChronoEntity.prototype.toString = function ()
    {
        return String.format ("[LevelGoal id='{0}' pos={1} winLevel={2}]",
                              this.properties.id,
                              this.mapPosition.toString(),
                              this.properties.winLevel);
    };
} ());
