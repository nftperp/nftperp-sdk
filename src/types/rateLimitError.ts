class RateLimitError extends Error {
    ratelimit: number;
    ratelimitRemaining: number;
    ratelimitReset: number;
    retryAfter: number;

    constructor(
        message: string,
        ratelimit: number,
        ratelimitRemaining: number,
        ratelimitReset: number,
        retryAfter: number
    ) {
        super(message);
        this.ratelimit = ratelimit;
        this.ratelimitRemaining = ratelimitRemaining;
        this.ratelimitReset = ratelimitReset;
        this.retryAfter = retryAfter;
    }
}

export default RateLimitError;
