

/**
 * @constructor
 * @implements {just.fm.IAccumulator}
 * @param {just.fm.List} list
 */
just.fm.ListAccumulator = function(list) {
  /**
   * @type {just.fm.List}
   */
  this.__list = list;
};


/**
 * @inheritDoc
 */
just.fm.ListAccumulator.prototype.get = function() {
  return this.__list;
};


/**
 * @inheritDoc
 */
just.fm.ListAccumulator.prototype.update = function(data) {
  this.__list.push(data);
};
