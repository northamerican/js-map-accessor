# JS Map operator `[]`
A proposed JS operator with shim

The JS map operator allows property access and method execution on all objects in an array.

<a href="https://cdn.rawgit.com/northamerican/js-map-operator/master/index.html">**Demo**</a>
Outputs in console.

##Examples
###Method call
```js
Player = class Player {
    constructor() {
        this.mood = 'sad';
    }

    setMood(mood) {
        this.mood = mood;
        return this.mood;
    }
}

let players = [new Player(), new Player()];
```

Set mood for all players:
```js
players.forEach(player => player.setMood('happy'));
```
with `[]` map operator:
```js
players[].setMood('happy');
```

###Property access
```js
let list = [
    {id: 1},
    {id: 2},
    null,
    {num: 3}
];
```
Standard Array map, ignoring `null` and assuming `[]` would fail silently on missing properties:
```js
list.map(p => p === null ? null : p.id);
``` 
with `[]` map operator:
```js
list[].id;
```
output:
`> [1, 2, null, undefined]`

###Custom method call
```js
let list = [1, 2, 3, 4, 5];
```
Alter and overwrite numbers in an array:
```js
list = list.map(n => n * 2)
```
with `[]` map operator:
```js
list[](n => n * 2)
```

###Deep property access
```js
let products = [{
    id: 100,
    bins: [15, 16]
}, {
    id: 200,
    bins: [20, 22]
}]
```

Set the `bins` in all products to `[10]`:
```js
products.forEach(prod => prod.bins = [10])
```
```js
products[].bins = [10]
```

Push a new `bin` "`30`" to all `products`:
```js
products.forEach(prod => prod.bins.push(30))
```
```js
products[].bins[].push(30)
```

Multiply each `bin` by `10`:
```js
products.forEach(prod => {
    prod.bins = prod.bins.map(bin => bin * 10)
})
```
```js
products[].bins[][](bin => bin * 10)
```

##To-do
- Babel plugin
- Extend functionality to array-like objects like NodeList, to allow `$('div')[].style`
- Allow silent failing on deep property access using Proxies
- Tests!
- A stricter mode that fails when there's a null or missing property
- An even stricter mode that allow the map operator only on arrays containing objects of the same class
