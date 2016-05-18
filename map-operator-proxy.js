const mapOperatorName = '_mapOperator';

const throwException = () => {
    throw ''
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

const allInArrayAreEqual = array => {
    let firstItem = array[0];
    return array.every(item => item === firstItem);
};

const typesInside = target => {
    let arrayOfTypes = target.map(typeOf);
    return allInArrayAreEqual(arrayOfTypes) ? arrayOfTypes[0] : throwException();
};


// Create record of the original object's context
// base: the original array the map operator was called on
// path: the path of the inner objects accessed.
//       arr[].a[].b   path: [[a], [b], []]
//       arr[].a.b     path: [[a, b], []]
const newMapOperatorContext = params => {
    Object.defineProperty(params.target, '_mapOperatorContext', {
        value: {
            base: params.base,
            paths: [[]]
        },
        configurable: true,
        writable: true
    });
};

// Create record of the original object's context
const setMapOperatorContext = params => {
    Object.defineProperty(params.target, '_mapOperatorContext', {
        value: params.using._mapOperatorContext,
        configurable: true,
        writable: true
    });
};


list = [
    {id: 1},
    {id: 2}
];


Object.defineProperty(Array.prototype, mapOperatorName, {
    // o[]
    get() {
        let originalArray = this;
        // o[](), o[].a[]()
        let mappedArrayFn = function(...args) {
            let hasContext = '_mapOperatorContext' in this;
            let base = hasContext ? this._mapOperatorContext.base : this;
            let paths = hasContext ? this._mapOperatorContext.paths : [];
            let hasPath = hasContext ? [].concat(...paths).length > 0 : false;

            // Access a property in the chain as a map
            let accessProperty = (index) => {
                let propertiesPath = paths[index];
                // Last path is empty, hence - 2
                let isLastPath = index === paths.length - 2;
                let lastProperty = lastInArray(propertiesPath);

                return (obj, i) => {
                    let targetObj = obj;
                    let typeOfLastProperty = typeOf(targetObj[lastProperty]);

                    propertiesPath.forEach((property, i) => {
                        let isLastProperty = i === propertiesPath.length - 1;

                        if (isLastProperty && isLastPath) return;

                        targetObj = targetObj[property];
                    });

                    if (isLastPath) {
                        if (typeOfLastProperty === 'function') {
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
                return base.map(args[0]);
            }

            // obj[].a[](...)
            return base.map(accessProperty(0));
        };
        let getter = function(originalMappedArray, property, receiver) {
            let target = originalArray;
            if (property in originalMappedArray) return originalMappedArray[property];

            let mappedArrayValue = target.map(item => item[property]);

            // o[].a();
            if (typesInside(mappedArrayValue) === 'function') {
                return (...args) => {
                    return target.map(objInArray => {
                        return objInArray[property](...args);
                    });
                }
            }

            

            let mappedArray = new Proxy(mappedArrayValue, {
                get: function(target, property, receiver) {
                    return target[property];
                }
            });

            // Inherit existing _mapOperatorContext
            setMapOperatorContext({
                target: mappedArray,
                using: originalMappedArray
            });

            console.log(originalMappedArray)

            // Add property to the context path
            lastInArray(mappedArray._mapOperatorContext.paths).push(property);


            return mappedArray;

        };
        let mappedArray = new Proxy(mappedArrayFn, {

            // o[].a
            get: getter,
            // get() {
            //     let target = parentIsAProperty ? this : self;
            //     let shouldUnwap = !parentIsAProperty && this._mapOperatorContext.paths.length > 1;
            //     //! v forEach this._mapOperatorContext.paths? try with really deep arrays
            //     let mappedArray = target.map(objInArray => {
            //         return shouldUnwap ? objInArray[mapOperatorName][propertyName] : objInArray[propertyName];
            //     });

            //     if (propertyType === 'function') {
            //         mappedArray = (...args) => {
            //             return self.map(objInArray => {
            //                 return objInArray[propertyName](...args);
            //             });
            //         }
            //     }

            //     // Inherit existing _mapOperatorContext
            //     setMapOperatorContext({
            //         target: mappedArray,
            //         base: this
            //     })
            //     // Add property to the context path
            //     lastInArray(mappedArray._mapOperatorContext.paths).push(propertyName);

            //     if (propertyType === 'object') {
            //         // Make property getters and setters for properties inside
            //         makeProperties({
            //             properties: getPropertyTypes(mappedArray),
            //             target: mappedArray,
            //             parentIsAProperty: true
            //         });
            //     }

            //     return mappedArray;
            // },
            set: function(target, property, value, receiver) {
                console.log(arguments)
                originalArray.forEach(objInArray => {
                    if (!(objInArray instanceof Object)) return;

                    objInArray[property] = value;
                });

                // if (self._mapOperatorContext) {
                //     return self._mapOperatorContext.base;
                // } else {
                //     return self;
                // }
                return originalArray;
            }
        });

        if ('_mapOperatorContext' in originalArray) {
            setMapOperatorContext({
                target: mappedArray,
                using: originalArray
            });
            mappedArray._mapOperatorContext.paths.push([]);
        } else {
            newMapOperatorContext({
                target: mappedArray,
                base: originalArray
            });
        }

        return mappedArray;
    }
});