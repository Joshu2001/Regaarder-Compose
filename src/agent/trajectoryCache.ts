import { CachedTrajectory, TrajectoryStep } from './types';

export class TrajectoryCacheManager {
  private cache: Map<string, CachedTrajectory> = new Map();

  private createKey(domain: string, intent: string): string {
    const cleanIntent = intent.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${domain}::${cleanIntent}`;
  }

  public get(domain: string, intent: string): CachedTrajectory | null {
    const key = this.createKey(domain, intent);
    const cached = this.cache.get(key);
    if (cached && cached.success) {
      return cached;
    }
    return null;
  }

  public save(domain: string, intent: string, steps: TrajectoryStep[]): void {
    const key = this.createKey(domain, intent);
    this.cache.set(key, {
      domain,
      intent,
      steps,
      success: true,
      timestamp: Date.now(),
      userCorrectionsCount: 0,
    });
  }

  public recordCorrection(domain: string, intent: string, correctedSteps: TrajectoryStep[]): void {
    const key = this.createKey(domain, intent);
    const existing = this.cache.get(key);
    this.cache.set(key, {
      domain,
      intent,
      steps: correctedSteps,
      success: true,
      timestamp: Date.now(),
      userCorrectionsCount: (existing?.userCorrectionsCount || 0) + 1,
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}
