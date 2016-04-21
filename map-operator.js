// Map operator "[]"

(() => {
    'strict mode';

    var mapOperatorName = '_mapOperator';

    var exceptions = {
        expectingFunction: 'A function was expected in the map operator'
    }

    Object.defineProperty(Array.prototype, mapOperatorName, {
        // obj[]
        get() { // put this in a function above Object.defineProperty
            var self = this; // give this a better name if possible
            // obj[](...);
            var mappedArray = function mappedArray() {
                if(typeof arguments[0] === 'undefined') throw exceptions.expectingFunction;

                var args = Array.from(arguments);
                var fn = args[0];
                var hasContext = self._mapOperatorContext;
                var baseArray = hasContext ? self._mapOperatorContext.base : self;
                var mapOperatorPath = hasContext ? self._mapOperatorContext.path : [];

                var propertiesPath = mapOperatorPath.filter(p => p !== '_mapOperator');
                var noDeepAccess = propertiesPath.length === 0;
                var propertiesPathIndex = 0;
                var isLastPath = () => propertiesPathIndex === propertiesPath.length - 1;

                var makeSetTargetProperty = index => {
                    var property = propertiesPath[index];
                    var setTargetProperty = obj => { // a[]
                        obj[property] = fn.call(self, obj[property]);

                        return obj;
                    };

                    return setTargetProperty;
                };

                var makeAccessProperty = index => {
                    var property = propertiesPath[index];
                    var accessProperty = obj => {
                        obj[property] = obj[property].map(makeSetTargetProperty(index + 1)); // obj[property + 1] ? makeAccessProperty(0) : makeSetTargetProperty(0)

                        return obj;
                    };

                    return accessProperty;
                };

                if(noDeepAccess) {
                    var result = baseArray.map(fn);
                } else {
                    var init = isLastPath()  ? makeSetTargetProperty(0) : makeAccessProperty(0);
                    var result = baseArray.map(init);
                }
                //! throw if mapOperator accessed twice in a row? [][]
                //! any reason to do that?

                // return hasContext ? self._mapOperatorContext.base : self;
                // self.map(obj => args[0].call(self, obj));
                return result;
            };

            var propertiesInArray = {}; // rename to propertyMetadata

            var getPropertiesInArray = (objInArray, i, array) => {
                if(!(objInArray instanceof Object)) return;

                var isArray = objInArray instanceof Array;
                var hasContext = '_mapOperatorContext' in self;
                var objPath = hasContext ? self._mapOperatorContext.path : [];

                // If the array has a _mapOperatorContext and it is an array
                // then get the properties of each of the arrays n levels in.
                if(isArray && hasContext && hasContext) {
                    objPath.forEach(property => {
                        if (property === mapOperatorName) return;

                        objInArray = objInArray[0];
                    });
                }

                var arrayIndices = Object.keys(array);
                var objectPrototype = Object.getPrototypeOf(objInArray);
                var propertiesInPrototype = Object.getOwnPropertyNames(objectPrototype);
                // Get the keys of the object, including the keys of its direct parent prototype
                var propertiesInObject = Object.keys(objInArray).concat(propertiesInPrototype).concat(arrayIndices);

                // For each property of this object,
                // record its type so its behavior can be set later
                propertiesInObject.forEach(propertyName => {
                    var property = objInArray[propertyName];
                    var propertyType = (() => {
                        if(property === null) {
                            return 'null';
                        } else if (property instanceof Function) {
                            return 'function';
                        } else {
                            return typeof property;
                        }
                    })();

                    // Don't redefine the method if it has already
                    // been defined in a prior object in the array.
                    // If one of existingType and propertyType is a function
                    // and the other isn't, throw error.
                    // if (propertyName in propertiesInArray) {
                    //     var existingType = propertiesInArray[propertyName];
                    //     ...
                    // }

                    // Avoid breaking _mapOperatorContext. Might not be needed?
                    if(propertyName === '_mapOperatorContext') return;

                    propertiesInArray[propertyName] = {
                        type: propertyType,
                    };
                });
            };

            // Create a property in the map operator
            var makeProperty = propertyName => {
                var property = propertiesInArray[propertyName];

                if(propertyName in mappedArray) return;

                if(property.type === 'function') {
                    Object.defineProperty(mappedArray, propertyName, {
                        // obj[].method()
                        value: function() { // (...arguments) =>
                            return self.map(objInArray => {
                                return objInArray[propertyName](...Array.from(arguments));
                            });
                        },
                        configurable: true
                    });
                } else {
                    Object.defineProperty(mappedArray, propertyName, {
                        // obj[].property;
                        get: function() {
                            var unwrapEachInside = target => {
                                return target.reduce((arr, property) => {
                                    if (property === mapOperatorName) return;

                                    arr.push(...property);

                                    return arr;
                                }, []);
                            };
                            var hasDepth = self._mapOperatorContext && self._mapOperatorContext.path.length;
                            var target = hasDepth ? unwrapEachInside(self) : self;
                            var mappedArray = target.map(objInArray => {
                                // Nothing to access, just return the property's value
                                if(!(objInArray instanceof Object)) return objInArray;

                                var propertyValue = objInArray[propertyName];

                                return propertyValue;
                            });

                            // Add property to the context chain
                            if('_mapOperatorContext' in this) {
                                // Inherit existing _mapOperatorContext
                                Object.defineProperty(mappedArray, '_mapOperatorContext', {
                                    value: this._mapOperatorContext,
                                    configurable: true
                                });
                                mappedArray._mapOperatorContext.path.push(propertyName);
                            } else {
                                // Create record of the original object's context
                                Object.defineProperty(mappedArray, '_mapOperatorContext', {
                                    value: {
                                        base: self,
                                        path: []
                                    },
                                    configurable: true
                                });
                            }

                            return mappedArray;
                        },
                        // obj[].property = 42;
                        set: function(value) {

                            // this can use similar logic as mappedArray()

                            self.forEach(objInArray => {
                                if(!(objInArray instanceof Object)) return;

                                objInArray[propertyName] = value;
                            });

                            if (self._mapOperatorContext) {
                                return self._mapOperatorContext.base;
                            } else {
                                return self;
                            }
                        },
                        configurable: true
                    });
                }
            };

            // Has the map operator been used on this object?
            if('_mapOperatorContext' in self) {
                // Pass the context to the map operator
                Object.defineProperty(mappedArray, '_mapOperatorContext', {
                    value: self._mapOperatorContext,
                    configurable: true
                });
                mappedArray._mapOperatorContext.path.push(mapOperatorName);
            } else {
                // Create record of the original object's context
                Object.defineProperty(mappedArray, '_mapOperatorContext', {
                    value: {
                        base: self,
                        path: []
                    },
                    configurable: true
                });
            }

            // Add the keys of every property in each
            // of the array's objects to the propertiesInArray object.
            self.forEach(getPropertiesInArray);


            // Create getters/setters or functions mapped to each
            // of the original array's object's properties.
            Object.keys(propertiesInArray).forEach(makeProperty);


            return mappedArray;
        }
    });
})();
