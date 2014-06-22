

/**
 * @param {fm.Script} script
 * @param {number=} opt_amount
 * @return {fm.Action}
 */
fm.acts.fold = function(script, opt_amount) {
  return function(atom, complete, cancel) {
    var context = this;
    var actionsAmount = opt_amount || script.length;
    var processedActions = 0;

    var iterator = new fm.ArrayIterator(script);
    var accumulator = new fm.AtomAccumulator(atom);

    function process(item) {
      item.call(context, accumulator.get(), handleAction, cancel);
    }

    function handleAction(result) {
      accumulator.update(result);
      processedActions += 1;
      fold(iterator, accumulator, process);
    }

    function fold(iterator, accumulator, process) {
      if (iterator.hasNext() && processedActions < actionsAmount) {
        process(iterator.next());
      } else {
        complete(accumulator.get());
      }
    }

    fold(iterator, accumulator, process);
  }
};


/**
 * @param {fm.Script} script
 * @return {fm.Action}
 */
fm.acts.fork = function(script) {
  return function(atom, complete, cancel) {
    var i = 0,
        l = script.length;

    while (i < l) {
      script[i].call(this, atom, fm.nop, fm.nop);
      i += 1;
    }

    complete(atom);
  }
};


/**
 * @param {fm.Script} script
 * @param {fm.Action} action
 * @return {fm.Action}
 */
fm.acts.wrap = function(script, action) {
  return function(atom, complete, cancel) {
    var context = this;

    var iterator = new fm.ArrayIterator(script);
    var accumulator = new fm.AtomAccumulator(atom);

    function process(item) {
      item.call(context, accumulator.get(), handleAction, cancel);
    }

    function handleAction(result) {
      accumulator.update(result);
      action.call(context, accumulator.get(), function() {
        fold(iterator, accumulator, process);
      }, cancel);
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
};
