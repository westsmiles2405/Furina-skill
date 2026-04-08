/**
 * 芙宁娜 Webview 侧边栏面板
 */
import * as vscode from 'vscode';
import * as crypto from 'crypto';

function getNonce(): string {
    return crypto.randomBytes(16).toString('hex');
}

export class FurinaChatPanel implements vscode.WebviewViewProvider {
    public static readonly viewType = 'furina.chatPanel';
    private view?: vscode.WebviewView;
    private messages: Array<{ role: 'furina' | 'user'; text: string }> = [];

    private onUserMessage?: (text: string) => void;

    constructor(private readonly extensionUri: vscode.Uri) { }

    /** 注册用户消息回调 */
    setOnUserMessage(handler: (text: string) => void): void {
        this.onUserMessage = handler;
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHtml();

        // 处理用户输入
        webviewView.webview.onDidReceiveMessage((data) => {
            if (data.type === 'userMessage' && typeof data.text === 'string') {
                const sanitized = data.text.trim();
                if (sanitized.length > 0 && sanitized.length <= 500) {
                    this.messages.push({ role: 'user', text: sanitized });
                    this.updateWebview();
                    // 触发回调让芙宁娜回复
                    this.onUserMessage?.(sanitized);
                }
            }
        });
    }

    /** 向面板追加芙宁娜的台词 */
    addFurinaMessage(text: string): void {
        this.messages.push({ role: 'furina', text });
        this.trimMessages();
        this.updateWebview();
    }

    /** 限制消息数量，超出时淘汰旧消息 */
    private trimMessages(): void {
        const MAX_MESSAGES = 200;
        if (this.messages.length > MAX_MESSAGES) {
            this.messages = this.messages.slice(this.messages.length - MAX_MESSAGES);
        }
    }

    private updateWebview(): void {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'update',
                messages: this.messages,
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
        content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>芙宁娜的舞台</title>
  <style>
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
    }
    .msg.furina {
      align-self: flex-start;
      background: rgba(110, 198, 255, 0.12);
      border: 1px solid rgba(110, 198, 255, 0.25);
      color: var(--furina-fg);
    }
    .msg.furina::before {
      content: '🎭 芙宁娜';
      display: block;
      font-size: 11px;
      color: var(--furina-blue);
      margin-bottom: 4px;
      font-weight: 600;
    }
    .msg.user {
      align-self: flex-end;
      background: rgba(255, 213, 79, 0.1);
      border: 1px solid rgba(255, 213, 79, 0.2);
    }
    .msg.user::before {
      content: '🎤 旅行者';
      display: block;
      font-size: 11px;
      color: var(--furina-gold);
      margin-bottom: 4px;
      font-weight: 600;
      text-align: right;
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
    #userInput:focus {
      border-color: var(--furina-blue);
    }
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

    function renderMessages(messages) {
      chat.innerHTML = '';
      messages.forEach(m => {
        const div = document.createElement('div');
        div.className = 'msg ' + m.role;
        div.textContent = m.text;
        chat.appendChild(div);
      });
      chat.scrollTop = chat.scrollHeight;
    }

    btn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      vscode.postMessage({ type: 'userMessage', text: text });
      input.value = '';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btn.click();
    });

    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.type === 'update') {
        renderMessages(msg.messages);
      }
    });
  </script>
</body>
</html>`;
    }
}
