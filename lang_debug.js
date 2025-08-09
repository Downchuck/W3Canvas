export function info(v) {
  if (typeof(v) == 'object') {
    let z='';
    for (let i = 0; i < v.length; i++) {
      z+=i+':'+v[i]+', ';
    }
    z=z.substr(0,z.length-2);
    return z;
  }
  return "v is not an object";
}

export function programmerPanic(msg) {
  //alert(msg);
  console.trace();
  throw new Error("PANIC: " + msg);
}

export function checkNull(fn, args) {
  if (args.length > 0) {
    for (let j = 0; j < args.length; j++) {
      if (args[j] === null) {
        throw new Error("Arg[" + j + "] is null in " + fn + ".init()");
      }
    }
  }
}
