"use strict";

var test = require('tape');
var mapnik = require('../');
var path = require('path');

function xmlWithFont(font) {
  var val = '<Map font-directory="./"><Style name="text"><Rule>';
  val += '<TextSymbolizer size="12" face-name="' + font + '"><![CDATA[[name]]]></TextSymbolizer>';
  val += '</Rule></Style></Map>';
  return val;
}



test('fonts can be registered locally using font-directory in XML', (assert) => {
  var map = new mapnik.Map(4, 4);
  map.fromStringSync('<Map font-directory="./data/map-a" />',{strict:true,base:path.resolve(__dirname)});
  assert.equal(map.fonts().indexOf('DejaVu Serif Condensed Bold Italic'),0);
  assert.end();
});

test('fonts can be registered locally registerFonts', (assert) => {
  var map = new mapnik.Map(4, 4);
  assert.throws(function() { map.registerFonts(); });
  assert.throws(function() { map.registerFonts(12); });
  assert.throws(function() { map.registerFonts('./test/data/map-a/', null); });
  assert.throws(function() { map.registerFonts('./test/data/map-a/', {recurse:1}); });
  assert.equal(map.registerFonts('./test/data/DOESNOTEXIST/', {recurse:false}), false);
  assert.equal(map.registerFonts('./test/data/map-a/', {recurse:false}), true);
  assert.equal(map.fonts().indexOf('DejaVu Serif Condensed Bold Italic'),0);
  assert.end();
});


var a = 'DejaVu Serif Condensed Bold Italic';
var b = 'DejaVu Serif Condensed Bold';

test('fonts are not globally registered', (assert) => {
  assert.equal(mapnik.fonts().indexOf(a), -1);
  assert.equal(mapnik.fonts().indexOf(b), -1);
  assert.end();
});

test('map a has ' + a, (assert) => {
  var map = new mapnik.Map(4, 4);
  assert.equal(map.fontDirectory(), undefined);
  assert.doesNotThrow(function() {
    map.fromStringSync(xmlWithFont(a), {
      strict:true,
      base:path.resolve(path.join(__dirname,'data','map-a'))
    });
  });
  // global fonts registry should not know about locally registered font
  assert.equal(mapnik.fonts().indexOf(a), -1);
  // map local registry should
  assert.equal(map.fonts().indexOf(a), 0);
  // font-directory should match that passed in via map XML
  assert.equal(map.fontDirectory(),"./");
  // known registered font paths should match local paths
  assert.equal(Object.keys(map.fontFiles())[0],a);
  var font_path = map.fontFiles()[a];
  assert.ok(font_path.indexOf('map-a') > -1);
  // calling loadFonts should cache local font in-memory
  assert.equal(map.loadFonts(),true);
  assert.equal(map.memoryFonts().length,1);
  assert.equal(map.memoryFonts()[0],font_path);
  // loading a second time should not do anything (fonts are already cached)
  assert.deepEqual(map.loadFonts(),false);
  // global cache should be empty
  assert.equal(mapnik.memoryFonts().length,0);
  assert.end();
});

test('map b has ' + b, (assert) => {
  var map = new mapnik.Map(4, 4);
  assert.doesNotThrow(function() {
    map.fromStringSync(xmlWithFont(b), {
      strict:true,
      base:path.resolve(path.join(__dirname,'data','map-b'))
    });
  });
  assert.equal(mapnik.fonts().indexOf(b), -1);
  assert.equal(map.fonts().indexOf(b), 0);
  assert.equal(map.fontDirectory(),"./");
  assert.equal(Object.keys(map.fontFiles())[0],b);
  assert.ok(map.fontFiles()[b].indexOf('map-b') > -1);
  assert.end();
});

test('map a should not have ' + b, (assert) => {
  var map = new mapnik.Map(4, 4);
  assert.throws(function() {
    map.fromStringSync(xmlWithFont(b), {
      strict:true,
      base:path.resolve(path.join(__dirname,'data','map-a'))
    });
  });
  assert.equal(mapnik.fonts().indexOf(b), -1);
  assert.equal(map.fonts().indexOf(b), -1);
  assert.end();
});

test('map b should not have ' + a, (assert) => {
  var map = new mapnik.Map(4, 4);
  assert.throws(function() {
    map.fromStringSync(xmlWithFont(a), {
      strict:true,
      base:path.resolve(path.join(__dirname,'data','map-b'))
    });
  });
  assert.equal(mapnik.fonts().indexOf(a), -1);
  assert.equal(map.fonts().indexOf(a), -1);
  assert.end();
});

/*
//timeout(100000);
//before(function() {
  mapnik.register_system_fonts();
//});

test('should find new fonts when registering all system fonts', function() {
  // will return true if new fonts are found
  // but should return false now we called in `before`
  assert.ok(!mapnik.register_system_fonts());
  assert.end();
});

test('should not register hidden fonts file names', function() {
  var fonts = mapnik.fontFiles();
  for (var i = 0; i < fonts.length; i++) {
    assert(fonts[i][1][0] != '.', fonts[i]);
  }
  assert.end();
});

test('should not register hidden fonts face-names', function() {
  var fonts = mapnik.fonts();
  for (var i = 0; i < fonts.length; i++) {
    assert(fonts[i][0] != '.', fonts[i]);
  }
  assert.end();
});
*/
