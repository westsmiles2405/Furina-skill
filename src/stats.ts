/**
 * 芙宁娜数据统计模块 — 记录工作陪伴数据
 */
import * as vscode from 'vscode';

export interface FurinaStats {
    totalPomodoros: number;
    totalMessages: number;
    totalSaves: number;
    todayPomodoros: number;
    todayMessages: number;
    todaySaves: number;
    lastActiveDate: string;
}

const STORAGE_KEY = 'furina.stats';

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export class StatsTracker {
    private stats: FurinaStats;

    constructor(private readonly globalState: vscode.Memento) {
        const saved = globalState.get<FurinaStats>(STORAGE_KEY);
        const today = todayStr();
        if (saved && saved.lastActiveDate === today) {
            this.stats = saved;
        } else {
            this.stats = {
                totalPomodoros: saved?.totalPomodoros ?? 0,
                totalMessages: saved?.totalMessages ?? 0,
                totalSaves: saved?.totalSaves ?? 0,
                todayPomodoros: 0,
                todayMessages: 0,
                todaySaves: 0,
                lastActiveDate: today,
            };
        }
    }

    get data(): Readonly<FurinaStats> {
        return this.stats;
    }

    recordPomodoro(): void {
        this.resetDayIfNeeded();
        this.stats.totalPomodoros++;
        this.stats.todayPomodoros++;
        this.save();
    }

    recordMessage(): void {
        this.resetDayIfNeeded();
        this.stats.totalMessages++;
        this.stats.todayMessages++;
        this.save();
    }

    recordSave(): void {
        this.resetDayIfNeeded();
        this.stats.totalSaves++;
        this.stats.todaySaves++;
        this.save();
    }

    private resetDayIfNeeded(): void {
        const today = todayStr();
        if (this.stats.lastActiveDate !== today) {
            this.stats.todayPomodoros = 0;
            this.stats.todayMessages = 0;
            this.stats.todaySaves = 0;
            this.stats.lastActiveDate = today;
        }
    }

    private save(): void {
        this.globalState.update(STORAGE_KEY, this.stats);
    }
}
