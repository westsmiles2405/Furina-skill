/**
 * 芙宁娜工作陪伴 — VS Code 扩展入口
 */
import * as vscode from 'vscode';
import { FurinaChatPanel } from './chatPanel';
import { PomodoroTimer } from './pomodoro';
import { IdleWatcher } from './idleWatcher';
import {
    getTimeBasedGreeting,
    getEncourageLine,
    getJudgment,
    getFinale,
    getWorkLine,
} from './persona';
import { generateResponse } from './dynamicReply';

let chatPanel: FurinaChatPanel;
let pomodoro: PomodoroTimer;
let idleWatcher: IdleWatcher;

export function activate(context: vscode.ExtensionContext) {
    // ─── 状态栏 ─────────────────────────────────────────
    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
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

    // ─── 侧边栏面板 ──────────────────────────────────────
    chatPanel = new FurinaChatPanel(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            FurinaChatPanel.viewType,
            chatPanel
        )
    );

    // ─── 番茄钟 ─────────────────────────────────────────
    pomodoro = new PomodoroTimer(
        statusBar,
        (msg) => chatPanel.addFurinaMessage(msg),
        (msg) => chatPanel.addFurinaMessage(msg)
    );

    // ─── 闲置监测 ──────────────────────────────────────
    idleWatcher = new IdleWatcher((msg) => chatPanel.addFurinaMessage(msg));

    // 用户输入时重置闲置计时器
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => idleWatcher.reset()),
        vscode.window.onDidChangeActiveTextEditor(() => idleWatcher.reset())
    );
    idleWatcher.reset();

    // ─── 命令注册 ──────────────────────────────────────

    // 开启今日舞台
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.openStage', () => {
            const greeting = getTimeBasedGreeting();
            chatPanel.addFurinaMessage(greeting);
            vscode.window.showInformationMessage(`🎭 芙宁娜：${greeting}`);
        })
    );

    // 开始番茄钟
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.startPomodoro', () => {
            pomodoro.start();
        })
    );

    // 结束番茄钟
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.stopPomodoro', () => {
            if (pomodoro.isRunning) {
                pomodoro.stop();
                const msg = '番茄钟被提前终止了。哼，虽然有点可惜，但也不是不能原谅。';
                chatPanel.addFurinaMessage(msg);
                vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
            } else {
                vscode.window.showInformationMessage('🎭 芙宁娜：番茄钟还没开始呢，急什么？');
            }
        })
    );

    // 给我打气
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.encourageMe', () => {
            const msg = getEncourageLine();
            chatPanel.addFurinaMessage(msg);
            vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
        })
    );

    // 审判我的代码
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.reviewWork', async () => {
            const diagnostics = vscode.languages.getDiagnostics();
            const issues: string[] = [];

            for (const [uri, diags] of diagnostics) {
                for (const d of diags) {
                    if (d.severity === vscode.DiagnosticSeverity.Error) {
                        const fileName = vscode.workspace.asRelativePath(uri);
                        issues.push(
                            `${fileName}:${d.range.start.line + 1} — ${d.message}`
                        );
                    }
                }
            }

            // 最多展示 10 条
            const topIssues = issues.slice(0, 10);
            if (issues.length > 10) {
                topIssues.push(`……以及另外 ${issues.length - 10} 项问题。`);
            }

            const judgment = getJudgment(topIssues);
            chatPanel.addFurinaMessage(judgment);
            vscode.window.showInformationMessage(
                `🎭 芙宁娜开庭审判：发现 ${issues.length} 项错误`
            );
        })
    );

    // 今日谢幕
    context.subscriptions.push(
        vscode.commands.registerCommand('furina.finale', () => {
            const msg = getFinale(pomodoro.completedCount);
            chatPanel.addFurinaMessage(msg);
            vscode.window.showInformationMessage(`🎭 芙宁娜：${msg}`);
        })
    );

    // ─── 用户消息回复 ─────────────────────────────────
    chatPanel.setOnUserMessage((text) => {
        const reply = generateResponse(text);
        chatPanel.addFurinaMessage(reply);
    });

    // ─── 用户消息回复 ─────────────────────────────────
    chatPanel.setOnUserMessage((text) => {
        const reply = generateResponse(text);
        chatPanel.addFurinaMessage(reply);
    });

    // ─── 启动问候 ──────────────────────────────────────
    const greeting = getTimeBasedGreeting();
    chatPanel.addFurinaMessage(greeting);

    // 工作时偶尔插话
    let editCount = 0;
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(() => {
            editCount++;
            if (editCount % 10 === 0) {
                const line = getWorkLine();
                chatPanel.addFurinaMessage(line);
            }
        })
    );
}

export function deactivate() {
    if (idleWatcher) {
        idleWatcher.dispose();
    }
    if (pomodoro?.isRunning) {
        pomodoro.stop();
    }
}
