import Lox from "./lox.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const lox = new Lox;
  lox.main();
}
