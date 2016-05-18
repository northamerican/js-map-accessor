import test from 'ava';
import './map-operator-proxy';

const mapOperatorKey = '_mapOperator';

// o[]
test('map operator loaded', t => {
    let arr = [][mapOperatorKey];

    t.truthy(arr);
});

// o[]();
test('call array of functions', t => {
    let greetings = [
        function(name) {
            return `hello, ${name}`;
        },
        function(name) {
            return `goodbye, ${name}`;
        }
    ];

    let greeted = greetings[mapOperatorKey]('shiba');

    t.deepEqual(greeted, ['hello, shiba', 'goodbye, shiba'])
});

// o[](n => {})
test('custom function call on each object in array', t => {
    let list = [1, 2, 3, 4, 5];
    let result = list[mapOperatorKey](n => n * 2);

    t.deepEqual(result, [2, 4, 6, 8, 10]);
});

// o[]((n, i) => {})
test('keep record of index in map operator', t => {
    let list = [10, 20, 30, 40, 50];
    let result = list[mapOperatorKey]((n, i) => i + n + 1);

    t.deepEqual(result, [11, 22, 33, 44, 55]);
});

// o[].a
test('access property in constructed object', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];
    let result = players[mapOperatorKey].mood;

    t.deepEqual(result, ['sad', 'sad']);
});

// o[].a w/ undefined
test('access of undefined properties', t => {
    let list = [
        {id: 1},
        {id: 2},
        {num: 3}
    ];

    t.deepEqual(list[mapOperatorKey].id, [1, 2, undefined]);
    t.deepEqual(list[mapOperatorKey].num, [undefined, undefined, 3]);
});

// o[].a()
test('call prototype method on properties in array', t => {
    let list = [[0], [0], [0]];

    let result = list[mapOperatorKey](n => [10]);

    result[mapOperatorKey].push(20);

    t.deepEqual(result, [[10, 20], [10, 20], [10, 20]]);
});

// o[].a(x)
test('call method in each object in array', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];
    let result = players[mapOperatorKey].setMood('happy');

    t.deepEqual([players[0].mood, players[1].mood], ['happy', 'happy']);
    t.deepEqual(result, ['happy', 'happy']);
});

// o[].a = x
test('write to property in each object in array', t => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];

    players[mapOperatorKey].mood = 'angry';

    t.deepEqual([players[0].mood, players[1].mood], ['angry', 'angry']);
});

// o[].a.b
test('access of nested objects in array', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapOperatorKey].a.b;

    t.deepEqual(result, [10, 15]);
});

// o[].a[].b
test('deep array access', t => {
    let list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = list[mapOperatorKey].a[mapOperatorKey].b

    t.deepEqual(result, [[10, 15], [20, 25]]);
});

// o[].a[].b[](n => {})
test('deep array manipulation', t => {
    let list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = list[mapOperatorKey].a[mapOperatorKey].b[mapOperatorKey](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: 20 }, { b: 30 }] },
        { a: [{ b: 40 }, { b: 50 }] }
    ]);
});

// o[].a[].b.c[](n => {})
test('very deep array manipulation', t => {
    let list = [
        { a: [{ b: { c: 10 } }, { b: { c: 15 } }] },
        { a: [{ b: { c: 20 } }, { b: { c: 25 } }] }
    ];
    let result = list[mapOperatorKey].a[mapOperatorKey].b.c[mapOperatorKey](n => n * 2);

    t.deepEqual(result, [
        { a: [{ b: { c: 20 } }, { b: { c: 30 } }] },
        { a: [{ b: { c: 40 } }, { b: { c: 50 } }] }
    ]);
});


// o[].a.b[](n => {})
test('run method on nested objects in array', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapOperatorKey].a.b[mapOperatorKey](n => 20);

    t.deepEqual(result, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});

// o[].a[]((n, i) => {})
test('keep record of index in map operator when used on deep objects', t => {
    let list = [{ a: 10 }, { a: 20 }, { a: 30 }, { a: 40 }, { a: 50 }];
    let result = list[mapOperatorKey].a[mapOperatorKey]((n, i) => i + n + 1);

    t.deepEqual(result, [{ a: 11 }, { a: 22 }, { a: 33 }, { a: 44 }, { a: 55 }]);
});

// o[].a.b[]((n, i) => {})
test('keep record of index in map operator when used on even deeper objects', t => {
    let list = [{ a: { b: 10 } }, { a: { b: 20 } }, { a: { b: 30 } }, { a: { b: 40 } }, { a: { b: 50 } }];
    let result = list[mapOperatorKey].a.b[mapOperatorKey]((n, i) => i + n + 1);

    t.deepEqual(result, [{ a: { b: 11 } }, { a: { b: 22 } }, { a: { b: 33 } }, { a: { b: 44 } }, { a: { b: 55 } }]);
});

// o[].a.b = x;
test('set nested objects in array', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    list[mapOperatorKey].a.b = 20;

    t.deepEqual(list, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});



// test('fail to access null property', t => {
//     let list = [
//         {id: 1},
//         {id: 2},
//         null
//     ];

//     t.throws(list[mapOperatorKey].id);
// });

// ! ^ same but deep null

// test('deep access of index in array', t => {
//     let list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] },
//         { a: [{ b: 30 }, { b: 35 }] }
//     ];

//     list = list[mapOperatorKey].a[mapOperatorKey][0].b;

//     t.deepEqual(list, [10, 20]);
// });

// test('deep setting of index in array', t => {
//     let list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] },
//         { a: [{ b: 30 }, { b: 35 }] }
//     ];

//     list[mapOperatorKey].a[0].b = 5;

//     t.deepEqual(list, [
//         { a: [{ b: 5 }, { b: 15 }] },
//         { a: [{ b: 5 }, { b: 25 }] },
//         { a: [{ b: 5 }, { b: 35 }] }
//     ]);
// });
