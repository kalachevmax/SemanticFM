

/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.list.walk = function(action) {
  return function(list, complete, cancel) {
    var context = this;
    var iterator = new fm.ArrayIterator(list);

    function process(item) {
      action.call(context, item, walk, cancel);
    }

    function walk() {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        complete();
      }
    }

    walk();
  }
};


/**
 * @param {function(fm.Input, fm.Input)} fn
 * @param {fm.Input} base
 * @return {fm.Action}
 */
fm.list.fold = function(fn, base) {
  return function(list, complete, cancel) {
    var context = this;

    var iterator = new fm.ArrayIterator(list);
    var accumulator = fm.createAccumulator(base);

    function process(item) {
      fn.call(context, item, accumulator.get(), handleProcessed, cancel);
    }

    function handleProcessed(accumulatorValue) {
      accumulator.update(accumulatorValue);
      fold();
    }

    function fold() {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        complete(accumulator.get());
      }
    }

    fold();
  }
};


/**
 * @param {fm.List} list
 * @return {fm.Action}
 */
fm.list.fork = function(list) {
  return function(action, complete, cancel) {
    var i = 0,
        l = list.length;

    while (i < l) {
      action.call(this, list[i], fm.nop, fm.nop);
      i += 1;
    }

    complete();
  }
};
