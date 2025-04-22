export class RateLimiter {
  constructor(limit, interval) {
    this.limit = limit;
    this.interval = interval;
    this.queue = [];
    this.activeRequests = 0;
  }

  async schedule(fn) {
    if (this.activeRequests >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.activeRequests++;
    try {
      const result = await fn();
      return result;
    } catch (error) {
      if (error.status === 429) {
        console.warn('Rate limit exceeded. Retrying with exponential backoff...');
        await this.exponentialBackoff();
        return this.schedule(fn);
      }
      throw error;
    } finally {
      this.activeRequests--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }

  async exponentialBackoff(attempt = 1) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 16000); // Max delay of 16 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
