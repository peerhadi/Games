import * as ex from 'excalibur';

globalThis.ex = ex;
declare global {
  var ex: typeof ex
}
