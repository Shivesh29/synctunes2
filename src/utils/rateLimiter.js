class RateLimiter {
    constructor(limit, interval) {
        this.limit = limit;
        this.interval = interval;
        this.queue = [];
        this.requests = 0;
        this.timer = null;
    }

    schedule(request, priority = false) {
        return new Promise((resolve, reject) => {
            const task = { request, resolve, reject, priority };
            if (priority) {
                this.queue.unshift(task);
            } else {
                this.queue.push(task);
            }
            this.processQueue();
        });
    }

    processQueue() {
        if (this.requests < this.limit && this.queue.length > 0) {
            const { request, resolve, reject } = this.queue.shift();
            this.requests++;
            request()
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.requests--;
                    this.processQueue();
                });
        }

        if (!this.timer) {
            this.timer = setTimeout(() => {
                this.requests = 0;
                this.timer = null;
                this.processQueue();
            }, this.interval);
        }
    }
}

export default RateLimiter;
