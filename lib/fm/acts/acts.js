

/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fold = function(script) {
  /**
   * @param {!Function} complete
   * @param {!Function} cancel
   * @param {fm.Input=} opt_input
   */
  function fold(complete, cancel, opt_input) {
    var iterator = new fm.ArrayIterator(script);
    var accumulator = new fm.AtomAccumulator(opt_input);

    function process(item) {
      item(handleAction, cancel, accumulator.get());
    }

    function handleAction(result) {
      accumulator.update(result);
      fold(iterator, accumulator, process);
    }

    function fold(iterator, accumulator, process) {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        complete(accumulator.get());
      }
    }

    fold(iterator, accumulator, process);
  }

  return fold;
};


/**
 * @param {fm.Script} script
 * @param {number} amount
 * @return {fm.Action}
 */
fm.acts.foldLimit = function(script, amount) {
  /**
   * @param {!Function} complete
   * @param {!Function} cancel
   * @param {fm.Input=} opt_input
   */
  function foldLimit(complete, cancel, opt_input) {
    var processedActions = 0;

    var iterator = new fm.ArrayIterator(script);
    var accumulator = new fm.AtomAccumulator(opt_input);

    function process(item) {
      item(handleAction, cancel, accumulator.get());
    }

    function handleAction(result) {
      accumulator.update(result);
      processedActions += 1;
      fold(iterator, accumulator, process);
    }

    function fold(iterator, accumulator, process) {
      if (iterator.hasNext() && processedActions < amount) {
        process(iterator.next());
      } else {
        complete(accumulator.get());
      }
    }

    fold(iterator, accumulator, process);
  }

  return foldLimit;
};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fork = function(script) {
  /**
   * @param {!Function} complete
   * @param {!Function} cancel
   * @param {fm.Input=} opt_input
   */
  function fork(complete, cancel, opt_input) {
    var i = 0,
        l = script.length;

    while (i < l) {
      script[i](fm.nop, fm.nop, opt_input);
      i += 1;
    }

    complete(opt_input);
  }

  return fork;
};


/**
 * @param {fm.Script} script
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.acts.wrap = function(script, action) {
  /**
   * @param {!Function} complete
   * @param {!Function} cancel
   * @param {fm.Input=} opt_input
   */
  function wrap(complete, cancel, opt_input) {
    var iterator = new fm.ArrayIterator(script);
    var accumulator = new fm.AtomAccumulator(opt_input);

    function process(item) {
      item(handleAction, cancel, accumulator.get());
    }

    function handleAction(result) {
      accumulator.update(result);
      action(function() {
        fold(iterator, accumulator, process);
      }, cancel, accumulator.get());
    }

    function fold(iterator, accumulator, process) {
      if (iterator.hasNext()) {
        process(iterator.next());
      } else {
        complete(accumulator.get());
      }
    }

    fold(iterator, accumulator, process);
  }

  return wrap;
};
