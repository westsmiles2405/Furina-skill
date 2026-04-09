/**
 * 芙宁娜 Webview 侧边栏面板
 */
import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { FurinaStats } from './stats';

function getNonce(): string {
    return crypto.randomBytes(16).toString('hex');
}

interface PendingMessage {
    from: 'furina' | 'user';
    text: string;
}

export class FurinaChatPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'furina.chatPanel';
    private view?: vscode.WebviewView;
    private messages: PendingMessage[] = [];
    private onUserMessage?: (text: string) => void;
    private latestStats?: FurinaStats;

    constructor(private readonly extensionUri: vscode.Uri) { }

    public setOnUserMessage(handler: (text: string) => void): void {
        this.onUserMessage = handler;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHtml();

        webviewView.webview.onDidReceiveMessage((data) => {
            if (data.type === 'userMessage' && typeof data.text === 'string') {
                const trimmed = data.text.trim();
                if (trimmed && trimmed.length <= 500) {
                    this.messages.push({ from: 'user', text: trimmed });
                    this.trimMessages();
                    this.syncMessages();
                    this.onUserMessage?.(trimmed);
                }
            }
        });

        this.syncMessages();
    }

    public addBotMessage(text: string): void {
        this.messages.push({ from: 'furina', text });
        this.trimMessages();
        this.syncMessages();
    }

    public updateStats(stats: FurinaStats): void {
        this.latestStats = stats;
        if (this.view) {
            this.view.webview.postMessage({
                type: 'updateStats',
                stats,
            });
        }
    }

    private trimMessages(): void {
        const MAX_MESSAGES = 200;
        if (this.messages.length > MAX_MESSAGES) {
            this.messages = this.messages.slice(this.messages.length - MAX_MESSAGES);
        }
    }

    private syncMessages(): void {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'messages',
            messages: this.messages,
        });
        if (this.latestStats) {
            this.view.webview.postMessage({
                type: 'updateStats',
                stats: this.latestStats,
            });
        }
    }

    private getHtml(): string {
        const nonce = getNonce();
        return /*html*/ `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <title>芙宁娜的舞台</title>
  <style nonce="${nonce}">
    :root {
      --furina-blue: #6ec6ff;
      --furina-gold: #ffd54f;
      --furina-bg: var(--vscode-editor-background, #1e1e2e);
      --furina-fg: var(--vscode-editor-foreground, #cdd6f4);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      background: var(--furina-bg);
      color: var(--furina-fg);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--furina-blue);
      text-align: center;
      font-size: 14px;
      color: var(--furina-blue);
      font-weight: 600;
    }
    .header span {
      color: var(--furina-gold);
      font-size: 12px;
      display: block;
      margin-top: 2px;
    }
    /* 统计面板 */
    .stats-bar {
      display: flex;
      justify-content: space-around;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(110, 198, 255, 0.15);
      font-size: 11px;
      color: rgba(205, 214, 244, 0.7);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--furina-gold);
    }
    #chat {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .msg {
      max-width: 90%;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease;
      word-wrap: break-word;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    .msg .avatar {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
    }
    .msg .bubble { flex: 1; min-width: 0; }
    .msg .name {
      font-size: 11px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .msg.furina {
      align-self: flex-start;
      background: rgba(110, 198, 255, 0.12);
      border: 1px solid rgba(110, 198, 255, 0.25);
      color: var(--furina-fg);
    }
    .msg.furina .name { color: var(--furina-blue); }
    .msg.furina .avatar { background: rgba(110, 198, 255, 0.2); }
    .msg.user {
      align-self: flex-end;
      flex-direction: row-reverse;
      background: rgba(255, 213, 79, 0.1);
      border: 1px solid rgba(255, 213, 79, 0.2);
    }
    .msg.user .name { color: var(--furina-gold); text-align: right; }
    .msg.user .avatar { background: rgba(255, 213, 79, 0.2); }
    /* 打字机光标 */
    .typing-cursor {
      display: inline-block;
      width: 2px;
      height: 14px;
      background: var(--furina-blue);
      margin-left: 2px;
      animation: blink 0.6s infinite;
      vertical-align: text-bottom;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .input-area {
      display: flex;
      padding: 8px 12px;
      gap: 8px;
      border-top: 1px solid rgba(110, 198, 255, 0.2);
    }
    #userInput {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(110, 198, 255, 0.3);
      color: var(--furina-fg);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 13px;
      outline: none;
    }
    #userInput:focus { border-color: var(--furina-blue); }
    #sendBtn {
      background: var(--furina-blue);
      color: #1e1e2e;
      border: none;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 13px;
      cursor: pointer;
      font-weight: 600;
    }
    #sendBtn:hover { opacity: 0.85; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    🎭 芙宁娜的舞台
    <span>工作陪伴 · 番茄钟 · 审判席</span>
  </div>
  <div class="stats-bar">
    <div class="stat-item"><span class="stat-value" id="statPomodoro">0</span><span>🍅 番茄</span></div>
    <div class="stat-item"><span class="stat-value" id="statMsg">0</span><span>💬 对话</span></div>
    <div class="stat-item"><span class="stat-value" id="statSave">0</span><span>💾 保存</span></div>
  </div>
  <div id="chat"></div>
  <div class="input-area">
    <input id="userInput" type="text" placeholder="对芙宁娜说点什么…" maxlength="500" />
    <button id="sendBtn">发送</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const chat = document.getElementById('chat');
    const input = document.getElementById('userInput');
    const btn = document.getElementById('sendBtn');

    let renderedCount = 0;
    let typeQueue = [];
    let isTyping = false;

    function send() {
      var t = input.value.trim();
      if (!t) return;
      vscode.postMessage({ type: 'userMessage', text: t });
      input.value = '';
    }
    btn.addEventListener('click', send);
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') send();
    });

    window.addEventListener('message', function(e) {
      var msg = e.data;
      if (msg.type === 'messages') renderAll(msg.messages);
      if (msg.type === 'updateStats') updateStats(msg.stats);
    });

    function updateStats(s) {
      var sp = document.getElementById('statPomodoro');
      var sm = document.getElementById('statMsg');
      var ss = document.getElementById('statSave');
      if (sp) { sp.textContent = s.todayPomodoros || 0; }
      if (sm) { sm.textContent = s.todayMessages || 0; }
      if (ss) { ss.textContent = s.todaySaves || 0; }
    }

    function renderAll(msgs) {
      for (var i = renderedCount; i < msgs.length; i++) {
        var m = msgs[i];
        var div = document.createElement('div');
        div.className = 'msg ' + m.from;

        var avatar = document.createElement('span');
        avatar.className = 'avatar';
        avatar.textContent = m.from === 'furina' ? '🎭' : '🎤';

        var bubble = document.createElement('div');
        bubble.className = 'bubble';

        var name = document.createElement('div');
        name.className = 'name';
        name.textContent = m.from === 'furina' ? '芙宁娜' : '旅行者';
        bubble.appendChild(name);

        var content = document.createElement('span');
        content.className = 'content';
        bubble.appendChild(content);

        div.appendChild(avatar);
        div.appendChild(bubble);
        chat.appendChild(div);

        if (m.from === 'furina') {
          enqueueType(content, m.text);
        } else {
          content.textContent = m.text;
        }
      }
      renderedCount = msgs.length;
      chat.scrollTop = chat.scrollHeight;
    }

    function enqueueType(el, text) {
      typeQueue.push({ el: el, text: text });
      if (!isTyping) processQueue();
    }

    function processQueue() {
      if (typeQueue.length === 0) { isTyping = false; return; }
      isTyping = true;
      var job = typeQueue.shift();
      typeText(job.el, job.text, function() { processQueue(); });
    }

    function typeText(el, text, cb) {
      var idx = 0;
      var speed = text.length > 60 ? 20 : text.length > 30 ? 30 : 45;
      var cur = document.createElement('span');
      cur.className = 'typing-cursor';
      el.appendChild(cur);
      var timer = setInterval(function() {
        if (idx < text.length) {
          el.insertBefore(document.createTextNode(text[idx]), cur);
          idx++;
          chat.scrollTop = chat.scrollHeight;
        } else {
          clearInterval(timer);
          if (cur.parentNode) cur.parentNode.removeChild(cur);
          if (cb) cb();
        }
      }, speed);
    }
  </script>
</body>
</html>`;
    }
}
