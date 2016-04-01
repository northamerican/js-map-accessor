// Map operator "[]" shim 
// arr[[]] works as arr[]

(() => {
    'strict mode';

    // The internal name used for the shim
    if(!window.mapOperatorShimMethodName) {
        var mapOperatorShimMethodName = '';
    }

    var MappedArray = function MappedArray() {
        if (!arguments[0] instanceof Function) return this;

        var result = Array.prototype.map.apply(this, arguments);

        // Replace the array with the mapped result
        this.splice(0);
        this.push(...result);

        return result;
    }

    Object.defineProperty(Array.prototype, mapOperatorShimMethodName, {
        get: function() {
            var propertiesInArray = {};
            var methods = MappedArray; //new MappedArray?

            // Add the keys of every property in each
            // of the array's objects to the propertiesInArray object.
            this.forEach(objInArray => {
                if(!(objInArray instanceof Object)) return;

                var objectPrototype = Object.getPrototypeOf(objInArray);
                // Get the keys of the object, including the keys of its direct parent prototype
                var propertiesInObject = [...Object.keys(objInArray), ...Object.getOwnPropertyNames(objectPrototype)];

                // For each property of this object,
                // Record the type of this property so it can be properly used by the map operator 
                propertiesInObject.forEach(propertyName => {
                    var property = objInArray[propertyName];

                    //! Check for matching types among all objects in the array and throw if there's a mismatch
                    //! "TypeError: 'id' in objects must be same type."

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

                //! probably necessary
                delete methods[propertyName];

                if(propertyType === 'function') {
                    Object.defineProperty(methods, propertyName, {
                        value: (...args) => {
                            return this.map(objInArray => objInArray[propertyName](...args));
                        },
                        configurable: true
                    });
                } else {
                    Object.defineProperty(methods, propertyName, {
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

            return methods;
        }
    });
})();
