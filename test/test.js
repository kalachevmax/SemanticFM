

var fm = require('../bin/semantic.fm.js');


function action(complete, cancel, input) {
  console.log(input);
  complete(++input);
}


function showMessage(complete, cancel, input) {
  console.log('eee!!');
  complete(input);
}


var showError = fm.async(function(input) {
  console.log('oops:', input);
});


function isGreat10(complete, cancel, input) {
  complete(input > 10);
}


function isLess12(complete, cancel, input) {
  complete(input < 12);
}


function square(item, complete, cancel) {
  complete(item * item);
}


var show = fm.async(function(input) {
  console.log(input);
});


fm.script([
  fm.if(fm.or(isGreat10), showMessage, showError),
  action,
  fm.if(fm.and(isGreat10, isLess12), showMessage, showError),
  action,
  fm.if(fm.and(isGreat10, isLess12), showMessage, showError)
])(console.log, console.log, 10);


fm.map(square)(console.log, console.log, [1,2,3,4,5]);

fm.script([
  fm.each(fm.script([
    action
  ]))
])(console.log, console.log, [1,2,3]);


fm.list.fork([10,20,30])(console.log, console.log, show);

fm.acts.fork([
  showMessage,
  showError
])(console.log, console.log, 100);
