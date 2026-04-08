/**
 * 动态回复引擎 — 根据用户输入分析意图并生成芙宁娜的响应
 * 包含关键词匹配和基于情感的回复策略
 */

import { getComfort, getEncourageLine, getWorkLine } from './persona';

// ─── 情感识别关键词 ─────────────────────────────────────
const SAD_KEYWORDS = [
    '失败',
    '放弃',
    '难过',
    '伤心',
    '抑郁',
    '灰心',
    '崩溃',
    '累了',
    '累坏',
    '不行',
    '没办法',
    '无法',
    '绝望',
    '已完蛋',
    '完了',
];

const WORK_KEYWORDS = [
    '工作',
    '代码',
    'bug',
    '错误',
    '修复',
    '功能',
    '优化',
    '重构',
    '设计',
    '架构',
    '文档',
    '测试',
    '部署',
    '发布',
    '进度',
    '任务',
];

const ENCOURAGEMENT_KEYWORDS = [
    '加油',
    '打气',
    '鼓励',
    '支持',
    '给我力量',
    '没动力',
    '想放弃',
    '坚持不住',
    '提提神',
    '振作',
    '激励',
];

const GREETING_KEYWORDS = ['你好', '早上好', '晚上好', '嗨', 'hello', '芙宁娜'];

// ─── 动态回复模板 ──────────────────────────────────────

const DYNAMIC_RESPONSES: Record<string, () => string> = {
    sad: getComfort,
    encourage: getEncourageLine,
    work: getWorkLine,
    greeting: () => '哦？你在叫我？说吧，需要什么帮助？',
};

// ─── 分析函数 ─────────────────────────────────────────

function analyzeIntent(message: string): string {
    const lower = message.toLowerCase();

    // 情感分析优先
    if (SAD_KEYWORDS.some((k) => lower.includes(k))) {
        return 'sad';
    }
    if (ENCOURAGEMENT_KEYWORDS.some((k) => lower.includes(k))) {
        return 'encourage';
    }
    if (GREETING_KEYWORDS.some((k) => lower.includes(k))) {
        return 'greeting';
    }
    if (WORK_KEYWORDS.some((k) => lower.includes(k))) {
        return 'work';
    }

    // 默认回复
    return 'default';
}

/** 提取用户输入中的关键信息 */
function extractInfo(message: string): { type: string; detail?: string } {
    if (message.includes('代码') || message.includes('bug')) {
        return { type: 'code-review' };
    }
    if (message.includes('番茄') || message.includes('专注')) {
        return { type: 'pomodoro' };
    }
    if (message.includes('任务') || message.includes('工作')) {
        const detail = message
            .split(/任务|工作|做/)
            .slice(1)
            .join('')
            .trim();
        return { type: 'task', detail };
    }
    return { type: 'general' };
}

// ─── 公共 API ────────────────────────────────────────────

export function generateResponse(userMessage: string): string {
    const intent = analyzeIntent(userMessage);
    const info = extractInfo(userMessage);

    // 情感优先 → 任务分析 → 默认
    if (intent in DYNAMIC_RESPONSES) {
        return DYNAMIC_RESPONSES[intent]();
    }

    // 任务特定回复
    if (info.type === 'code-review') {
        const reviews = [
            '哦？要我看看你的代码？行吧，让我来评判一下。先把有问题的部分指给我看。',
            '代码？我准备好了。别让我失望，我对代码的要求可严格着呢。',
            '想要本大导演的专业审视？那你的代码最好足够体面。',
        ];
        return reviews[Math.floor(Math.random() * reviews.length)];
    }

    if (info.type === 'task' && info.detail) {
        const taskLines = [
            `"${info.detail}"……好吧，听起来还不错。具体怎么分解这个任务？让我替你理理思路。`,
            `所以你要做"${info.detail}"？那行，咱们先把它拆成几个小阶段，然后逐一推进。`,
            `哼，你总算决定任务的优先级了。"${info.detail}"就交给你了，别搞砸。`,
        ];
        return taskLines[Math.floor(Math.random() * taskLines.length)];
    }

    // 通用回复
    const defaults = [
        '嗯？有话就说，别遮遮掩掩。',
        '怎么，对当前的工作有什么想说的吗？',
        '有什么需要本大导演帮忙的吗？',
        '你这个表情告诉我，你可能在想什么。说出来吧。',
        '好吧，我在听。尽管说出你的想法。',
        '嗯哼。继续，我洗耳恭听。',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}
