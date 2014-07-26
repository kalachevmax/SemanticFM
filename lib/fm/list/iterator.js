

/**
 * @constructor
 * @param {fm.List} list
 */
fm.list.Iterator = function(list) {
  /**
   * @type {fm.List}
   */
  this.__list = list;

  /**
   * @type {number}
   */
  this.__position = 0;
};


/**
 * @return {boolean}
 */
fm.list.Iterator.prototype.hasNext = function() {
  return typeof this.__list[this.__position + 1] !== 'undefined';
};


/**
 * @return {fm.Input}
 */
fm.list.Iterator.prototype.next = function() {
  return this.__list[++this.__position];
};


/**
 * @return {fm.Input}
 */
fm.list.Iterator.prototype.destroy = function() {
  this.__list = null;
  this.__position = 0;
};
