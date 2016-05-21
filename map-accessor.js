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

const flattenArray = array => [].concat(...array);
const lastInArray = array => array[array.length - 1];
const isArrayOfFunctions = array => array.every(target => typeof target === 'function');
const throwNull = () => {
    throw TypeError('Cannot access properties of null using map accessor');
}

// Create record of the original object's context
// Used for referencing the original array in mappedArrayFn
// base: the original array the map accessor was called on
// path: the path of the inner objects accessed.
//       arr[].a[].b   path: [[a], [b]]
//       arr[].a.b[]   path: [[a, b], []]
const newMapAccessorContext = params => {
    Object.defineProperty(params.target, '_mapAccessorContext', {
        value: {
            base: params.base,
            paths: [[]]
        }
    });
};

// Target inherits record of the original object's context
const setMapAccessorContext = params => {
    Object.defineProperty(params.target, '_mapAccessorContext', {
        value: params.base._mapAccessorContext
    });
};

// arr[], arr[].arr2[]
const get = function() {
    // arr, arr2
    const originalArray = this;

    // arr[](), arr[].arr2[]()
    let mappedArrayFn = function(...args) {
        let hasContext = '_mapAccessorContext' in this;
        let base = this;
        let paths = [];
        let hasPath = false;

        // Access a property in the chain as a map
        let accessProperty = (index) => {
            let propertiesPath = paths[index];
            // Last path is empty and 'length' is one larger than index, hence '- 2'
            let isLastPath = index >= paths.length - 2;
            let lastProperty = lastInArray(propertiesPath);

            return (target, i) => {
                let targetObj = target;

                propertiesPath.forEach(property => {
                    let isLastProperty = property === lastInArray(propertiesPath);

                    if (isLastProperty && isLastPath) return;

                    targetObj = targetObj[property];
                });

                if (isLastPath) {
                    targetObj[lastProperty] = args[0].call(this, targetObj[lastProperty], i);
                } else {
                    targetObj = targetObj.map(accessProperty(index + 1));
                }

                return target;
            };
        };

        if (hasContext) {
            base = this._mapAccessorContext.base;
            paths = this._mapAccessorContext.paths;
            hasPath = flattenArray(paths).length > 0;
        }

        // arr[]()
        if (!hasPath) {
            if (isArrayOfFunctions(this)) {
                return this.map(fn => fn(...args));
            }
            return base.map(args[0]);
        }

        // arr[].arr2[]()
        return base.map(accessProperty(0));
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
            mappedArrayValue = originalArray.map(value => {
                if (typeof value[property] === 'function') {
                    return value[property];
                } else {
                    return value[mapAccessorName][property];
                }
            });
        } else {
            mappedArrayValue = originalArray.map(value => value === null ? throwNull() : value[property]);
        }

        // arr[].a();
        if (isArrayOfFunctions(mappedArrayValue)) {
            mappedArrayValue = (...args) => {
                return originalArray.map(value => {
                    return value[property](...args);
                });
            };
        }

        // arr[].a.b...
        let mappedArray = new Proxy(mappedArrayValue, { get, set });

        setMapAccessorContext({
            target: mappedArray,
            base: target
        });
        lastInArray(mappedArray._mapAccessorContext.paths).push(property);

        return mappedArray;
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

        return mappedArrayFn.call(target, value => newValue);
    };

    let mappedArray = new Proxy(mappedArrayFn, { get, set });

    if ('_mapAccessorContext' in originalArray) {
        setMapAccessorContext({
            target: mappedArray,
            base: originalArray
        });
        mappedArray._mapAccessorContext.paths.push([]);
    } else {
        newMapAccessorContext({
            target: mappedArray,
            base: originalArray
        });
    }

    return mappedArray;
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