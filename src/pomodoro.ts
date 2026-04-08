/**
 * 番茄钟计时器模块
 */
import * as vscode from 'vscode';
import { getFocusStart, getFocusEnd, getBreakRemind } from './persona';

export class PomodoroTimer {
    private timer: ReturnType<typeof setInterval> | undefined;
    private remaining = 0;
    private isBreak = false;
    private statusBarItem: vscode.StatusBarItem;
    private onTick: (msg: string) => void;
    private onComplete: (msg: string) => void;
    private totalPomodoros = 0;

    constructor(
        statusBarItem: vscode.StatusBarItem,
        onTick: (msg: string) => void,
        onComplete: (msg: string) => void
    ) {
        this.statusBarItem = statusBarItem;
        this.onTick = onTick;
        this.onComplete = onComplete;
    }

    get isRunning(): boolean {
        return this.timer !== undefined;
    }

    get completedCount(): number {
        return this.totalPomodoros;
    }

    start(): void {
        if (this.timer) {
            this.stop();
        }

        const config = vscode.workspace.getConfiguration('furina');
        const minutes = config.get<number>('pomodoroMinutes', 25);
        this.remaining = minutes * 60;
        this.isBreak = false;

        const msg = getFocusStart(minutes);
        this.onTick(msg);

        this.statusBarItem.text = `🎭 专注 ${this.formatTime(this.remaining)}`;
        this.statusBarItem.show();

        this.timer = setInterval(() => {
            this.remaining--;

            if (this.remaining <= 0) {
                if (!this.isBreak) {
                    // 专注结束，进入休息
                    this.totalPomodoros++;
                    const endMsg = getFocusEnd();
                    this.onComplete(endMsg);

                    const breakMin = config.get<number>('breakMinutes', 5);
                    this.remaining = breakMin * 60;
                    this.isBreak = true;

                    const breakMsg = getBreakRemind();
                    vscode.window.showInformationMessage(`🎭 芙宁娜：${breakMsg}`);
                    this.onTick(breakMsg);
                } else {
                    // 休息结束
                    this.stop();
                    const returnMsg = '休息结束了！回到舞台上来吧，下一幕还等着你呢。';
                    vscode.window.showInformationMessage(`🎭 芙宁娜：${returnMsg}`);
                    this.onComplete(returnMsg);
                    return;
                }
            }

            // 更新状态栏
            const label = this.isBreak ? '☕ 休息' : '🎭 专注';
            this.statusBarItem.text = `${label} ${this.formatTime(this.remaining)}`;
        }, 1000);
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        this.statusBarItem.text = '🎭 芙宁娜';
    }

    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}
