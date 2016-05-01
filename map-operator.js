// Map operator "[]"

(() => {
    'strict mode';

    const mapOperatorName = '_mapOperator';

    const exceptions = {
        expectingFunction: new TypeError('Map operator expects function as argument')
    };

    const removeFromArray = (string, array) => {
        let index = array.indexOf(string);

        array.splice(index, 1);
    };

    const uniqueArray = array => {
        return [...new Set(array)];
    }

    const lastInArray = array => {
        let lastIndex = array.length - 1;

        return array[lastIndex];
    }

    const typeOf = target => {
        if (target === null) {
            return 'null';
        } else if (target instanceof Function) {
            return 'function';
        } else {
            return typeof target;
        }
    };

    let newMapOperatorContext = params => {
        // Create record of the original object's context
        Object.defineProperty(params.target, '_mapOperatorContext', {
            value: {
                base: params.base,
                paths: [[]]
            }
        });
    }

    // obj[]
    let mapOperatorBase = function() {
        // `self` refers to the array on which the map operator was used.
        let self = this;
        // obj[], obj[](...)
        let mappedArray = (...args) => {

            // if (every item in self is a function) { // for [fn, fn, fn]()
            //     return self.map(fn => fn(...args));
            // } else
            if (typeof args[0] !== 'function') {
                throw exceptions.expectingFunction;
            }

            let fn = args[0];
            let hasContext = '_mapOperatorContext' in self;
            let baseArray = hasContext ? self._mapOperatorContext.base : self;
            let mapOperatorPaths = hasContext ? self._mapOperatorContext.paths : [];
            let hasPath = hasContext ? [].concat(...mapOperatorPaths).length > 0 : false;
            let result;

            // Access a property in the chain as a map
            let accessProperty = (index) => {
                let propertiesPath = mapOperatorPaths[index];
                let isLastPath = index === mapOperatorPaths.length - 1;

                return (obj, i) => {
                    let targetObj = obj;
                    let property;
                    let isLastProperty = isLastPath && i === propertiesPath.length - 1;

                    console.log('accessing deep paths, properties:', propertiesPath)
                    // Access the deep object targeted by the current path
                    for (property of propertiesPath) {
                        if (isLastProperty) break;
                        targetObj = targetObj[property];

                        console.log(property)
                        console.log('results', targetObj)

                        // Proxy or throw error here
                    }

                    if (isLastPath) {
                        console.log('obj[property]', property)
                        obj[property] = fn.call(self, targetObj, i);
                    } else {
                        targetObj = targetObj.map(accessProperty(index + 1));
                    }

                    return obj;
                };
            };

            // obj[](...)
            if (!hasPath) {
                return baseArray.map(fn);
            }

            // empty path at end (last path) should instead trigger .map(fn) or fn.call(self, targetObj, i)
            mapOperatorPaths.splice(-1);

            // obj[].a[](...)
            return baseArray.map(accessProperty(0));
        };

        // Get the types of every property in each of the array's objects
        let getPropertyTypes = array => {
            let propertiesInArray = {};

            // array.forEach(o => {
            //     Object.assign(propertiesInArraysObjects, o);
            // });

            array.forEach((itemInArray, i) => {
                if (itemInArray === null) return;
                if (itemInArray === undefined) return;

                let isArray = itemInArray instanceof Array;
                let hasContext = '_mapOperatorContext' in array;
                let objPath = hasContext ? lastInArray(array._mapOperatorContext.paths) : [];

                // If the array has a _mapOperatorContext and it is an array
                // then get the properties of each of the arrays n levels in.
                if (isArray) { //! && objPath.length ?
                    objPath.forEach(property => {
                        // if (property === mapOperatorName) return;

                        itemInArray = itemInArray[0];
                    });
                }

                // keys of obj in obj[]
                let itemProperties = Object.getOwnPropertyNames(itemInArray);
                let propertiesInPrototype = Object.getOwnPropertyNames(Object.getPrototypeOf(itemInArray));

                // For each property of this object,
                // record its type so its behavior can be set later
                uniqueArray([...itemProperties, ...propertiesInPrototype])
                .forEach(propertyName => {
                    // if(!(propertyName in itemInArray)) {
                    //     throw 'mismatch'
                    // };
                    let property = itemInArray[propertyName];


                    // Don't redefine the method if it has already
                    // been defined in a prior object in the array.
                    // if (propertyName in propertiesInArray) {
                    //     let existingType = propertiesInArray[propertyName];

                    //     if(existingType !== typeOf(property)) {

                    //     };
                    // }

                    // If one of existingType and propertyType is a function
                    // and the other isn't, throw error.

                    propertiesInArray[propertyName] = typeOf(property);
                });
            });

            // delete propertiesInArray.length
            // delete propertiesInArray._mapOperator
            // delete propertiesInArray._mapOperatorContext
            // delete propertiesInArray.forEach
            // delete propertiesInArray.map
            return propertiesInArray;
        };

        let makeProperties = params => {
            let properties = Object.keys(params.properties);

            properties.forEach(propertyName => {
                let propertyType = params.properties[propertyName];
                let parentIsAProperty = params.parentIsAProperty;

                Object.defineProperty(params.target, propertyName, {
                    // obj[].property, obj[].property.property...
                    get() {
                        // obj[].method()
                        if (propertyType === 'function') {
                            return (...args) => {
                                return self.map(objInArray => {
                                    return objInArray[propertyName](...args);
                                });
                            }
                        }

                        let target = parentIsAProperty ? this : self;

                        let shouldUnwap = !parentIsAProperty && this._mapOperatorContext && this._mapOperatorContext.paths.length > 1;
                        let mappedArray = target.map(objInArray => {
                            return shouldUnwap ? objInArray[mapOperatorName][propertyName] : objInArray[propertyName];
                        });

                        // Inherit existing _mapOperatorContext
                        Object.defineProperty(mappedArray, '_mapOperatorContext', {
                            value: this._mapOperatorContext
                        });
                        // Add property to the context path
                        lastInArray(mappedArray._mapOperatorContext.paths).push(propertyName);

                        // Make property getters and setters for properties inside
                        makeProperties({
                            properties: getPropertyTypes(mappedArray),
                            target: mappedArray,
                            parentIsAProperty: true
                        });

                        return mappedArray;
                    },
                    // obj[].property = 42;
                    set(value) {

                        let target = parentIsAProperty ? this : self;

                        // Inherit existing _mapOperatorContext
                        Object.defineProperty(target, '_mapOperatorContext', {
                            value: this._mapOperatorContext
                        });
                        // Add property to the context path
                        lastInArray(target._mapOperatorContext.paths).push(propertyName);

                        // Make property getters and setters for properties inside
                        makeProperties({
                            properties: getPropertyTypes(target),
                            target: target,
                            parentIsAProperty: true
                        });

                        return target[mapOperatorName](item => item = value);
                    }
                });
            });
        };

        // Create getters/setters or functions mapped to each
        // of the original array's object's properties.
        makeProperties({
            properties: getPropertyTypes(self),
            target: mappedArray,
        });

        // Has the map operator been used on this object?
        if ('_mapOperatorContext' in self) {
            // Pass the context to the map operator
            Object.defineProperty(mappedArray, '_mapOperatorContext', {
                value: self._mapOperatorContext
            });
            mappedArray._mapOperatorContext.paths.push([]);
        } else {
            newMapOperatorContext({
                target: mappedArray,
                base: self
            });
        }

        return mappedArray;
    }

    Object.defineProperty(Array.prototype, mapOperatorName, {
        get: mapOperatorBase
    });
})();
