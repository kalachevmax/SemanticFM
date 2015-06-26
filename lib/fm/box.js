

/**
 * @constructor
 * @implements {fm.IBox.<T>}
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
 * @inheritDoc
 */
fm.Box.prototype.get = function(opt_context) {
  if (typeof this.__nameOrValue === 'string') {
    var symbol = fm.getSymbol(this.__nameOrValue, opt_context);
		return symbol instanceof fm.Accumulator ? symbol.get() : symbol;
  }

  return this.__nameOrValue;
};
