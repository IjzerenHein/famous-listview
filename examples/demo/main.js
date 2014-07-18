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

define(function(require) {
    'use strict';

    // import dependencies
    var Engine = require('famous/core/Engine');
    var FastClick = require('famous/inputs/FastClick');
    var RenderNode = require('famous/core/RenderNode');
    var Modifier = require('famous/core/Modifier');
    var Surface = require('famous/core/Surface');
    var FlexibleLayout = require('famous/views/FlexibleLayout');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var ListView = require('famous-listview');
    var BoxLayout = require('famous-boxlayout');
    var Utility = require('famous/utilities/Utility');

    // create the main context
    var mainContext = Engine.createContext();

    // create layout
    var topLayout = new BoxLayout({ margins: [40, 0, 0, 0]});
    mainContext.add(topLayout);
    var renderables = [];
    var layout = new FlexibleLayout({
        ratios: [true, 1]
    });
    layout.sequenceFrom(renderables);
    topLayout.middle.add(layout);
    topLayout.top.add(new Surface({
        classes: ['header'],
        content: '<div>famous-listview demo</div>'
    }));

    // Create left action-panel
    var panel = new RenderNode(new Modifier({size: [160, undefined]}));
    renderables.push(panel);
    panel.add(new Surface({classes: ['panel']}));
    var panelLayout = new SequentialLayout({
        direction: 1
    });
    var panelActions = [];
    panelLayout.sequenceFrom(panelActions);
    panel.add(panelLayout);
    function _addAction(name, callback) {
        var action = new RenderNode(new Modifier({size: [undefined, 40]}));
        var surface = new Surface({
            classes: ['action'],
            content: '<div>' + name + '</div>'
        });
        surface.on('click', function() {
            console.log('[Action: ' + name + '] ...');
            callback.call(this, name, function() {
                console.log('[Action: ' + name + '] ... callback done!');
            });
        });
        action.add(surface);
        panelActions.push(action);
    }
    function _createListItem(name) {
        return new Surface({
            size: [undefined, 40],
            classes: ['listitem'],
            content: '<div>' + name + '</div>',
            properties: {
                background: Please.make_color()
            }
        });
    }

    // Create listview
    var boxLayout = new BoxLayout({margins: [30, 0, 0, 0]});
    var listView = new ListView({
        selection: ListView.Selection.MULTIPLE,
        scrollContainer: {
            container: {
                properties: {
                    padding: '10px'
                }
            }
        }
    });
    boxLayout.middle.add(listView);
    renderables.push(boxLayout);

    // Log events
    function _logEvent(event) {
        delete event.target;
        console.log('[Event] ' + JSON.stringify(event));
    }
    listView.on('insert', _logEvent);
    listView.on('remove', _logEvent);
    listView.on('selection', _logEvent);

    // Create counter
    var counter = new Surface({
        classes: ['counter']
    });
    boxLayout.top.add(counter);
    function _updateCounter() {
        counter.setContent('<div>Count: ' + listView.getCount() + '</div>');
    }
    listView.on('insert', _updateCounter);
    listView.on('remove', _updateCounter);
    _updateCounter();

    // Set listview placeholder (is shown when list-view is empty)
    var placeholder = new Surface({
        classes: ['placeholder'],
        content: '<div>No items.<br><br>Use the options on the left to insert items.<br><br>This placeholder automatically disappears when items are added.</div>'
    });
    listView.placeholder.add(placeholder);

    // Add actions
    _addAction('Insert top', function(name, callback) {
        listView.insert(0, _createListItem(name), undefined, callback);
    });
    _addAction('Insert middle', function(name, callback) {
        listView.insert(Math.floor(listView.getCount() / 2), _createListItem(name), undefined, callback);
    });
    _addAction('Insert bottom', function(name, callback) {
        listView.insert(-1, _createListItem(name), undefined, callback);
    });
    _addAction('Insert batch', function(name, callback) {
        var items = [];
        for (var i = 0; i < 10; i++) {
            items.push(_createListItem(name));
        }
        listView.insert(Math.floor(listView.getCount() / 2), items, undefined, callback);
    });
    _addAction('Insert instant', function(name, callback) {
        listView.insert(0, _createListItem(name), {duration: 0}, callback);
    });
    _addAction('Remove top', function(name, callback) {
        listView.remove(0, undefined, undefined, callback);
    });
    _addAction('Remove middle', function(name, callback) {
        listView.remove(Math.floor(listView.getCount() / 2), undefined, undefined, callback);
    });
    _addAction('Remove bottom', function(name, callback) {
        listView.remove(-1, undefined, undefined, callback);
    });
    _addAction('Remove All', function(name, callback) {
        listView.remove(0, listView.getCount(), undefined, callback);
    });
    _addAction('Select All', function() {
        listView.setSelection(0, -1, true);
    });
    _addAction('De-select All', function() {
        listView.setSelection(0, -1, false);
    });
});
