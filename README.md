famous-listview
==========

famous-listview is a fully customizable view which extends famo.us ScrollContainer with:
* insert/remove animations
* selection state (single / multiple)
* showing a placeholder when the list is empty

*Development on famous-listview is ongoing, drop me an email or submit a request
if you feel something is missing or not working. Please star this project to
support it.*

![Screenshot](Screenshot.gif)

## Demo

[View the demo here](https://rawgit.com/IjzerenHein/famous-listview/master/examples/demo/index.html)


## Installation

Install using bower:

	bower install ijzerenhein/famous-listview

## Getting started

If necessary, add to the requirejs paths config:

```javascript
require.config({
    paths: {
        ...
        'famous-listview': 'bower_components/famous-listview/ListView',
        ...
    }
});
```

Example of how to create a ListView:

```javascript
var ListView = require('famous-listview');

// create list-view
var listView = new ListView();
this.add(listView);

// insert items
function _createItem(name) {
    return new Surface({
        content: name
    });
}
listView.insert(0, _createItem('one'));
listView.insert(1, _createItem('two'));
listView.insert(-1, _createItem('three')); // -1 => appends at tail

```

## Documentation

- [Inserting and removing renderables](#inserting-and-removing-renderables)
- [Emitted events](#emitted-events)
- [Item selection](#item-selection)
- [Placeholder to show when list is empty](#placeholder-to-show-when-list-is-empty)
- [State classes: first, last, selected](#state-classes-first-last-selected)
- [Inserting views and delegating state-classes](#inserting-views-and-delegating-state-classes)
- [Vertical orientation](#vertical-orientation)
- [Setting internal margins](#setting-internal-margins)
- [API Reference](docs/ListView.md)
- [Options](docs/ListView.md#module_ListView)

### Inserting and removing renderables

To insert or remove items, use the `insert` and `remove` methods. When `-1` is
used in combination with the `index` it refers to the last + 1 item. When `-1`
is used in combination with the `count` then it refers to all items, starting
from `index`.

**Insert examples**
```javascript
listView.insert(0, renderable);                // Insert before the first item
listView.insert(-1, renderable);               // Insert after the last item
listView.insert(4, [renderable, renderable2]); // Insert two items at once
listView.insert(0, renderable, {duration: 0}); // Insert without animation

// Insert two items slowly, and with a callback
listView.insert(0, [renderable, renderable2], {duration: 3000}, function() {
	console.log('yay, the animation has completed');
});
```

**Remove examples**
```javascript
listView.remove(0);                            // Remove the first item
listView.remove(1, 3);                         // Remove 3 items starting at 1
listView.remove(0, -1);                        // Remove all items
listView.remove(-1, 10);                       // Remove last 10 items
listView.remove(0, -1, {duration: 0});         // Remove without animation

// Remove all items slowly, and with a callback
listView.remove(0, -1, {duration: 3000}, function() {
	console.log('yay, the animation has completed');
});
```

### Emitted events

The following events are emitted by the view:

```javascript
listView.on('insert', function (event) {
	/* when multiple items are inserted at once, insert is only emitted once
	event: {
		type,  // event-type: 'insert'
		index, // index of first inserted item
		count, // number of items that were inserted
		target // listView
	} */
});
```

```javascript
listView.on('remove', function (event) {
	/* when multiple items are removed at once, remove is only emitted once
	event: {
		type,  // event-type: 'remove'
		index, // index of first removed item
		count, // number of items that were removed
		target // listView
	} */
});
```

### Item selection

ListView supports 3 selection modes: `Selection.NONE`, `Selection.SINGLE` and
`Selection.MULTIPLE`. Because the list-view does not inject any own surfaces
into the render-tree, it utilizes the inserted renderable for capturing the
`click` event. For selection to function, the renderable must have an
`.on` function and respond to the `click` event.

By default, the selection-mode is set to **SINGLE**. To change the
selection-mode use:

```javascript
var listView = new ListView({
	selection: ListView.Selection.MULTIPLE
});
```

To get the selection use `getSelection`

```javascript
var renderables = listView.getSelection();    // returns array of renderables
var indexes = listView.getSelection(true);    // returns array of indexes
```

To set the selection use `setSelection`:

```javascript
listView.setSelection(0);                     // selects the first item
listView.setSelection(0, 1, true);            // equivalent to setSelection(0)
listView.setSelection(-1);                    // selects the last item
listView.setSelection(0, 10);                 // selects the first 10 items
listView.setSelection(0, -1);                 // selects all items
listView.setSelection(0, 1, false);           // de-selects the first item
listView.setSelection(0, -1, false);          // de-selects all items
```

### Placeholder to show when list is empty

You can set a placeholder, which is shown when the list is empty.

```javascript
var listView = new ListView();
var noItemsSurface = new Surface({
	content: 'No items'
});
listView.placeholder.add(noItemsSurface)
```

### State classes: first, last, selected

The first and last item in the list-view are automatically given a state-class,
e.g. for adding rounded corners. Also, when an item is selected or
de-selected, the state-class is updated on the renderable. If the renderable is
a `Surface` then it calls `addClass` and `removeClass` on that surface directly.
The following snippet shows the default state-classes and how you can modify them:

```javascript
var listView = new ListView({
	selectedClass: 'selected',
	firstClass: 'first',
	lastClass: 'last'
});
```

### Inserting views & delegating state-classes

The list-view inspects the renderable and will call `addClass` and `removeClass`
only if these methods exist. If you insert a `View`, and you want to delegate the
states to the view, you can add your own `addClass` and `removeClass`:

```javascript
function _createItem() {
	var myView = new MyView(); // your-view, e.g. has the method: setSelected
	var item = new RenderNode(myView);
	item.addClass = function (cls) {
		if (cls === 'selected') myView.setSelected(true);
	};
	item.removeClass = function (cls) {
		if (cls === 'selected') myView.setSelected(false);
	};
	return item;
}
listView.insert(-1, _createItem());
```

### Vertical orientation

By default, the listview lays-out its renderables horziontally. To layout
the renderables vertically, use:

```javascript
var listView = new ListView({
	scrollContainer: {
		scrollview: {
			direction: Utility.Direction.X
		}
	},
	insertSize: [0, undefined], // start of animation when inserting
	removeSize: [0, undefined]  // end of animation when removing
});
```

### Setting internal margins

By default, the Scrollview inside the ContainerSurface is filled to
its parent. To set margins between the added items and the parent container,
use:

```javascript
var listView = new ListView({
	scrollContainer: {
		container: {
			properties: {
			    padding: '10px'
			}
		}
	}
});
```

## Contribute

Feel free to contribute to this project in any way.
The easiest way to support this project is by giving it a star.

## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes
