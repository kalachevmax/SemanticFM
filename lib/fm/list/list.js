

/**
 * @param {just.fm.List} list
 * @return {just.fm.Action}
 */
just.fm.list.fold = function(list) {
  return function(action, complete, cancel) {
    var context = this;

    var iterator = new just.fm.ArrayIterator(list);
    var accumulator = new just.fm.ListAccumulator([]);

    function process(item) {
      action.call(context, item, handleAction, cancel);
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
};


/**
 * @param {just.fm.List} list
 * @return {just.fm.Action}
 */
just.fm.list.fork = function(list) {
  return function(action, complete, cancel) {
    var i = 0,
        l = list.length;

    while (i < l) {
      action.call(this, list[i], just.utils.nop, just.utils.nop);
      i += 1;
    }

    complete();
  }
};
