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
 * TODO:
 * - selection (single, multiple)
 *
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

    /**
     * @class
     * @param {Object} options Options.
     * @param {String} [options.content] Image-url.
     * @param {SizeMode|String} [options.sizeMode] Size-mode to use.
     * @param {PositionMode|String} [options.positionMode] Position-mode to use.
     * @param {RepeatMode|String} [options.repeatMode] Repeat-mode to use.
     * @alias module:ListView
     */
    var ListView = function() {
        View.apply(this, arguments);

        _createScrollContainer.call(this);
        _createPlaceholder.call(this);
    };
    ListView.prototype = Object.create(View.prototype);
    ListView.prototype.constructor = ListView;

    ListView.DEFAULT_OPTIONS = {
        scrollContainer: {
            scrollview: {
                direction: Utility.Direction.Y
            }
        },
        insertSize: [undefined, 0],
        removeSize: [undefined, 0],
        showOpacity: 1,
        insertOpacity: 0,
        removeOpacity: 0,
        insertTransition: {duration: 1000, curve: Easing.outExpo},
        removeTransition: {duration: 200, curve: Easing.outExpo},
        showPlaceholderTransition: {duration: 500},
        hidePlaceholderTransition: {duration: 500},
        firstClass: 'first',
        lastClass: 'last',
    };

    function _createScrollContainer() {
        this.scrollContainer = new ScrollContainer(this.options.scrollContainer)
        this._viewSequence = new ViewSequence([]);
        this._items = [];
        this.scrollContainer.sequenceFrom(this._viewSequence);
    }

    /**
     * Creates a placeholder and rendercontroller for showing/hiding the placeholder
     */
    function _createPlaceholder() {
        this._renderController = new RenderController();
        this.add(this._renderController);
        this.placeholder = new RenderNode();
        this._renderController.show(this.placeholder, {duration: 0});
        this._placeholderVisible = true;
    }

    /**
     * Shows/hides the placeholder dependent on whether any list-items exist
     */
    function _updatePlaceholder() {
        if (this.getCount()) {
            if (this._placeholderVisible) this._renderController.show(this.scrollContainer, this.options.hidePlaceholderTransition);
        } else {
            if (this._placeholderVisible) this._renderController.show(this.placeholder, this.options.showPlaceholderTransition);
        }
    }

    /**
     * Shows/hides the placeholder dependent on whether any list-items exist
     */
    function _createItem(renderable) {
        var item = {
            modifier: new StateModifier({}),
            renderable: renderable
        }
        item.node = new RenderNode(item.modifier);
        item.node.add(renderable);
        return item;
    }

    /**
     * Get the number of items
     */
    ListView.prototype.getCount = function() {
        return this._items.length;
    };

    /**
     * Inserts a renderable into the list-view
     */
    ListView.prototype.insert = function(index, renderable) {

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

        // update first-class
        if (index === 0 && this.options.firstClass){
            var newItem = this._items[0];
            if (newItem.renderable.addClass) newItem.renderable.addClass(this.options.firstClass);
            if (this._items.length > items.length) {
                var oldItem = this._items[items.length];
                if (oldItem.renderable.removeClass) oldItem.renderable.removeClass(this.options.firstClass);
            }
        }

        // update last-class
        if ((index === (this._items.length - items.length)) && this.options.lastClass) {
            var newItem = this._items[this._items.length - 1];
            if (newItem.renderable.addClass) newItem.renderable.addClass(this.options.lastClass);
            if (this._items.length > items.length) {
                var oldItem = this._items[this._items.length - (items.length + 1)];
                if (oldItem.renderable.removeClass) oldItem.renderable.removeClass(this.options.lastClass);
            }
        }

        // add items to scroll-container
        var nodes = [];
        for (var i = 0; i < this._items.length; i++) {
            nodes.push(this._items[i].node);
        }
        this._viewSequence = new ViewSequence(nodes);
        this.scrollContainer.sequenceFrom(this._viewSequence);

        // perform show animation
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.modifier.halt();
            if (this.options.insertSize) {
                item.modifier.setSize(this.options.insertSize);
                item.modifier.setSize(item.renderable.getSize(), this.options.insertTransition);
            }
            if ((this.options.showOpacity !== undefined) && (this.options.insertOpacity !== undefined)) {
                item.modifier.setOpacity(this.options.insertOpacity);
                item.modifier.setOpacity(this.options.showOpacity, this.options.insertTransition);
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
            target: this,
            index: index,
            count: items.length
        });
    };

    /**
     * Removes one or more items from the list-view
     */
    ListView.prototype.remove = function(index, count) {

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
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.modifier.halt();
            if (this.options.removeSize) {
                item.modifier.setSize(this.options.removeSize, this.options.removeTransition);
            }
            if (this.options.removeOpacity !== undefined) {
                item.modifier.setOpacity(this.options.removeOpacity, this.options.removeTransition);
            }
        }

        // remove items
        this._items.splice(index, count);

        // update first- and last-class
        if (this._items.length > 0) {
            if ((index === 0) && this.options.firstClass){
                var newItem = this._items[0];
                if (newItem.renderable.addClass) newItem.renderable.addClass(this.options.firstClass);
            }
            if ((index === this._items.length) && this.options.lastClass) {
                var newItem = this._items[this._items.length - 1];
                if (newItem.renderable.addClass) newItem.renderable.addClass(this.options.lastClass);
            }
        }

        // Update placeholder
        _updatePlaceholder.call(this);

        // emit event
        this._eventOutput.emit('remove', {
            target: this,
            index: index,
            count: count
        });
    };

    module.exports = ListView;
});
