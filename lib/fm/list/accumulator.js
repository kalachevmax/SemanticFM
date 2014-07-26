

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.List=} opt_list
 */
fm.list.Accumulator = function(opt_list) {
  /**
   * @type {fm.List}
   */
  this.__list = opt_list || [];
};


/**
 * @inheritDoc
 */
fm.list.Accumulator.prototype.get = function() {
  return this.__list;
};


/**
 * @inheritDoc
 */
fm.list.Accumulator.prototype.update = function(data) {
  this.__list.push(data);
};
