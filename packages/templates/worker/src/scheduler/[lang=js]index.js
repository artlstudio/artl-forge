import cron from 'node-cron';

export class Scheduler {
  jobs = [];
  logger;

  constructor(logger) {
    this.logger = logger;
  }

  add(schedule, job) {
    const task = cron.schedule(
      schedule,
      async () => {
        const startTime = Date.now();
        this.logger.info('Job started', { job: job.name });

        try {
          await job.handler(this.logger);
          const duration = Date.now() - startTime;
          this.logger.info('Job completed', { job: job.name, duration });
        } catch (error) {
          const duration = Date.now() - startTime;
          this.logger.error('Job failed', { job: job.name, error, duration });
        }
      },
      { scheduled: false }
    );

    this.jobs.push({ schedule, job, task });
    this.logger.info('Job registered', { job: job.name, schedule });
  }

  start() {
    for (const { task } of this.jobs) {
      task.start();
    }
    this.logger.info('Scheduler started', { count: this.jobs.length });
  }

  stop() {
    for (const { task } of this.jobs) {
      task.stop();
    }
    this.logger.info('Scheduler stopped');
  }
}
