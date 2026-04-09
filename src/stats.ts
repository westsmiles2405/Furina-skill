/**
 * 芙宁娜数据统计 — 番茄钟 / 消息 / 保存 次数追踪
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

function todayStr(): string {
    return new Date().toISOString().slice(0, 10);
}

export class StatsTracker {
    private stats: FurinaStats;
    private static readonly KEY = 'furina.stats';

    constructor(private readonly state: vscode.Memento) {
        this.stats = state.get<FurinaStats>(StatsTracker.KEY, {
            totalPomodoros: 0,
            totalMessages: 0,
            totalSaves: 0,
            todayPomodoros: 0,
            todayMessages: 0,
            todaySaves: 0,
            lastActiveDate: todayStr(),
        });
        this.resetIfNewDay();
    }

    private resetIfNewDay(): void {
        const today = todayStr();
        if (this.stats.lastActiveDate !== today) {
            this.stats.todayPomodoros = 0;
            this.stats.todayMessages = 0;
            this.stats.todaySaves = 0;
            this.stats.lastActiveDate = today;
            this.persist();
        }
    }

    private persist(): void {
        void this.state.update(StatsTracker.KEY, this.stats);
    }

    public recordPomodoro(): void {
        this.resetIfNewDay();
        this.stats.totalPomodoros++;
        this.stats.todayPomodoros++;
        this.persist();
    }

    public recordMessage(): void {
        this.resetIfNewDay();
        this.stats.totalMessages++;
        this.stats.todayMessages++;
        this.persist();
    }

    public recordSave(): void {
        this.resetIfNewDay();
        this.stats.totalSaves++;
        this.stats.todaySaves++;
        this.persist();
    }

    public get current(): FurinaStats {
        this.resetIfNewDay();
        return { ...this.stats };
    }
}
