// Rate limiting utility for API calls
class RateLimiter {
    private static lastCallTime: number = 0;
    private static minInterval: number = 2000; // 2 seconds between calls

    static async waitIfNeeded(): Promise<void> {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;

        if (timeSinceLastCall < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastCall;
            console.log(`Rate limiting: waiting ${waitTime}ms before next API call`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastCallTime = Date.now();
    }
}

export default RateLimiter;
