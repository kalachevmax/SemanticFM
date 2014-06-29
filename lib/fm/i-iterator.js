

/**
 * @interface
 */
fm.IIterator = function() {};


/**
 * @return {boolean}
 */
fm.IIterator.prototype.hasNext = function() {};


/**
 * @return {fm.Input}
 */
fm.IIterator.prototype.next = function() {};
