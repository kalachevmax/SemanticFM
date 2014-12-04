

var script = fm.STRING([
  fm.STRING('types rocks!'),
  fm.NUMBER(123),

  fm.LIST(fm.Type.STRING, ['a', 'b', 'c']),
  fm.fold,

  fm.LIST_STRING(['a', 'b', 'c']),
  fm.fold
]);


script(handleSuccess, console.error);

function handleSuccess() {
  console.log('Operation successfully completed.');
}
