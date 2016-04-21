import test from 'ava';
import './map-operator';

const mapOperatorKey = '_mapOperator';

// assume obj[mapOperatorKey] === obj[]

// var evalMapOperator = code => {
//     var mapOperator = /\[\]/g;
//     // Not a perfect way to detect usage of [] operator but good enough for a demo
//     var mapOperatorHook = /[^\s=:](\[\])+/g;

//     code.replace(mapOperatorHook, function(match) {
//         var replaceWith = match.replace(mapOperator, "[\'" + mapOperatorKey + "\']");

//         code = code.replace(match, replaceWith)
//     });

//     return code;
// }

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
        null,
        {num: 3}
    ];

    t.deepEqual(list[mapOperatorKey].id, [1, 2, null, undefined]);
    t.deepEqual(list[mapOperatorKey].num, [undefined, undefined, null, 3]);
});

test('custom function call on each object in array', t => {
    let list = [1, 2, 3, 4, 5];

    list = list[mapOperatorKey](n => n * 2);

    t.deepEqual(list, [2, 4, 6, 8, 10]);
});

test('keep record of index in map operator', t => {
    let list = [10, 20, 30, 40, 50];

    list = list[mapOperatorKey]((n, i) => (i + 1) + n);

    t.deepEqual(list, [11, 22, 33, 44, 55]);
});

// keep record of index in map operator + deep

test('set all properties in array of objects', t => {
    let list = [{ num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }];

    list[mapOperatorKey].num = 10;

    t.deepEqual(list, [{ num: 10 }, { num: 10 }, { num: 10 }, { num: 10 }, { num: 10 }]);
});

test('call inherited prototype method on properties in array', t => {
    let list = [[0], [0], [0]];

    list = list[mapOperatorKey](n => [10]);
    list[mapOperatorKey].push(20);

    t.deepEqual(list, [[10, 20], [10, 20], [10, 20]]);
});


test('deep array manipulation', t => {
    var list = [
        { a: [{ b: 10 }, { b: 15 }] },
        { a: [{ b: 20 }, { b: 25 }] }
    ];

    list = list[mapOperatorKey].a[mapOperatorKey].b[mapOperatorKey](n => n * 2);

    t.deepEqual(list, [
        { a: [{ b: 20 }, { b: 30 }] },
        { a: [{ b: 40 }, { b: 50 }] }
    ]);
})

// deep set all properties in objects


// test('deep selection of index in array', t => {
//     var list = [
//         { a: [{ b: 10 }, { b: 15 }] },
//         { a: [{ b: 20 }, { b: 25 }] }
//     ];

//     list = list[mapOperatorKey].a[0].b;

//     t.deepEqual(list, [10, 20]);
// });

// deep property set, get, method call, fn.


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
