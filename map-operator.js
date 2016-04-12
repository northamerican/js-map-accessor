// Map operator "[]"

(() => {
    'strict mode';

    Object.defineProperty(Array.prototype, '_mapOperator', {
        get() {
            // var _typeOf = function() {
            //     Object.assign(propertiesInArray, {
            //         // PropertyName: PropertyType
            //         [propertyName]: (() => {
            //             if(property === null) {
            //                 return 'null';
            //             } else if (property instanceof Function) {
            //                 return 'function';
            //             } else {
            //                 return typeof property;
            //             }
            //         })()
            //     });
            // };
            var propertiesInArray = {};
            var mappedArray = function mappedArray() {
                var args = Array.from(arguments);
                var isFunction = args[0] instanceof Function;

                if(isFunction) {
                    var result = this.map(args[0], this);

                    // Replace the array with the mapped result
                    // if passing a non-function
                    this.splice(0);
                    this.concat(result);

                    return result
                    // return this.map(args[0], this);
                } else {
                    var result = this.map(() => JSON.parse(JSON.stringify(args[0])), this);

                    // Replace the array with the mapped result
                    // if passing a non-function
                    this.splice(0);
                    this.concat(result);

                    return result
                }
            };

            // Add the keys of every property in each
            // of the array's objects to the propertiesInArray object.
            this.forEach(objInArray => {
                if(!(objInArray instanceof Object)) return;

                var objectPrototype = Object.getPrototypeOf(objInArray);
                // Get the keys of the object, including the keys of its direct parent prototype
                var propertiesInObject = Object.keys(objInArray).concat(Object.getOwnPropertyNames(objectPrototype));

                // For each property of this object,
                // record its type so its behavior can be set later
                propertiesInObject.forEach(propertyName => {
                    var property = objInArray[propertyName];

                    Object.assign(propertiesInArray, {
                        // PropertyName: PropertyType
                        [propertyName]: (() => {
                            if(property === null) {
                                return 'null';
                            } else if (property instanceof Function) {
                                return 'function';
                            } else {
                                return typeof property;
                            }
                        })()
                    });
                });
            });

            // Create getters/setters or functions mapped to each
            // of the original array's object's properties.
            Object.keys(propertiesInArray).forEach(propertyName => {
                var propertyType = propertiesInArray[propertyName];
                var self = this;

                if(propertyName in mappedArray) return; //! this skips non-enumerable methods like constructor and __proto__. yay or nay?

                if(propertyType === 'function') {
                    Object.defineProperty(mappedArray, propertyName, {
                        value: function() { // (...arguments) =>
                            return self.map(objInArray => {
                                console.log(objInArray)
                                return objInArray[propertyName](...Array.from(arguments));
                            });
                        },
                        configurable: true
                    });
                } else {
                    Object.defineProperty(mappedArray, propertyName, {
                        get: () => {
                            return this.map(objInArray => {
                                if(!(objInArray instanceof Object)) return objInArray;

                                var propertyValue = objInArray[propertyName];

                                return propertyValue;
                            });
                        },
                        set: (value) => {
                            this.forEach(objInArray => {
                                if(!(objInArray instanceof Object)) return;

                                objInArray[propertyName] = value;
                            });

                            return this;
                        },
                        configurable: true
                    });
                }
            });

            return mappedArray;
        }
    });
})();
