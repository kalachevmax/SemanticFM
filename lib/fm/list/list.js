

/**
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.list.walk = function(action) {
  /**
   * @param {!Function} complete
   * @param {!Function} cancel
   * @param {fm.List} list
   */
  function walk(complete, cancel, list) {
    var iterator = new fm.list.Iterator(list);

    function process(item) {
      action(walk, cancel, item);
    }

    function walk() {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        iterator.destroy();
        complete();
      }
    }

    walk();
  }

  return walk;
};


/**
 * @param {function(fm.Input, fm.Input, !Function, !Function)} fn
 * @param {fm.Input} base
 * @return {fm.Action}
 */
fm.list.fold = function(fn, base) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.List} list
   */
  function fold(complete, cancel, list) {
    var iterator = new fm.list.Iterator(list);
    var accumulator = fm.createAccumulator(base);

    function process(item) {
      fn(item, accumulator.get(), handleProcessed, cancel);
    }

    function handleProcessed(accumulatorValue) {
      accumulator.update(accumulatorValue);
      fold();
    }

    function fold() {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        iterator.destroy();
        complete(accumulator.get());
      }
    }

    fold();
  }

  return fold;
};


/**
 * @param {fm.ConditionAction} condition
 * @return {fm.Action}
 */
fm.list.filter = function(condition) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.List} list
   */
  function filter(complete, cancel, list) {
    var iterator = new fm.list.Iterator(list);
    var accumulator = new fm.list.Accumulator();

    function process(item) {
      condition(function(isPassed) {
        if (isPassed) {
          accumulator.update(item);
        }
        fold();
      }, cancel, item);
    }

    function fold() {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        iterator.destroy();
        complete(accumulator.get());
      }
    }

    fold();
  }

  return filter;
};


/**
 * @param {fm.List} list
 * @return {fm.Action}
 */
fm.list.fork = function(list) {
  /**
   * @param {function()} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Action} action
   */
  function fork(complete, cancel, action) {
    var i = 0,
        l = list.length;

    while (i < l) {
      action(fm.nop, fm.nop, list[i]);
      i += 1;
    }

    complete();
  }

  return fork;
};
