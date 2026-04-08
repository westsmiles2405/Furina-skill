/**
 * 闲置检测模块 — 在用户长时间无操作时发出芙宁娜式提醒
 */
import * as vscode from 'vscode';
import { getIdleRemind } from './persona';

export class IdleWatcher {
    private timer: ReturnType<typeof setTimeout> | undefined;
    private onIdle: (msg: string) => void;

    constructor(onIdle: (msg: string) => void) {
        this.onIdle = onIdle;
    }

    /** 重置闲置计时器（每次用户操作时调用） */
    reset(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }

        const config = vscode.workspace.getConfiguration('furina');
        const enabled = config.get<boolean>('enableIdleReminder', true);
        if (!enabled) {
            return;
        }

        const minutes = config.get<number>('idleMinutes', 30);
        this.timer = setTimeout(() => {
            const msg = getIdleRemind();
            vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
            this.onIdle(msg);
        }, minutes * 60 * 1000);
    }

    dispose(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
