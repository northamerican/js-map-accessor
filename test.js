import test from 'ava';
import './map-operator';

const mapOperatorKey = '_mapOperator';

// let mapOperator = code => {
//     let mapOperator = /\[\]/g;
//     // Not a perfect way to detect usage of [] operator but good enough for a demo
//     let mapOperatorHook = /[^\s=:](\[\])+/g;

//     code.replace(mapOperatorHook, function(match) {
//         let replaceWith = match.replace(mapOperator, `[mapOperatorKey']`);

//         code = code.replace(match, replaceWith)
//     });

//     return code;
// }

// eval(mapOperator(``))

test('map operator loaded', t => {
    let arr = [][mapOperatorKey];

    t.truthy(arr);
});

(() => {
    let Player = function() {
        this.mood = 'sad';
    }
    Player.prototype.setMood = function(mood) {
        this.mood = mood;
        return this.mood;
    }

    let players = [new Player(), new Player()];

    test('call method in each object in array', t => {
        players[mapOperatorKey].setMood('happy');
        t.deepEqual([players[0].mood, players[1].mood], ['happy', 'happy']);
    });

    test('write to property in each object in array', t => {
        players[mapOperatorKey].mood = 'angry';
        t.deepEqual([players[0].mood, players[1].mood], ['angry', 'angry']);
    });
})();

test('property access', t => {
    let list = [
        {id: 1},
        {id: 2},
        {num: 3}
    ];

    t.deepEqual(list[mapOperatorKey].id, [1, 2, undefined]);
    t.deepEqual(list[mapOperatorKey].num, [undefined, undefined, 3]);
});

// test('fail to access null property', t => {
//     let list = [
//         {id: 1},
//         {id: 2},
//         null
//     ];

//     t.throws(list[mapOperatorKey].id);
// });

//! ^ same but deep null

test('custom function call on each object in array', t => {
    let list = [1, 2, 3, 4, 5];
    let result = list[mapOperatorKey](n => n * 2);

    t.deepEqual(result, [2, 4, 6, 8, 10]);
});

test('keep record of index in map operator', t => {
    let list = [10, 20, 30, 40, 50];
    let result = list[mapOperatorKey]((n, i) => (i + 1) + n);

    t.deepEqual(result, [11, 22, 33, 44, 55]);
});

test('keep record of index in map operator when used on deep objects', t => {
    let list = [{ a: 10 }, { a: 20 }, { a: 30 }, { a: 40 }, { a: 50 }];
    let result = list[mapOperatorKey].a[mapOperatorKey]((n, i) => i + n + 1);

    t.deepEqual(result, [{ a: 11 }, { a: 22 }, { a: 33 }, { a: 44 }, { a: 55 }]);
});

// test('keep record of index in map operator when used on even deeper objects', t => {
//     let list = [{ a: { b: 10 } }, { a: { b: 20 } }, { a: { b: 30 } }, { a: { b: 40 } }, { a: { b: 50 } }];
//     let result = list[mapOperatorKey].a.b[mapOperatorKey]((n, i) => i + n + 1);

//     t.deepEqual(result, [{ a: { b: 11 } }, { a: { b: 22 } }, { a: { b: 33 } }, { a: { b: 44 } }, { a: { b: 55 } }]);
// });

test('set all properties in array of objects', t => {
    let list = [{ num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }];

    list[mapOperatorKey].num = 10;

    t.deepEqual(list, [{ num: 10 }, { num: 10 }, { num: 10 }, { num: 10 }, { num: 10 }]);
});

test('call prototype method on properties in array', t => {
    let list = [[0], [0], [0]];

    let result = list[mapOperatorKey](n => [10]);

    result[mapOperatorKey].push(20);
    t.deepEqual(result, [[10, 20], [10, 20], [10, 20]]);
});

test('deep array access', t => {
    let list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];
    let result = list[mapOperatorKey].a[mapOperatorKey].b

    t.deepEqual(result, [[10, 15], [20, 25]]);
});

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

test('access of nested objects in array', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapOperatorKey].a.b;

    t.deepEqual(result, [10, 15]);
});

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


test('set nested objects in array', t => {
    let list = [
        { a: { b: 10 } },
        { a: { b: 15 } }
    ];

    let result = list[mapOperatorKey].a.b = 20;

    t.deepEqual(result, [
        { a: { b: 20 } },
        { a: { b: 20 } }
    ]);
});






// test('deep access of index in array', t => {
//     let list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] },
//         { a: [{ b: 30 }, { b: 35 }] }
//     ];

//     list = list[mapOperatorKey].a[0].b;

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




// deep property set, get, method call, fn.


// [fn, fn]()

// test('throw on mismatched property types', t => {

// });



// list[mapOperatorKey].a[mapOperatorKey].b[mapOperatorKey] = 30

// test('deep array manipulation', t => {
//     let albums = [{
//         editions: [15, 20]
//     }, {
//         editions: [30, 40]
//     }];

//     albums = albums[mapOperatorKey].editions[mapOperatorKey][mapOperatorKey](edition => edition * 10);

//     // console.log(albums);

//     t.deepEqual(albums, [{
//         editions: [150, 200]
//     }, {
//         editions: [300, 400]
//     }]);
// });
