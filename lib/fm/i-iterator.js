

/**
 * @interface
 */
fm.IIterator = function() {};


/**
 * @return {boolean}
 */
fm.IIterator.prototype.hasNext = function() {};


/**
 * @return {fm.Atom}
 */
fm.IIterator.prototype.next = function() {};
