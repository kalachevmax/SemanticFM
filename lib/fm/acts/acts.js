

/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fold = function(script) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
	 */
  function fold(complete, cancel, input, opt_context) {
    var iterator = new fm.list.Iterator(script);
    var accumulator = new fm.Accumulator(input);

    function process(action) {
      action(handleAction, cancel, accumulator.get(), opt_context);
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
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function foldLimit(complete, cancel, input) {
    var processedActions = 0;

    var iterator = new fm.list.Iterator(script);
    var accumulator = new fm.Accumulator(input);

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
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
	 * @param {!fm.ExecContext=} opt_context
   */
  function fork(complete, cancel, input, opt_context) {
    var i = 0,
        l = script.length;

    while (i < l) {
      script[i](fm.nop, console.log, input, opt_context);
      i += 1;
    }

    complete(input);
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
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function wrap(complete, cancel, input) {
    var iterator = new fm.list.Iterator(script);
    var accumulator = new fm.Accumulator(input);

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
