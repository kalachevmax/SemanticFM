

/**
 * @constructor
 * @implements {just.fm.IIterator}
 * @param {!Array} array
 */
just.fm.ArrayIterator = function(array) {
  /**
   * @type {just.fm.List}
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
just.fm.ArrayIterator.prototype.hasNext = function() {
  return this.__position < this.__length;
};


/**
 * @return {just.fm.Atom}
 */
just.fm.ArrayIterator.prototype.next = function() {
  this.__position += 1;
  return this.__array.shift();
};
