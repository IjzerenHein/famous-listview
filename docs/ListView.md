
<a name="module_ListView"></a>
#ListView
ListView extends famo.us ScrollContainer with insert/remove animations, selection (single/multiple) and support for a placeholder.

<a name="module_ListView"></a>
##class: ListView ⏏
**Members**

* [class: ListView ⏏](#module_ListView)
  * [new ListView(options)](#module_ListView)
  * [enum: ListView.Selection](#module_ListView.Selection)
    * [module:ListView.Selection.NONE](#module_ListView.Selection.NONE)
    * [module:ListView.Selection.SINGLE](#module_ListView.Selection.SINGLE)
    * [module:ListView.Selection.MULTIPLE](#module_ListView.Selection.MULTIPLE)
  * [enum: ListView.ItemState](#module_ListView.ItemState)
    * [module:ListView.ItemState.SELECTED](#module_ListView.ItemState.SELECTED)
    * [module:ListView.ItemState.FIRST](#module_ListView.ItemState.FIRST)
    * [module:ListView.ItemState.LAST](#module_ListView.ItemState.LAST)
  * [ListView.setSurfaceClass](#module_ListView.setSurfaceClass)
  * [listView.insert(index, renderable, [transition], [callback])](#module_ListView#insert)
  * [listView.remove(index, [count], [transition], [callback])](#module_ListView#remove)
  * [listView.getCount()](#module_ListView#getCount)
  * [listView.get(index)](#module_ListView#get)
  * [listView.setSelection(index, [count], [selected])](#module_ListView#setSelection)
  * [listView.getSelection([indexes])](#module_ListView#getSelection)

<a name="module_ListView"></a>
###new ListView(options)
**Params**

- options `Object` - Options.
  - [selection] `Selection` - Selection-mode (e.g. Selection.NONE, Selection.SINGLE, Selection.MULTIPLE)
  - [setItemState] `function` - Function that is called whenever an item-state changes (default: ListView.setSurfaceClass)
  - [scrollContainer] `Object` - Options that are passed on to the internal scrollContainer
  - [insertSize] `Array.Number` - Start-size that is used to animate item insertion (default: [undefined, 0])
  - [removeSize] `Array.Number` - End-size that is used to animate item removal (default: [undefined, 0])
  - [insertOpacity] `Number` - Start opacity that is used to animate an item insertion (default: 0)
  - [removeOpacity] `Number` - End opacity that is used to animate an item removal (default: 0)
  - [showOpacity] `Number` - Opacity that is used to show an item (default: 1)
  - [insertTransition] `Transition` - Transition that is used when inserting an item (default: {duration: 1000, curve: Easing.outExpo})
  - [removeTransition] `Transition` - Transition that is used when removing an item (default: {duration: 200, curve: Easing.outExpo})
  - [showPlaceholderTransition] `Transition` - Transition for showing the placeholder (default: {duration: 500})
  - [hidePlaceholderTransition] `Transition` - Transition for hiding the placeholder (default: {duration: 500})

<a name="module_ListView.Selection"></a>
###enum: ListView.Selection
**Properties**: `NONE`, `SINGLE`, `MULTIPLE`  
<a name="module_ListView.ItemState"></a>
###enum: ListView.ItemState
**Properties**: `SELECTED`, `FIRST`, `LAST`  
<a name="module_ListView.setSurfaceClass"></a>
###ListView.setSurfaceClass
Default implementation for options.setItemState which adds/removes a class
from a surface based on the state. This function effectively sets the
'first', 'last' and 'selected' classes for the renderable.

**Params**

- index `Number` - Index of the item
- renderable `Renderable` - Renderable that was added to the list-view
- state `ItemState` | `String` - State to set or clear on the renderable
- set `Boolean` - Set or clear the state

<a name="module_ListView#insert"></a>
###listView.insert(index, renderable, [transition], [callback])
Inserts one ore more items using an animation

**Params**

- index `Number` - Index of the item to insert the item before (when -1 is specified, inserts at the tail)
- renderable `Renderable` | `Array` - One or more renderables to insert
- [transition] `Transition` - Transition to use for the animation (when omitted, options.insertTransition is used)
- [callback] `function` - Function that is called upon completion (e.g. after animation)

<a name="module_ListView#remove"></a>
###listView.remove(index, [count], [transition], [callback])
Removes one or more items using an animation

**Params**

- index `Number` - Index of the item to remove (when -1 is specified, removes the last-items)
- [count] `Number` - Number of items to process, starting from index
- [transition] `Transition` - Transition to use for the animation (when omitted, options.removeTransition is used)
- [callback] `function` - Function that is called upon completion (e.g. after animation)

<a name="module_ListView#getCount"></a>
###listView.getCount()
Get the number of items

**Returns**: `Number` - number of items  
<a name="module_ListView#get"></a>
###listView.get(index)
Get item at specified index

**Params**

- index `Number` - index of item

**Returns**: `Renderable` - item  
<a name="module_ListView#setSelection"></a>
###listView.setSelection(index, [count], [selected])
Set the selection status of one or more items

**Params**

- index `Number` - Index of the item to select/de-select
- [count] `Number` - Number of items to process, starting from index
- [selected] `Boolean` - select or de-select (when omitted, true is assumed)

<a name="module_ListView#getSelection"></a>
###listView.getSelection([indexes])
Get all selected items

**Params**

- [indexes] `Number` - When set to true, returns the index rather than the renderable

**Returns**: `Array` - array of renderables (or indexes)  

