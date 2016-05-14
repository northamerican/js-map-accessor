// Map operator "[]"
{

'strict mode';

const mapOperatorName = '_mapOperator';

const nativePropertiesOfObject = Object.getOwnPropertyNames(Object.getPrototypeOf({}));
const nativePropertiesOfFunction = Object.getOwnPropertyNames(Object.getPrototypeOf(Function));
// 'map', 'forEach', '_mapOperator', '_mapOperatorContext',

const exceptions = {
    // expectingFunction: new TypeError('Map operator expects function as argument')
};

const removeFromArray = (excludeList, array) => {
    excludeList.forEach(string => {
        let indexOfString = array.indexOf(string);

        while (indexOfString !== -1) {
            array.splice(indexOfString, 1);
            indexOfString = array.indexOf(string);
        }

    });
}

const uniqueArray = array => {
    return [...new Set(array)];
};

const lastInArray = array => {
    let lastIndex = array.length - 1;

    return array[lastIndex];
};

const throwException = () => {
    throw '';
};

const typeOf = target => {
    if (target === null) {
        return 'null';
    } else {
        return typeof target;
    }
};

const allInArrayAreEqual = array => {
    let firstItem = array[0];
    return array.every(item => item === firstItem);
};

const typesInside = target => {
    let arrayOfTypes = target.map(typeOf);
    return allInArrayAreEqual(arrayOfTypes) ? arrayOfTypes[0] : throwException();
};

// Create record of the original object's context
const newMapOperatorContext = params => {
    Object.defineProperty(params.target, '_mapOperatorContext', {
        value: {
            base: params.base,
            paths: [[]]
        }
    });
};

// Create record of the original object's context
const setMapOperatorContext = params => {
    Object.defineProperty(params.target, '_mapOperatorContext', {
        value: params.base._mapOperatorContext
    });
};

// Get the types of every property in each of the array's objects
const getPropertyTypes = array => {
    let propertiesInArray = {};
    let getOwnPropertyTypes = (itemInArray, i) => {
        // if (itemInArray === null) return;
        // if (itemInArray === undefined) return;

        let isArray = itemInArray instanceof Array;
        let hasContext = '_mapOperatorContext' in array;
        let objPath = hasContext ? lastInArray(array._mapOperatorContext.paths) : [];


        // let propertyIsFirstInPath = hasContext ? lastInArray(array._mapOperatorContext.paths).length === 0 : true;

        // If the array has a _mapOperatorContext and it is an array
        // then get the properties of each of the arrays n levels in.
        // objPath.length...
        if (isArray) {
            objPath.forEach(property => {
                itemInArray = itemInArray[0];
            });
        }

        let itemProperties = Object.keys(itemInArray);
        let propertiesInPrototype = Object.getOwnPropertyNames(Object.getPrototypeOf(itemInArray));

        // Methods that should not be mapped to each object in the array
        removeFromArray([...nativePropertiesOfObject, ...nativePropertiesOfFunction], propertiesInPrototype);

        // For each property of this object,
        // record its type so its behavior can be set later
        uniqueArray([...itemProperties, ...propertiesInPrototype])
        .forEach(propertyName => {
            let property = itemInArray[propertyName];

            // Don't redefine the method if it has already
            // been defined in a prior object in the array.
            if (propertyName in propertiesInArray) {
                let existingType = propertiesInArray[propertyName];

                if (existingType !== typeOf(property)) {
                    // console.log(propertiesInArray[propertyName], property)
                    // console.log(existingType, typeOf(property))
                    
                    throw propertyName + '. was ' + existingType + '. is ' + typeOf(property)
                    //throwException(); //! untested
                };
            }

            // If one of existingType and propertyType is a function
            // and the other isn't, throw error.


            if(propertyName === 'id') debugger;
            propertiesInArray[propertyName] = typeOf(property);
        });
    }

    array.forEach(getOwnPropertyTypes);

    return propertiesInArray;
};

// obj[]
const mapOperatorBase = function() {
    // `self` refers to the array on which the map operator was used.
    let self = this;
    // obj[], obj[](...)
    let mappedArray = (...args) => {

        let hasContext = '_mapOperatorContext' in this;
        let baseArray = hasContext ? this._mapOperatorContext.base : this;
        let mapOperatorPaths = hasContext ? this._mapOperatorContext.paths : [];
        let hasPath = hasContext ? [].concat(...mapOperatorPaths).length > 0 : false;

        // Access a property in the chain as a map
        let accessProperty = (index) => {
            let propertiesPath = mapOperatorPaths[index];
            let isLastPath = index === mapOperatorPaths.length - 1;
            let lastProperty = lastInArray(propertiesPath);

            return (obj, i) => {
                let targetObj = obj;

                propertiesPath.forEach((property, i) => {
                    let isLastProperty = isLastPath && i === propertiesPath.length - 1;

                    if (isLastProperty) return;
                    targetObj = targetObj[property];

                    //throw error here
                });

                if (isLastPath) {
                    if (typeof targetObj[lastProperty] === 'function') {
                        targetObj = targetObj[lastProperty](...args);
                    } else {
                        targetObj[lastProperty] = args[0].call(this, targetObj[lastProperty], i);
                    }
                } else {
                    targetObj = targetObj.map(accessProperty(index + 1));
                }

                return obj;
            };
        };

        // obj[](...)
        if (!hasPath) {
            if (typesInside(this) === 'function') {
                return this.map(fn => fn(...args));
            }
            return baseArray.map(args[0]);
        }

        // empty path at end (last path) should instead trigger .map(fn) or fn.call(this, targetObj, i)
        mapOperatorPaths.splice(-1);

        // obj[].a[](...)
        return baseArray.map(accessProperty(0));
    };

    let makeProperties = params => {
        let properties = Object.keys(params.properties);

        properties.forEach(propertyName => {
            let propertyType = params.properties[propertyName];
            let parentIsAProperty = params.parentIsAProperty;

            Object.defineProperty(params.target, propertyName, {
                // obj[].property, obj[].property.property...
                get() {
                    let target = parentIsAProperty ? this : self;
                    let shouldUnwap = !parentIsAProperty && this._mapOperatorContext.paths.length > 1;

                    //! v forEach this._mapOperatorContext.paths? try with really deep arrays
                    let mappedArray =  target.map(objInArray => {
                        return shouldUnwap ? objInArray[mapOperatorName][propertyName] : objInArray[propertyName];
                    });

                    if (propertyType === 'function') {
                        mappedArray = (...args) => {
                            return self.map(objInArray => {
                                return objInArray[propertyName](...args);
                            });
                        }
                    }

                    // Inherit existing _mapOperatorContext
                    setMapOperatorContext({
                        target: mappedArray,
                        base: this
                    })
                    // Add property to the context path
                    lastInArray(mappedArray._mapOperatorContext.paths).push(propertyName);

                    if (propertyType === 'object') {
                        // Make property getters and setters for properties inside
                        makeProperties({
                            properties: getPropertyTypes(mappedArray),
                            target: mappedArray,
                            parentIsAProperty: true
                        });
                    }

                    return mappedArray;
                },
                // obj[].property = 42;
                set(value) {
                    let target = parentIsAProperty ? this : self;

                    // Inherit existing _mapOperatorContext
                    setMapOperatorContext({
                        target: target,
                        base: this
                    });
                    // Add property to the context path
                    lastInArray(target._mapOperatorContext.paths).push(propertyName);

                    return target[mapOperatorName](item => value);
                }
            });
        });
    };

    // Create getters/setters or functions mapped to each
    // of the original array's object's properties.
    makeProperties({
        properties: getPropertyTypes(this),
        target: mappedArray,
    });

    if ('_mapOperatorContext' in this) {
        setMapOperatorContext({
            target: mappedArray,
            base: this
        });
        mappedArray._mapOperatorContext.paths.push([]);
    } else {
        newMapOperatorContext({
            target: mappedArray,
            base: this
        });
    }

    return mappedArray;
};

Object.defineProperty(Array.prototype, mapOperatorName, {
    get: mapOperatorBase
});

};
