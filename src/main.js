/* MERGED — session 2 framework (levels, menus, hearts, pause, obstacles, quiz)
   + session 1 visual engine (10 biomes, themed runners/gates, weather, songs).
   Global THREE, no modules so it opens via file:// */
(function () {
  'use strict';

  var LANES = [-3, 0, 3];
  var HIT_Z = 0; // paired with the low chase cam (close cam + close runner would clip)
  var MAX_LIVES = 3;
  var MAX_PAUSES = 3;
  var SLOW_MULT = 0.55;      // slow mode speed multiplier (near gates only)
  var SLOW_ZONE = 42;        // gates closer than this start slowing (when slow mode on)
  var SPEED_MAX = 38;
  var BASE_SPEED = 18;       // equal base speed for every level
  var HITS_PER_BIOME = 2;    // correct answers before the biome rotates
  var TRANSITION_DUR = 4.5;  // seconds for the seamless biome morph

  // ---------------- LEVELS (8 levels, 100 questions, every level a different size) ----------------
  var LEVELS = [
    {
      name: 'Level 1 — Basics', desc: 'print, comments, operators', speed: BASE_SPEED,
      questions: [
        { q: 'Which function prints text?', answers: ['print()', 'show()', 'echo()'], correct: 0 },
        { q: 'Which symbol starts a comment?', answers: ['#', '//', '--'], correct: 0 },
        { q: 'Which operator is integer division?', answers: ['/', '//', '%'], correct: 1 },
        { q: 'What is len([1, 2, 3])?', answers: ['2', '3', '6'], correct: 1 },
        { q: 'Which keyword defines a function?', answers: ['def', 'func', 'define'], correct: 0 },
        { q: 'What type is 3.14?', answers: ['int', 'float', 'str'], correct: 1 },
        { q: 'Which quotes make a string?', answers: ["'", 'neither', 'both'], correct: 2 },
        { q: 'Which assigns a value?', answers: ['==', '=', '!='], correct: 1 },
        { q: 'Which reads user input?', answers: ['input()', 'read()', 'get()'], correct: 0 },
        { q: 'How do you write True?', answers: ['True', 'true', 'TRUE'], correct: 0 }
      ]
    },
    {
      name: 'Level 2 — Data', desc: 'strings, lists, dicts', speed: BASE_SPEED,
      questions: [
        { q: 'Which of these data types is IMMUTABLE?', answers: ['list', 'tuple', 'dict'], correct: 1 },
        { q: 'Which method adds an item to the END of a list?', answers: ['append()', 'add()', 'push()'], correct: 0 },
        { q: 'What does "py"[1] give?', answers: ['p', 'y', 'error'], correct: 1 },
        { q: 'Which literal creates a dict?', answers: ['[]', '{"a": 1}', '()'], correct: 1 },
        { q: 'Index of the FIRST list item?', answers: ['1', '0', '-1'], correct: 1 },
        { q: 'Which converts "5" to an integer?', answers: ['str()', 'int()', 'len()'], correct: 1 },
        { q: 'Which literal creates a list?', answers: ['()', '[]', '{}'], correct: 1 },
        { q: 'Which removes the LAST item?', answers: ['pop()', 'push()', 'drop()'], correct: 0 },
        { q: 'What is len("abc")?', answers: ['2', '3', 'error'], correct: 1 },
        { q: 'Which literal creates a tuple?', answers: ['[]', '{}', '()'], correct: 2 },
        { q: 'How do you read key "k"?', answers: ['d[0]', "d['k']", 'd(k)'], correct: 1 },
        { q: "What is 'a'+'b'?", answers: ["'ab'", "'a b'", 'error'], correct: 0 }
      ]
    },
    {
      name: 'Level 3 — Logic', desc: 'if, loops, range', speed: BASE_SPEED,
      questions: [
        { q: 'Which keyword repeats while a condition is True?', answers: ['if', 'for', 'while'], correct: 2 },
        { q: 'Which operator tests equality?', answers: ['=', '==', '!='], correct: 1 },
        { q: 'What does list(range(3)) give?', answers: ['[1,2,3]', '[0,1,2]', '[0,3]'], correct: 1 },
        { q: 'How do you exit a loop early?', answers: ['stop', 'exit', 'break'], correct: 2 },
        { q: 'Which loop is best for a fixed number of repeats?', answers: ['while', 'if', 'for'], correct: 2 },
        { q: 'What is True and False?', answers: ['True', 'False', 'error'], correct: 1 },
        { q: 'What is not True?', answers: ['True', 'False', 'None'], correct: 1 },
        { q: 'How long is range(5)?', answers: ['4', '5', '6'], correct: 1 },
        { q: 'What does i += 1 mean?', answers: ['i = i + 1', 'i = 1', 'i == 1'], correct: 0 },
        { q: 'What marks a loop body?', answers: ['{}', 'indent', ';'], correct: 1 },
        { q: 'Loop-else runs when?', answers: ['no break', 'on break', 'never'], correct: 0 }
      ]
    },
    {
      name: 'Level 4 — Pro Mix', desc: 'errors, files, functions', speed: BASE_SPEED,
      questions: [
        { q: 'What does KeyError mean?', answers: ['missing dict key', 'bad import', 'bad indent'], correct: 0 },
        { q: 'Which opens a file for READING?', answers: ["open(f,'r')", "open(f,'w')", "open(f,'a')"], correct: 0 },
        { q: 'What is __init__?', answers: ['constructor', 'destructor', 'decorator'], correct: 0 },
        { q: 'Which block handles errors?', answers: ['try/except', 'check/catch', 'do/handle'], correct: 0 },
        { q: 'What does lambda create?', answers: ['a loop', 'anon. function', 'a class'], correct: 1 },
        { q: 'What is len({1, 1, 2})?', answers: ['3', '2', '1'], correct: 1 },
        { q: 'What is [i*i for i in range(3)]?', answers: ['[0,1,4]', '[1,4,9]', '[0,1,2]'], correct: 0 },
        { q: 'Which keyword repeats while a condition is True?', answers: ['if', 'for', 'while'], correct: 2 },
        { q: 'Which raises ZeroDivisionError?', answers: ['1/0', '1+0', '0/1'], correct: 0 },
        { q: 'Which needs an import?', answers: ['sqrt', 'print', 'len'], correct: 0 },
        { q: 'What prefix makes an f-string?', answers: ['f', 's', '$'], correct: 0 },
        { q: 'How do you write None?', answers: ['None', 'null', 'nil'], correct: 0 },
        { q: 'What does ** mean?', answers: ['power', 'times', 'comment'], correct: 0 },
        { q: 'What does pass do?', answers: ['nothing', 'stop', 'skip file'], correct: 0 }
      ]
    },
    {
      name: 'Level 5 — Strings', desc: 'text tricks', speed: BASE_SPEED,
      questions: [
        { q: 'Which makes "hi" → "HI"?', answers: ['upper()', 'big()', 'cap()'], correct: 0 },
        { q: 'Which is an f-string?', answers: ['"{x}"', 'f"{x}"', '"(x)"'], correct: 1 },
        { q: 'Which splits "a,b"?', answers: ['split()', 'cut()', 'chop()'], correct: 0 },
        { q: 'What is "a" in "abc"?', answers: ['True', 'False', 'error'], correct: 0 },
        { q: 'Which trims spaces?', answers: ['trim()', 'strip()', 'cut()'], correct: 1 },
        { q: 'What is "aaa".replace("a","b")?', answers: ['bbb', 'aaa', 'error'], correct: 0 },
        { q: 'What is "py"[-1]?', answers: ['p', 'y', 'error'], correct: 1 },
        { q: 'What does str(5) give?', answers: ["'5'", '5', 'error'], correct: 0 },
        { q: 'What is len("")?', answers: ['0', '1', 'error'], correct: 0 }
      ]
    },
    {
      name: 'Level 6 — OOP', desc: 'classes and objects', speed: BASE_SPEED,
      questions: [
        { q: 'Which keyword makes a class?', answers: ['class', 'def', 'object'], correct: 0 },
        { q: 'What is self?', answers: ['1st param', 'keyword', 'a type'], correct: 0 },
        { q: 'When does __init__ run?', answers: ['on create', 'on delete', 'never'], correct: 0 },
        { q: 'How does B inherit A?', answers: ['class B(A)', 'class A(B)', 'inherit B'], correct: 0 },
        { q: 'What is self.x = 1?', answers: ['instance var', 'local var', 'global'], correct: 0 },
        { q: 'How do you call a method?', answers: ['obj.m()', 'm(obj)', 'obj->m'], correct: 0 },
        { q: 'What does super() reach?', answers: ['parent', 'child', 'none'], correct: 0 },
        { q: 'Which makes a string view?', answers: ['__str__', 'toString', 'str()'], correct: 0 },
        { q: 'Which checks an object type?', answers: ['isinstance()', 'typeof()', 'is()'], correct: 0 },
        { q: 'What is a blueprint called?', answers: ['class', 'object', 'self'], correct: 0 },
        { q: 'How do you read an attribute?', answers: ['obj.attr', 'obj->attr', 'obj:attr'], correct: 0 },
        { q: 'Which is the constructor?', answers: ['__new__', '__init__', 'setup'], correct: 1 },
        { q: 'Which attr is name-mangled?', answers: ['__x', '_x', 'x_'], correct: 0 }
      ]
    },
    {
      name: 'Level 7 — Tools', desc: 'modules and libraries', speed: BASE_SPEED,
      questions: [
        { q: 'How do you load math?', answers: ['import math', 'load math', 'use math'], correct: 0 },
        { q: 'What does pip do?', answers: ['installs pkgs', 'runs code', 'edits files'], correct: 0 },
        { q: 'Which gives a random int?', answers: ['randint()', 'rand()', 'randomize()'], correct: 0 },
        { q: 'What is math.sqrt(16)?', answers: ['4.0', '4', 'error'], correct: 0 },
        { q: 'What is datetime for?', answers: ['date/time', 'random', 'files'], correct: 0 },
        { q: 'How do you import one name?', answers: ['from x import y', 'take y from x', 'get y'], correct: 0 },
        { q: 'How do you alias numpy?', answers: ['import n as np', 'import np=n', 'as np import n'], correct: 0 },
        { q: 'What is sys.argv?', answers: ['cmd args', 'paths', 'env vars'], correct: 0 },
        { q: 'What does json.loads do?', answers: ['JSON→dict', 'dict→JSON', 'str→list'], correct: 0 },
        { q: 'What does os.getcwd give?', answers: ['folder path', 'user', 'os name'], correct: 0 },
        { q: 'Minimum len(sys.argv)?', answers: ['0', '1', '2'], correct: 1 },
        { q: 'What is help() for?', answers: ['docs', 'run', 'exit'], correct: 0 },
        { q: 'Bad import raises?', answers: ['ImportError', 'ValueError', 'NameError'], correct: 0 },
        { q: 'Script __name__ equals?', answers: ['"__main__"', '"main"', '"run"'], correct: 0 },
        { q: 'How do you install requests?', answers: ['pip get x', 'pip install x', 'install x'], correct: 1 }
      ]
    },
    {
      name: 'Level 8 — Tricky Mix', desc: 'read carefully!', speed: BASE_SPEED,
      questions: [
        { q: 'What is [1,2] + [3]?', answers: ['[1,2,3]', '[1,2,[3]]', 'error'], correct: 0 },
        { q: 'What is 3 * "ab"?', answers: ['ababab', '9', 'error'], correct: 0 },
        { q: 'What is bool([])?', answers: ['True', 'False', 'error'], correct: 1 },
        { q: 'What is 7 // 3?', answers: ['2', '2.33', '3'], correct: 0 },
        { q: 'What is 7 % 3?', answers: ['1', '2', '3'], correct: 0 },
        { q: 'x=[1]; y=x; y+=[2]; x is?', answers: ['[1]', '[1,2]', '[2]'], correct: 1 },
        { q: 'After a, b = 1, 2: b?', answers: ['1', '2', 'error'], correct: 1 },
        { q: 'What is float("3.5")?', answers: ['3.5', '3', 'error'], correct: 0 },
        { q: 'What is int(3.9)?', answers: ['3', '4', '3.9'], correct: 0 },
        { q: 'What is round(2.5)?', answers: ['2', '3', '2.5'], correct: 0 },
        { q: 'What is "Hi" * 0?', answers: ["''", 'Hi', 'error'], correct: 0 },
        { q: 'Is None == False?', answers: ['True', 'False', 'error'], correct: 1 },
        { q: 'What is True + True?', answers: ['2', 'True', 'error'], correct: 0 },
        { q: 'sorted([3,1,2])[0]?', answers: ['1', '3', '0'], correct: 0 },
        { q: 'What is min("abc")?', answers: ['a', 'c', 'error'], correct: 0 },
        { q: 'What is 2 ** 3 ** 0?', answers: ['1', '2', '8'], correct: 1 }
      ]
    }
  ];

  // ---- Level 9: endless pool = every level's questions + fresh extras, open to all ----
  var ENDLESS_NEW = [
    { q: 'What is 2 * [1, 2]?', answers: ['[1,2,1,2]', '[2,4]', '[1,2]'], correct: 0 },
    { q: 'What is "Hi".lower()?', answers: ['hi', 'HI', 'Hi'], correct: 0 },
    { q: 'What is abs(-7)?', answers: ['7', '-7', 'error'], correct: 0 },
    { q: 'What is max(3, 9, 4)?', answers: ['3', '9', '4'], correct: 1 },
    { q: 'What is type([])?', answers: ['list', 'array', 'tuple'], correct: 0 },
    { q: 'What is 5 != 5?', answers: ['True', 'False', 'error'], correct: 1 },
    { q: 'len("a,b".split(","))?', answers: ['1', '2', '3'], correct: 1 },
    { q: 'What is list("ab")?', answers: ["['a','b']", "['ab']", 'error'], correct: 0 },
    { q: 'What is 4 ** 0.5?', answers: ['2.0', '2', 'error'], correct: 0 },
    { q: 'What is bool("False")?', answers: ['True', 'False', 'error'], correct: 0 },
    { q: 'What is sum([1,2,3])?', answers: ['5', '6', '9'], correct: 1 },
    { q: 'What is ord("A")?', answers: ['65', '97', 'error'], correct: 0 }
  ];
  (function () {
    var pool = [];
    LEVELS.forEach(function (lv) { pool = pool.concat(lv.questions); });
    pool = pool.concat(ENDLESS_NEW);
    LEVELS.push({ name: 'Level 9 — Endless', desc: 'never ends • open to all', speed: BASE_SPEED, endless: true, questions: pool });
  })();

  // ---------------- BIOMES (session 1, fog widened slightly for gate visibility) ----------------
  var BIOMES = [
    { icon: '⛈', name: 'STORM PLAINS', sky: 0x11182b, fog: [24, 175],
      ground: 0x232b26, road: 0x232936, edge: 0x7dd3fc, dash: 0x9ca3af,
      amb: 0x9fb4dd, ambI: 0.55, sun: 0xcfd8ff, sunI: 0.55,
      weather: 'rain', props: 'storm', stars: false,
      sunDisc: false, moonDisc: false, aurora: false, glow: false, tumble: false,
      planet: false, bats: false, water: false, extra: 'lightning' },
    { icon: '🏜', name: 'DESERT SUNSET', sky: 0xb3541e, fog: [38, 210],
      ground: 0xc9a06a, road: 0x8a6b48, edge: 0xffe08a, dash: 0x9ca3af,
      amb: 0xffd9a0, ambI: 0.7, sun: 0xffb36b, sunI: 1.2,
      weather: 'dust', props: 'desert', stars: false,
      sunDisc: true, moonDisc: false, aurora: false, glow: false, tumble: true,
      planet: false, bats: false, water: false, extra: null },
    { icon: '🌃', name: 'NEON CITY', sky: 0x070b1c, fog: [33, 190],
      ground: 0x0d1328, road: 0x151b33, edge: 0x22d3ee, dash: 0x9ca3af,
      amb: 0x8fa8ff, ambI: 0.6, sun: 0xffffff, sunI: 0.8,
      weather: 'drizzle', props: 'city', stars: true,
      sunDisc: false, moonDisc: true, aurora: false, glow: false, tumble: false,
      planet: false, bats: false, water: false, extra: null },
    { icon: '❄', name: 'SNOWFALL AURORA', sky: 0x274b6d, fog: [30, 175],
      ground: 0xdfe9f5, road: 0x9fb2cc, edge: 0xffffff, dash: 0x9ca3af,
      amb: 0xcfe6ff, ambI: 0.85, sun: 0xbcd6ff, sunI: 0.6,
      weather: 'snow', props: 'snow', stars: true,
      sunDisc: false, moonDisc: false, aurora: true, glow: false, tumble: false,
      planet: false, bats: false, water: false, extra: null },
    { icon: '🌿', name: 'JUNGLE', sky: 0x0d2818, fog: [21, 160],
      ground: 0x14331f, road: 0x2f3a24, edge: 0xa3e635, dash: 0x9ca3af,
      amb: 0x86efac, ambI: 0.5, sun: 0xd9f99d, sunI: 0.5,
      weather: 'fireflies', props: 'jungle', stars: false,
      sunDisc: false, moonDisc: false, aurora: false, glow: false, tumble: false,
      planet: false, bats: false, water: false, extra: null },
    { icon: '🌋', name: 'VOLCANO', sky: 0x20090a, fog: [24, 175],
      ground: 0x1c1214, road: 0x2b1a1e, edge: 0xff5a1a, dash: 0x9ca3af,
      amb: 0xff9a7a, ambI: 0.5, sun: 0xff7a3c, sunI: 0.7,
      weather: 'embers', props: 'volcano', stars: false,
      sunDisc: false, moonDisc: false, aurora: false, glow: true, tumble: false,
      planet: false, bats: false, water: false, extra: null },
    { icon: '🚀', name: 'DEEP SPACE', sky: 0x03030c, fog: [36, 210],
      ground: 0x0a0a18, road: 0x141428, edge: 0xc084fc, dash: 0x9ca3af,
      amb: 0xa5b4fc, ambI: 0.65, sun: 0xffffff, sunI: 0.7,
      weather: 'stardust', props: 'space', stars: true,
      sunDisc: false, moonDisc: false, aurora: false, glow: false, tumble: false,
      planet: true, bats: false, water: false, extra: null },
    { icon: '🏖', name: 'BEACH BOARDWALK', sky: 0x7ec8e3, fog: [39, 210],
      ground: 0xe8d29a, road: 0xb08d5a, edge: 0x2dd4bf, dash: 0x9ca3af,
      amb: 0xfff3d6, ambI: 0.85, sun: 0xffe9a8, sunI: 1.25,
      weather: 'spray', props: 'beach', stars: false,
      sunDisc: true, moonDisc: false, aurora: false, glow: false, tumble: false,
      planet: false, bats: false, water: true, extra: null },
    { icon: '🎃', name: 'HAUNTED NIGHT', sky: 0x150a24, fog: [20, 150],
      ground: 0x1a1426, road: 0x241d33, edge: 0xfb923c, dash: 0x9ca3af,
      amb: 0xc4b5fd, ambI: 0.5, sun: 0xddd6fe, sunI: 0.45,
      weather: 'mist', props: 'haunted', stars: true,
      sunDisc: false, moonDisc: true, aurora: false, glow: false, tumble: false,
      planet: false, bats: true, water: false, extra: null },
    { icon: '🍬', name: 'CANDY LAND', sky: 0xf9a8d4, fog: [36, 190],
      ground: 0xfbcfe8, road: 0x7c4a2d, edge: 0xff9ec7, dash: 0x9ca3af,
      amb: 0xffe4f1, ambI: 0.9, sun: 0xffffff, sunI: 1.1,
      weather: 'sprinkles', props: 'candy', stars: false,
      sunDisc: true, moonDisc: false, aurora: false, glow: false, tumble: false,
      planet: false, bats: false, water: false, extra: null }
  ];

  // gate face styles keyed by biome props type (session 1)
  var GATE_STYLE = {
    storm:   { bg: '#232936', bd: '#7dd3fc', ink: '#ffffff', side: 0x1a2033, sub: 'STORM GATE' },
    desert:  { bg: '#5b3a1e', bd: '#ffe08a', ink: '#ffe9b8', side: 0x3a2612, sub: 'SAND GATE' },
    city:    { bg: '#0b1026', bd: '#22d3ee', ink: '#a5f3fc', side: 0x0b1026, sub: 'NEON GATE' },
    snow:    { bg: '#dfe9f5', bd: '#0284c7', ink: '#0b2a4a', side: 0x9fb2cc, sub: 'ICE GATE' },
    jungle:  { bg: '#1d3a24', bd: '#a3e635', ink: '#d9f99d', side: 0x12241a, sub: 'JUNGLE GATE' },
    volcano: { bg: '#1c0f12', bd: '#ff6b1a', ink: '#ffd9b8', side: 0x14090b, sub: 'LAVA GATE' },
    space:   { bg: '#0d0d24', bd: '#c084fc', ink: '#e9d5ff', side: 0x0d0d24, sub: 'STAR GATE', stars: true },
    beach:   { bg: '#0e7490', bd: '#ffffff', ink: '#ffffff', side: 0x0a4a5e, sub: 'TIKI GATE' },
    haunted: { bg: '#1c1030', bd: '#fb923c', ink: '#fed7aa', side: 0x120a20, sub: 'CRYPT GATE' },
    candy:   { bg: '#f9a8d4', bd: '#ffffff', ink: '#7c2d12', side: 0xd67aa5, sub: 'CANDY GATE', sprinkles: true }
  };

  // obstacle shapes per biome (barrier = 1 lane, wall = full width, both jumpable)
  function obstKindNow() {
    var idx = phase === 'transition' ? transTo : biomeIndex;
    return BIOMES[idx].props;
  }

  function buildBarrierMesh(kind) {
    var g = new THREE.Group();
    if (kind === 'snow') { // snow pile
      var pile = addMesh(g, new THREE.SphereGeometry(1.2, 12, 9), lam(0xf4f8fc), 0, 0.1, 0);
      pile.scale.set(1.1, 0.55, 0.7);
      var lump = addMesh(g, new THREE.SphereGeometry(0.45, 9, 7), lam(0xffffff), 0.8, 0.25, 0.1);
      lump.scale.y = 0.7;
      addMesh(g, new THREE.SphereGeometry(0.35, 8, 6), lam(0xdbeafe), -0.8, 0.2, -0.1);
    } else if (kind === 'jungle') { // fallen log
      var log = addMesh(g, new THREE.CylinderGeometry(0.45, 0.5, 2.6, 9), lam(0x6b4a26), 0, 0.45, 0);
      log.rotation.z = Math.PI / 2;
      var stub = addMesh(g, new THREE.CylinderGeometry(0.12, 0.15, 0.7, 6), lam(0x6b4a26), -0.7, 0.95, 0);
      stub.rotation.z = -0.5;
      addMesh(g, new THREE.BoxGeometry(1.8, 0.12, 0.7), lam(0x3f7a33), 0, 0.88, 0, false);
    } else if (kind === 'desert') { // sandstone block + pyramid cap
      addMesh(g, new THREE.BoxGeometry(2.2, 0.9, 1.0), lam(0xd9a441), 0, 0.45, 0);
      addMesh(g, new THREE.ConeGeometry(0.7, 0.6, 4), lam(0xb45309), 0, 1.15, 0);
    } else if (kind === 'city') { // traffic barricade
      addMesh(g, new THREE.BoxGeometry(0.18, 1.0, 0.9), lam(0x334155), -1.0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(0.18, 1.0, 0.9), lam(0x334155), 1.0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(2.4, 0.5, 0.25), lam(0xea580c), 0, 0.85, 0);
      for (var cs = 0; cs < 3; cs++) {
        addMesh(g, new THREE.BoxGeometry(0.4, 0.54, 0.27), bas(0xffffff), -0.7 + cs * 0.7, 0.85, 0, false);
      }
    } else if (kind === 'volcano') { // lava rock
      var rockMat = new THREE.MeshLambertMaterial({ color: 0x171216, emissive: 0xff5a00, emissiveIntensity: 0.55 });
      var rock = addMesh(g, new THREE.DodecahedronGeometry(1.0, 0), rockMat, 0, 0.5, 0);
      rock.scale.set(1.2, 0.65, 0.7);
    } else if (kind === 'space') { // meteorite + beacon
      var metMat = new THREE.MeshLambertMaterial({ color: 0x4c3a7a, emissive: 0x7c3aed, emissiveIntensity: 0.3 });
      var met = addMesh(g, new THREE.DodecahedronGeometry(0.85, 0), metMat, 0, 0.5, 0);
      met.scale.set(1.3, 0.75, 0.8);
      addMesh(g, new THREE.SphereGeometry(0.16, 8, 6), bas(0x67e8f9), 0, 1.2, 0, false);
    } else if (kind === 'beach') { // sandcastle
      addMesh(g, new THREE.CylinderGeometry(0.7, 0.8, 1.0, 10), lam(0xe3b96a), 0, 0.5, 0);
      addMesh(g, new THREE.ConeGeometry(0.75, 0.5, 10), lam(0xc99a55), 0, 1.2, 0);
      addMesh(g, new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5), lam(0x8a6b48), 0, 1.6, 0, false);
      addMesh(g, new THREE.BoxGeometry(0.35, 0.22, 0.04), bas(0xef4444), 0.19, 1.8, 0, false);
    } else if (kind === 'haunted') { // tombstone + cross
      addMesh(g, new THREE.BoxGeometry(0.9, 1.0, 0.3), lam(0x6b7280), 0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(0.6, 0.18, 0.32), lam(0x4b5563), 0, 1.05, 0);
    } else if (kind === 'candy') { // chocolate bar
      addMesh(g, new THREE.BoxGeometry(2.2, 0.7, 1.0), lam(0x7c4a2d), 0, 0.35, 0);
      for (var cx = 0; cx < 3; cx++) for (var cz = 0; cz < 2; cz++) {
        addMesh(g, new THREE.BoxGeometry(0.45, 0.15, 0.4), lam(0xd69a5d), -0.6 + cx * 0.6, 0.75, -0.22 + cz * 0.44, false);
      }
    } else { // storm: rock slab
      addMesh(g, new THREE.BoxGeometry(2.4, 1.0, 1.1), lam(0x64748b), 0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(2.0, 0.25, 0.9), lam(0x475569), 0, 1.1, 0);
    }
    return g;
  }

  function buildWallMesh(kind) {
    var g = new THREE.Group();
    if (kind === 'snow') { // ice wall
      addMesh(g, new THREE.BoxGeometry(8.8, 1.1, 0.6), lam(0xbfe3f5), 0, 0.55, 0);
      addMesh(g, new THREE.BoxGeometry(8.84, 0.2, 0.64), lam(0xffffff), 0, 1.1, 0, false);
    } else if (kind === 'jungle') { // vine wall
      addMesh(g, new THREE.BoxGeometry(8.8, 1.0, 0.6), lam(0x2f5c2e), 0, 0.5, 0);
      for (var li = 0; li < 5; li++) {
        addMesh(g, new THREE.SphereGeometry(0.4, 8, 6), lam(0x4d9e4f), -3.5 + li * 1.75, 1.15, 0, false);
      }
    } else if (kind === 'desert') { // sandstone wall + pyramid caps
      addMesh(g, new THREE.BoxGeometry(8.8, 1.0, 0.6), lam(0xc99a4a), 0, 0.5, 0);
      for (var pi = 0; pi < 3; pi++) {
        addMesh(g, new THREE.ConeGeometry(0.5, 0.5, 4), lam(0xb45309), -2.8 + pi * 2.8, 1.2, 0);
      }
    } else if (kind === 'city') { // police barrier segments
      for (var si = 0; si < 4; si++) {
        addMesh(g, new THREE.BoxGeometry(2.2, 1.1, 0.6), lam(si % 2 ? 0xf8fafc : 0x1d4ed8), -3.3 + si * 2.2, 0.55, 0);
      }
    } else if (kind === 'volcano') { // lava wall with glowing cracks
      var wallMat = new THREE.MeshLambertMaterial({ color: 0x1c0f12, emissive: 0xcc3300, emissiveIntensity: 0.5 });
      addMesh(g, new THREE.BoxGeometry(8.8, 1.2, 0.6), wallMat, 0, 0.6, 0);
      for (var ci = 0; ci < 3; ci++) {
        addMesh(g, new THREE.BoxGeometry(0.18, 1.0, 0.1), bas(0xffb03a), -2.5 + ci * 2.5, 0.6, 0.32, false);
      }
    } else if (kind === 'space') { // energy wall
      var eMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.65 });
      var ew = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.1, 0.3), eMat);
      ew.position.set(0, 0.55, 0);
      g.add(ew);
      addMesh(g, new THREE.BoxGeometry(0.3, 1.3, 0.5), lam(0x2e2350), -4.4, 0.65, 0);
      addMesh(g, new THREE.BoxGeometry(0.3, 1.3, 0.5), lam(0x2e2350), 4.4, 0.65, 0);
    } else if (kind === 'beach') { // wave wall
      addMesh(g, new THREE.BoxGeometry(8.8, 1.0, 0.6), lam(0x1e90d6), 0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(8.84, 0.22, 0.64), lam(0xffffff), 0, 1.05, 0, false);
    } else if (kind === 'haunted') { // plank fence
      addMesh(g, new THREE.BoxGeometry(8.8, 0.18, 0.3), lam(0x241a3a), 0, 0.85, 0);
      addMesh(g, new THREE.BoxGeometry(8.8, 0.18, 0.3), lam(0x241a3a), 0, 0.35, 0);
      for (var fi = 0; fi < 7; fi++) {
        addMesh(g, new THREE.BoxGeometry(0.5, 1.2, 0.2), lam(0x3b2a5e), -3.9 + fi * 1.3, 0.6, 0);
      }
    } else if (kind === 'candy') { // chocolate wall with drizzle
      addMesh(g, new THREE.BoxGeometry(8.8, 1.0, 0.6), lam(0x7c4a2d), 0, 0.5, 0);
      addMesh(g, new THREE.BoxGeometry(8.84, 0.2, 0.64), lam(0xfff7ed), 0, 1.05, 0, false);
    } else { // storm: concrete wall
      addMesh(g, new THREE.BoxGeometry(8.8, 1.2, 0.6), lam(0x475569), 0, 0.6, 0);
      addMesh(g, new THREE.BoxGeometry(8.84, 0.25, 0.64), lam(0x1e293b), 0, 0.15, 0, false);
    }
    return g;
  }

  var WEATHER_STYLE = {
    rain:      { color: 0x9fc5ff, size: 0.16, opacity: 0.8 },
    drizzle:   { color: 0x7dd3fc, size: 0.10, opacity: 0.5 },
    dust:      { color: 0xe8c48a, size: 0.14, opacity: 0.55 },
    snow:      { color: 0xffffff, size: 0.20, opacity: 0.9 },
    fireflies: { color: 0xb6ff5e, size: 0.18, opacity: 0.95 },
    embers:    { color: 0xff8a2a, size: 0.22, opacity: 0.95 },
    stardust:  { color: 0xc4e2ff, size: 0.16, opacity: 0.9 },
    mist:      { color: 0xcfd8e6, size: 0.42, opacity: 0.22 },
    spray:     { color: 0xd6f0ff, size: 0.22, opacity: 0.5 },
    sprinkles: { color: 0xffffff, size: 0.20, opacity: 0.95 }
  };

  // ---------------- state ----------------
  var mode = 'menu';           // menu | playing | over | win
  var paused = false;
  var levelIdx = 0;
  var maxCleared = 0;   // highest 1-based level cleared, persisted
  try { maxCleared = parseInt(localStorage.getItem('pqr_cleared') || '0', 10) || 0; } catch (e) {}
  function unlockedUpTo() { return Math.min(LEVELS.length, Math.max(3, maxCleared + 2)); }
  var slowMode = false;
  var currentLane = 1;
  var score = 0;
  var streak = 0;   // consecutive correct answers (any wrong resets to 0)
  var lives = MAX_LIVES;
  var pausesLeft = MAX_PAUSES;
  var qIndex = 0;              // advances only on CORRECT
  var qOrder = [];             // shuffled question order for this run (count stays secret)
  var speed = BASE_SPEED;
  var speedBonus = 0;
  var dustT = 0;
  var jumpY = 0, jumpV = 0;
  var GRAV = -32, JUMP_V = 12.5;
  var obstacles = [];
  var hurtT = 0;
  var jumpHintShown = false;
  var OBS_Z = -85;
  var roundActive = true;
  var pendingSpawn = -1;
  var pendingEnd = -1;
  var pendingEndType = null;
  var elapsed = 0;
  // biome engine state (session 1)
  var biomeIndex = 0;
  var hitsInBiome = 0;
  var phase = 'stable';        // stable | approach | transition
  var approachNext = -1;
  var transFrom = 0, transTo = 0, transT = 0;
  var propTypeNow = 'storm';
  var bQueue = [];
  var popT = 1;

  function level() { return LEVELS[levelIdx]; }
  function spawnZ() { return -115; }
  function curQ() {
    var qs = level().questions;
    return qs[qOrder[qIndex % qs.length]];
  }

  // ---------------- dom ----------------
  var qText = document.getElementById('question-text');
  var heartsEl = document.getElementById('hud-hearts');
  var pausesEl = document.getElementById('hud-pauses');
  var streakEl = document.getElementById('hud-streak');
  var streakPlusEl = document.getElementById('streak-plus');
  var endlessCardBtn = document.getElementById('endless-card');
  var biomeEl = document.getElementById('hud-biome');
  var nextEl = document.getElementById('hud-next');
  var slowBadge = document.getElementById('hud-slow');
  var flashEl = document.getElementById('flash');
  var toastEl = document.getElementById('toast');
  var menuEl = document.getElementById('menu');
  var levelListEl = document.getElementById('level-list');
  var slowToggle = document.getElementById('slow-toggle');
  var pauseMenuEl = document.getElementById('pauseMenu');
  var pauseInfoEl = document.getElementById('pause-info');
  var resumeBtn = document.getElementById('resume-btn');
  var pauseLevelsBtn = document.getElementById('pause-levels-btn');
  var slowTogglePause = document.getElementById('slow-toggle-pause');
  var gameoverEl = document.getElementById('gameover');
  var goScoreEl = document.getElementById('go-score');
  var retryBtn = document.getElementById('retry-btn');
  var goLevelsBtn = document.getElementById('go-levels-btn');
  var winMenuEl = document.getElementById('winMenu');
  var winScoreEl = document.getElementById('win-score');
  var nextBtn = document.getElementById('next-btn');
  var winLevelsBtn = document.getElementById('win-levels-btn');
  var soundBtn = document.getElementById('hud-sound');

  // ---------------- audio: session 2 SFX + session 1 songs, one context ----------------
  var audioCtx = null, masterGain = null, musicGain = null, noiseBuf = null;
  var songStarted = false, songIdx = 0, biomeCount = 0, songTimer = null, songEndTimer = null, mp3EndTimer = null;
  var muted = false;
  try { muted = localStorage.getItem('pqr_muted') === '1'; } catch (e) {}
  var SONGS = [
    { name: 'Sunny Steps', step: 300, wave: 'sine', vol: 0.06, bassVol: 0.03, root: 523.25, legato: 1.8,
      mel: [0, 4, 7, 12, 7, 4, 2, 4], bass: [0, null, null, null, -5, null, -3, null], drums: null },
    { name: 'Midnight Drive', step: 340, wave: 'triangle', vol: 0.05, bassVol: 0.05, root: 220, legato: 1.6,
      mel: [0, null, 3, null, 7, null, 10, 7], bass: [0, null, null, null, null, null, -2, null],
      drums: ['k', null, 'h', null, 'k', null, 'h', 'k'] }
  ];
  function ensureAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (!audioCtx) {
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(audioCtx.destination);
      musicGain = audioCtx.createGain();   // dedicated song bus so procedural fades never touch SFX
      musicGain.gain.value = 0;
      musicGain.connect(masterGain);
      noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (!muted && audioCtx.state === 'suspended') audioCtx.resume();
    return true;
  }
  function unlock() {
    if (!ensureAudio()) return;
    if (!songStarted) songStarted = true;   // ctx ready; music itself starts on level entry
  }
  function tone(freq, dur, type, vol, delay, slideTo, bus) {
    if (muted || !ensureAudio()) return;
    if (audioCtx.state !== 'running') return;
    var t0 = audioCtx.currentTime + (delay || 0);
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol || 0.3), t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || masterGain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function sfxClick() { tone(720, 0.07, 'square', 0.16); }
  function sfxSwish() { tone(280, 0.12, 'sine', 0.14, 0, 620); }
  function sfxCorrect() { tone(523.25, 0.12, 'triangle', 0.4); tone(659.25, 0.12, 'triangle', 0.4, 0.09); tone(783.99, 0.24, 'triangle', 0.4, 0.18); }
  function sfxWrong() { tone(170, 0.22, 'sawtooth', 0.3); tone(115, 0.3, 'sawtooth', 0.3, 0.09); }
  function sfxPause() { tone(440, 0.1, 'sine', 0.27); tone(330, 0.16, 'sine', 0.27, 0.09); }
  function sfxJump() { tone(300, 0.15, 'square', 0.14, 0, 720); }
  function sfxCrash() { tone(95, 0.25, 'sine', 0.4); tone(65, 0.3, 'triangle', 0.3, 0.02); }
  function sfxResume() { tone(330, 0.1, 'sine', 0.27); tone(494, 0.16, 'sine', 0.27, 0.09); }
  function sfxWin() { var n = [523, 659, 784, 1047, 784, 1319]; for (var wi = 0; wi < n.length; wi++) tone(n[wi], 0.2, 'triangle', 0.38, wi * 0.12); }
  function sfxOver() { var n = [392, 330, 262, 196]; for (var oi = 0; oi < n.length; oi++) tone(n[oi], 0.26, 'sawtooth', 0.25, oi * 0.17); }
  function sfxPickup() { tone(660, 0.09, 'square', 0.12); tone(990, 0.12, 'square', 0.12, 0.08); }
  function sfxKick() {
    if (muted || !ensureAudio() || audioCtx.state !== 'running') return;
    var t0 = audioCtx.currentTime;
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t0);
    o.frequency.exponentialRampToValueAtTime(45, t0 + 0.12);
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
    o.connect(g); g.connect(masterGain);
    o.start(t0); o.stop(t0 + 0.2);
  }
  function sfxHat() {
    if (muted || !ensureAudio() || audioCtx.state !== 'running') return;
    var t0 = audioCtx.currentTime;
    var src = audioCtx.createBufferSource();
    src.buffer = noiseBuf;
    var f = audioCtx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = 7000;
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + 0.07);
  }
  function sfxSweep() {
    if (muted || !ensureAudio() || audioCtx.state !== 'running') return;
    var t0 = audioCtx.currentTime;
    var src = audioCtx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    var f = audioCtx.createBiquadFilter();
    f.type = 'bandpass'; f.Q.value = 1.5;
    f.frequency.setValueAtTime(300, t0);
    f.frequency.exponentialRampToValueAtTime(3000, t0 + 1.1);
    var g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start(t0); src.stop(t0 + 1.3);
  }
  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem('pqr_muted', muted ? '1' : '0'); } catch (e) {}
    soundBtn.textContent = muted ? '🔇' : '🔊';
    if (audioCtx) { if (muted) audioCtx.suspend(); else audioCtx.resume(); }
    if (muted && activeTrack) activeTrack.pause();
    else if (!muted && activeTrack && musicWanted) elPlay(activeTrack);
  }
  function freqOf(root, semi) { return root * Math.pow(2, semi / 12); }
  function startSong() {
    if (songTimer) { clearInterval(songTimer); songTimer = null; }
    if (songEndTimer) { clearTimeout(songEndTimer); songEndTimer = null; }
    stopMP3();
    musicWanted = true;
    var song = SONGS[songIdx % SONGS.length];
    // 2s fade in on the song bus (SFX stay full volume)
    var t0 = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(t0);
    musicGain.gain.setValueAtTime(0.0001, t0);
    musicGain.gain.exponentialRampToValueAtTime(1, t0 + 2);
    var i = 0;
    songTimer = setInterval(function () {
      if (muted || !audioCtx || audioCtx.state !== 'running' || paused) return;   // song holds while paused
      var m = song.mel[i % song.mel.length];
      if (m !== null && m !== undefined) {
        tone(freqOf(song.root, m), song.step / 1000 * (song.legato || 1.8), song.wave, song.vol, 0, null, musicGain);
        tone(freqOf(song.root, m) * 2, song.step / 1000 * 1.2, 'sine', song.vol * 0.3, 0, null, musicGain);
      }
      if (song.bass) {
        var b = song.bass[i % song.bass.length];
        if (b !== null && b !== undefined) tone(freqOf(song.root / 2, b), song.step / 1000 * 2.5, 'triangle', song.bassVol, 0, null, musicGain);
      }
      if (song.drums) {
        var dd = song.drums[i % song.drums.length];
        if (dd === 'k') sfxKick();
        else if (dd === 'h') sfxHat();
      }
      i++;
    }, song.step);
    // ~35s runtime like the licensed tracks, then 2s fade out + auto-advance
    songEndTimer = setTimeout(songEndCheck, 33000);
  }
  function songEndCheck() {
    if (paused || mode !== 'playing') { songEndTimer = setTimeout(songEndCheck, 2000); return; }
    var t1 = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(t1);
    musicGain.gain.setValueAtTime(Math.max(0.0001, musicGain.gain.value), t1);
    musicGain.gain.exponentialRampToValueAtTime(0.0001, t1 + 2);
    songEndTimer = setTimeout(function () { pickTrack(); }, 2000);
  }
  // ---- licensed tracks (local mp3s) take priority over procedural songs ----
  var trackA = new Audio('audio/call-to-adventure.mp3');
  var trackB = new Audio('audio/move-forward.mp3');
  trackA._vol = 0.3;   // Call to Adventure
  trackB._vol = 0.08;   // Move Forward, mixed well under everything
  trackA.preload = 'auto'; trackB.preload = 'auto';
  trackA.loop = true; trackB.loop = true;
  trackA.dataset.title = 'Call to Adventure — Kevin MacLeod';
  trackB.dataset.title = 'Move Forward — Kevin MacLeod';
  [trackA, trackB].forEach(function (tr) {
    tr.addEventListener('error', function () {
      toast('⚠ music file blocked — serve via localhost, not file open', 3000);
    });
  });
  var activeTrack = null, musicWanted = false;
  function fadeTrack(el, to, ms, done) {
    if (el._fade) { clearInterval(el._fade); el._fade = null; }
    var from = el.volume;
    var steps = Math.max(1, Math.round(ms / 50));
    var i = 0;
    el._fade = setInterval(function () {
      i++;
      var f = Math.min(1, i / steps);
      el.volume = from + (to - from) * f;
      if (f >= 1) { clearInterval(el._fade); el._fade = null; if (done) done(); }
    }, 50);
  }
  function elPlay(el) {
    try { var p = el.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  function stopMP3() {
    if (mp3EndTimer) { clearTimeout(mp3EndTimer); mp3EndTimer = null; }
    if (activeTrack) {
      var el = activeTrack;
      activeTrack = null;
      fadeTrack(el, 0, 2000, function () { el.pause(); });
    }
  }
  function stopMusic() {
    if (songTimer) { clearInterval(songTimer); songTimer = null; }
    if (songEndTimer) { clearTimeout(songEndTimer); songEndTimer = null; }
    stopMP3();
    musicWanted = false;
  }
  function playMP3(el) {
    if (songTimer) { clearInterval(songTimer); songTimer = null; }
    musicWanted = true;
    if (activeTrack === el && !el.paused) { fadeTrack(el, el._vol, 1000); return; }
    stopMP3();
    activeTrack = el;
    el.volume = 0;
    try { el.currentTime = 0; } catch (e) {}
    elPlay(el);
    fadeTrack(el, el._vol, 2000);
    toast('♫ ' + el.dataset.title, 1500);
    // ~35s runtime like everything else, then fade out + auto-advance
    if (mp3EndTimer) clearTimeout(mp3EndTimer);
    mp3EndTimer = setTimeout(mp3EndCheck, 33000);
  }
  function mp3EndCheck() {
    var el = activeTrack;
    if (!el || paused || mode !== 'playing') { mp3EndTimer = setTimeout(mp3EndCheck, 2000); return; }
    fadeTrack(el, 0, 2000);
    mp3EndTimer = setTimeout(function () { if (activeTrack === el) pickTrack(); }, 2000);
  }
  function pickTrack() {
    // ~65% licensed tracks, ~35% procedural survivors
    if (Math.random() < 0.65) {
      playMP3(Math.random() < 0.5 ? trackA : trackB);
    } else {
      songIdx = (Math.random() * SONGS.length) | 0;
      startSong();
      toast('♪ ' + SONGS[songIdx].name, 1500);
    }
  }
  function onBiomeEnter(isFirst) {
    if (!audioCtx || !songStarted) return;
    if (isFirst) {
      biomeCount = 0;
      pickTrack();   // weighted mix again: ~70% licensed, ~30% procedural
      return;
    }
    biomeCount++;
    if (biomeCount % 2 === 0) pickTrack();
  }

  // ---------------- renderer / scene ----------------
  var container = document.getElementById('game');
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(BIOMES[0].sky);
  scene.fog = new THREE.Fog(BIOMES[0].sky, BIOMES[0].fog[0], BIOMES[0].fog[1]);

  var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 260);
  var CAM_BASE = new THREE.Vector3(0, 3.8, 6.2);
  camera.position.copy(CAM_BASE);
  camera.lookAt(0, 1.4, -12);

  // ---------------- lights ----------------
  var ambient = new THREE.AmbientLight(BIOMES[0].amb, BIOMES[0].ambI);
  scene.add(ambient);
  var sun = new THREE.DirectionalLight(BIOMES[0].sun, BIOMES[0].sunI);
  sun.position.set(7, 14, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far = 60;
  scene.add(sun);
  var rim = new THREE.DirectionalLight(0x22d3ee, 0.35);
  rim.position.set(-6, 4, -10);
  scene.add(rim);

  var tSky = new THREE.Color(BIOMES[0].sky);
  var tGround = new THREE.Color(BIOMES[0].ground);
  var tRoad = new THREE.Color(BIOMES[0].road);
  var tEdge = new THREE.Color(BIOMES[0].edge);
  var tAmb = new THREE.Color(BIOMES[0].amb);
  var tSunC = new THREE.Color(BIOMES[0].sun);
  var tAmbI = BIOMES[0].ambI, tSunI = BIOMES[0].sunI;
  var _c1 = new THREE.Color(), _c2 = new THREE.Color();

  // ---------------- ground + road ----------------
  var groundMat = new THREE.MeshLambertMaterial({ color: BIOMES[0].ground });
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(280, 280), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.05, -50);
  ground.receiveShadow = true;
  scene.add(ground);

  var roadMat = new THREE.MeshLambertMaterial({ color: BIOMES[0].road });
  var road = new THREE.Mesh(new THREE.PlaneGeometry(11, 170), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -60);
  road.receiveShadow = true;
  scene.add(road);

  var edgeMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  [-5.65, 5.65].forEach(function (x) {
    var edge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 170), edgeMat);
    edge.position.set(x, 0.05, -60);
    scene.add(edge);
  });

  var dashMat = new THREE.MeshBasicMaterial({ color: 0x9ca3af });
  var dashes = [];
  var dashGeo = new THREE.BoxGeometry(0.16, 0.04, 2.2);
  [-1.5, 1.5].forEach(function (x) {
    for (var i = 0; i < 24; i++) {
      var d = new THREE.Mesh(dashGeo, dashMat);
      d.position.set(x, 0.02, 12 - i * 7);
      scene.add(d);
      dashes.push(d);
    }
  });

  // ---------------- sky extras (session 1) ----------------
  function noFog(mat) { mat.fog = false; return mat; }

  var stars = (function () {
    var n = 340, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 260;
      pos[i * 3 + 1] = 8 + Math.random() * 75;
      pos[i * 3 + 2] = -150 + Math.random() * 110;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var p = new THREE.Points(g, noFog(new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));
    p.frustumCulled = false;
    p.visible = false;
    scene.add(p);
    return p;
  })();

  var sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(8, 32),
    noFog(new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.95 }))
  );
  sunDisc.position.set(-28, 9, -120);
  sunDisc.visible = false;
  scene.add(sunDisc);

  var moonDisc = new THREE.Mesh(
    new THREE.CircleGeometry(4, 32),
    noFog(new THREE.MeshBasicMaterial({ color: 0xe8f0ff }))
  );
  moonDisc.position.set(26, 22, -120);
  moonDisc.visible = false;
  scene.add(moonDisc);

  function gradientTex(stops) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 128);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 128);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }

  var auroraTex = gradientTex([[0, 'rgba(0,0,0,0)'], [0.45, 'rgba(52,255,150,0.75)'], [0.7, 'rgba(150,100,255,0.5)'], [1, 'rgba(0,0,0,0)']]);
  auroraTex.repeat.set(5, 1);
  var aurora = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 26),
    noFog(new THREE.MeshBasicMaterial({ map: auroraTex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
  );
  aurora.position.set(0, 28, -115);
  aurora.visible = false;
  scene.add(aurora);

  var glowTex = gradientTex([[0, 'rgba(0,0,0,0)'], [0.62, 'rgba(255,90,20,0.55)'], [0.8, 'rgba(255,180,60,0.85)'], [1, 'rgba(0,0,0,0)']]);
  var glowHorizon = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 16),
    noFog(new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }))
  );
  glowHorizon.position.set(0, 4, -118);
  glowHorizon.visible = false;
  scene.add(glowHorizon);

  var planet = new THREE.Group();
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(7, 24, 18), noFog(new THREE.MeshBasicMaterial({ color: 0x6d5ef0 }))));
  var planetRing = new THREE.Mesh(new THREE.RingGeometry(9, 12.5, 48), noFog(new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })));
  planet.add(planetRing);
  var planetMoon = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 10), noFog(new THREE.MeshBasicMaterial({ color: 0xcbd5e1 })));
  planetMoon.position.set(11, 3, 0);
  planet.add(planetMoon);
  planet.position.set(32, 27, -130);
  planet.visible = false;
  scene.add(planet);

  var waterMat = new THREE.MeshBasicMaterial({ color: 0x1e90d6, transparent: true, opacity: 0.85 });
  var waterL = new THREE.Mesh(new THREE.PlaneGeometry(30, 170), waterMat);
  waterL.rotation.x = -Math.PI / 2;
  waterL.position.set(-24, 0.0, -55);
  waterL.visible = false;
  scene.add(waterL);
  var waterR = waterL.clone();
  waterR.position.x = 24;
  waterR.visible = false;
  scene.add(waterR);

  var bats = [];
  var batMat = new THREE.MeshBasicMaterial({ color: 0x0a0a12 });
  for (var bi = 0; bi < 5; bi++) {
    var bat = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 4), batMat);
    bat.visible = false;
    bat.userData = { ph: Math.random() * 6.28, r: 8 + Math.random() * 10, h: 12 + Math.random() * 6, sp: 0.5 + Math.random() * 0.5 };
    scene.add(bat);
    bats.push(bat);
  }

  var tumbleweeds = [];
  var tumbleMat = new THREE.MeshBasicMaterial({ color: 0xc9a06a, wireframe: true });
  var tumbleGeo = new THREE.SphereGeometry(0.55, 7, 5);
  for (var tw = 0; tw < 3; tw++) {
    var w = new THREE.Mesh(tumbleGeo, tumbleMat);
    w.visible = false;
    w.userData = { sp: 4 + Math.random() * 3 };
    scene.add(w);
    tumbleweeds.push(w);
  }
  function resetTumbleweed(w, stagger) {
    w.position.set(-14 - Math.random() * (stagger ? 18 : 4), 0.55, -18 - Math.random() * 30);
    w.userData.sp = 4 + Math.random() * 3.5;
  }

  // ---------------- weather: main + teaser (session 1) ----------------
  function makeSys(n) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(n * 3);
    var base = new Float32Array(n * 3);
    var seed = new Float32Array(n);
    var col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) { col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1; seed[i] = Math.random() * 100; }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true, opacity: 0.8, vertexColors: true });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    return { n: n, geo: geo, pos: pos, base: base, seed: seed, col: col, mat: mat, pts: pts, type: 'rain', baseOp: 0.8 };
  }
  var mainS = makeSys(220);
  var teasS = makeSys(100);
  teasS.pts.visible = false;

  var SPRINKLE_COLS = [[1, 0.3, 0.5], [0.3, 0.8, 1], [0.5, 1, 0.4], [1, 0.85, 0.2], [0.8, 0.5, 1]];
  var _wc = new THREE.Color();

  function setupSys(S, type) {
    S.type = type;
    var st = WEATHER_STYLE[type] || WEATHER_STYLE.rain;
    S.mat.size = st.size;
    S.mat.opacity = st.opacity;
    S.baseOp = st.opacity;
    for (var i = 0; i < S.n; i++) {
      var x, y, z;
      if (type === 'embers') { x = (Math.random() - 0.5) * 18; y = Math.random() * 3; z = -70 + Math.random() * 80; }
      else if (type === 'fireflies') { x = (Math.random() - 0.5) * 22; y = 0.5 + Math.random() * 4; z = -60 + Math.random() * 68; }
      else if (type === 'snow') { x = (Math.random() - 0.5) * 55; y = Math.random() * 28; z = -100 + Math.random() * 112; }
      else if (type === 'dust') { x = (Math.random() - 0.5) * 40; y = Math.random() * 6; z = -100 + Math.random() * 112; }
      else if (type === 'drizzle') { x = (Math.random() - 0.5) * 50; y = Math.random() * 26; z = -100 + Math.random() * 112; }
      else if (type === 'stardust') { x = (Math.random() - 0.5) * 60; y = Math.random() * 30; z = -110 + Math.random() * 122; }
      else if (type === 'mist' || type === 'spray') { x = (Math.random() - 0.5) * 45; y = 0.2 + Math.random() * 3.5; z = -100 + Math.random() * 112; }
      else if (type === 'sprinkles') { x = (Math.random() - 0.5) * 40; y = Math.random() * 26; z = -100 + Math.random() * 112; }
      else { x = (Math.random() - 0.5) * 55; y = Math.random() * 28; z = -100 + Math.random() * 112; }
      S.pos[i * 3] = x; S.pos[i * 3 + 1] = y; S.pos[i * 3 + 2] = z;
      S.base[i * 3] = x; S.base[i * 3 + 1] = y; S.base[i * 3 + 2] = z;
      var r = 1, g = 1, b = 1;
      if (type === 'sprinkles') { var cc = SPRINKLE_COLS[(Math.random() * SPRINKLE_COLS.length) | 0]; r = cc[0]; g = cc[1]; b = cc[2]; }
      else { _wc.set(st.color); r = _wc.r; g = _wc.g; b = _wc.b; }
      S.col[i * 3] = r; S.col[i * 3 + 1] = g; S.col[i * 3 + 2] = b;
    }
    S.geo.attributes.position.needsUpdate = true;
    S.geo.attributes.color.needsUpdate = true;
    S.pts.visible = true;
  }

  function updateSys(S, dt) {
    if (!S.pts.visible) return;
    var type = S.type;
    for (var i = 0; i < S.n; i++) {
      var ix = i * 3, s = S.seed[i];
      if (type === 'rain') {
        S.pos[ix + 1] -= 55 * dt; S.pos[ix] += 8 * dt;
        if (S.pos[ix + 1] < 0) { S.pos[ix + 1] = 24 + Math.random() * 6; S.pos[ix] = (Math.random() - 0.5) * 55; S.pos[ix + 2] = -100 + Math.random() * 112; }
      } else if (type === 'drizzle') {
        S.pos[ix + 1] -= 30 * dt; S.pos[ix] += 4 * dt;
        if (S.pos[ix + 1] < 0) { S.pos[ix + 1] = 22 + Math.random() * 5; S.pos[ix] = (Math.random() - 0.5) * 50; S.pos[ix + 2] = -100 + Math.random() * 112; }
      } else if (type === 'snow' || type === 'sprinkles') {
        S.pos[ix + 1] -= (type === 'snow' ? (2.5 + (s % 2)) : 9) * dt;
        S.pos[ix] += Math.sin(elapsed * 2 + s) * dt * 1.6;
        if (S.pos[ix + 1] < 0) { S.pos[ix + 1] = 24 + Math.random() * 5; S.pos[ix] = (Math.random() - 0.5) * (type === 'snow' ? 55 : 40); }
      } else if (type === 'dust' || type === 'mist' || type === 'spray') {
        var drift = type === 'dust' ? (5 + (s % 5)) : (1 + (s % 2));
        S.pos[ix] += drift * dt;
        S.pos[ix + 1] = S.base[ix + 1] + Math.sin(elapsed * (type === 'dust' ? 3 : 1.2) + s) * 0.6;
        if (S.pos[ix] > 24) { S.pos[ix] = -24; S.pos[ix + 2] = -100 + Math.random() * 112; S.base[ix] = S.pos[ix]; S.base[ix + 1] = S.pos[ix + 1]; S.base[ix + 2] = S.pos[ix + 2]; }
      } else if (type === 'embers' || type === 'stardust') {
        var rise = type === 'embers' ? (2 + (s % 3)) * 1.6 : 0.7;
        S.pos[ix + 1] += rise * dt;
        S.pos[ix] += Math.sin(elapsed * 3 + s) * dt * 1.2;
        var top = type === 'embers' ? 10 : 30;
        if (S.pos[ix + 1] > top) {
          if (type === 'embers') { S.pos[ix + 1] = 0; S.pos[ix] = (Math.random() - 0.5) * 18; S.pos[ix + 2] = -70 + Math.random() * 80; }
          else { S.pos[ix + 1] = 0; S.pos[ix] = (Math.random() - 0.5) * 60; S.pos[ix + 2] = -110 + Math.random() * 122; }
        }
      } else if (type === 'fireflies') {
        S.pos[ix] = S.base[ix] + Math.sin(elapsed * 1.2 + s) * 1.6;
        S.pos[ix + 1] = S.base[ix + 1] + Math.sin(elapsed * 1.7 + s * 2) * 0.7;
        S.pos[ix + 2] = S.base[ix + 2] + Math.cos(elapsed * 0.9 + s) * 1.6;
      }
    }
    S.geo.attributes.position.needsUpdate = true;
  }

  // ---------------- side props (session 1) ----------------
  var props = [];
  var PROP_COUNT = 80;
  var TIER_PATTERN = [0, 0, 0, 1, 0, 1, 2, 1, 0, 2];
  function xForTier(tier, side) {
    if (tier === 0) return side * (7.5 + Math.random() * 5);
    if (tier === 1) return side * (13.5 + Math.random() * 10);
    return side * (22 + Math.random() * 28);
  }
  function scaleForTier(tier) {
    return tier === 0 ? 1 : tier === 1 ? 1.2 : 1.9;
  }

  function lam(color) { return new THREE.MeshLambertMaterial({ color: color }); }
  function bas(color) { return new THREE.MeshBasicMaterial({ color: color }); }

  function addMesh(group, geo, mat, x, y, z, shadow) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (shadow !== false) m.castShadow = true;
    group.add(m);
    return m;
  }

  function deadTree(g, color) {
    addMesh(g, new THREE.CylinderGeometry(0.12, 0.24, 2.6, 6), lam(color), 0, 1.3, 0);
    var b1 = addMesh(g, new THREE.CylinderGeometry(0.07, 0.1, 1.3, 5), lam(color), 0.35, 2.1, 0);
    b1.rotation.z = -0.7;
    var b2 = addMesh(g, new THREE.CylinderGeometry(0.06, 0.09, 1.0, 5), lam(color), -0.3, 1.7, 0);
    b2.rotation.z = 0.7;
  }

  function makeProp(type, side, z, tier) {
    var g = new THREE.Group();
    if (tier === undefined) tier = 1;
    var far = xForTier(2, side);
    var near = xForTier(tier, side);
    var roll = Math.random();
    if (type === 'storm') {
      if (roll < 0.5) {
        var r = 0.8 + Math.random() * 1.2;
        addMesh(g, new THREE.DodecahedronGeometry(r, 0), lam(0x4b5563), 0, r * 0.55, 0);
      } else deadTree(g, 0x3f2d20);
      g.position.set(near, 0, z);
    } else if (type === 'desert') {
      if (tier === 2 && roll < 0.35) {
        addMesh(g, new THREE.ConeGeometry(7, 6, 4), lam(0xd9a441), 0, 3, 0, false);
        g.position.set(far, 0, z - 10);
      } else if (roll < 0.7) {
        addMesh(g, new THREE.CylinderGeometry(0.35, 0.42, 2.6, 8), lam(0x2f9e44), 0, 1.3, 0);
        addMesh(g, new THREE.CylinderGeometry(0.2, 0.2, 0.9, 7), lam(0x2f9e44), 0.5, 2.1, 0);
        g.position.set(near, 0, z);
      } else {
        var rk = addMesh(g, new THREE.SphereGeometry(1 + Math.random(), 8, 6), lam(0xb98a56), 0, 0.4, 0);
        rk.scale.y = 0.55;
        g.position.set(near, 0, z);
      }
    } else if (type === 'city') {
      var w = 2 + Math.random() * 3, h = 3 + Math.random() * 9, dep = 2 + Math.random() * 3;
      var cols = [0x1e2a4a, 0x2a1e4a, 0x1e4a3a, 0x4a2a1e, 0x334155, 0x3b2f63];
      addMesh(g, new THREE.BoxGeometry(w, h, dep), lam(cols[(Math.random() * cols.length) | 0]), 0, h / 2, 0, false);
      addMesh(g, new THREE.BoxGeometry(0.12, h * 0.7, 0.12), bas(Math.random() > 0.5 ? 0x22d3ee : 0xa855f7), (side > 0 ? -w / 2 : w / 2), h * 0.4, 0, false);
      g.position.set(near, 0, z);
    } else if (type === 'snow') {
      if (roll < 0.7) {
        addMesh(g, new THREE.CylinderGeometry(0.18, 0.26, 1.2, 7), lam(0x4a3525), 0, 0.6, 0);
        addMesh(g, new THREE.ConeGeometry(1.5, 2.2, 8), lam(0x2d6a4f), 0, 2.1, 0);
        addMesh(g, new THREE.ConeGeometry(1.0, 1.6, 8), lam(0xe2e8f0), 0, 3.3, 0);
      } else {
        var sr = addMesh(g, new THREE.SphereGeometry(0.9 + Math.random() * 0.8, 8, 6), lam(0xeef4fb), 0, 0.35, 0);
        sr.scale.y = 0.6;
      }
      g.position.set(near, 0, z);
    } else if (type === 'jungle') {
      var th = 3 + Math.random() * 2.5;
      addMesh(g, new THREE.CylinderGeometry(0.25, 0.4, th, 7), lam(0x4a3525), 0, th / 2, 0);
      addMesh(g, new THREE.SphereGeometry(1.3 + Math.random() * 0.8, 9, 7), lam(0x1d5c2e), 0, th + 0.8, 0);
      addMesh(g, new THREE.SphereGeometry(0.9 + Math.random() * 0.5, 8, 6), lam(0x2f8f46), 1.2, th, 0);
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 2.2, 5), lam(0x3f7a33), -1.2, th - 0.6, 0.4, false);
      g.position.set(near, 0, z);
    } else if (type === 'volcano') {
      if (roll < 0.4) {
        var pool = new THREE.Mesh(new THREE.CircleGeometry(1.4 + Math.random() * 1.2, 20), bas(0xff6b1a));
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = 0.03;
        g.add(pool);
        g.position.set(near, 0, z);
      } else if (roll < 0.7) {
        addMesh(g, new THREE.DodecahedronGeometry(1 + Math.random() * 1.2, 0), lam(0x171216), 0, 0.8, 0);
        g.position.set(near, 0, z);
      } else {
        addMesh(g, new THREE.CylinderGeometry(0.7, 1.0, 3.5 + Math.random() * 2, 6), lam(0x241a20), 0, 2, 0);
        g.position.set(near, 0, z);
      }
    } else if (type === 'space') {
      if (roll < 0.55) {
        addMesh(g, new THREE.DodecahedronGeometry(0.9 + Math.random() * 1.3, 0), lam(0x3d3a5c), 0, 0, 0);
        var fy = 2 + Math.random() * 4;
        g.position.set(near, fy, z);
        g.userData.float = fy;
      } else {
        addMesh(g, new THREE.CylinderGeometry(0.09, 0.09, 3.2, 6), lam(0x334155), 0, 1.6, 0, false);
        addMesh(g, new THREE.SphereGeometry(0.32, 10, 8), bas(0x67e8f9), 0, 3.3, 0, false);
        g.position.set(near, 0, z);
      }
    } else if (type === 'beach') {
      if (roll < 0.55) {
        var trunk = addMesh(g, new THREE.CylinderGeometry(0.18, 0.3, 3.6, 7), lam(0x8a6b48), 0, 1.8, 0);
        trunk.rotation.z = side * 0.12;
        for (var f = 0; f < 5; f++) {
          var frond = addMesh(g, new THREE.ConeGeometry(0.32, 2.4, 5), lam(0x2f9e44), 0, 3.7, 0);
          frond.scale.z = 0.35;
          frond.rotation.z = (f / 5) * Math.PI * 2;
          frond.rotation.x = 0.9;
        }
        g.position.set(near, 0, z);
      } else {
        var ucols = [0xef4444, 0x22d3ee, 0xfacc15, 0xec4899];
        addMesh(g, new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), lam(0xe7e5e4), 0, 0.9, 0);
        addMesh(g, new THREE.ConeGeometry(1.3, 0.8, 8), lam(ucols[(Math.random() * ucols.length) | 0]), 0, 1.9, 0);
        g.position.set(near, 0, z);
      }
    } else if (type === 'haunted') {
      if (roll < 0.45) {
        var pk = addMesh(g, new THREE.SphereGeometry(0.7 + Math.random() * 0.4, 10, 8), lam(0xe26a1b), 0, 0.55, 0);
        pk.scale.y = 0.8;
        addMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 0.4, 5), lam(0x3f6212), 0, 1.15, 0, false);
      } else if (roll < 0.75) {
        deadTree(g, 0x1c1426);
      } else {
        addMesh(g, new THREE.BoxGeometry(0.9, 1.2, 0.25), lam(0x6b7280), 0, 0.6, 0);
        addMesh(g, new THREE.BoxGeometry(1.1, 0.25, 0.3), lam(0x4b5563), 0, 0.12, 0);
      }
      g.position.set(near, 0, z);
    } else { // candy
      if (roll < 0.5) {
        addMesh(g, new THREE.CylinderGeometry(0.14, 0.14, 2.6, 7), lam(0xfff7ed), 0, 1.3, 0);
        var donut = addMesh(g, new THREE.TorusGeometry(0.85, 0.42, 10, 18), lam(0xff7ab8), 0, 2.9, 0);
        donut.rotation.x = Math.PI / 2;
      } else {
        var lcols = [0xef4444, 0x22d3ee, 0xa855f7, 0x22c55e];
        addMesh(g, new THREE.CylinderGeometry(0.09, 0.09, 2.2, 6), lam(0xfff7ed), 0, 1.1, 0);
        addMesh(g, new THREE.SphereGeometry(0.65, 12, 10), lam(lcols[(Math.random() * lcols.length) | 0]), 0, 2.4, 0);
      }
      g.position.set(near, 0, z);
    }
    g.scale.setScalar(scaleForTier(tier));
    g.userData.sx = side;
    g.userData.tier = tier;
    g.userData.ptype = type;
    return g;
  }

  function disposeProp(g) {
    scene.remove(g);
    g.traverse(function (o) {
      if (o.isMesh) { o.geometry.dispose(); if (o.material && o.material.dispose) o.material.dispose(); }
    });
  }

  function clearProps() {
    for (var i = 0; i < props.length; i++) disposeProp(props[i]);
    props = [];
  }

  function spawnProps(type) {
    for (var i = 0; i < PROP_COUNT; i++) {
      var side = i % 2 === 0 ? -1 : 1;
      var tier = TIER_PATTERN[i % TIER_PATTERN.length];
      var p = makeProp(type, side, 14 - i * 1.9 - Math.random() * 1.5, tier);
      scene.add(p);
      props.push(p);
    }
  }

  function morphPropTo(idx, newType) {
    var old = props[idx];
    var p = makeProp(newType, old.userData.sx || 1, old.position.z, old.userData.tier === undefined ? 1 : old.userData.tier);
    scene.add(p);
    disposeProp(old);
    props[idx] = p;
  }

  // ---- far-far silhouettes: a few giant props on the horizon, all biomes ----
  var farfar = [];
  function clearFarfar() {
    for (var i = 0; i < farfar.length; i++) disposeProp(farfar[i]);
    farfar = [];
  }
  function spawnFarfar(type) {
    for (var i = 0; i < 8; i++) {
      var side = i % 2 ? 1 : -1;
      var p = makeProp(type, side, 20 - i * 20 - Math.random() * 8, 2);
      p.position.x = side * (55 + Math.random() * 35);
      p.scale.setScalar(2.5 + Math.random() * 1.5);
      scene.add(p);
      farfar.push(p);
    }
  }

  // ---- ground patches + clouds: fill the wide empty areas, auto-tinted by biome ----
  var patchMatA = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var patchMatB = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var patchGeo = new THREE.CircleGeometry(1, 14);
  var patches = [];
  function patchPlace(p, z) {
    var side = Math.random() < 0.5 ? -1 : 1;
    p.position.x = side * (7 + Math.random() * 63);
    p.position.z = z;
    var s = 1 + Math.random() * 3.2;
    p.scale.set(s, s, 1);
  }
  for (var pti = 0; pti < 44; pti++) {
    var pm = new THREE.Mesh(patchGeo, pti % 2 ? patchMatA : patchMatB);
    pm.rotation.x = -Math.PI / 2;
    pm.position.y = -0.02;
    pm.receiveShadow = false;
    patchPlace(pm, 15 - Math.random() * 145);
    scene.add(pm);
    patches.push(pm);
  }
  var cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.88, fog: false });
  var cloudGeo = new THREE.SphereGeometry(1, 10, 8);
  var clouds = [];
  for (var cli = 0; cli < 8; cli++) {
    var cg = new THREE.Group();
    for (var clj = 0; clj < 3; clj++) {
      var puff = new THREE.Mesh(cloudGeo, cloudMat);
      var pr2 = 2.5 + Math.random() * 3;
      puff.scale.set(pr2 * 1.4, pr2 * 0.7, pr2);
      puff.position.set(clj * 3 - 3 + Math.random(), Math.random() * 1.2, Math.random());
      cg.add(puff);
    }
    cg.position.set((Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 70), 24 + Math.random() * 20, -140 + Math.random() * 120);
    cg.userData.sp = 0.5 + Math.random();
    scene.add(cg);
    clouds.push(cg);
  }

  // ---------------- themed runners (session 1, one per biome) ----------------
  var BUILDERS = {
    storm: function () {
      var g = new THREE.Group();
      var spinner = new THREE.Group();
      spinner.position.y = 0.85;
      var tyre = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.3, 12, 24), lam(0x1f2937));
      tyre.rotation.y = Math.PI / 2;
      tyre.castShadow = true;
      spinner.add(tyre);
      var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 12), lam(0xf97316));
      hub.rotation.z = Math.PI / 2;
      spinner.add(hub);
      for (var i = 0; i < 5; i++) {
        var lug = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), bas(0xfde68a));
        var a = (i / 5) * Math.PI * 2;
        lug.position.set(0, Math.cos(a) * 0.16, Math.sin(a) * 0.16);
        spinner.add(lug);
      }
      g.add(spinner);
      g.userData.tick = function (t, dt) {
        spinner.rotation.x -= dt * 9;
        spinner.position.y = 0.85 + Math.abs(Math.sin(t * 9)) * 0.07;
      };
      return g;
    },
    desert: function () {
      var g = new THREE.Group();
      var brown = lam(0x8a5a2b), dark = lam(0x5b3a1e);
      addMesh(g, new THREE.BoxGeometry(0.95, 0.75, 1.7), brown, 0, 0.95, 0);
      var neck = addMesh(g, new THREE.BoxGeometry(0.45, 0.95, 0.5), brown, 0, 1.55, -1.0);
      neck.rotation.x = -0.45;
      addMesh(g, new THREE.BoxGeometry(0.4, 0.42, 0.85), brown, 0, 1.98, -1.4);
      addMesh(g, new THREE.ConeGeometry(0.09, 0.3, 6), dark, -0.14, 2.28, -1.25);
      addMesh(g, new THREE.ConeGeometry(0.09, 0.3, 6), dark, 0.14, 2.28, -1.25);
      addMesh(g, new THREE.BoxGeometry(0.16, 0.9, 0.28), dark, 0, 1.75, -0.72);
      var tail = addMesh(g, new THREE.CylinderGeometry(0.07, 0.1, 0.9, 6), dark, 0, 1.0, 1.05);
      tail.rotation.x = 0.5;
      var legs = [];
      var lx = [-0.32, 0.32];
      for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) {
        legs.push(addMesh(g, new THREE.CylinderGeometry(0.1, 0.12, 0.95, 7), dark, lx[a], 0.48, b === 0 ? -0.6 : 0.6));
      }
      g.userData.tick = function (t) {
        legs[0].rotation.x = Math.sin(t * 10) * 0.9;
        legs[3].rotation.x = Math.sin(t * 10) * 0.9;
        legs[1].rotation.x = Math.sin(t * 10 + Math.PI) * 0.9;
        legs[2].rotation.x = Math.sin(t * 10 + Math.PI) * 0.9;
        tail.rotation.x = 0.5 + Math.sin(t * 6) * 0.25;
      };
      return g;
    },
    city: function () {
      var g = new THREE.Group();
      var silver = lam(0x94a3b8), dark = lam(0x334155);
      addMesh(g, new THREE.BoxGeometry(0.9, 0.9, 0.6), silver, 0, 1.0, 0);
      addMesh(g, new THREE.BoxGeometry(0.6, 0.5, 0.55), silver, 0, 1.78, -0.05);
      addMesh(g, new THREE.BoxGeometry(0.12, 0.1, 0.05), bas(0x22d3ee), -0.14, 1.8, -0.34, false);
      addMesh(g, new THREE.BoxGeometry(0.12, 0.1, 0.05), bas(0x22d3ee), 0.14, 1.8, -0.34, false);
      addMesh(g, new THREE.BoxGeometry(0.2, 0.12, 0.05), bas(0x22d3ee), 0, 1.05, -0.32, false);
      addMesh(g, new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), dark, 0, 2.2, -0.05, false);
      var tip = addMesh(g, new THREE.SphereGeometry(0.09, 8, 6), bas(0xef4444), 0, 2.42, -0.05, false);
      var armL = addMesh(g, new THREE.BoxGeometry(0.22, 0.7, 0.22), dark, -0.58, 1.0, 0);
      var armR = addMesh(g, new THREE.BoxGeometry(0.22, 0.7, 0.22), dark, 0.58, 1.0, 0);
      var legL = addMesh(g, new THREE.BoxGeometry(0.28, 0.7, 0.28), dark, -0.22, 0.35, 0);
      var legR = addMesh(g, new THREE.BoxGeometry(0.28, 0.7, 0.28), dark, 0.22, 0.35, 0);
      g.userData.tick = function (t) {
        armL.rotation.x = Math.sin(t * 9) * 0.7;
        armR.rotation.x = -Math.sin(t * 9) * 0.7;
        legL.rotation.x = -Math.sin(t * 9) * 0.6;
        legR.rotation.x = Math.sin(t * 9) * 0.6;
        var s = 1 + (Math.sin(t * 6) > 0 ? 0.35 : 0);
        tip.scale.set(s, s, s);
      };
      return g;
    },
    snow: function () {
      var g = new THREE.Group();
      var black = lam(0x111827), white = lam(0xf8fafc), orange = lam(0xfb923c);
      var body = addMesh(g, new THREE.SphereGeometry(0.55, 14, 12), black, 0, 0.85, 0);
      body.scale.y = 1.25;
      var belly = addMesh(g, new THREE.SphereGeometry(0.38, 12, 10), white, 0, 0.8, -0.28, false);
      belly.scale.y = 1.2;
      addMesh(g, new THREE.SphereGeometry(0.1, 8, 6), white, -0.16, 1.28, -0.42, false);
      addMesh(g, new THREE.SphereGeometry(0.1, 8, 6), white, 0.16, 1.28, -0.42, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x000000), -0.16, 1.28, -0.5, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x000000), 0.16, 1.28, -0.5, false);
      var beak = addMesh(g, new THREE.ConeGeometry(0.09, 0.22, 8), orange, 0, 1.16, -0.55, false);
      beak.rotation.x = -Math.PI / 2;
      var flipL = addMesh(g, new THREE.BoxGeometry(0.12, 0.5, 0.3), black, -0.6, 0.85, 0);
      var flipR = addMesh(g, new THREE.BoxGeometry(0.12, 0.5, 0.3), black, 0.6, 0.85, 0);
      addMesh(g, new THREE.BoxGeometry(0.2, 0.1, 0.34), orange, -0.2, 0.05, -0.05);
      addMesh(g, new THREE.BoxGeometry(0.2, 0.1, 0.34), orange, 0.2, 0.05, -0.05);
      g.userData.tick = function (t) {
        g.rotation.z = Math.sin(t * 7) * 0.1;
        g.position.y = Math.abs(Math.sin(t * 7)) * 0.1;
        flipL.rotation.z = 0.3 + Math.sin(t * 7) * 0.4;
        flipR.rotation.z = -0.3 - Math.sin(t * 7) * 0.4;
      };
      return g;
    },
    jungle: function () {
      var g = new THREE.Group();
      var brown = lam(0x7c4a21), tan = lam(0xd9a86c), dark = lam(0x4a2c12);
      addMesh(g, new THREE.BoxGeometry(0.7, 0.8, 0.6), brown, 0, 0.9, 0);
      addMesh(g, new THREE.BoxGeometry(0.55, 0.55, 0.5), brown, 0, 1.62, -0.05);
      addMesh(g, new THREE.BoxGeometry(0.34, 0.3, 0.1), tan, 0, 1.56, -0.32, false);
      addMesh(g, new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), brown, -0.34, 1.7, -0.05);
      addMesh(g, new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), brown, 0.34, 1.7, -0.05);
      var armL = addMesh(g, new THREE.BoxGeometry(0.18, 0.95, 0.18), dark, -0.48, 0.9, 0);
      var armR = addMesh(g, new THREE.BoxGeometry(0.18, 0.95, 0.18), dark, 0.48, 0.9, 0);
      var legL = addMesh(g, new THREE.BoxGeometry(0.2, 0.5, 0.2), dark, -0.2, 0.25, 0);
      var legR = addMesh(g, new THREE.BoxGeometry(0.2, 0.5, 0.2), dark, 0.2, 0.25, 0);
      var tail = addMesh(g, new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6), dark, 0, 1.5, 0.75);
      tail.rotation.x = -0.9;
      g.userData.tick = function (t) {
        armL.rotation.x = Math.sin(t * 10) * 0.95;
        armR.rotation.x = -Math.sin(t * 10) * 0.95;
        legL.rotation.x = -Math.sin(t * 10) * 0.7;
        legR.rotation.x = Math.sin(t * 10) * 0.7;
        tail.rotation.z = Math.sin(t * 5) * 0.4;
      };
      return g;
    },
    volcano: function () {
      var g = new THREE.Group();
      var green = lam(0x16a34a), dark = lam(0x14532d), cream = lam(0xfef3c7);
      addMesh(g, new THREE.BoxGeometry(0.8, 0.6, 1.3), green, 0, 0, 0);
      addMesh(g, new THREE.BoxGeometry(0.5, 0.45, 0.55), green, 0, 0.45, -0.8);
      addMesh(g, new THREE.BoxGeometry(0.3, 0.22, 0.35), cream, 0, 0.32, -1.15, false);
      addMesh(g, new THREE.ConeGeometry(0.09, 0.3, 6), cream, -0.16, 0.8, -0.75);
      addMesh(g, new THREE.ConeGeometry(0.09, 0.3, 6), cream, 0.16, 0.8, -0.75);
      addMesh(g, new THREE.BoxGeometry(0.5, 0.2, 0.7), cream, 0, -0.28, -0.1, false);
      for (var s = 0; s < 3; s++) {
        addMesh(g, new THREE.ConeGeometry(0.09, 0.28, 5), dark, 0, 0.42, -0.3 + s * 0.35);
      }
      var tail = addMesh(g, new THREE.ConeGeometry(0.16, 0.9, 6), green, 0, 0.05, 1.0);
      tail.rotation.x = Math.PI / 2 + 0.15;
      var wingL = new THREE.Group(), wingR = new THREE.Group();
      wingL.position.set(-0.4, 0.25, 0.1);
      wingR.position.set(0.4, 0.25, 0.1);
      var wl = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.65), lam(0x15803d));
      wl.position.x = -0.6; wl.castShadow = true;
      var wr = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.65), lam(0x15803d));
      wr.position.x = 0.6; wr.castShadow = true;
      wingL.add(wl); wingR.add(wr);
      g.add(wingL); g.add(wingR);
      var legL = addMesh(g, new THREE.BoxGeometry(0.18, 0.5, 0.18), dark, -0.25, -0.45, 0.1);
      var legR = addMesh(g, new THREE.BoxGeometry(0.18, 0.5, 0.18), dark, 0.25, -0.45, 0.1);
      g.position.y = 0.9;
      g.userData.tick = function (t) {
        var flap = 0.25 + Math.sin(t * 9) * 0.65;
        wingL.rotation.z = -flap;
        wingR.rotation.z = flap;
        g.position.y = 0.9 + Math.sin(t * 3) * 0.18;
        legL.rotation.x = Math.sin(t * 9) * 0.4;
        legR.rotation.x = -Math.sin(t * 9) * 0.4;
      };
      return g;
    },
    space: function () {
      var g = new THREE.Group();
      var white = lam(0xf1f5f9), grey = lam(0x64748b);
      addMesh(g, new THREE.BoxGeometry(0.8, 0.9, 0.55), white, 0, 1.0, 0);
      addMesh(g, new THREE.SphereGeometry(0.42, 14, 12), white, 0, 1.78, -0.05);
      addMesh(g, new THREE.BoxGeometry(0.5, 0.3, 0.12), lam(0x0c4a6e), 0, 1.78, -0.4, false);
      addMesh(g, new THREE.BoxGeometry(0.55, 0.7, 0.3), grey, 0, 1.05, 0.42);
      addMesh(g, new THREE.BoxGeometry(0.18, 0.14, 0.06), bas(0xef4444), -0.12, 1.1, -0.3, false);
      addMesh(g, new THREE.BoxGeometry(0.18, 0.14, 0.06), bas(0x22d3ee), 0.12, 1.1, -0.3, false);
      var armL = addMesh(g, new THREE.BoxGeometry(0.22, 0.7, 0.22), white, -0.53, 1.0, 0);
      var armR = addMesh(g, new THREE.BoxGeometry(0.22, 0.7, 0.22), white, 0.53, 1.0, 0);
      var legL = addMesh(g, new THREE.BoxGeometry(0.26, 0.7, 0.26), white, -0.2, 0.35, 0);
      var legR = addMesh(g, new THREE.BoxGeometry(0.26, 0.7, 0.26), white, 0.2, 0.35, 0);
      g.userData.tick = function (t) {
        g.position.y = Math.abs(Math.sin(t * 4)) * 0.3;
        armL.rotation.x = Math.sin(t * 4) * 0.55;
        armR.rotation.x = -Math.sin(t * 4) * 0.55;
        legL.rotation.x = -Math.sin(t * 4) * 0.5;
        legR.rotation.x = Math.sin(t * 4) * 0.5;
      };
      return g;
    },
    beach: function () {
      var g = new THREE.Group();
      var red = lam(0xdc2626), dark = lam(0x991b1b);
      var body = addMesh(g, new THREE.SphereGeometry(0.6, 14, 12), red, 0, 0.5, 0);
      body.scale.set(1.2, 0.6, 0.9);
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5), dark, -0.2, 0.95, -0.3, false);
      addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5), dark, 0.2, 0.95, -0.3, false);
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), lam(0xffffff), -0.2, 1.16, -0.3, false);
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), lam(0xffffff), 0.2, 1.16, -0.3, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x111111), -0.2, 1.16, -0.4, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x111111), 0.2, 1.16, -0.4, false);
      var clawL = addMesh(g, new THREE.SphereGeometry(0.28, 10, 8), red, -0.85, 0.55, -0.3);
      var clawR = addMesh(g, new THREE.SphereGeometry(0.28, 10, 8), red, 0.85, 0.55, -0.3);
      addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), dark, -0.85, 0.8, -0.3);
      addMesh(g, new THREE.ConeGeometry(0.12, 0.3, 6), dark, 0.85, 0.8, -0.3);
      var legs = [];
      for (var s = -1; s <= 1; s += 2) for (var k = 0; k < 3; k++) {
        var leg = addMesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.7, 5), dark, s * 0.7, 0.3, -0.3 + k * 0.3);
        leg.rotation.z = s * 0.9;
        legs.push(leg);
      }
      g.userData.tick = function (t) {
        for (var i = 0; i < legs.length; i++) legs[i].rotation.x = Math.sin(t * 16 + i) * 0.5;
        var snap = 1 + Math.sin(t * 5) * 0.12;
        clawL.scale.set(snap, snap, snap);
        clawR.scale.set(2 - snap, 2 - snap, 2 - snap);
        g.position.x = Math.sin(t * 8) * 0.06;
      };
      return g;
    },
    haunted: function () {
      var g = new THREE.Group();
      var sheet = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.92 });
      var skirt = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 12), sheet);
      skirt.position.y = 0.55;
      skirt.castShadow = true;
      g.add(skirt);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 12), sheet);
      head.position.y = 1.25;
      head.castShadow = true;
      g.add(head);
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), bas(0x0a0a12), -0.17, 1.32, -0.42, false);
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), bas(0x0a0a12), 0.17, 1.32, -0.42, false);
      var mouth = addMesh(g, new THREE.SphereGeometry(0.12, 8, 6), bas(0x0a0a12), 0, 1.05, -0.44, false);
      mouth.scale.y = 1.4;
      var armL = addMesh(g, new THREE.SphereGeometry(0.14, 8, 6), sheet, -0.55, 0.95, 0, false);
      var armR = addMesh(g, new THREE.SphereGeometry(0.14, 8, 6), sheet, 0.55, 0.95, 0, false);
      g.userData.tick = function (t) {
        g.position.y = 0.35 + Math.sin(t * 2.5) * 0.2;
        g.rotation.z = Math.sin(t * 2.5) * 0.08;
        armL.position.y = 0.95 + Math.sin(t * 3) * 0.12;
        armR.position.y = 0.95 - Math.sin(t * 3) * 0.12;
      };
      return g;
    },
    candy: function () {
      var g = new THREE.Group();
      var dough = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.36, 12, 22), lam(0xe8b06a));
      dough.position.y = 1.25;
      dough.castShadow = true;
      g.add(dough);
      var frost = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.3, 12, 22), lam(0xff7ab8));
      frost.position.set(0, 1.25, 0.12);
      g.add(frost);
      var spCols = [0x22d3ee, 0xfacc15, 0x22c55e, 0xffffff, 0xa855f7];
      for (var i = 0; i < 10; i++) {
        var a = (i / 10) * Math.PI * 2;
        var sp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.05), bas(spCols[i % spCols.length]));
        sp.position.set(Math.cos(a) * 0.62, 1.25 + Math.sin(a) * 0.62, 0.38);
        sp.rotation.z = a;
        g.add(sp);
      }
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), lam(0xffffff), -0.18, 1.45, 0.32, false);
      addMesh(g, new THREE.SphereGeometry(0.11, 8, 6), lam(0xffffff), 0.18, 1.45, 0.32, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x1c1917), -0.18, 1.45, 0.42, false);
      addMesh(g, new THREE.SphereGeometry(0.05, 6, 5), bas(0x1c1917), 0.18, 1.45, 0.42, false);
      var legL = addMesh(g, new THREE.CylinderGeometry(0.09, 0.09, 0.55, 6), lam(0x7c2d12), -0.22, 0.28, 0);
      var legR = addMesh(g, new THREE.CylinderGeometry(0.09, 0.09, 0.55, 6), lam(0x7c2d12), 0.22, 0.28, 0);
      g.userData.tick = function (t) {
        legL.rotation.x = Math.sin(t * 14) * 0.9;
        legR.rotation.x = -Math.sin(t * 14) * 0.9;
        g.rotation.z = Math.sin(t * 7) * 0.08;
        g.position.y = Math.abs(Math.sin(t * 14)) * 0.08;
      };
      return g;
    }
  };

  var runnerCache = {};
  var activeKind = '';

  // ---------------- player rig (lane + jump + shadow; themed runner swapped in) ----------------
  var player = new THREE.Group();
  var blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 24),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.01;
  player.add(blob);
  player.position.set(0, 0, HIT_Z);
  scene.add(player);

  function activeRunner() { return player.userData.runner || null; }

  function easeOutBack(x) {
    var c = 1.70158;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  }

  function swapRunner(kind, pop) {
    if (activeKind === kind && player.userData.runner) return;
    var old = player.userData.runner;
    if (old) player.remove(old);
    var r = runnerCache[kind];
    if (!r) { r = BUILDERS[kind](); runnerCache[kind] = r; }
    player.add(r);
    player.userData.runner = r;
    activeKind = kind;
    if (pop) {
      r.scale.setScalar(0.01);
      popT = 0;
      burst(player.position.x, 1.2, 0, 0xffffff, 30, 0.5, 0.2, 0.7);
    } else {
      r.scale.setScalar(1);
      popT = 1;
    }
  }

  // ---------------- answer gates: session 2 layout + session 1 biome styling ----------------
  var blocks = [];

  var TEST_SHOW_CORRECT = false;   // TEST HELPER: green outline on the correct gate. Set true to test again.
  function textTexture(text, st, isCorrect) {
    // session 2's wrapping engine (1280px, multiline) on session 1's biome-styled face
    var c = document.createElement('canvas');
    c.width = 1280; c.height = 1280;
    var g = c.getContext('2d');
    g.fillStyle = st.bg;
    g.fillRect(0, 0, 1280, 1280);
    if (st.stars) {
      g.fillStyle = '#ffffff';
      for (var i = 0; i < 110; i++) {
        g.globalAlpha = 0.3 + Math.random() * 0.7;
        g.fillRect(Math.random() * 1280, Math.random() * 1280, 7, 7);
      }
      g.globalAlpha = 1;
    }
    if (st.sprinkles) {
      var cols = ['#ef4444', '#22d3ee', '#22c55e', '#facc15', '#a855f7'];
      for (var s = 0; s < 60; s++) {
        g.fillStyle = cols[(Math.random() * cols.length) | 0];
        g.beginPath();
        g.arc(Math.random() * 1280, Math.random() * 1280, 16, 0, 6.29);
        g.fill();
      }
    }
    g.strokeStyle = (isCorrect && TEST_SHOW_CORRECT) ? '#22c55e' : st.bd;
    g.lineWidth = 52;
    g.strokeRect(40, 40, 1200, 1200);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = st.ink;
    var words = String(text).split(' ');
    function layout(fs) {
      g.font = 'bold ' + fs + 'px "Courier New", monospace';
      var L = [], ln = '';
      words.forEach(function (w) {
        var t = ln ? ln + ' ' + w : w;
        if (g.measureText(t).width > 1100 && ln) { L.push(ln); ln = w; }
        else ln = t;
      });
      if (ln) L.push(ln);
      return L;
    }
    var size = 380;
    var lines = layout(size);
    while ((lines.length > 2 ||
      lines.some(function (ln) { return g.measureText(ln).width > 1100; })) && size > 160) {
      size -= 12;
      lines = layout(size);
    }
    var cy = 640 - (lines.length - 1) * (size * 0.62);
    lines.forEach(function (ln, i) { g.fillText(ln, 640, cy + i * size * 1.24); });
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  function shuffled(n) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    for (var i = a.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clearBlocks() {
    blocks.forEach(function (b) {
      scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      b.mesh.material.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
    });
    blocks = [];
  }

  function setBanner() {
    if (!qText) return;
    qText.textContent = 'Q' + (qIndex + 1) + ': ' + curQ().q;   // no total — done count only
  }

  function gateStyleNow() {
    var idx = phase === 'transition' ? transTo : biomeIndex;
    return GATE_STYLE[BIOMES[idx].props] || GATE_STYLE.storm;
  }

  function spawnRound() {
    clearBlocks();
    roundActive = true;
    pendingSpawn = -1;
    var Q = curQ();
    setBanner();
    updateHUD();

    var st = gateStyleNow();
    var order = shuffled(3);
    for (var lane = 0; lane < 3; lane++) {
      var ai = order[lane];
      var correct = ai === Q.correct;
      var tex = textTexture(Q.answers[ai], st, correct);
      var sideMat = new THREE.MeshLambertMaterial({ color: st.side });
      var faceMat = new THREE.MeshBasicMaterial({ map: tex });
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 3.0, 0.7),
        [sideMat, sideMat, sideMat, sideMat, faceMat, sideMat]
      );
      mesh.position.set(LANES[lane], 1.7, spawnZ());
      mesh.castShadow = true;
      scene.add(mesh);
      blocks.push({ mesh: mesh, lane: lane, isCorrect: correct });
    }
  }

  // ---------------- obstacles (session 2: jump or dodge between questions) ----------------
  function removeObstacle(i) {
    var ob = obstacles[i];
    ob.mesh.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    scene.remove(ob.mesh);
    obstacles.splice(i, 1);
  }
  function clearObstacles() { while (obstacles.length) removeObstacle(0); }

  function addBarrier(lane) {
    var grp = buildBarrierMesh(obstKindNow());
    grp.position.set(LANES[lane], 0, OBS_Z - Math.random() * 8);
    scene.add(grp);
    obstacles.push({ mesh: grp, topY: 1.25 });
  }
  function addRoadblock() {
    var grp = buildWallMesh(obstKindNow());
    grp.position.set(0, 0, OBS_Z - Math.random() * 8);
    scene.add(grp);
    obstacles.push({ mesh: grp, topY: 1.25 });
  }
  function spawnObstacleWave() {
    if (!jumpHintShown) {
      jumpHintShown = true;
      toast('Barriers! SPACE / swipe ↑ to JUMP — or dodge!', 2200);
    }
    var r = Math.random();
    if (r < 0.15) {
      addRoadblock();
    } else if (r < 0.40) {
      var a = (Math.random() * 3) | 0, b;
      do { b = (Math.random() * 3) | 0; } while (b === a);
      addBarrier(a); addBarrier(b);
    } else {
      addBarrier((Math.random() * 3) | 0);
    }
  }
  function hitObstacle(i) {
    removeObstacle(i);
    if (hurtT > 0) return;
    hurtT = 1.2;
    lives--;
    streak = 0;   // crashing also kills the streak
    punchStreak();
    flash('bad');
    shake(0.5);
    sfxCrash();
    updateHUD();
    if (lives <= 0) { pendingEnd = 0.7; pendingEndType = 'over'; }
  }
  function jump() {
    if (mode !== 'playing' || paused) return;
    if (jumpY <= 0.01 && jumpV <= 0.01) { jumpV = JUMP_V; sfxJump(); }
  }

  // ---------------- particles (session 2 burst, extended params) ----------------
  var bursts = [];
  function burst(x, y, z, color, count, life, size, power) {
    var n = count || 46;
    var maxLife = life || 0.7;
    var pw = (power === undefined) ? 1 : power;
    var pos = new Float32Array(n * 3);
    var vel = [];
    for (var i = 0; i < n; i++) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 9 * pw,
        (Math.random() * 7 + 1) * pw,
        (Math.random() - 0.5) * 9 * pw
      ));
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: color, size: size || 0.22, transparent: true, opacity: 1 });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);
    bursts.push({ pts: pts, vel: vel, life: maxLife, maxLife: maxLife });
  }
  function updateBursts(dt) {
    for (var i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i];
      b.life -= dt;
      var p = b.pts.geometry.attributes.position.array;
      for (var j = 0; j < b.vel.length; j++) {
        p[j * 3] += b.vel[j].x * dt;
        p[j * 3 + 1] += b.vel[j].y * dt;
        p[j * 3 + 2] += b.vel[j].z * dt;
        b.vel[j].y -= 14 * dt;
      }
      b.pts.geometry.attributes.position.needsUpdate = true;
      b.pts.material.opacity = Math.max(0, b.life / b.maxLife);
      if (b.life <= 0) {
        scene.remove(b.pts);
        b.pts.geometry.dispose(); b.pts.material.dispose();
        bursts.splice(i, 1);
      }
    }
  }

  // ---------------- hud / feedback ----------------
  // ---- streak ranks, fighting-game style: every correct steps up one rank ----
  function streakRank(s) {
    if (s >= 6) return { k: 'sss', w: 'SSSensational!!' };
    if (s >= 5) return { k: 'ss', w: 'SSadistic!!' };
    if (s >= 4) return { k: 's', w: 'Supreme!' };
    if (s >= 3) return { k: 'a', w: 'Anarchic' };
    if (s >= 2) return { k: 'b', w: 'Blazing' };
    if (s >= 1) return { k: 'c', w: 'Cruising' };
    return { k: 'd', w: 'Dirty' };
  }
  // ---- streak punch animation (re-triggered on every correct answer) ----
  function punchStreak() {
    streakEl.classList.remove('punch');
    void streakEl.offsetWidth;
    streakEl.classList.add('punch');
    if (streakPlusEl) {
      streakPlusEl.textContent = '+1 🔥';
      streakPlusEl.classList.remove('go');
      void streakPlusEl.offsetWidth;
      streakPlusEl.classList.add('go');
    }
  }

  function nextInfo() {
    if (phase === 'transition') return { icon: BIOMES[transTo].icon, left: 0 };
    if (phase === 'approach') return { icon: BIOMES[approachNext].icon, left: 1 };
    return { icon: BIOMES[peekNext()].icon, left: HITS_PER_BIOME - hitsInBiome };
  }
  function updateHUD() {
    heartsEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, MAX_LIVES - lives));
    pausesEl.textContent = '☕ ' + pausesLeft;
    slowBadge.classList.toggle('hidden', !(slowMode && mode === 'playing'));
    var rk = streakRank(streak);
    streakEl.innerHTML = '🔥 x' + streak + ' · <span class="rk rk-' + rk.k + '">' + rk.w + '</span>';
    var ni = nextInfo();
    nextEl.textContent = ni.left > 0 ? '▸' + ni.icon + ' ' + ni.left : '→ ' + ni.icon;
  }

  var flashTimer = null;
  function flash(kind) {
    flashEl.className = kind;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { flashEl.className = ''; }, 180);
  }

  var toastTimer = null;
  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('hidden'); }, ms || 1600);
  }

  var shakeT = 0;
  function shake(dur) { shakeT = Math.max(shakeT, dur); }

  // ---------------- biome engine (session 1: random queue + seamless morph) ----------------
  function refillQueue(exclude) {
    var idx = [];
    for (var i = 0; i < BIOMES.length; i++) if (i !== exclude) idx.push(i);
    for (var k = idx.length - 1; k > 0; k--) {
      var j = (Math.random() * (k + 1)) | 0;
      var t = idx[k]; idx[k] = idx[j]; idx[j] = t;
    }
    bQueue = idx;
  }
  function peekNext() {
    if (!bQueue.length) refillQueue(biomeIndex);
    return bQueue[0];
  }

  function applyExtras(B) {
    stars.visible = !!B.stars;
    sunDisc.visible = !!B.sunDisc;
    moonDisc.visible = !!B.moonDisc;
    aurora.visible = !!B.aurora;
    glowHorizon.visible = !!B.glow;
    planet.visible = !!B.planet;
    waterL.visible = waterR.visible = !!B.water;
    _c1.set(B.sky);
    cloudMat.color.copy(_c1).lerp(new THREE.Color(0xffffff), 0.65);
    for (var i = 0; i < bats.length; i++) bats[i].visible = !!B.bats;
    for (var t = 0; t < tumbleweeds.length; t++) {
      tumbleweeds[t].visible = !!B.tumble;
      if (B.tumble) resetTumbleweed(tumbleweeds[t], true);
    }
  }

  function blendTargets(a, b, f) {
    _c1.set(a.sky); _c2.set(b.sky); tSky.copy(_c1).lerp(_c2, f);
    _c1.set(a.ground); _c2.set(b.ground); tGround.copy(_c1).lerp(_c2, f);
    _c1.set(a.road); _c2.set(b.road); tRoad.copy(_c1).lerp(_c2, f);
    _c1.set(a.edge); _c2.set(b.edge); tEdge.copy(_c1).lerp(_c2, f);
    _c1.set(a.amb); _c2.set(b.amb); tAmb.copy(_c1).lerp(_c2, f);
    _c1.set(a.sun); _c2.set(b.sun); tSunC.copy(_c1).lerp(_c2, f);
    tAmbI = a.ambI + (b.ambI - a.ambI) * f;
    tSunI = a.sunI + (b.sunI - a.sunI) * f;
    scene.fog.near = a.fog[0] + (b.fog[0] - a.fog[0]) * f;
    scene.fog.far = a.fog[1] + (b.fog[1] - a.fog[1]) * f;
  }

  function fullTargets(b) { blendTargets(b, b, 1); }

  function startApproach() {
    approachNext = peekNext();
    phase = 'approach';
    var cur = BIOMES[biomeIndex], nxt = BIOMES[approachNext];
    blendTargets(cur, nxt, 0.35);
    setupSys(teasS, nxt.weather);
    teasS.mat.opacity = 0;
    teasS.teasTarget = 0.55;
    updateHUD();
  }

  function startTransition() {
    if (phase === 'transition') return;
    transFrom = biomeIndex;
    if (phase === 'approach') {
      transTo = approachNext;
      bQueue.shift();
    } else {
      transTo = peekNext();
      bQueue.shift();
    }
    if (!bQueue.length) refillQueue(transTo);
    phase = 'transition';
    transT = 0;
    var nxt = BIOMES[transTo];
    fullTargets(nxt);
    applyExtras(nxt);
    swapRunner(nxt.props, true);
    onBiomeEnter(false);
    sfxSweep();
    if (teasS.pts.visible && teasS.type !== nxt.weather) setupSys(teasS, nxt.weather);
    teasS.pts.visible = true;
    teasS.teasTarget = teasS.baseOp;
    // old props keep rolling out behind; recycled ones respawn as the new type
    propTypeNow = nxt.props;
    clearFarfar();
    spawnFarfar(nxt.props);   // horizon swaps instantly — too far to see the pop
    for (var fc = 0; fc < props.length; fc++) {
      if (props[fc].position.z < -30 && props[fc].userData.ptype !== nxt.props) morphPropTo(fc, nxt.props);
    }
    biomeEl.textContent = nxt.icon + ' ' + nxt.name;
    updateHUD();
  }

  function finishTransition() {
    biomeIndex = transTo;
    hitsInBiome = 0;
    phase = 'stable';
    approachNext = -1;
    setupSys(mainS, BIOMES[biomeIndex].weather);
    teasS.pts.visible = false;
    updateHUD();
  }

  function setBiome(i, instant) {
    biomeIndex = ((i % BIOMES.length) + BIOMES.length) % BIOMES.length;
    hitsInBiome = 0;
    phase = 'stable';
    approachNext = -1;
    teasS.pts.visible = false;
    var B = BIOMES[biomeIndex];
    fullTargets(B);
    scene.fog.near = B.fog[0];
    scene.fog.far = B.fog[1];
    if (instant) {
      scene.background.copy(tSky);
      scene.fog.color.copy(tSky);
      groundMat.color.copy(tGround);
      roadMat.color.copy(tRoad);
      edgeMat.color.copy(tEdge);
      ambient.color.copy(tAmb); ambient.intensity = tAmbI;
      sun.color.copy(tSunC); sun.intensity = tSunI;
    }
    clearProps();
    spawnProps(B.props);
    propTypeNow = B.props;
    clearFarfar();
    spawnFarfar(B.props);
    setupSys(mainS, B.weather);
    applyExtras(B);
    swapRunner(B.props, false);
    biomeEl.textContent = B.icon + ' ' + B.name;
    updateHUD();
  }

  var boltTimer = 3;
  function doBolt() {
    flashEl.className = 'bolt';
    setTimeout(function () { if (flashEl.className === 'bolt') flashEl.className = ''; }, 130);
    setTimeout(function () {
      flashEl.className = 'bolt';
      setTimeout(function () { if (flashEl.className === 'bolt') flashEl.className = ''; }, 120);
    }, 220);
  }

  // ---------------- flow (session 2 + biome hooks) ----------------
  function buildLevelList() {
    levelListEl.innerHTML = '';
    LEVELS.forEach(function (lv, i) {
      if (lv.endless) return;   // endless lives in its own spotlight card, not the list
      var locked = (i !== LEVELS.length - 1) && (i >= unlockedUpTo());   // endless always open
      var btn = document.createElement('button');
      btn.className = 'lvl-btn' + (locked ? ' locked' : '');
      btn.innerHTML = '<span class="lvl-num">' + (locked ? '🔒' : (i + 1)) + '</span>' +
        '<span class="lvl-meta"><b>' + lv.name + '</b><small>' + lv.desc + '</small></span>' +
        '<span class="lvl-q">▶</span>';
      if (locked) {
        btn.addEventListener('click', function () {
          unlock();
          toast('🔒 Finish level ' + unlockedUpTo() + ' to unlock!', 1800);
          sfxWrong();
        });
      } else {
        btn.addEventListener('click', function () { unlock(); sfxClick(); startLevel(i); });
      }
      levelListEl.appendChild(btn);
    });
    if (endlessCardBtn) {
      endlessCardBtn.onclick = function () { unlock(); sfxClick(); startLevel(LEVELS.length - 1); };
    }
  }

  function hideAllOverlays() {
    menuEl.classList.add('hidden');
    pauseMenuEl.classList.add('hidden');
    gameoverEl.classList.add('hidden');
    winMenuEl.classList.add('hidden');
  }

  function startLevel(i) {
    levelIdx = Math.max(0, Math.min(LEVELS.length - 1, i));
    if (mode !== 'playing') slowMode = !!slowToggle.checked;
    score = 0; lives = MAX_LIVES; pausesLeft = MAX_PAUSES;
    streak = 0;
    qIndex = 0; currentLane = 1;
    qOrder = shuffled(level().questions.length);   // random order every run
    speed = BASE_SPEED;
    speedBonus = 0;
    jumpY = 0; jumpV = 0; hurtT = 0;
    clearObstacles();
    paused = false;
    mode = 'playing';
    roundActive = true;
    pendingSpawn = -1; pendingEnd = -1; pendingEndType = null;
    player.position.x = LANES[1];
    player.rotation.set(0, 0, 0);
    refillQueue(-1);
    setBiome(0, false);
    onBiomeEnter(true);
    hideAllOverlays();
    spawnRound();
  }

  function backToMenu() {
    mode = 'menu';
    paused = false;
    clearBlocks();
    clearObstacles();
    hideAllOverlays();
    menuEl.classList.remove('hidden');
    buildLevelList();   // refresh locks after any new unlock
    stopMusic();
    qText.textContent = 'Pick a level to start…';
    slowToggle.checked = slowMode;
    updateHUD();
  }

  function doGameOver() {
    mode = 'over';
    paused = false;
    goScoreEl.textContent = level().name + ' — Final score: ' + score + ' • cleared ' + qIndex;
    hideAllOverlays();
    gameoverEl.classList.remove('hidden');
    stopMusic();
    sfxOver();
  }

  function doWin() {
    mode = 'win';
    paused = false;
    var cleared = levelIdx + 1;
    if (cleared > maxCleared) {
      maxCleared = cleared;
      try { localStorage.setItem('pqr_cleared', String(maxCleared)); } catch (e2) {}
      toast('🔓 Levels open up to ' + unlockedUpTo() + '!', 2200);
    }
    var isLast = levelIdx >= LEVELS.length - 1;
    winScoreEl.textContent = level().name + ' clear! Score: ' + score + (slowMode ? ' (🐢 slow)' : '');
    nextBtn.textContent = isLast ? '↻ REPLAY LEVEL' : 'NEXT LEVEL ▶';
    hideAllOverlays();
    winMenuEl.classList.remove('hidden');
    stopMusic();
    sfxWin();
    var CONF = [0x22c55e, 0xfacc15, 0x22d3ee, 0xa855f7, 0xef4444, 0xffffff];
    for (var ci = 0; ci < 8; ci++) {
      burst((Math.random() - 0.5) * 8, 1 + Math.random() * 3.5, -2 - Math.random() * 7,
        CONF[ci % CONF.length], 40, 1.5, 0.25, 0.9);
    }
  }

  function paintGate(block, hex) {
    // splash the gate YOU passed green/red — it keeps scrolling past, tinted
    block.mesh.material.forEach(function (m) { if (m.color) m.color.set(hex); });
    block.mesh.scale.set(1.1, 1.1, 1);
  }

  function resolveHit(block) {
    if (!roundActive || mode !== 'playing' || paused) return;
    roundActive = false;

    if (block.isCorrect) {
      score += 100;
      if (lives < MAX_LIVES) lives++;
      else if (pausesLeft < MAX_PAUSES) { pausesLeft++; toast('Full ❤️ + correct: +1 ☕!', 1500); }
      speedBonus = Math.min(12, speedBonus + 1.0);
      burst(block.mesh.position.x, 1.6, 0.5, 0x22c55e);
      flash('good');
      sfxCorrect();
      sfxPickup();
      paintGate(block, 0x22c55e);
      streak++;
      punchStreak();
      qIndex++;
      if (level().endless && qIndex >= level().questions.length) {
        qOrder = shuffled(level().questions.length);   // endless: reshuffle, never win
        qIndex = 0;
      }
      setBanner();
      updateHUD();
      if (!level().endless && qIndex >= level().questions.length) {
        pendingEnd = 0.7; pendingEndType = 'win';
      } else {
        if (phase !== 'transition') {
          hitsInBiome++;
          if (hitsInBiome >= HITS_PER_BIOME) startTransition();
          else if (hitsInBiome === HITS_PER_BIOME - 1 && phase === 'stable') startApproach();
        }
        spawnObstacleWave();
        pendingSpawn = 0.8;
      }
    } else {
      lives--;
      streak = 0;   // one wrong wipes the style meter back to D
      punchStreak();
      burst(player.position.x, 1.2, 0, 0xef4444);
      flash('bad');
      sfxWrong();
      paintGate(block, 0xef4444);
      shake(0.45);
      setBanner();
      updateHUD();
      if (lives <= 0) {
        pendingEnd = 0.7; pendingEndType = 'over';
      } else {
        spawnObstacleWave();
        pendingSpawn = 0.8;
      }
    }
  }

  // ---------------- pause (session 2: ESC, 3 per run) ----------------
  function tryPause() {
    if (mode !== 'playing' || paused) return;
    if (pausesLeft <= 0) {
      toast('No ☕ left! Fill ❤️, then correct answers earn ☕.', 2000);
      return;
    }
    pausesLeft--;
    paused = true;
    pauseInfoEl.textContent = '☕ left: ' + pausesLeft + ' / ' + MAX_PAUSES;
    slowTogglePause.checked = slowMode;
    pauseMenuEl.classList.remove('hidden');
    sfxPause();
    if (activeTrack) activeTrack.pause();
    updateHUD();
  }
  function resumeGame() {
    if (mode !== 'playing' || !paused) return;
    paused = false;
    pauseMenuEl.classList.add('hidden');
    sfxResume();
    if (activeTrack && musicWanted && !muted) elPlay(activeTrack);
  }

  // ---------------- input ----------------
  function move(dir) {
    if (mode !== 'playing' || paused) return;
    var next = Math.max(0, Math.min(2, currentLane + dir));
    if (next !== currentLane) { currentLane = next; sfxSwish(); }
  }
  window.addEventListener('keydown', function (e) {
    unlock();
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move(-1);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move(1);
    else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (e.repeat) return;
      if (mode === 'playing') { paused ? resumeGame() : tryPause(); }
    }
    else if (e.key === 'm' || e.key === 'M') { setMuted(!muted); if (!muted) sfxClick(); }
    else if (e.key === 'r' || e.key === 'R') {
      if (mode === 'playing' || mode === 'over' || mode === 'win') { sfxClick(); startLevel(levelIdx); }
    }
    else if (e.key === 'n' || e.key === 'N') {
      if (mode === 'win' && levelIdx < LEVELS.length - 1) { sfxClick(); startLevel(levelIdx + 1); }
      else if (mode === 'win') { sfxClick(); startLevel(levelIdx); }
    }
    else if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      if (mode === 'menu') { sfxClick(); startLevel(levelIdx); }
      else jump();
    }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); jump(); }
  });
  window.addEventListener('pointerdown', unlock);
  resumeBtn.addEventListener('click', resumeGame);
  pauseLevelsBtn.addEventListener('click', function () { sfxClick(); backToMenu(); });
  retryBtn.addEventListener('click', function () { sfxClick(); startLevel(levelIdx); });
  goLevelsBtn.addEventListener('click', function () { sfxClick(); backToMenu(); });
  winLevelsBtn.addEventListener('click', function () { sfxClick(); backToMenu(); });
  nextBtn.addEventListener('click', function () {
    sfxClick();
    if (levelIdx < LEVELS.length - 1) startLevel(levelIdx + 1);
    else startLevel(levelIdx);
  });
  soundBtn.textContent = muted ? '🔇' : '🔊';
  soundBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    setMuted(!muted);
    if (!muted) sfxClick();
  });
  var resetBtn = document.getElementById('reset-progress');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    try { localStorage.removeItem('pqr_cleared'); } catch (e) {}
    maxCleared = 0;
    buildLevelList();
    toast('Progress reset — levels 1–3 open.', 1800);
    sfxClick();
  });
  slowToggle.addEventListener('change', function () {
    slowMode = !!slowToggle.checked;
    if (slowTogglePause) slowTogglePause.checked = slowMode;
    slowBadge.classList.toggle('hidden', !(slowMode && mode === 'playing'));
    sfxClick();
  });
  slowTogglePause.addEventListener('change', function () {
    slowMode = !!slowTogglePause.checked;
    slowToggle.checked = slowMode;
    slowBadge.classList.toggle('hidden', !(slowMode && mode === 'playing'));
    sfxClick();
  });
  pausesEl.style.pointerEvents = 'auto';
  pausesEl.style.cursor = 'pointer';
  pausesEl.title = 'Click or press ESC to pause';
  pausesEl.addEventListener('click', function () {
    if (mode === 'playing') { paused ? resumeGame() : tryPause(); }
  });

  var tx0 = null, ty0 = null;
  window.addEventListener('touchstart', function (e) {
    unlock();
    tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', function (e) {
    if (tx0 === null) return;
    var dx = e.changedTouches[0].clientX - tx0;
    var dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx)) { if (dy < 0) jump(); }
    else if (Math.abs(dx) > 24) move(dx < 0 ? -1 : 1);
    tx0 = null; ty0 = null;
  }, { passive: true });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------------- main loop ----------------
  var clock = new THREE.Clock();
  var playerBox = new THREE.Box3();
  var blockBox = new THREE.Box3();

  buildLevelList();
  refillQueue(0);
  setBiome(0, true);
  updateHUD();

  function animate() {
    requestAnimationFrame(animate);
    var dt = Math.min(clock.getDelta(), 0.05);
    var playing = (mode === 'playing' && !paused);
    elapsed += playing ? dt : dt * 0.15;

    // lane slide + jump + themed run cycle (alive behind menus too)
    var targetX = LANES[currentLane];
    if (playing) player.position.x += (targetX - player.position.x) * Math.min(1, dt * 11);
    player.position.y = jumpY + Math.abs(Math.sin(elapsed * 11)) * 0.06;
    player.rotation.x = THREE.MathUtils.clamp(-jumpV * 0.025, -0.4, 0.3);
    player.rotation.z = THREE.MathUtils.clamp((targetX - player.position.x) * -0.06, -0.28, 0.28);
    var run = activeRunner();
    if (run) {
      if (popT < 1) {
        popT = Math.min(1, popT + dt * 2.2);
        run.scale.setScalar(Math.max(0.01, easeOutBack(popT)));
      }
      if (run.userData.tick) run.userData.tick(elapsed, dt);
    }

    if (playing) {
      // world colors ease toward biome targets (drives seamless transitions)
      var k = 1 - Math.exp(-2.2 * dt);
      scene.background.lerp(tSky, k);
      scene.fog.color.lerp(tSky, k);
      groundMat.color.lerp(tGround, k);
      roadMat.color.lerp(tRoad, k);
      edgeMat.color.lerp(tEdge, k);
      ambient.color.lerp(tAmb, k);
      ambient.intensity += (tAmbI - ambient.intensity) * k;
      sun.color.lerp(tSunC, k);
      sun.intensity += (tSunI - sun.intensity) * k;

      // transition progress: crossfade weather (props drain naturally behind)
      if (phase === 'approach') {
        if (teasS.mat.opacity < teasS.teasTarget) {
          teasS.mat.opacity = Math.min(teasS.teasTarget, teasS.mat.opacity + dt * 0.5);
        }
      }
      if (phase === 'transition') {
        transT += dt;
        var f = Math.min(1, transT / TRANSITION_DUR);
        mainS.mat.opacity = mainS.baseOp * (1 - f);
        teasS.mat.opacity += (teasS.baseOp - teasS.mat.opacity) * Math.min(1, dt * 3);
        if (f >= 1) finishTransition();
      }

      // slow mode: full speed normally, ease off only when gates are close
      var gatesNear = slowMode && blocks.length > 0 && blocks[0].mesh.position.z > -SLOW_ZONE;
      var cruise = Math.min(SPEED_MAX, BASE_SPEED + speedBonus);
      var targetSpeed = gatesNear ? cruise * SLOW_MULT : cruise;
      speed += (targetSpeed - speed) * Math.min(1, dt * 2.5);

      // jump physics + landing puff
      var prevY = jumpY;
      jumpV += GRAV * dt;
      jumpY += jumpV * dt;
      if (jumpY <= 0) {
        jumpY = 0;
        if (prevY > 0.05 && jumpV < -6) {
          burst(player.position.x, 0.12, 0.4, 0x8b93a3, 8, 0.4, 0.15, 0.3);
        }
        jumpV = 0;
      }

      // hurt invulnerability + blink
      if (hurtT > 0) { hurtT -= dt; player.visible = (Math.floor(elapsed * 14) % 2 === 0); }
      else player.visible = true;

      for (var i = 0; i < dashes.length; i++) {
        dashes[i].position.z += speed * dt;
        if (dashes[i].position.z > 14) dashes[i].position.z -= 24 * 7;
      }
      for (var b = 0; b < props.length; b++) {
        var pr = props[b];
        // drain: leftovers rush out 2.6x, whole stream runs 1.7x mid-switch so no thin band forms
        var boost = (phase === 'transition') ? 1.7 : 1;
        var rush = pr.userData.ptype !== propTypeNow ? 2.6 : 1;
        pr.position.z += speed * dt * rush * boost;
        if (pr.position.z > 14) {
          morphPropTo(b, propTypeNow);
          props[b].position.z -= 134;
        }
        var pr2 = props[b];
        if (pr2.userData.float) {
          pr2.rotation.y += dt * 0.4;
          pr2.position.y = pr2.userData.float + Math.sin(elapsed * 1.5 + pr2.position.z) * 0.3;
        }
      }
      // ground patches scroll + follow the biome ground tint (never rebuilt, never pops)
      patchMatA.color.copy(groundMat.color).multiplyScalar(0.82);
      patchMatB.color.copy(groundMat.color).multiplyScalar(1.1);
      for (var gi = 0; gi < patches.length; gi++) {
        var gp = patches[gi];
        gp.position.z += speed * dt;
        if (gp.position.z > 15) patchPlace(gp, gp.position.z - 150);
      }
      // clouds drift sideways, wrap around
      for (var qi = 0; qi < clouds.length; qi++) {
        var cd = clouds[qi];
        cd.position.x += cd.userData.sp * dt;
        if (cd.position.x > 100) cd.position.x = -100;
      }
      // far-far silhouettes scroll with the world
      for (var fi = 0; fi < farfar.length; fi++) {
        var fp = farfar[fi];
        fp.position.z += speed * dt;
        if (fp.position.z > 20) {
          fp.position.z -= 170;
          fp.position.x = (fp.position.x > 0 ? 1 : -1) * (55 + Math.random() * 35);
        }
      }
      for (var m = 0; m < blocks.length; m++) {
        blocks[m].mesh.position.z += speed * dt;
        blocks[m].mesh.rotation.y = Math.sin(elapsed * 2 + m) * 0.06;
      }
      // obstacles scroll in, collide, and recycle
      for (var oi = obstacles.length - 1; oi >= 0; oi--) {
        var ob = obstacles[oi];
        ob.mesh.position.z += speed * dt;
        if (ob.mesh.position.z > 12) { removeObstacle(oi); continue; }
        if (hurtT <= 0 && Math.abs(ob.mesh.position.z - HIT_Z) < 1.6) {
          playerBox.setFromObject(player);
          blockBox.setFromObject(ob.mesh);
          if (playerBox.intersectsBox(blockBox) && playerBox.min.y < ob.topY - 0.25) {
            hitObstacle(oi);
          }
        }
      }
      // run dust puffs at the runner's feet
      dustT -= dt;
      if (dustT <= 0) {
        dustT = 0.14;
        burst(player.position.x + (Math.random() - 0.5) * 0.5, 0.15, 0.9, 0x8b93a3, 5, 0.35, 0.13, 0.25);
      }

      updateSys(mainS, dt);
      updateSys(teasS, dt);

      // desert tumbleweeds
      var showT = false;
      for (var t2 = 0; t2 < tumbleweeds.length; t2++) if (tumbleweeds[t2].visible) { showT = true; break; }
      if (showT) {
        for (var t = 0; t < tumbleweeds.length; t++) {
          var twd = tumbleweeds[t];
          twd.position.x += twd.userData.sp * dt;
          twd.position.y = 0.55 + Math.abs(Math.sin(elapsed * 5 + t * 2)) * 0.5;
          twd.rotation.z -= twd.userData.sp * dt * 2;
          twd.position.z += speed * dt * 0.4;
          if (twd.position.x > 16 || twd.position.z > 12) resetTumbleweed(twd, false);
        }
      }
      // haunted bats circling
      var showB = false;
      for (var bti = 0; bti < bats.length; bti++) if (bats[bti].visible) { showB = true; break; }
      if (showB) {
        for (var bq = 0; bq < bats.length; bq++) {
          var bt = bats[bq], u = bt.userData;
          var a = elapsed * u.sp + u.ph;
          bt.position.set(Math.cos(a) * u.r, u.h + Math.sin(elapsed * 2 + u.ph) * 1.2, -55 + Math.sin(a) * u.r * 0.5);
          bt.rotation.y = -a;
          bt.scale.y = 1 + Math.sin(elapsed * 10 + u.ph) * 0.25;
        }
      }
      if (aurora.visible) {
        aurora.material.opacity = 0.45 + 0.25 * Math.sin(elapsed * 0.8);
        auroraTex.offset.x += dt * 0.02;
        aurora.position.x = camera.position.x;
      }
      if (planet.visible) planet.rotation.y += dt * 0.05;

      // storm lightning (current or incoming biome)
      if (BIOMES[phase === 'transition' ? transTo : biomeIndex].extra === 'lightning') {
        boltTimer -= dt;
        if (boltTimer <= 0) {
          doBolt();
          boltTimer = 2.5 + Math.random() * 4;
        }
      }

      // delayed spawn / delayed end (pause-safe: only ticks while playing)
      if (pendingSpawn > 0) {
        pendingSpawn -= dt;
        if (pendingSpawn <= 0) { pendingSpawn = -1; if (mode === 'playing') spawnRound(); }
      }
      if (pendingEnd > 0) {
        pendingEnd -= dt;
        if (pendingEnd <= 0) {
          var t = pendingEndType; pendingEnd = -1; pendingEndType = null;
          if (t === 'over') doGameOver(); else if (t === 'win') doWin();
        }
      }

      if (roundActive) {
        for (var c = 0; c < blocks.length; c++) {
          var blk = blocks[c];
          var dz = Math.abs(blk.mesh.position.z - HIT_Z);
          var sameLane = blk.lane === currentLane ||
            Math.abs(blk.mesh.position.x - player.position.x) < 1.25;
          if (dz < 1.0 && sameLane) {
            playerBox.setFromObject(player);
            blockBox.setFromObject(blk.mesh);
            if (playerBox.intersectsBox(blockBox)) { resolveHit(blk); break; }
          }
        }
      }
      if (blocks.length && blocks[0].mesh.position.z > 12 && pendingEnd < 0) {
        clearBlocks();
        if (roundActive) { roundActive = false; pendingSpawn = 0.8; }
      }
    }

    updateBursts(paused ? 0 : dt);

    camera.position.set(CAM_BASE.x, CAM_BASE.y, CAM_BASE.z);
    if (shakeT > 0 && playing) {
      shakeT -= dt;
      var mg = Math.min(0.5, shakeT) * 0.9;
      camera.position.x += (Math.random() - 0.5) * mg;
      camera.position.y += (Math.random() - 0.5) * mg;
    }
    camera.position.x += player.position.x * 0.25;
    camera.lookAt(player.position.x * 0.4, 1.4, -12);

    renderer.render(scene, camera);
  }
  animate();
})();
