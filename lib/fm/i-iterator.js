

/**
 * @interface
 */
just.fm.IIterator = function() {};


/**
 * @return {boolean}
 */
just.fm.IIterator.prototype.hasNext = function() {};


/**
 * @return {just.fm.Atom}
 */
just.fm.IIterator.prototype.next = function() {};
