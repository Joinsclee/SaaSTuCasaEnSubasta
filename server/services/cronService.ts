import { propertyDataSync } from './propertyDataSync';

interface CronJobConfig {
  name: string;
  schedule: string; // Cron format: "0 2 * * *" for 2 AM daily
  handler: () => Promise<void>;
  enabled: boolean;
}

export class CronService {
  private jobs: CronJobConfig[] = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.setupDailySync();
  }

  private setupDailySync(): void {
    this.addJob({
      name: 'daily_property_sync',
      schedule: '0 2 * * *', // 2 AM daily
      handler: async () => {
        console.log('Starting scheduled daily property sync...');
        await propertyDataSync.performDailySync();
      },
      enabled: true
    });
  }

  addJob(job: CronJobConfig): void {
    this.jobs.push(job);
    if (job.enabled) {
      this.scheduleJob(job);
    }
  }

  private scheduleJob(job: CronJobConfig): void {
    // For now, implement simple daily check (in production would use proper cron library)
    const checkInterval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      // Simple check for 2 AM
      if (job.name === 'daily_property_sync' && hour === 2 && minute === 0) {
        job.handler().catch(error => {
          console.error(`Cron job ${job.name} failed:`, error);
        });
      }
    }, 60000); // Check every minute

    this.intervals.set(job.name, checkInterval);
  }

  enableJob(name: string): void {
    const job = this.jobs.find(j => j.name === name);
    if (job) {
      job.enabled = true;
      this.scheduleJob(job);
    }
  }

  disableJob(name: string): void {
    const job = this.jobs.find(j => j.name === name);
    if (job) {
      job.enabled = false;
      const interval = this.intervals.get(name);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(name);
      }
    }
  }

  // Manual sync trigger
  async triggerManualSync(): Promise<any> {
    console.log('Manual property sync triggered...');
    return await propertyDataSync.performDailySync();
  }

  getJobStatus(): Array<{name: string, enabled: boolean, nextRun?: string}> {
    return this.jobs.map(job => ({
      name: job.name,
      enabled: job.enabled,
      nextRun: job.enabled ? 'Próximas 2:00 AM' : undefined
    }));
  }
}

export const cronService = new CronService();