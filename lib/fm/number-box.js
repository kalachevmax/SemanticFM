

/**
 * @constructor
 * @implements {fm.IBox.<number>}
 * @param {string|number|!Array.<fm.IBox.<number>>} nameOrValueOrBoxes
 * @param {fm.BoxOperation=} opt_operation
 */
fm.NumberBox = function(nameOrValueOrBoxes, opt_operation) {
  /**
   * @type {string|number|!Array.<fm.IBox.<number>>}
   */
  this.__nameOrValueOrBoxes = nameOrValueOrBoxes;

  /**
   * @type {fm.BoxOperation}
   */
  this.__operation = opt_operation || fm.BoxOperation.NOP;
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.get = function(opt_context) {
  if (typeof this.__nameOrValueOrBoxes === 'string') {
    var symbol = fm.getSymbol(this.__nameOrValueOrBoxes, opt_context);

    if (symbol instanceof fm.Accumulator) {
      return symbol.get();
    } else if (typeof symbol === 'number') {
      return symbol;
    }
  }

  if (this.__nameOrValueOrBoxes instanceof Array) {
    switch (this.__operation) {
      case fm.BoxOperation.LENGTH:
        return this.__length(opt_context);

      case fm.BoxOperation.SUM:
        return this.__sum(opt_context);

      case fm.BoxOperation.DIV:
        return this.__div(opt_context);

      case fm.BoxOperation.MOD:
        return this.__mod(opt_context);

      case fm.BoxOperation.DIV_PLUS_1:
        return this.__divPlus1(opt_context);
    }

    return this.__nameOrValueOrBoxes[0].get();
  }

  if (typeof this.__nameOrValueOrBoxes === 'number') {
    return this.__nameOrValueOrBoxes;
  }

  return -1;
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.__length = function(opt_context) {
  return this.__nameOrValueOrBoxes[0].get(opt_context).length;
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.__sum = function(opt_context) {
  var result = 0;

  var i = 0,
      l = this.__nameOrValueOrBoxes.length;

  while (i < l) {
		var input = this.__nameOrValueOrBoxes[i];
    result += input instanceof fm.NumberBox ? input.get(opt_context) : input;
    i += 1;
  }

  return result;
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.__div = function(opt_context) {
  return Math.floor(this.__nameOrValueOrBoxes[0].get(opt_context) / this.__nameOrValueOrBoxes[1].get(opt_context));
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.__mod = function(opt_context) {
  return this.__nameOrValueOrBoxes[0].get(opt_context) % this.__nameOrValueOrBoxes[1].get(opt_context);
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {number}
 */
fm.NumberBox.prototype.__divPlus1 = function(opt_context) {
  var a = fm.unbox(this.__nameOrValueOrBoxes[0], opt_context);
  var b = fm.unbox(this.__nameOrValueOrBoxes[1], opt_context);
  return Math.floor(a/b) + (a % b === 0 ? 0 : 1);
};
