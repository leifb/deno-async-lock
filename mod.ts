/**
 * A lock that can be used to synchronize async code.
 * Call `aquire` to aquire the lock manually. This will require you to release 
 * the lock again by calling the result of `aquire`.
 * Use `run` to let the lock handle the release.
 * 
 * If multiple calls to `aquire` are made while the lock has been taken
 * they will get the lock in the order they tried to aquire it (FIFO).
 * 
 * There are no timeouts. If the lock is never released, aquire will never resolve.
 */
export class Lock {

    private queue: Array<() => void>;
    private isTaken: boolean;

    constructor() {
        this.queue = [];
        this.isTaken = false;
    }

    /**
     * Aquires the lock and returns a method to release the lock again.
     * If the lock is taken right now, the promise will only resolve once the lock has been aquired.
     * 
     * If the result is never called, the lock will be taken indefinitely.
     * @returns The method to release the lock.
     */
    public aquire(): Promise<() => void> {
        return new Promise<() => void>(resolve => {
            // Define what to do when we take the lock
            const take = () => {
                // Mark lock as taken now
                this.isTaken = true;
                // Resolve with the method to release the lock
                resolve(() => {
                    this.isTaken = false;
                    this.callNext();
                });
            }

            // If the lock is not taken, take now
            if (!this.isTaken)
                return take();

            // Else queue the take
            this.queue.push(take);
        });
    }

    /**
     * Aquiers the lock, runs the executor and then releases the lock again.
     * Errors will be passed through, but the lock will still be released. 
     * @param executor The method to run. Can be async or sync.
     */
    public async run(executor: () => Promise<void> | void) {
        const release = await this.aquire();
        try {
            await executor();
        }
        finally {
            release();
        }
    }

    /**
     * Removes the first element from the queue and executes it.
     */
    private callNext() {
        const next = this.queue.shift()
        next && next();
    }

}