/**
 * 芙宁娜工作陪伴 — 主入口
 */

import * as vscode from 'vscode';
import { FurinaChatPanel } from './chatPanel';
import { PomodoroTimer } from './pomodoro';
import { IdleWatcher } from './idleWatcher';
import { StatsTracker } from './stats';
import {
    getOpening,
    getWorkLine,
    getEncourageLine,
    getJudgment,
    getFocusStart,
    getFocusEnd,
    getBreakRemind,
    getBreakEnd,
    getFinale,
    getIdleRemind,
    getTimeBasedGreeting,
    getMonologue,
    getSnackRecommendation,
    getNeuvilletteEasterEgg,
} from './persona';
import {
    generateResponse,
    analyzeCodeProblems,
    CODE_ANALYSIS_KEYWORDS,
} from './dynamicReply';

export function activate(context: vscode.ExtensionContext): void {
    // ── 核心模块 ─────────────────────────────────────
    const panel = new FurinaChatPanel(context.extensionUri);
    const pomodoro = new PomodoroTimer();
    const stats = new StatsTracker(context.globalState);

    const idleWatcher = new IdleWatcher(() => {
        panel.addBotMessage(getIdleRemind());
    });

    // ── 常驻状态栏 ──────────────────────────────────
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100,
    );
    statusBar.text = '🎭 芙宁娜';
    statusBar.tooltip = '芙宁娜工作陪伴';
    statusBar.command = 'furina.openStage';
    const showStatusBar = vscode.workspace
        .getConfiguration('furina')
        .get<boolean>('enableStatusBar', true);
    if (showStatusBar) {
        statusBar.show();
    }
    context.subscriptions.push(statusBar);

    // ── 注册 Webview ─────────────────────────────────
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(FurinaChatPanel.viewType, panel),
    );

    // ── 用户消息处理 ──────────────────────────────────
    panel.setOnUserMessage((text) => {
        stats.recordMessage();
        panel.updateStats(stats.current);
        idleWatcher.reset();

        const lower = text.toLowerCase();
        if (CODE_ANALYSIS_KEYWORDS.some((k) => lower.includes(k))) {
            panel.addBotMessage(analyzeCodeProblems());
            return;
        }

        const reply = generateResponse(text);
        panel.addBotMessage(reply);
    });

    // ── 首次欢迎引导 ──────────────────────────────────
    const welcomed = context.globalState.get<boolean>('furina.welcomed', false);
    if (!welcomed) {
        panel.addBotMessage(
            '欢迎来到芙宁娜的舞台！初次见面，容我自我介绍——我是枫丹的水之大导演，芙宁娜。',
        );
        panel.addBotMessage(
            '📌 小提示：\n' +
            '• 在输入框跟我聊天，我会根据你说的话回复\n' +
            '• 按 Ctrl+Shift+P 搜索"芙宁娜"查看所有命令\n' +
            '• 试试"开始番茄钟专注"让我陪你计时\n' +
            '• 说"检查代码"让我帮你分析当前错误',
        );
        panel.addBotMessage(
            '好了，介绍完毕。准备好了就开始工作吧——聚光灯已经落下来了，别发呆。',
        );
        void context.globalState.update('furina.welcomed', true);
    } else {
        panel.addBotMessage(getTimeBasedGreeting());
    }

    // 初始推送统计
    panel.updateStats(stats.current);

    // ── 命令注册 ──────────────────────────────────────
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.openStage', () => {
            const msg = getOpening();
            panel.addBotMessage(msg);
            panel.addBotMessage(getTimeBasedGreeting());
            void vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
        }),

        vscode.commands.registerCommand('furina.startPomodoro', () => {
            if (pomodoro.isRunning) {
                panel.addBotMessage('诶？番茄钟已经在跑了啊~别急别急，先把当前这一幕演完！');
                return;
            }
            const config = vscode.workspace.getConfiguration('furina');
            const minutes = config.get<number>('pomodoroMinutes', 25);
            panel.addBotMessage(getFocusStart(minutes));

            pomodoro.start(minutes, (phase) => {
                switch (phase) {
                    case 'focus-end':
                        panel.addBotMessage(getFocusEnd());
                        stats.recordPomodoro();
                        panel.updateStats(stats.current);
                        break;
                    case 'break-start':
                        panel.addBotMessage(getBreakRemind());
                        break;
                    case 'break-end':
                        panel.addBotMessage(getBreakEnd());
                        break;
                }
            });
        }),

        vscode.commands.registerCommand('furina.stopPomodoro', () => {
            if (!pomodoro.isRunning) {
                panel.addBotMessage('番茄钟还没开始呢，急什么？');
                return;
            }
            pomodoro.stop();
            panel.addBotMessage('番茄钟被提前终止了。哼，虽然有点可惜，但也不是不能原谅。');
        }),

        vscode.commands.registerCommand('furina.encourageMe', () => {
            const msg = getEncourageLine();
            panel.addBotMessage(msg);
            void vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
        }),

        vscode.commands.registerCommand('furina.reviewWork', () => {
            const diagnostics = vscode.languages.getDiagnostics();
            const issues: string[] = [];
            for (const [uri, diags] of diagnostics) {
                for (const d of diags) {
                    if (d.severity === vscode.DiagnosticSeverity.Error) {
                        const fileName = vscode.workspace.asRelativePath(uri);
                        issues.push(
                            `${fileName}:${d.range.start.line + 1} — ${d.message}`,
                        );
                    }
                }
            }
            const totalErrors = issues.length;
            const topIssues = issues.slice(0, 10);
            if (issues.length > 10) {
                topIssues.push(`……以及另外 ${issues.length - 10} 项问题。`);
            }
            panel.addBotMessage(getJudgment(topIssues));
            void vscode.window.showInformationMessage(
                `🎭 芙宁娜开庭审判：发现 ${totalErrors} 项错误`,
            );
        }),

        vscode.commands.registerCommand('furina.finale', () => {
            const msg = getFinale(pomodoro.completedCount);
            panel.addBotMessage(msg);
            pomodoro.stop();
            void vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
        }),

        vscode.commands.registerCommand('furina.monologue', () => {
            panel.addBotMessage(getMonologue());
        }),

        vscode.commands.registerCommand('furina.snack', () => {
            panel.addBotMessage(getSnackRecommendation());
        }),

        vscode.commands.registerCommand('furina.neuvillette', () => {
            panel.addBotMessage(getNeuvilletteEasterEgg());
        }),
    );

    // ── 保存事件 → 统计 + 彩蛋 ──────────────────────
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(() => {
            stats.recordSave();
            panel.updateStats(stats.current);
            idleWatcher.reset();
            if (stats.current.todaySaves % 10 === 0) {
                panel.addBotMessage(getWorkLine());
            }
        }),
    );

    // ── 编辑事件 → 重置闲置 ──────────────────────────
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            idleWatcher.reset();
        }),
        vscode.window.onDidChangeActiveTextEditor(() => {
            idleWatcher.reset();
        }),
    );

    // ── 清理 ──────────────────────────────────────────
    context.subscriptions.push({
        dispose() {
            pomodoro.dispose();
            idleWatcher.dispose();
        },
    });
}

export function deactivate(): void { }
