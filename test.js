import test from 'ava';
import './index';

const mapAccessorName = '_mapAccessor';

test('arr[]', t => {
    let arr = [][mapAccessorName];

    t.truthy(arr);
});

test('arr[]()', t => {
    let greetings = [
        function(name) {
            return `hello, ${name}`;
        },
        function(name) {
            return `goodbye, ${name}`;
        }
    ];

    let greeted = greetings[mapAccessorName]('shiba');

    t.deepEqual(greeted, ['hello, shiba', 'goodbye, shiba'])
});

test('arr[](n => x)', t => {
    let arr = [1, 2, 3, 4, 5];
    let result = arr[mapAccessorName](n => n * 2);

    t.deepEqual(result, [2, 4, 6, 8, 10]);
});

test('arr[]((n, i) => {})', t => {
    let arr = [10, 20, 30, 40, 50];
    let result = arr[mapAccessorName]((n, i) => i + n + 1);

    t.deepEqual(result, [11, 22, 33, 44, 55]);
});

test('arr[].a', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];
    let result = players[mapAccessorName].mood;

    t.deepEqual(result, ['sad', 'sad']);
});

test('arr[].a w/ undefined', t => {
    let arr = [
        {id: 1},
        {id: 2},
        {num: 3}
    ];

    t.deepEqual(arr[mapAccessorName].id, [1, 2, undefined]);
    t.deepEqual(arr[mapAccessorName].num, [undefined, undefined, 3]);
});

test('arr[].native(x)', t => {
    let arr = [[0], [0], [0]];

    let result = arr[mapAccessorName](n => [10]);

    result[mapAccessorName].push(20);

    t.deepEqual(result, [[10, 20], [10, 20], [10, 20]]);
});

test('arr[].a(x)', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];
    let result = players[mapAccessorName].setMood('happy');

    t.deepEqual([players[0].mood, players[1].mood], ['happy', 'happy']);
    t.deepEqual(result, [{ mood: 'happy' }, { mood: 'happy' }]);
});

test('arr[].a[].b(x)', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [{ a: [new Player(), new Player()] }, { a: [new Player(), new Player()] }];
    let result = players[mapAccessorName].a[mapAccessorName].setMood('happy');

    t.deepEqual(players[0].a[0].mood, 'happy');
    t.deepEqual(result, [{
        a: [
            { mood: 'happy' },
            { mood: 'happy' }
        ]
    }, {
        a: [
            { mood: 'happy' },
            { mood: 'happy' }
        ]
    }]);
});

test('arr[].a[].b = x', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [{ a: [new Player(), new Player()] }, { a: [new Player(), new Player()] }];

    players[mapAccessorName].a[mapAccessorName].mood = 'happy';

    t.deepEqual(players[0].a[0].mood, 'happy');
    t.deepEqual(players, [{
        a: [
            { mood: 'happy' },
            { mood: 'happy' }
        ]
    }, {
        a: [
            { mood: 'happy' },
            { mood: 'happy' }
        ]
    }]);
});

test('arr[].a = x', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];

    players[mapAccessorName].mood = 'angry';

    t.deepEqual([players[0].mood, players[1].mood], ['angry', 'angry']);
});

test('arr[].a.native(x)', t => {
    let arr = [{
        a: [1, 2]
    }, {
        a: [1, 2]
    }]

    arr[mapAccessorName].a.push(3);

    t.deepEqual(arr, [{
        a: [1, 2, 3]
    }, {
        a: [1, 2, 3]
    }]);
});

test('arr[].a.b', t => {
    let arr = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = arr[mapAccessorName].a.b;

    t.deepEqual(result, [10, 15]);
});

test('arr[].a.b.c', t => {
    let arr = [
        { a: { b: { c: 10 } } },
        { a: { b: { c: 15 } } }
    ];

    let result = arr[mapAccessorName].a.b.c;

    t.deepEqual(result, [10, 15]);
});

test('arr[].a[].b', t => {
    let arr = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = arr[mapAccessorName].a[mapAccessorName].b

    t.deepEqual(result, [[10, 15], [20, 25]]);
});

test('arr[].a[].b[](n => x)', t => {
    let arr = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = arr[mapAccessorName].a[mapAccessorName].b[mapAccessorName](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: 20 }, { b: 30 }] },
        { a: [{ b: 40 }, { b: 50 }] }
    ]);
});

test('arr[].a[].b.c', t => {
    let arr = [
        { a: [{ b: { c: 10 } }, { b: { c: 15 } }] },
        { a: [{ b: { c: 20 } }, { b: { c: 25 } }] }
    ];
    let result = arr[mapAccessorName].a[mapAccessorName].b.c;

    t.deepEqual(result, [
        [10, 15],
        [20, 25]
    ]);
});

test('arr[].a[].b.c[](n => x)', t => {
    let arr = [
        { a: [{ b: { c: 10 } }, { b: { c: 15 } }] },
        { a: [{ b: { c: 20 } }, { b: { c: 25 } }] }
    ];
    let result = arr[mapAccessorName].a[mapAccessorName].b.c[mapAccessorName](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: { c: 20 } }, { b: { c: 30 } }] },
        { a: [{ b: { c: 40 } }, { b: { c: 50 } }] }
    ]);
});


test('arr[].a.b[](n => x)', t => {
    let arr = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = arr[mapAccessorName].a.b[mapAccessorName](n => 20);

    t.deepEqual(result, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});

test('arr[].a[]((n, i) => {})', t => {
    let arr = [
        { a: 10 },
        { a: 20 },
        { a: 30 }
    ];
    let result = arr[mapAccessorName].a[mapAccessorName]((n, i) => i + n + 1);

    t.deepEqual(result, [
        { a: 11 },
        { a: 22 },
        { a: 33 }
    ]);
});

test('arr[].a.b[]((n, i) => {})', t => {
    let arr = [
        { a: { b: 10 } },
        { a: { b: 20 } },
        { a: { b: 30 } }
    ];
    let result = arr[mapAccessorName].a.b[mapAccessorName]((n, i) => i + n + 1);

    t.deepEqual(result, [
        { a: { b: 11 } },
        { a: { b: 22 } },
        { a: { b: 33 } }
    ]);
});

test.skip('arr[].a[0].b', t => {
    let arr = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] },
        { a: [{ b: 30 }, { b: 35 }] }
    ];

    arr = arr[mapAccessorName].a[1].b;

    t.deepEqual(arr, [15, 25, 35]);
});

test.skip('arr[].a[0].b = x', t => {
    let arr = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] },
        { a: [{ b: 30 }, { b: 35 }] }
    ];

    arr[mapAccessorName].a[0].b = 5;

    t.deepEqual(arr, [
        { a: [{ b: 5 }, { b: 15 }] },
        { a: [{ b: 5 }, { b: 25 }] },
        { a: [{ b: 5 }, { b: 35 }] }
    ]);
});

test('arr[].a.b = x', t => {
    let arr = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    arr[mapAccessorName].a.b = 20;

    t.deepEqual(arr, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});

test('arr[].new = x', t => {
    let arr = [{}, {}];

    arr[mapAccessorName].a = {};
    arr[mapAccessorName].a.b = 42;

    t.deepEqual(arr, [{ a: { b: 42 } }, { a: { b: 42 } }]);
});

test('arr[] = x', t => {
    let arr = [0, 0];

    arr[mapAccessorName] = 42;

    t.deepEqual(arr, [42, 42]);
});

test.skip('arr[].a[][] = x', t => {
    let arr = [{
        a: [10, 15]
    }, {
        a: [20, 25]
    }];

    arr[mapAccessorName].a[mapAccessorName][mapAccessorName] = 5;

    t.deepEqual(arr, [{
        a: [5, 5]
    }, {
        a: [5, 5]
    }]);
});

test.skip('arr[].a[][](n => x)', t => {
    let arr = [{
        a: [10, 15]
    }, {
        a: [20, 25]
    }];

    arr[mapAccessorName].a[mapAccessorName][mapAccessorName](n => n * 2);

    t.deepEqual(arr, [{
        a: [20, 30]
    }, {
        a: [40, 50]
    }]);
});

test.skip('arr[].a[].n[]((n, i) => i)', t => {
    arr = [
        { a: [{n: 1}, {n: 1}, {n: 1}] },
        { a: [{n: 1}, {n: 1}, {n: 1}] },
        { a: [{n: 1}, {n: 1}, {n: 1}] },
    ];

    arr[mapAccessorName].a[mapAccessorName][mapAccessorName]((n, i) => i)

    t.deepEqual(arr, [
        { a: [{n: 1}, {n: 2}, {n: 3}] },
        { a: [{n: 4}, {n: 5}, {n: 6}] },
        { a: [{n: 7}, {n: 8}, {n: 9}] },
    ]);
});

test('throw on null', t => {
    t.throws(() => {
        let arr = [
            {id: 1},
            {id: 2},
            null
        ];

        arr[mapAccessorName].id;
    });
});
