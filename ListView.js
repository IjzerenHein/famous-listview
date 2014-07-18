/*
 * Copyright (c) 2014 Gloey Apps
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define*/

/**
 * ListView extends famo.us ScrollContainer with insert/remove animations, selection (single/multiple) and support for a placeholder.
 * @module
 */
define(function(require, exports, module) {
    'use strict';

    // import dependencies
    var RenderNode = require('famous/core/RenderNode');
    var ViewSequence = require('famous/core/ViewSequence');
    var View = require('famous/core/View');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ScrollContainer = require('famous/views/ScrollContainer');
    var Utility = require('famous/utilities/Utility');
    var RenderController = require('famous/views/RenderController');
    var Easing = require('famous/transitions/Easing');
    var Transform = require('famous/core/Transform');

    /**
     * @enum
     * @alias module:ListView.Selection
     */
    var Selection = {
        NONE: 0,
        SINGLE: 1,
        MULTIPLE: 2
    };

    /**
     * @enum
     * @alias module:ListView.ItemState
     */
    var ItemState = {
        SELECTED: 'selected',
        FIRST: 'first',
        LAST: 'last'
    };

    /**
     * @class
     * @param {Object} options Options.
     * @param {Selection} [options.selection] Selection-mode (e.g. Selection.NONE, Selection.SINGLE, Selection.MULTIPLE)
     * @param {Function} [options.setItemState] Function that is called whenever an item-state changes (default: ListView.setSurfaceClass)
     * @param {Object} [options.scrollContainer] Options that are passed on to the internal scrollContainer
     * @param {Array.Number} [options.insertSize] Start-size that is used to animate item insertion (default: [undefined, 0])
     * @param {Array.Number} [options.removeSize] End-size that is used to animate item removal (default: [undefined, 0])
     * @param {Number} [options.insertOpacity] Start opacity that is used to animate an item insertion (default: 0)
     * @param {Number} [options.removeOpacity] End opacity that is used to animate an item removal (default: 0)
     * @param {Number} [options.showOpacity] Opacity that is used to show an item (default: 1)
     * @param {Transition} [options.insertTransition] Transition that is used when inserting an item (default: {duration: 1000, curve: Easing.outExpo})
     * @param {Transition} [options.removeTransition] Transition that is used when removing an item (default: {duration: 200, curve: Easing.outExpo})
     * @param {Transition} [options.showPlaceholderTransition] Transition for showing the placeholder (default: {duration: 500})
     * @param {Transition} [options.hidePlaceholderTransition] Transition for hiding the placeholder (default: {duration: 500})
     * @alias module:ListView
     */
    var ListView = function() {
        View.apply(this, arguments);

        _createScrollContainer.call(this);
        _createPlaceholder.call(this);
    };
    ListView.prototype = Object.create(View.prototype);
    ListView.prototype.constructor = ListView;
    ListView.Selection = Selection;

    ListView.DEFAULT_OPTIONS = {
        selection: Selection.SINGLE,
        setItemState: _setSurfaceClass,
        scrollContainer: {
            scrollview: {
                direction: Utility.Direction.Y
            }
        },
        insertSize: [undefined, 0],
        removeSize: [undefined, 0],
        insertOpacity: 0,
        removeOpacity: 0,
        showOpacity: 1,
        insertTransition: {duration: 1000, curve: Easing.outExpo},
        removeTransition: {duration: 200, curve: Easing.outExpo},
        insertTransform: null,
        removeTransform: null,
        showPlaceholderTransition: {duration: 500},
        hidePlaceholderTransition: {duration: 500}
    };

    /**
     * Creates the main scroll-container
     */
    function _createScrollContainer() {
        this.scrollContainer = new ScrollContainer(this.options.scrollContainer)
        this._items = [];
        this.scrollContainer.sequenceFrom([]);
    }

    /**
     * Creates a rendercontroller for showing/hiding the placeholder
     */
    function _createPlaceholder() {
        this._renderController = new RenderController();
        this.add(this._renderController);
        this.placeholder = new RenderNode();
        this._renderController.show(this.placeholder, {duration: 0});
        this._placeholderVisible = true;
    }

    /**
     * Shows/hides the placeholder dependent on whether the list is empty
     */
    function _updatePlaceholder() {
        if (this.getCount()) {
            if (this._placeholderVisible) this._renderController.show(this.scrollContainer, this.options.hidePlaceholderTransition);
        } else {
            if (this._placeholderVisible) this._renderController.show(this.placeholder, this.options.showPlaceholderTransition);
        }
    }

    /**
     * Fired when a list-item is clicked, sets the selection
     */
    function _onClickItem(item) {
        switch (this.options.selection) {
            case Selection.NONE:
                break;
            case Selection.SINGLE:
                this.setSelection(this._items.indexOf(item), 1, true);
                break;
            case Selection.MULTIPLE:
                this.setSelection(this._items.indexOf(item), 1, !item.state.selected); // toggle
                break;
        }
    }

    /**
     * Shows/hides the placeholder dependent on whether any list-items exist
     */
    function _createItem(renderable) {
        var item = {
            modifier: new StateModifier({}),
            renderable: renderable,
            state: {
                selected: false
            }
        }
        item.node = new RenderNode(item.modifier);
        item.node.add(renderable);
        if (item.renderable.on) {
            item.renderable.on('click', _onClickItem.bind(this, item));
        }
        return item;
    }

    /**
     * Default implementation for `options.setItemState` which adds/removes a class
     * from a surface based on the state. This function effectively sets the
     * 'first', 'last' and 'selected' classes for the renderable.
     *
     * @param {Number} index Index of the item
     * @param {Renderable} renderable Renderable that was added to the list-view
     * @param {ItemState|String} state State to set or clear on the renderable
     * @param {Boolean} set Set or clear the state
     */
    ListView.setSurfaceClass = _setSurfaceClass;
    function _setSurfaceClass(index, renderable, state, set) {
        if (set) {
            if (renderable.addClass) renderable.addClass(state);
        } else {
            if (renderable.removeClass) renderable.removeClass(state);
        }
    };

    /**
     * Set the state for an item
     */
    function _setItemState(index, state, add) {
        var item = this._items[index];
        if (item.state[state]) {
            if (!add) {
                item.state[state] = false;
                this.options.setItemState(index, item.renderable, state, false);
                return true;
            }
        } else if (add) {
            item.state[state] = true;
            this.options.setItemState(index, item.renderable, state, true);
            return true;
        }
    }

    /**
     * Inserts one ore more items using an animation
     *
     * @param {Number} index Index of the item to insert the item before (when -1 is specified, inserts at the tail)
     * @param {Renderable|Array} renderable One or more renderables to insert
     * @param {Transition} [transition] Transition to use for the animation (when omitted, options.insertTransition is used)
     * @param {Function} [callback] Function that is called upon completion (e.g. after animation)
     */
    ListView.prototype.insert = function(index, renderable, transition, callback) {

        // create items
        var items = [];
        if (renderable instanceof Array) {
            if (renderable.length === 0) return;
            for (var i = 0; i < renderable.length; i++) {
                items.push(_createItem.call(this, renderable[i]));
            }
        } else {
            items.push(_createItem.call(this, renderable));
        }

        // add to _items
        // http://stackoverflow.com/questions/7032550/javascript-insert-an-array-inside-another-array
        if (index < 0) index = this.getCount();
        this._items.splice.apply(this._items, [index, 0].concat(items));

        // update first-state
        if (index === 0){
            _setItemState.call(this, 0, ItemState.FIRST, true);
            if (this._items.length > items.length) {
                _setItemState.call(this, items.length, ItemState.FIRST, false);
            }
        }

        // update last-state
        if (index === (this._items.length - items.length)) {
            _setItemState.call(this, this._items.length - 1, ItemState.LAST, true);
            if (this._items.length > items.length) {
                _setItemState.call(this, this._items.length - (items.length + 1), ItemState.LAST, false);
            }
        }

        // add items to scroll-container
        var nodes = [];
        for (var i = 0; i < this._items.length; i++) {
            nodes.push(this._items[i].node);
        }
        this.scrollContainer.sequenceFrom(nodes);

        // perform show animation
        transition = transition || this.options.insertTransition;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.modifier.halt();
            if (this.options.insertSize) {
                item.modifier.setSize(this.options.insertSize);
                item.modifier.setSize(item.renderable.getSize(), transition, callback);
                callback = null;
            }
            if ((this.options.showOpacity !== undefined) && (this.options.insertOpacity !== undefined)) {
                item.modifier.setOpacity(this.options.insertOpacity);
                item.modifier.setOpacity(this.options.showOpacity, transition, callback);
                callback = null;
            }
            if (this.options.insertTransform) {
                item.modifier.setTransform(this.options.insertTransform);
                item.modifier.setTransform(Transform.identity, transition, callback);
                callback = null;
            }
        }

        // TODO - fix the case where items inserted as top shouldn't always scroll to top

        // add to array
        /*if ((index === undefined) || index < 0) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                this._viewSequence.push(item.node);
            }
        } else if (index === 0) {
            //this._viewSequence.unshift(renderable);
            // todo
        } else {
            // TODO - insert at arbitrary location
        }*/

        // Update placeholder
        _updatePlaceholder.call(this);

        // emit event
        this._eventOutput.emit('insert', {
            type: 'insert',
            target: this,
            index: index,
            count: items.length
        });

        // do callback
        if (callback) callback();
    };

    /**
     * Removes one or more items using an animation
     *
     * @param {Number} index Index of the item to remove (when -1 is specified, removes the last-items)
     * @param {Number} [count] Number of items to process, starting from index
     * @param {Transition} [transition] Transition to use for the animation (when omitted, options.removeTransition is used)
     * @param {Function} [callback] Function that is called upon completion (e.g. after animation)
     */
    ListView.prototype.remove = function(index, count, transition, callback) {

        // check arguments
        if (count === 0) return;
        if (index < 0) index = this.getCount() - 1;
        count = (count === undefined) ? 1 : count;

        // get the items to remove
        var items = [];
        for (var i = 0; i < count; i++) {
            items.push(this._items[i+index]);
        }

        // perform hide animation
        transition = transition || this.options.removeTransition;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.modifier.halt();
            if (this.options.removeSize) {
                item.modifier.setSize(this.options.removeSize, transition, callback);
                callback = null;
            }
            if (this.options.removeOpacity !== undefined) {
                item.modifier.setOpacity(this.options.removeOpacity, transition, callback);
                callback = null;
            }
            if (this.options.removeTransform) {
                item.modifier.setTransform(this.options.removeTransform, transition, callback);
                callback = null;
            }
        }

        // remove items
        this._items.splice(index, count);

        // update first- and last-state
        if (this._items.length > 0) {
            if (index === 0){
                _setItemState.call(this, 0, ItemState.FIRST, true);
            }
            if (index === this._items.length) {
                _setItemState.call(this, this._items.length - 1, ItemState.LAST, true);
            }
        }

        // Update placeholder
        _updatePlaceholder.call(this);

        // emit event
        this._eventOutput.emit('remove', {
            type: 'remove',
            target: this,
            index: index,
            count: count
        });

        // do callback
        if (callback) callback();
    };

    /**
     * Get the number of items
     *
     * @return {Number} number of items
     */
    ListView.prototype.getCount = function() {
        return this._items.length;
    };

    /**
     * Get item at specified index
     * @param {Number} index index of item
     * @return {Renderable} item
     */
    ListView.prototype.get = function(index) {
        return this._items[index].renderable;
    };

    /**
     * Set the selection status of one or more items
     *
     * @param {Number} index Index of the item to select/de-select
     * @param {Number} [count] Number of items to process, starting from index
     * @param {Boolean} [selected] select or de-select (when omitted, true is assumed)
     */
    ListView.prototype.setSelection = function(index, count, selected) {
        if (selected === undefined) selected = true;
        if (count < 0) count = this._items.length - index;
        var deselect = [];
        var select = [];
        for (var i = 0 ; i < count; i++) {

            // unselect
            if (!selected) {
                if (_setItemState.call(this, index + i, ItemState.SELECTED, false)) {
                    deselect.push(index + i);
                }

            // multi-select
            } else if (this.options.selection === Selection.MULTIPLE){
                if (_setItemState.call(this, index + i, ItemState.SELECTED, true)) {
                    select.push(index + i);
                }

            // single-select
            } else {
                for (var j = 0; j < this._items.length; j++) {
                    if ((index + i) === j) {
                        if (_setItemState.call(this, j, ItemState.SELECTED, true)) {
                            select.push(j);
                        }
                    } else {
                        if (_setItemState.call(this, j, ItemState.SELECTED, false)) {
                            deselect.push(j);
                        }
                    }
                }
            }
        }

        // emit event
        if (select.length || deselect.length) {
            this._eventOutput.emit('selection', {
                type: 'selection',
                target: this,
                select: select,
                deselect: deselect
            });
        }
    };

    /**
     * Get all selected items
     *
     * @param {Number} [indexes] When set to true, returns the index rather than the renderable
     * @return {Array} array of renderables (or indexes)
     */
    ListView.prototype.getSelection = function(indexes) {
        var result = [];
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            if (item.state.selected) {
                result.push(indexes ? i : item.renderable);
            }
        }
        return result;
    };

    module.exports = ListView;
});
