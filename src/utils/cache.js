class Cache {
    constructor(namespace, ttl, debug = false) {
        this.namespace = namespace;
        this.ttl = ttl;
        this.debug = debug;
    }

    log(message, data = {}) {
        if (this.debug) {
            console.log(`[Cache][${this.namespace}] ${message}`, data);
        }
    }

    getKey(key) {
        return `${this.namespace}:${key}`;
    }

    set(key, value) {
        const data = {
            value,
            expiry: Date.now() + this.ttl * 1000
        };
        localStorage.setItem(this.getKey(key), JSON.stringify(data));
        this.log('Set cache entry', { key, ttl: this.ttl });
    }

    get(key) {
        const data = JSON.parse(localStorage.getItem(this.getKey(key)));
        if (data) {
            if (data.expiry > Date.now()) {
                this.log('Cache hit', { key });
                return data.value;
            } else {
                this.log('Cache expired', { key });
                this.remove(key);
            }
        } else {
            this.log('Cache miss', { key });
        }
        return null;
    }

    has(key) {
        const data = JSON.parse(localStorage.getItem(this.getKey(key)));
        if (data && data.expiry > Date.now()) {
            this.log('Cache exists', { key });
            return true;
        }
        this.log('Cache does not exist or expired', { key });
        return false;
    }

    remove(key, onExpireCallback = null) {
        const data = JSON.parse(localStorage.getItem(this.getKey(key)));
        if (data && data.expiry <= Date.now() && onExpireCallback) {
            this.log('Cache expired, triggering callback', { key });
            onExpireCallback(key, data.value);
        }
        localStorage.removeItem(this.getKey(key));
        this.log('Removed cache entry', { key });
    }

    extendTTL(key, additionalTTL) {
        const data = JSON.parse(localStorage.getItem(this.getKey(key)));
        if (data && data.expiry > Date.now()) {
            data.expiry += additionalTTL * 1000;
            localStorage.setItem(this.getKey(key), JSON.stringify(data));
            this.log('Extended TTL', { key, additionalTTL });
        } else {
            this.log('Cannot extend TTL, cache entry does not exist or expired', { key });
        }
    }

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.namespace)) {
                localStorage.removeItem(key);
                this.log('Cleared cache entry', { key });
            }
        });
    }
}

export default Cache;
