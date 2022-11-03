# tiled-blupi
[Tiled](https://www.mapeditor.org/) extensions for Blupi map formats.
![image](https://user-images.githubusercontent.com/6082665/199763579-3d3ac10d-ad32-4c60-b1ab-ff776b3b777b.png)
Simply take the `tiled` folder for the game you want to edit and place it directly in the game's install folder, then open the `.tiled-project` file in Tiled.

## Speedy Blupi/Speedy Blupi II
These games are largely the same, save for some tileset differences and *II* having a few more object types. Levels are found in the `DATA` folder, named `WORLD###.BLP` for standard levels, and `u###-###.blp` for custom levels; there are other files in the folder, but trying to open them will just cause errors.

Various properties of the level are set on the map itself, look on the left side when opening the level, or select Map -> Map Properties from the menu.
- `major_version` - The major version of the game the map is made for. Always 1 in all official maps.
- `minor_version` - The minor version of the game the map is made for. *Speedy Blupi* maps use 2, while *Speedy Blupi II* maps use 3.
- `horz_scroll` - If checked, the level can scroll horizontally.
- `vert_scroll` - If checked, the level can scroll vertically.
- `music` - The music to play with the level. -1 is no music, otherwise it's the number in the midi file's name.
- `background` - The background image to use for the level. Due to technical limitations the image does not change if you edit this property, you'll have to close and re-open it to see the new background.
- `name` - The name of the level. Maximum 40 characters, ASCII only.

Each level has four layers:
### Background
The background image. Editing this layer has no effect on the level data.
### Decoration
The large background elements you can place in levels. Use the `explo` tileset with this layer.
### Objects
The layer for objects. Objects can use any tile from any of the available tilesets, and do not need to be aligned to the tile grid (in fact doing so may make them off-center). Of special note is the `Player Start` tileset, levels will load one of each of these tiles to represent each player's starting position; you should not delete or duplicate them. The `Object Types` tileset is a special tileset that contains presets for the various object types in the game (except Lift, which is the default when placing tiles from the standard tilesets).

Objects have several properties to change how they behave:
- `type` - You can use this to control how an object behaves. In *Speedy Blupi*, object types that are exclusive to the sequel are labeled with `(II)`, and will be ignored by the game.
- `endpoint` - This allows you to set the location that an object will move to. To do this you must place an object at the location you want the object to move to, and then select that object in the `endpoint` property's editor. The first tile of the `Object Types` tileset is made for the purpose of being used as an endpoint marker, but any object can be used.
- `a_to_b_time` - The time it takes for the object to move from its starting point to the ending point, in frames.
- `b_to_a_time` - The time it takes for the object to move from its ending point back to the starting point, in frames.
- `a_wait` - The time the object will pause at the starting point, in frames.
- `b_wait` - The time the object will pause at the ending point, in frames.
- `field_X` - These properties have an unknown purpose, but they are presented here for the sake of completeness.
### Foreground
The main tile layer you interact with. Use the `object` tileset with this layer.
