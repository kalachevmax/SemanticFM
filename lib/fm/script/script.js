

/**
 * @param {just.fm.Script} script
 * @param {number=} opt_amount
 * @return {just.fm.Action}
 */
just.fm.script.fold = function(script, opt_amount) {
  return function(atom, complete, cancel) {
    var context = this;
    var actionsAmount = opt_amount || script.length;
    var processedActions = 0;

    var iterator = new just.fm.ArrayIterator(script);
    var accumulator = new just.fm.AtomAccumulator(atom);

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
 * @param {just.fm.Script} script
 * @return {just.fm.Action}
 */
just.fm.script.fork = function(script) {
  return function(atom, complete, cancel) {
    var i = 0,
        l = script.length;

    while (i < l) {
      script[i].call(this, atom, just.utils.nop, just.utils.nop);
      i += 1;
    }

    complete(atom);
  }
};


/**
 * @param {just.fm.Script} script
 * @param {just.fm.Action} action
 * @return {just.fm.Action}
 */
just.fm.script.wrap = function(script, action) {
  return function(atom, complete, cancel) {
    var context = this;

    var iterator = new just.fm.ArrayIterator(script);
    var accumulator = new just.fm.AtomAccumulator(atom);

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
