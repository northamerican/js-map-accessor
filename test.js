import test from 'ava';
import './map-operator';

const mapOperatorKey = '_mapOperator';

// assume obj[mapOperatorKey] === obj[]

var evalMapOperator = code => {
    var mapOperator = /\[\]/g;
    // Not a perfect way to detect usage of [] operator but good enough for a demo
    var mapOperatorHook = /[^\s=:](\[\])+/g;

    code.replace(mapOperatorHook, function(match) {
        var replaceWith = match.replace(mapOperator, "[\'" + mapOperatorKey + "\']");

        code = code.replace(match, replaceWith)
    });

    return code;
}

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

test('custom method call without function', t => {
    let list = [1, 2, 3, 4, 5];

    list = list[mapOperatorKey](0);

    t.deepEqual(list, [0, 0, 0, 0, 0]);
});

test('call inherited prototype method on properties in array', t => {
    let list = [[0], [0], [0]];

    list = list[mapOperatorKey]([10]);
    list[mapOperatorKey].push(20);

    t.deepEqual(list, [[10, 20], [10, 20], [10, 20]]);
});


test('deep array manipulation', t => {
    let albums = [{
        editions: [15, 20]
    }, {
        editions: [30, 40]
    }];

    albums = albums[mapOperatorKey].editions[mapOperatorKey][mapOperatorKey](edition => edition * 10);

    // console.log(albums);

    t.deepEqual(albums, [{
        editions: [150, 200]
    }, {
        editions: [300, 400]
    }]);
});
