

/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fold = function(script) {
  /**
   * @param {function(fm.Input)} complete
   * @param {function(string, number=)} cancel
   * @param {fm.Input} input
   */
  function fold(complete, cancel, input) {
    var iterator = new fm.ScriptIterator(script);
    var accumulator = new fm.Accumulator(input);

    function process(item) {
      var action = item[0];
      var args = item.slice(1);
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
   */
  function fork(complete, cancel, input) {
    var i = 0,
        l = script.length;

    while (i < l) {
      script[i](fm.nop, fm.nop, input);
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
