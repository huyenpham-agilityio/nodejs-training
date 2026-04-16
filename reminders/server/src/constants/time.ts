// Job retry configuration
export const MAX_JOB_ATTEMPTS = 3;
export const JOB_BACKOFF_DELAY = 1000; // 1 second in milliseconds

// Job retention periods (in seconds)
export const COMPLETED_JOBS_RETENTION_COUNT = 100;
export const COMPLETED_JOBS_RETENTION_AGE = 24 * 3600; // 24 hours

export const FAILED_JOBS_RETENTION_COUNT = 1000;
export const FAILED_JOBS_RETENTION_AGE = 7 * 24 * 3600; // 7 days

// Worker rate limiting
export const WORKER_CONCURRENCY = 5;
export const RATE_LIMITER_MAX_JOBS = 10; // max jobs per duration
export const RATE_LIMITER_DURATION = 1000; // 1 second in milliseconds
