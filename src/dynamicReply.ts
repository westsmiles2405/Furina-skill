/**
 * 芙宁娜动态回复引擎 — 关键词意图识别 + 角色化生成
 */

import * as vscode from 'vscode';
import {
    getComfort,
    getSolemnComfort,
    getEncourageLine,
    getWorkLine,
    getTimeBasedGreeting,
    getMonologue,
    getSnackRecommendation,
    getNeuvilletteEasterEgg,
} from './persona';

// ─── 关键词列表 ──────────────────────────────────────────

const SAD_KEYWORDS = [
    '难过', '伤心', '哭', '崩溃', '失败', '完蛋',
    '无语', '烦', '累', '郁闷', '焦虑', '绝望',
    '不行', '放弃', '痛苦',
];

const DEEP_SAD_KEYWORDS = [
    '去世', '死了', '离世', '走了', '不在了',
    '分手', '离婚', '自杀', '想死', '活不下去',
    '亲人', '永别', '葬礼', '丧',
];

const WORK_KEYWORDS = [
    '写代码', '编程', '调试', 'debug', '功能', '需求',
    '上线', '部署', '开发', '测试', '重构', '优化',
    '写完', 'code', '代码', '函数',
];

const ENCOURAGEMENT_KEYWORDS = [
    '加油', '鼓励', '打气', '支持', '帮忙',
    '信心', '坚持', '挺住', '可以', '行不行',
    '给力',
];

const GREETING_KEYWORDS = [
    '你好', '早上好', 'hi', 'hello', '嗨',
    '在吗', '芙宁娜',
];

const MONOLOGUE_KEYWORDS = ['独白', '演讲', '有感而发', '说两句', '舞台'];
const SNACK_KEYWORDS = ['甜品', '蛋糕', '下午茶', '吃', '饿', '零食', '饮料'];
const NEUVILLETTE_KEYWORDS = ['那维莱特', '大审判官', '法官', '审判长'];

export const CODE_ANALYSIS_KEYWORDS = [
    '分析', '诊断', '检查代码', '代码质量', '有没有错',
];

// ─── 意图分析 ──────────────────────────────────────────

type Intent =
    | 'deep_sad'
    | 'sad'
    | 'work'
    | 'encourage'
    | 'greeting'
    | 'monologue'
    | 'snack'
    | 'neuvillette'
    | 'unknown';

function analyzeIntent(text: string): Intent {
    const lower = text.toLowerCase();
    if (MONOLOGUE_KEYWORDS.some((k) => lower.includes(k))) { return 'monologue'; }
    if (SNACK_KEYWORDS.some((k) => lower.includes(k))) { return 'snack'; }
    if (NEUVILLETTE_KEYWORDS.some((k) => lower.includes(k))) { return 'neuvillette'; }
    if (DEEP_SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'deep_sad'; }
    if (SAD_KEYWORDS.some((k) => lower.includes(k))) { return 'sad'; }
    if (ENCOURAGEMENT_KEYWORDS.some((k) => lower.includes(k))) { return 'encourage'; }
    if (WORK_KEYWORDS.some((k) => lower.includes(k))) { return 'work'; }
    if (GREETING_KEYWORDS.some((k) => lower.includes(k))) { return 'greeting'; }
    return 'unknown';
}

function extractInfo(text: string): { type: string; detail: string } {
    const lower = text.toLowerCase();

    if (lower.includes('bug') || lower.includes('报错') || lower.includes('error')) {
        return { type: 'bug', detail: '嗯？又出错了？别慌，让本大导演来替你审理。先把报错信息呈上来吧。' };
    }
    if (lower.includes('deadline') || lower.includes('赶') || lower.includes('来不及')) {
        return { type: 'deadline', detail: '哼，时间紧迫？那就更不能乱。先把最关键的那一幕搞定，其余的可以延后。' };
    }
    if (lower.includes('同事') || lower.includes('老板') || lower.includes('领导')) {
        return { type: 'people', detail: '人际关系嘛……在舞台上，每个人都有自己的角色。关键是找到你们的默契，而不是硬碰硬。' };
    }
    return { type: 'general', detail: '' };
}

// ─── 主回复函数 ──────────────────────────────────────────

export function generateResponse(userMessage: string): string {
    const intent = analyzeIntent(userMessage);
    const info = extractInfo(userMessage);

    switch (intent) {
        case 'deep_sad':
            return getSolemnComfort();

        case 'sad':
            if (info.detail) {
                return `${getComfort()}\n\n${info.detail}`;
            }
            return getComfort();

        case 'encourage':
            return getEncourageLine();

        case 'work':
            if (info.detail) {
                return `${getWorkLine()}\n\n${info.detail}`;
            }
            return getWorkLine();

        case 'greeting':
            return getTimeBasedGreeting();

        case 'monologue':
            return getMonologue();

        case 'snack':
            return getSnackRecommendation();

        case 'neuvillette':
            return getNeuvilletteEasterEgg();

        default: {
            const responses = [
                '嗯？有话就说，别遮遮掩掩。',
                '怎么，对当前的工作有什么想说的吗？',
                '有什么需要本大导演帮忙的吗？',
                '你这个表情告诉我，你可能在想什么。说出来吧。',
                '好吧，我在听。尽管说出你的想法。',
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
}

// ─── 代码问题分析 ─────────────────────────────────────────

export function analyzeCodeProblems(): string {
    const diagnostics = vscode.languages.getDiagnostics();
    let errors = 0;
    let warnings = 0;
    const topIssues: string[] = [];

    for (const [uri, diags] of diagnostics) {
        for (const d of diags) {
            if (d.severity === vscode.DiagnosticSeverity.Error) {
                errors++;
                if (topIssues.length < 5) {
                    topIssues.push(
                        `🎭 [${uri.path.split('/').pop()}:${d.range.start.line + 1}] ${d.message}`,
                    );
                }
            } else if (d.severity === vscode.DiagnosticSeverity.Warning) {
                warnings++;
            }
        }
    }

    if (errors === 0 && warnings === 0) {
        return '哦？不错嘛，目前没有任何错误和警告。继续保持，别让我失望。';
    }

    const header =
        errors > 0
            ? `本大导演发现了 ${errors} 个错误和 ${warnings} 个警告！这场演出恐怕需要紧急修改剧本了。`
            : `没有错误，但有 ${warnings} 个警告。虽非致命，但精益求精才配得上本导演的舞台。`;

    const issues = topIssues.length > 0 ? '\n\n' + topIssues.join('\n') : '';

    const advice =
        errors > 3
            ? '\n\n先别慌。从最严重的那几个开始，一个一个处理。本大导演在这里盯着你。'
            : errors > 0
                ? '\n\n不算太糟，先解决 error，warning 可以稍后处理。快去修复，我等你的好消息。'
                : '';

    return `${header}${issues}${advice}`;
}
