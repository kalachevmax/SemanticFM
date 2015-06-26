

/**
 * @constructor
 * @implements {fm.IBox.<string>}
 * @param {string|!Array.<fm.IBox.<string>>} nameOrValueOrBoxes
 * @param {fm.BoxOperation=} opt_operation
 */
fm.StringBox = function(nameOrValueOrBoxes, opt_operation) {
  /**
   * @type {string|!Array.<fm.IBox.<string>>}
   */
  this.__nameOrValueOrBoxes = nameOrValueOrBoxes;

  /**
   * @type {fm.BoxOperation}
   */
  this.__operation = opt_operation || fm.BoxOperation.NOP;
};


/**
 * @param {!fm.ExecContext=} opt_context
 * @return {string}
 */
fm.StringBox.prototype.get = function(opt_context) {
  if (typeof this.__nameOrValueOrBoxes === 'string') {
    var symbol = fm.getSymbol(this.__nameOrValueOrBoxes, opt_context);

    if (symbol instanceof fm.Accumulator) {
      return symbol.get();
    } else {
      return typeof symbol === 'string' ? symbol : this.__nameOrValueOrBoxes;
    }
  }

  if (this.__nameOrValueOrBoxes instanceof Array) {
    switch (this.__operation) {
      case fm.BoxOperation.CONCAT:
        return this.__concat();
    }

    return this.__nameOrValueOrBoxes[0].get();
  }

  return '';
};


/**
 * @return {string}
 */
fm.StringBox.prototype.__concat = function() {
  var result = '';

  var i = 0,
      l = this.__nameOrValueOrBoxes.length;

  while (i < l) {
    result += this.__nameOrValueOrBoxes[i].get();
    i += 1;
  }

  return result;
};
