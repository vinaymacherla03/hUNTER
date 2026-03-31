
type Task<T> = () => Promise<T>;

export class RequestScheduler {
  private queue: { task: Task<any>; resolve: (value: any) => void; reject: (reason?: any) => void; retries: number }[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minDelay = 3000; // Increased to 3s to be even more conservative with quotas

  add<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject, retries: 0 });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    
    // 1. Rate Limiting
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.minDelay) {
      await new Promise(r => setTimeout(r, this.minDelay - timeSinceLast));
    }

    const item = this.queue.shift();
    if (!item) {
        this.isProcessing = false;
        return;
    }

    try {
      // 2. Execute Task
      const result = await item.task();
      this.lastRequestTime = Date.now();
      item.resolve(result);
    } catch (error: any) {
      // 3. Smart Error Handling & Retries
      let msg = '';
      try {
          msg = (error.message || JSON.stringify(error)).toLowerCase();
      } catch (e) {
          msg = String(error).toLowerCase();
      }

      const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted');
      const isServerOverload = msg.includes('503') || msg.includes('500') || msg.includes('overloaded');

      if ((isRateLimit || isServerOverload) && item.retries < 6) {
        // More aggressive exponential backoff for persistent limit issues
        const backoff = Math.pow(2.5, item.retries + 2) * 1000; 
        console.warn(`[Scheduler] Quota/Server error detected. Retrying in ${Math.round(backoff/1000)}s... (Attempt ${item.retries + 1}/6)`);
        
        await new Promise(r => setTimeout(r, backoff));
        
        // Re-queue at the front
        this.queue.unshift({ ...item, retries: item.retries + 1 });
      } else {
        console.error("[Scheduler] Request failed permanently:", error);
        item.reject(error);
      }
    } finally {
      this.isProcessing = false;
      // Continue processing queue
      if (this.queue.length > 0) {
          this.process();
      }
    }
  }
}

export const scheduler = new RequestScheduler();
