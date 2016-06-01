{
'use strict';

const mapAccessorName = '_mapAccessor';

// Methods that should not be mapped to each object when using map accessor
// to prevent recursion and other weirdness.
const nativePropertiesOfObject = Object.getOwnPropertyNames(Object.prototype);
const nativePropertiesOfFunction = Object.getOwnPropertyNames(Function.prototype);
const nativeSymbolsOfSymbol = Object.getOwnPropertySymbols(Symbol.prototype);
const internalProperties = [mapAccessorName, '_mapAccessorContext'];
const allNativeProperties = [
    ...nativePropertiesOfObject,
    ...nativePropertiesOfFunction,
    ...nativeSymbolsOfSymbol,
    ...internalProperties
];

const indices = array => array.length - 1;
const flattenArray = array => [].concat(...array);
const lastInArray = array => array[indices(array)];
const isArrayOfFunctions = array => array.every(target => typeof target === 'function');
const throwNull = () => {
    throw TypeError('Cannot access properties of null using map accessor');
};

// Create record of the original object's context
// Used for referencing the original array in mappedArrayFn
// base: the original array the map accessor was called on
// path: the path of the inner objects accessed.
//       arr[].a[].b   paths: [[a], [b]]
//       arr[].a.b[]   paths: [[a, b], []]
const setMapAccessorContext = ({ target, base }) => {
    Object.defineProperty(target, '_mapAccessorContext', {
        value: getMapAccessorContext(base),
        configurable: true
    });
};
// Get the original context and paths of an array
// Return a new context if none exists
const getMapAccessorContext = base => {
    var context = base._mapAccessorContext;

    return context || newMapAccessorContext(base);
};

const newMapAccessorContext = base => ({
    base: base,
    paths: []
});

// arr[], arr[].arr2[]
const get = function() {
    // arr, arr2
    const originalArray = this;

    // arr[](), arr[].arr2[]()
    let mappedArrayFn = function(...args) {
        let { base, paths } = getMapAccessorContext(this);
        let hasPath = flattenArray(paths).length > 0;

        // Access a property in the chain as a map
        let accessProperty = (index = 0) => {
            // arr[]()
            if (!hasPath) {
                // Pass args into each function in array
                // ! this breaks "arr[] = x" if arr is an array of functions
                if (isArrayOfFunctions(this)) {
                    return fn => fn(...args);
                }
                return args[0];
            }

            let path = paths[index];
            // - 1 because length is one more than last index and
            // - 1 because the last path is always empty in this case
            let isLastPath = index >= paths.length - 1 - 1; // trash
            let lastProperty = lastInArray(path);

            return (target, i) => {
                let targetObj = target;

                // Recursively access inner properties of objects
                path.forEach((property, i) => {
                    let isLastProperty = i === indices(path) && isLastPath;

                    if (!isLastProperty) targetObj = targetObj[property];
                });

                if (isLastPath) {
                    targetObj[lastProperty] = args[0].call(this, targetObj[lastProperty], i);
                } else {
                    targetObj = targetObj.map(accessProperty(index + 1));
                }

                return target;
            };
        };

        // arr[].arr2[]()
        return base.map(accessProperty());
    };

    // arr[].a
    // target = arr[]
    // property = 'a'
    let get = function(target, property) {
        let paths = target._mapAccessorContext.paths;
        let isDeepMapped = paths.length > 1; // arr[].a[].b
        let isDeepObj = lastInArray(paths).length > 0; // arr[].a.b
        let mappedArrayValue;

        // Don't use map accessor when accessing certain properties
        if (allNativeProperties.includes(property)) {
            return target[property];
        }

        // Disable access by index
        // Removing causes recursion in ava test runner
        if (Number.isInteger(Number(property))) {
            return target[property];
        }

        if (isDeepObj) {
            mappedArrayValue = target.map(value => value === null ? throwNull() : value[property]);
        } else if (isDeepMapped) {
            mappedArrayValue = originalArray.map(value => value[mapAccessorName][property]);
        } else {
            mappedArrayValue = originalArray.map(value => value === null ? throwNull() : value[property]);
        }

        lastInArray(target._mapAccessorContext.paths).push(property);

        // arr[].a();
        if (isArrayOfFunctions(mappedArrayValue)) {
            // arr[].a(), arr[].a()
            mappedArrayValue = (...args) => {
                let { base, paths } = getMapAccessorContext(target);

                // Access a property in the chain as a map
                let accessProperty = (index = 0) => {
                    let path = paths[index];
                    let isLastPath = path === lastInArray(paths);
                    let lastProperty = lastInArray(path);

                    return (target, i) => {
                        let targetObj = target;

                        // Recursively access inner properties of objects
                        path.forEach((property, i) => {
                            let isLastProperty = i === indices(path) && isLastPath;

                            if (!isLastProperty) targetObj = targetObj[property];
                        });

                        if (isLastPath) {
                            targetObj = targetObj[lastProperty](...args);
                        } else {
                            targetObj = targetObj.map(accessProperty(index + 1));
                        }

                        return target;
                    };
                };

                return base.map(accessProperty());
            };
        }

        setMapAccessorContext({
            target: mappedArrayValue,
            base: target
        });

        return new Proxy(mappedArrayValue, { get, set });
    };

    // arr[].a = x
    // target = arr[]
    // property = 'a'
    // value = x
    let set = function(target, property, newValue) {
        setMapAccessorContext({
            target: target,
            base: target
        });
        lastInArray(target._mapAccessorContext.paths).push(property);
        // hack. when called directly, mappedArrayFn will have an empty path at the end.
        // in this case it is not present.
        // mappedArrayFn should actually remove the last path if it's empty.
        target._mapAccessorContext.paths.push([]);

        return mappedArrayFn.call(target, value => newValue);
    };

    setMapAccessorContext({
        target: mappedArrayFn,
        base: originalArray
    });
    mappedArrayFn._mapAccessorContext.paths.push([]);

    return new Proxy(mappedArrayFn, { get, set });
};
// arr[] = x
const set = function(value) {
    let newValue = this[mapAccessorName](target => value);
    // Clear the original array
    this.splice(0);
    // Replace the contents of the array with the desired value
    this.push(...newValue);
};

Object.defineProperty(Array.prototype, mapAccessorName, { get, set });

};