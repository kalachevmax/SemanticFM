

/**
 * @constructor
 * @implements {fm.IIterator}
 * @param {!Array} array
 */
fm.ArrayIterator = function(array) {
  /**
   * @type {fm.List}
   */
  this.__array = array.slice(0);

  /**
   * @type {number}
   */
  this.__position = 0;

  /**
   * @type {number}
   */
  this.__length = array.length;
};


/**
 * @return {boolean}
 */
fm.ArrayIterator.prototype.hasNext = function() {
  return this.__position < this.__length;
};


/**
 * @return {fm.Input}
 */
fm.ArrayIterator.prototype.next = function() {
  this.__position += 1;
  return this.__array.shift();
};
