# Javascript map accessor `[]`
A proposed extension to bracket notation accessors in Javascript.

The map accessor allows accessing properties and calling methods on nested objects with a simple syntax. 

##Examples
###Property access

Map a property from each object in an array to a new array:
```js
players = [
    {id: 1, mood: 'happy'},
    {id: 2, mood: 'sad'},
    {id: 3}
];
```
```js
players[].mood;

> ['happy', 'sad', undefined];
```


Access properties deeply nested inside arrays:
```js
arr = [{
    a: [
        { b: { c: 10 } },
        { b: { c: 15 } }
    ]
}, {
    a: [
        { b: { c: 20 } },
        { b: { c: 25 } }
    ]
}];
```
```js
arr[].a[].b.c;

> [[10, 15], [20, 25]]
```


Access an index within a multidimensional array:
```js
arr = [
    { a: [{ b: 10 }, { b: 15 }] },
    { a: [{ b: 20 }, { b: 25 }] },
    { a: [{ b: 30 }, { b: 35 }] }
];
```
```js
arr[].a[1].b; 

> [15, 25, 35]
```


###Method calls

Call a method in each object in an array:
```js
Player = function() {
    this.mood = 'sad';
};
Player.prototype.setMood = function(mood) {
    this.mood = mood;
    return this.mood;
};
```
```js
players[].setMood('happy');

players.mood 
> ['happy', 'happy'];

```


Call native methods on each object in an array:
```js
arr = [{
    a: [1, 2]
}, {
    a: [1, 2]
}];

```
```js
arr[].a.push(3);

arr[].a 
> [[1,2,3], [1,2,3]];
```


###Map accessor call

Call map function on nested properties in an array:
```js
arr = [
    { a: [{ b: 10 }, { b: 15 }] },
    { a: [{ b: 20 }, { b: 25 }] }
];
```
```js
arr[].a[].b[]((n, i) => i + n * 2);
> [
    { a: [{ b: 20 }, { b: 31 }] },
    { a: [{ b: 42 }, { b: 53 }] }
]
```


Call each function in an array with argument:
```js
fnArr = [(a, b) => a + b, (a, b) => a - b];
```
```js
fnArr[](16, 8); 
> [24, 8]

```


### Set properties

Set each property in each object in an array:
```js
arr = [{ a: 0 }, { a: 0 }];
```
```js
arr[].a = 42;

arr[].a; 
> [{ a: 42 }, { a: 42 }];
```


Set each property in a multidimensional array:
```js
arr = [{
    a: [0, 0]
}, {
    a: [0, 0]
}];

```
```js
arr[].a[][] = 42;
> [{
    a: [42, 42]
}, {
    a: [42, 42]
}];
```

##Requirements
A browser supporting JS [Proxies](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy).
Recent versions of Chrome, Firefox and Edge.

##How to use
- Install the map accessor babel plugin
- Test without babel plugin: Use `['_mapAccessor']` instead of `[]`.

##Issues
- See issues or report one
