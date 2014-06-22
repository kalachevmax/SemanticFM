

/**
 * @constructor
 * @implements {fm.IAccumulator}
 * @param {fm.List} list
 */
fm.ListAccumulator = function(list) {
  /**
   * @type {fm.List}
   */
  this.__list = list;
};


/**
 * @inheritDoc
 */
fm.ListAccumulator.prototype.get = function() {
  return this.__list;
};


/**
 * @inheritDoc
 */
fm.ListAccumulator.prototype.update = function(data) {
  this.__list.push(data);
};
