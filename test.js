import test from 'ava';
import './map-accessor';

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
    let list = [1, 2, 3, 4, 5];
    let result = list[mapAccessorName](n => n * 2);

    t.deepEqual(result, [2, 4, 6, 8, 10]);
});

test('arr[]((n, i) => {})', t => {
    let list = [10, 20, 30, 40, 50];
    let result = list[mapAccessorName]((n, i) => i + n + 1);

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
    let list = [
        {id: 1},
        {id: 2},
        {num: 3}
    ];

    t.deepEqual(list[mapAccessorName].id, [1, 2, undefined]);
    t.deepEqual(list[mapAccessorName].num, [undefined, undefined, 3]);
});

test('arr[].a()', t => {
    let list = [[0], [0], [0]];

    let result = list[mapAccessorName](n => [10]);

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
    t.deepEqual(result, ['happy', 'happy']);
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

test('arr[].a[].native(x)', t => {
    let list = [{
        a: [1, 2]
    }, {
        a: [1, 2]
    }]

    list[mapAccessorName].a[mapAccessorName].push(3);

    t.deepEqual(list, [{
        a: [1, 2, 3]
    }, {
        a: [1, 2, 3]
    }]);
});

test('arr[].a.b', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapAccessorName].a.b;

    t.deepEqual(result, [10, 15]);
});

test('arr[].a.b.c', t => {
    let list = [
        { a: { b: { c: 10 } } },
        { a: { b: { c: 15 } } }
    ];

    let result = list[mapAccessorName].a.b.c;

    t.deepEqual(result, [10, 15]);
});

test('arr[].a[].b', t => {
    let list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = list[mapAccessorName].a[mapAccessorName].b

    t.deepEqual(result, [[10, 15], [20, 25]]);
});

test('arr[].a[].b[](n => x)', t => {
    let list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = list[mapAccessorName].a[mapAccessorName].b[mapAccessorName](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: 20 }, { b: 30 }] },
        { a: [{ b: 40 }, { b: 50 }] }
    ]);
});

test('arr[].a[].b.c', t => {
    let list = [
        { a: [{ b: { c: 10 } }, { b: { c: 15 } }] },
        { a: [{ b: { c: 20 } }, { b: { c: 25 } }] }
    ];
    let result = list[mapAccessorName].a[mapAccessorName].b.c;

    t.deepEqual(result, [
        [10, 15],
        [20, 25]
    ]);
});

test('arr[].a[].b.c[](n => x)', t => {
    let list = [
        { a: [{ b: { c: 10 } }, { b: { c: 15 } }] },
        { a: [{ b: { c: 20 } }, { b: { c: 25 } }] }
    ];
    let result = list[mapAccessorName].a[mapAccessorName].b.c[mapAccessorName](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: { c: 20 } }, { b: { c: 30 } }] },
        { a: [{ b: { c: 40 } }, { b: { c: 50 } }] }
    ]);
});


test('arr[].a.b[](n => x)', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapAccessorName].a.b[mapAccessorName](n => 20);

    t.deepEqual(result, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});

test('arr[].a[]((n, i) => {})', t => {
    let list = [
        { a: 10 },
        { a: 20 },
        { a: 30 }
    ];
    let result = list[mapAccessorName].a[mapAccessorName]((n, i) => i + n + 1);

    t.deepEqual(result, [
        { a: 11 },
        { a: 22 },
        { a: 33 }
    ]);
});

test('arr[].a.b[]((n, i) => {})', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 20 } },
        { a: { b: 30 } }
    ];
    let result = list[mapAccessorName].a.b[mapAccessorName]((n, i) => i + n + 1);

    t.deepEqual(result, [
        { a: { b: 11 } },
        { a: { b: 22 } },
        { a: { b: 33 } }
    ]);
});

// Works but the test runner breaks
// test('arr[].a[0].b', t => {
//     let list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] },
//         { a: [{ b: 30 }, { b: 35 }] }
//     ];

//     list = list[mapAccessorName].a[1].b;

//     t.deepEqual(list, [15, 25, 35]);
// });

// Works but the test runner breaks
// test('arr[].a[0].b = x', t => {
//     let list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] },
//         { a: [{ b: 30 }, { b: 35 }] }
//     ];

//     list[mapAccessorName].a[0].b = 5;

//     t.deepEqual(list, [
//         { a: [{ b: 5 }, { b: 15 }] },
//         { a: [{ b: 5 }, { b: 25 }] },
//         { a: [{ b: 5 }, { b: 35 }] }
//     ]);
// });

test('arr[].a.b = x', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    list[mapAccessorName].a.b = 20;

    t.deepEqual(list, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});

test('arr[].new = x', t => {
    let list = [{}, {}];

    list[mapAccessorName].a = {};
    list[mapAccessorName].a.b = 42;

    t.deepEqual(list, [{ a: { b: 42 } }, { a: { b: 42 } }]);
});

test('arr[] = x', t => {
    let list = [0, 0];

    list[mapAccessorName] = 42;

    t.deepEqual(list, [42, 42]);
});

test('fail to access null property', t => {
    t.throws(() => {
        let list = [
            {id: 1},
            {id: 2},
            null
        ];

        list[mapAccessorName].id;
    });
});
