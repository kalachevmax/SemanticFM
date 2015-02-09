

/**
 * @constructor
 * @template T
 * @param {string|T} nameOrValue
 */
fm.Box = function(nameOrValue) {
  /**
   * @type {string|T}
   */
  this.__nameOrValue = nameOrValue;
};


/**
 * @return {T}
 */
fm.Box.prototype.get = function() {
  if (typeof this.__nameOrValue === 'string') {
    return fm.getSymbol(this.__nameOrValue) || this.__nameOrValue;
  }

  return this.__nameOrValue;
};
