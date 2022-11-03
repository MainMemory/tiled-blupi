const itemTypesArray = [
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	19,
	20,
	21,
	24,
	25,
	26,
	27,
	28,
	29,
	30,
	31,
	32,
	33,
	34,
	40,
	44,
	46,
	47,
	49,
	50,
	51,
	54,
	55,
	96,
	200,
	201,
	202,
	203
];

var sblvMapFormat = {
    name: "Speedy Blupi level",
    extension: "blp",

	//Function for reading from a blp file
	read: function(fileName) {
		var file_path = FileInfo.path(FileInfo.fromNativeSeparators(fileName));
		var file = new BinaryFile(fileName, BinaryFile.ReadOnly);
		var data = new DataView(file.readAll());
		file.close();

		var tilemap = new TileMap();
		tilemap.setSize(100, 100);
		tilemap.setTileSize(64, 64);
		tilemap.setProperty("major_version", data.getUint16(0, true));
		tilemap.setProperty("minor_version", data.getUint16(2, true));
		tilemap.setProperty("horz_scroll", data.getInt32(0xD4, true) == 100);
		tilemap.setProperty("vert_scroll", data.getInt32(0xD8, true) == 100);
		tilemap.setProperty("music", data.getInt16(0xDE, true) - 1);
		var bgnum = data.getInt16(0xE0, true);
		tilemap.setProperty("background", bgnum);
		var lvlname = '';
		for (var i = 0x178; i < 0x1A0; i++) {
			var c = data.getUint8(i);
			if (c == 0)
				break;
			lvlname += String.fromCharCode(c);
		}
		tilemap.setProperty("name", lvlname);

		var objecttileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/object.tsx"));
		tilemap.addTileset(objecttileset);
		var blupi0tileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/blupi000.tsx"));
		tilemap.addTileset(blupi0tileset);
		var blupi1tileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/blupi001.tsx"));
		tilemap.addTileset(blupi1tileset);
		var blupi2tileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/blupi002.tsx"));
		tilemap.addTileset(blupi2tileset);
		var blupi3tileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/blupi003.tsx"));
		tilemap.addTileset(blupi3tileset);
		var elementtileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/element.tsx"));
		tilemap.addTileset(elementtileset);
		var explotileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/explo.tsx"));
		tilemap.addTileset(explotileset);
		var playertileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/Player Start.tsx"));
		tilemap.addTileset(playertileset);
		var objtypetileset = tiled.tilesetFormat("tsx").read(FileInfo.joinPaths(file_path, "../tiled/tilesets/Object Types.tsx"));
		tilemap.addTileset(objtypetileset);

		var bgstr = bgnum.toString().padStart(3, "0");
		var bgfilename = FileInfo.joinPaths(file_path, "../IMAGE16/DECOR" + bgstr + ".BLP");
		if (!File.exists(bgfilename))
			bgfilename = FileInfo.joinPaths(file_path, "../IMAGE08/DECOR" + bgstr + ".BLP");

		if (File.exists(bgfilename))
		{
			var bglayer = new ImageLayer("Background");
			bglayer.setImage(new Image(bgfilename, "bmp"), bgfilename);
			bglayer.parallaxFactor = Qt.point(0.5, 0.5);
			bglayer.repeatX = true;
			bglayer.repeatY = true;
			tilemap.addLayer(bglayer);
			bglayer.locked = true;
		}

		var decolayer = new TileLayer("Decoration");
		decolayer.width = 100;
		decolayer.height = 100;
		fgedit = decolayer.edit();
		for (var y = 0; y < 100; ++y) {
			for (var x = 0; x < 100; ++x) {
				var id = data.getInt16(0x5184 + (y + (100 * x)) * 2, true);
				if (id != -1 && id < explotileset.tileCount) {
					fgedit.setTile(x, y, explotileset.tile(id));
				}
			}
		}
		fgedit.apply();
		tilemap.addLayer(decolayer);

		var objlayer = new ObjectGroup("Objects");
		tilemap.addLayer(objlayer);

		for (var i = 3; i >= 0; i--) {
			var stobj = new MapObject("Player " + (i + 1));
			var t = playertileset.tile(i);
			stobj.width = t.width;
			stobj.height = t.height;
			stobj.tile = t;
			stobj.x = data.getInt32(0x148 + (i * 8), true);
			stobj.y = data.getInt32(0x14C + (i * 8), true);
			stobj.tileFlippedHorizontally = !data.getInt32(0x168 + (i * 4), true);
			objlayer.addObject(stobj);
		}

		for (var i = 0; i < 200; i++) {
			var type = itemTypesArray.indexOf(data.getUint16(0x9FA4 + (i * 0x30), true));
			if (type != -1) {
				var obj = new MapObject();
				obj.setProperty("type", tiled.propertyValue("ObjectTypes", type));
				obj.setProperty("a_to_b_time", data.getUint16(0x9FA6 + (i * 0x30), true));
				obj.setProperty("b_to_a_time", data.getUint16(0x9FA8 + (i * 0x30), true));
				obj.setProperty("a_wait", data.getUint16(0x9FAA + (i * 0x30), true));
				obj.setProperty("b_wait", data.getUint16(0x9FAC + (i * 0x30), true));
				obj.setProperty("field_A", data.getUint16(0x9FAE + (i * 0x30), true));
				obj.x = data.getInt32(0x9FB0 + (i * 0x30), true);
				obj.y = data.getInt32(0x9FB4 + (i * 0x30), true);
				var x2 = data.getInt32(0x9FB8 + (i * 0x30), true);
				var y2 = data.getInt32(0x9FBC + (i * 0x30), true);
				var pt = null;
				if (x2 != obj.x || y2 != obj.y) {
					pt = new MapObject();
					var t  = objtypetileset.tile(0);
					pt.width = t.width;
					pt.height = t.height;
					pt.tile = t;
					pt.x = x2;
					pt.y = y2;
				}
				obj.setProperty("field_1C", data.getInt32(0x9FC0 + (i * 0x30), true));
				obj.setProperty("field_20", data.getInt32(0x9FC4 + (i * 0x30), true));
				obj.setProperty("field_24", data.getUint16(0x9FC8 + (i * 0x30), true));
				obj.setProperty("field_26", data.getUint16(0x9FCA + (i * 0x30), true));
				obj.setProperty("field_28", data.getUint16(0x9FCC + (i * 0x30), true));
				var ts = null;
				switch (data.getUint16(0x9FCE + (i * 0x30), true))
				{
					case 2:
						ts = blupi0tileset;
						break;
					case 9:
						ts = explotileset;
						break;
					case 10:
						ts = elementtileset;
						break;
					case 11:
						ts = blupi1tileset;
						break;
					case 12:
						ts = blupi2tileset;
						break;
					case 13:
						ts = blupi3tileset;
						break;
					default:
						ts = objecttileset;
						break;
				}
				var tid = data.getUint16(0x9FD0 + (i * 0x30), true);
				if (tid >= ts.tileCount)
					tid = 0;
				var t  = ts.tile(tid);
				obj.width = t.width;
				obj.height = t.height;
				obj.tile = t;
				obj.setProperty("field_2E", data.getUint16(0x9FD2 + (i * 0x30), true));
				objlayer.addObject(obj);
				if (pt != null) {
					objlayer.addObject(pt);
					obj.setProperty("endpoint", pt);
				}
			}
		}

		var fglayer = new TileLayer("Foreground");
		fglayer.width = 100;
		fglayer.height = 100;
		var fgedit = fglayer.edit();
		for (var y = 0; y < 100; ++y) {
			for (var x = 0; x < 100; ++x) {
				var id = data.getInt16(0x364 + (y + (100 * x)) * 2, true);
				if (id != -1 && id < objecttileset.tileCount) {
					fgedit.setTile(x, y, objecttileset.tile(id));
				}
			}
		}
		fgedit.apply();
		tilemap.addLayer(fglayer);

		return tilemap;

	},


	write: function(map, fileName) {
		var buffer = new ArrayBuffer(50468);
		var data = new DataView(buffer);

		data.setUint16(0, map.property("major_version") ?? 1, true);
		data.setUint16(2, map.property("minor_version") ?? 2, true);
		data.setInt32(0xD4, (map.property("horz_scroll") ?? true) ? 100 : 0, true);
		data.setInt32(0xD8, (map.property("vert_scroll") ?? true) ? 100 : 0, true);
		data.setInt16(0xDE, (map.property("music") ?? -1) + 1, true);
		data.setInt16(0xE0, map.property("background") ?? 0, true);
		var lvlname = map.property("name") ?? '';
		for (var i = 0; i < Math.min(lvlname.length, 40); i++)
			data.setUint8(0x178 + i, lvlname.charCodeAt(i));

		for (var lid = 0; lid < map.layerCount; ++lid) {
			var layer = map.layerAt(lid);
			switch (layer.name)
			{
				case "Foreground":
					if (layer.isTileLayer) {
						for (var y = 0; y < 100; ++y) {
							for (var x = 0; x < 100; ++x) {
								var id = -1;
								var tile = layer.tileAt(x, y);
								if (tile != null)
									id = tile.id;
								data.setInt16(0x364 + (y + (100 * x)) * 2, id, true);
							}
						}
					}
					break;
				case "Decoration":
					if (layer.isTileLayer) {
						for (var y = 0; y < 100; ++y) {
							for (var x = 0; x < 100; ++x) {
								var id = -1;
								var tile = layer.tileAt(x, y);
								if (tile != null)
									id = tile.id;
								data.setInt16(0x5184 + (y + (100 * x)) * 2, id, true);
							}
						}
					}
					break;
				case "Objects":
					if (layer.isObjectLayer) {
						var objcnt = 0;
						for (var oid = 0; oid < layer.objectCount; oid++) {
							var obj = layer.objectAt(oid);
							var className = obj.className;
							if (className.length == 0 && obj.tile != null)
								className = obj.tile.className;
							switch (className)
							{
								case "Blupi":
									var pn = 0;
									if (obj.tile != null)
										pn = obj.tile.id;
									data.setInt32(0x148 + (pn * 8), obj.x, true);
									data.setInt32(0x14C + (pn * 8), obj.y, true);
									data.setInt32(0x168 + (pn * 4), obj.tileFlippedHorizontally ? 0 : 1, true);
									break;
								case "Object":
									if (objcnt >= 200)
										continue;
									var type = 0;
									var prop = obj.resolvedProperty("type");
									if (prop != null)
										type = prop.value;
									data.setUint16(0x9FA4 + (objcnt * 0x30), itemTypesArray[type], true);
									data.setUint16(0x9FA6 + (objcnt * 0x30), obj.resolvedProperty("a_to_b_time") ?? 0, true);
									data.setUint16(0x9FA8 + (objcnt * 0x30), obj.resolvedProperty("b_to_a_time") ?? 0, true);
									data.setUint16(0x9FAA + (objcnt * 0x30), obj.resolvedProperty("a_wait") ?? 0, true);
									data.setUint16(0x9FAC + (objcnt * 0x30), obj.resolvedProperty("b_wait") ?? 0, true);
									data.setUint16(0x9FAE + (objcnt * 0x30), obj.resolvedProperty("field_A") ?? 0, true);
									data.setInt32(0x9FB0 + (objcnt * 0x30), obj.x, true);
									data.setInt32(0x9FB4 + (objcnt * 0x30), obj.y, true);
									var x2 = obj.x;
									var y2 = obj.y;
									var endpoint = obj.resolvedProperty("endpoint");
									if (endpoint != null && endpoint.x != null && endpoint.y != null) {
										x2 = endpoint.x;
										y2 = endpoint.y;
									}
									data.setInt32(0x9FB8 + (objcnt * 0x30), x2, true);
									data.setInt32(0x9FBC + (objcnt * 0x30), y2, true);
									data.setInt32(0x9FC0 + (objcnt * 0x30), obj.resolvedProperty("field_1C") ?? 0, true);
									data.setInt32(0x9FC4 + (objcnt * 0x30), obj.resolvedProperty("field_20") ?? 0, true);
									data.setUint16(0x9FC8 + (objcnt * 0x30), obj.resolvedProperty("field_24") ?? 0, true);
									data.setUint16(0x9FCA + (objcnt * 0x30), obj.resolvedProperty("field_26") ?? 0, true);
									data.setUint16(0x9FCC + (objcnt * 0x30), obj.resolvedProperty("field_28") ?? 0, true);
									if (obj.tile != null) {
										switch (obj.tile.tileset.name)
										{
											case "object":
												data.setUint16(0x9FCE + (objcnt * 0x30), 1, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "blupi000":
												data.setUint16(0x9FCE + (objcnt * 0x30), 2, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "explo":
												data.setUint16(0x9FCE + (objcnt * 0x30), 9, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "element":
												data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "blupi001":
												data.setUint16(0x9FCE + (objcnt * 0x30), 11, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "blupi002":
												data.setUint16(0x9FCE + (objcnt * 0x30), 12, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "blupi003":
												data.setUint16(0x9FCE + (objcnt * 0x30), 13, true);
												data.setUint16(0x9FD0 + (objcnt * 0x30), obj.tile.id, true);
												break;
											case "Object Types":
												switch (obj.tile.id)
												{
													case 1:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 12, true);
														break;
													case 2:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 48, true);
														break;
													case 3:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 57, true);
														break;
													case 4:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 0, true);
														break;
													case 5:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 21, true);
														break;
													case 6:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 29, true);
														break;
													case 7:
														data.setUint16(0x9FCE + (objcnt * 0x30), 1, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 32, true);
														break;
													case 8:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 68, true);
														break;
													case 9:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 69, true);
														break;
													case 10:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 78, true);
														break;
													case 11:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 89, true);
														break;
													case 12:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 90, true);
														break;
													case 13:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 125, true);
														break;
													case 14:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 129, true);
														break;
													case 15:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 151, true);
														break;
													case 16:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 136, true);
														break;
													case 17:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 167, true);
														break;
													case 18:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 177, true);
														break;
													case 19:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 178, true);
														break;
													case 20:
														data.setUint16(0x9FCE + (objcnt * 0x30), 1, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 238, true);
														break;
													case 21:
														data.setUint16(0x9FCE + (objcnt * 0x30), 2, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 61, true);
														break;
													case 22:
														data.setUint16(0x9FCE + (objcnt * 0x30), 11, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 61, true);
														break;
													case 23:
														data.setUint16(0x9FCE + (objcnt * 0x30), 12, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 61, true);
														break;
													case 24:
														data.setUint16(0x9FCE + (objcnt * 0x30), 13, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 61, true);
														break;
													case 25:
														data.setUint16(0x9FCE + (objcnt * 0x30), 2, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 237, true);
														break;
													case 26:
														data.setUint16(0x9FCE + (objcnt * 0x30), 11, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 237, true);
														break;
													case 27:
														data.setUint16(0x9FCE + (objcnt * 0x30), 12, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 237, true);
														break;
													case 28:
														data.setUint16(0x9FCE + (objcnt * 0x30), 13, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 237, true);
														break;
													case 29:
														data.setUint16(0x9FCE + (objcnt * 0x30), 10, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 168, true);
														break;
													case 30:
														data.setUint16(0x9FCE + (objcnt * 0x30), 2, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 257, true);
														break;
													case 31:
														data.setUint16(0x9FCE + (objcnt * 0x30), 11, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 257, true);
														break;
													case 32:
														data.setUint16(0x9FCE + (objcnt * 0x30), 12, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 257, true);
														break;
													case 33:
														data.setUint16(0x9FCE + (objcnt * 0x30), 13, true);
														data.setUint16(0x9FD0 + (objcnt * 0x30), 257, true);
														break;
												}
												break;
										}
									}
									data.setUint16(0x9FD2 + (objcnt * 0x30), obj.resolvedProperty("field_2E") ?? 0, true);
									objcnt++;
									break;
							}
						}
					}
					break;
			}
		}
		
		var file = new BinaryFile(fileName, BinaryFile.WriteOnly);
		file.write(buffer);
		file.commit();
	}

}

tiled.registerMapFormat("sblv", sblvMapFormat);
