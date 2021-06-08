# Deno-async-lock

A simple lock to synchronize async code.

## Example

```ts
// There is only one export: The `Lock` class
// Add version for production code
import { Lock } from "https://deno.land/x/async_lock/mod.ts";

// Creates a new lock
const lock = new Lock();

// Use the `run` method, also works with an async method
await lock.run(() => {
  console.log("hello");
});

// Or use the lock manually
const release = await lock.aquire();
console.log("world");
release();
```
