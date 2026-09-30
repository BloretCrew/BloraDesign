// native-dialog: global alert/confirm/prompt calls.
export function ask() {
  alert("hello");
  const ok = confirm("sure?");
  const name = prompt("name?");
  return { ok, name };
}
