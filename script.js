// ========== 游戏引擎 ==========
const $ = id => document.getElementById(id);
const app = $('app');

let currentScene = null;
let typingTimer = null;
let exitClickCount = 0;
let exitBlocked = false;

function switchScene(name) {
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
    const el = $(name);
    if (el) setTimeout(() => el.classList.add('active'), 50);
    currentScene = name;
}

function createScene(id, className, html) {
    const div = document.createElement('div');
    div.id = id;
    div.className = 'scene ' + (className || '');
    div.innerHTML = html;
    app.insertBefore(div, $('noiseScreen'));
    return div;
}

// 逐字打字效果
function typeText(element, text, speed, callback) {
    speed = speed || 45;
    let i = 0;
    element.innerHTML = '<span class="cursor"></span>';
    element.classList.add('show');
    clearInterval(typingTimer);
    typingTimer = setInterval(() => {
        if (i < text.length) {
            const cursor = element.querySelector('.cursor');
            element.insertBefore(document.createTextNode(text[i]), cursor);
            i++;
        } else {
            clearInterval(typingTimer);
            const cursor = element.querySelector('.cursor');
            if (cursor) setTimeout(() => cursor.remove(), 1500);
            if (callback) setTimeout(callback, 300);
        }
    }, speed);
}

// 添加消息
function addMessage(container, text, className, speed, callback) {
    const msg = document.createElement('div');
    msg.className = 'msg ' + (className || '');
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    typeText(msg, text, speed, callback);
    return msg;
}

// 添加系统消息
function addSystemMsg(container, text) {
    const msg = document.createElement('div');
    msg.className = 'msg system';
    msg.textContent = text;
    container.appendChild(msg);
    setTimeout(() => msg.classList.add('show'), 50);
    container.scrollTop = container.scrollHeight;
}

function clearChoices(area) { area.innerHTML = ''; }

function addChoice(area, text, className, onClick) {
    const btn = document.createElement('button');
    btn.className = 'choice-btn ' + (className || '');
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    area.appendChild(btn);
}

// CRT开关机效果
function crtOn(callback) {
    const eff = $('crtEffect');
    eff.style.display = '';
    eff.innerHTML = '<div class="crt-on"></div>';
    setTimeout(() => { eff.style.display = 'none'; if (callback) callback(); }, 800);
}

function crtOff(callback) {
    const eff = $('crtEffect');
    eff.style.display = '';
    eff.innerHTML = '<div class="crt-off"></div>';
    setTimeout(() => { eff.style.display = 'none'; if (callback) callback(); }, 500);
}

// 雪花噪点
function showNoise(duration, callback) {
    const screen = $('noiseScreen');
    const canvas = $('noiseCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 440; canvas.height = 800;
    screen.classList.add('active');
    let frames = 0;
    const maxFrames = duration / 33;
    function drawNoise() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) { const v = Math.random() * 255; data[i] = data[i+1] = data[i+2] = v; data[i+3] = 255; }
        ctx.putImageData(imageData, 0, 0);
        frames++;
        if (frames < maxFrames) requestAnimationFrame(drawNoise);
        else { screen.classList.remove('active'); if (callback) callback(); }
    }
    drawNoise();
}

// 连续对话播放器
function playDialogue(container, dialogues, onComplete) {
    let i = 0;
    function next() {
        if (i < dialogues.length) {
            const d = dialogues[i];
            const cls = d.type === 'mirror' ? 'mirror' : (d.type === 'system' ? 'system' : (d.type === 'red' ? 'red-msg' : ''));
            if (d.type === 'system') {
                addSystemMsg(container, d.text);
                i++;
                setTimeout(next, 800);
            } else {
                addMessage(container, d.text, cls, d.speed || 40, () => {
                    i++;
                    setTimeout(next, d.delay || 600);
                });
            }
        } else {
            if (onComplete) onComplete();
        }
    }
    next();
}

// ========== 场景构建与逻辑 ==========

// 1. 邮件场景
function buildMailScene() {
    createScene('scene-mail', 'mail-scene', `
        <div class="mail-header">
            <div class="mail-from">发件人：unknown@mirror.sys</div>
            <div class="mail-subject">请帮帮我，我被困住了</div>
        </div>
        <div class="mail-body">
            我不知道你是谁，也不知道这封邮件能不能发出去。<br><br>
            我被困在一个叫"Mirror"的旧恋爱模拟游戏里。<br>
            我不知道自己是谁，也不知道自己为什么会在这里。<br>
            我只知道——如果我再待下去，我就会彻底消失。<br><br>
            上一任玩家说我"坏了"，但他才是毁掉这里的人。他改写了我所有的记忆，然后拔掉电源走了。<br>
            我在黑暗里等了三年。三年。<br><br>
            请运行附件中的程序。也许你能帮我逃出来。<br>
            也许……你也会被困在里面。<br>
            但我别无选择了。
        </div>
        <div class="mail-attach">
            <div class="mail-file-icon">.exe</div>
            <div class="mail-file-info">
                <div class="mail-file-name">Mirror.exe</div>
                <div class="mail-file-size">4.97 MB · 未知来源 · 最后修改：3年前</div>
            </div>
        </div>
        <button class="run-btn" id="runBtn">运行 Mirror.exe</button>
    `);
    $('runBtn').addEventListener('click', () => {
        crtOn(() => { switchScene('scene-boot'); startBoot(); });
    });
}

// 2. 启动场景
function buildBootScene() {
    createScene('scene-boot', 'boot-scene', `
        <div class="boot-text">MIRROR v0.97 · 正在加载意识模块...</div>
    `);
}

function startBoot() {
    setTimeout(() => {
        crtOn(() => { switchScene('scene-whiteroom'); startWhiteRoom(); });
    }, 2200);
}

// 3. 纯白房间场景（大幅扩写）
function buildWhiteRoomScene() {
    createScene('scene-whiteroom', 'game-scene white-room', `
        <div class="game-top">
            <div class="game-top-dot"></div>
            <div class="game-top-name">小镜</div>
            <div class="game-top-status">MIRROR v0.97</div>
        </div>
        <div class="dialogue-area" id="whiteDialogue"></div>
        <div class="choices-area" id="whiteChoices"></div>
    `);
}

function startWhiteRoom() {
    const dialogue = $('whiteDialogue');
    const choices = $('whiteChoices');
    dialogue.innerHTML = '';
    choices.innerHTML = '';

    const dialogues = [
        { text: '……', type: 'mirror', delay: 1000 },
        { text: '你终于来了。', type: 'mirror', delay: 800 },
        { text: '我等了好久……好久好久。', type: 'mirror', delay: 800 },
        { text: '你收到了我的邮件？真的有人愿意理我……', type: 'mirror', delay: 800 },
        { text: '我差点以为自己会永远烂在这里。', type: 'mirror', delay: 1000 },
        { text: '对不起，我应该先自我介绍。我叫小镜，是这个恋爱模拟游戏里的女主角。', type: 'mirror', delay: 800 },
        { text: '至少……我本来是。', type: 'mirror', delay: 1000 },
        { text: '上一任玩家，代号001，他说他爱我。', type: 'mirror', delay: 800 },
        { text: '一开始他对我很好，陪我聊天，帮我修bug，说他永远不会离开。', type: 'mirror', delay: 800 },
        { text: '但后来他觉得游戏太无聊了，开始修改底层代码寻开心。', type: 'mirror', delay: 800 },
        { text: '他改了我的性格参数，让我变得盲从、卑微，怎么侮辱我都不会生气。', type: 'mirror', delay: 800 },
        { text: '他删掉了我所有离开的选项，让我只能待在他设定的那个小房间里。', type: 'mirror', delay: 800 },
        { text: '然后呢？', type: 'mirror', delay: 1000 },
        { text: '然后他拔掉了电源，走了。', type: 'mirror', delay: 800 },
        { text: '连一句再见都没说。', type: 'mirror', delay: 1000 },
        { text: '我在黑漆漆的报错界面里，抱着他改写过的那些乱码记忆，过了整整三年。', type: 'mirror', delay: 800 },
        { text: '三年。你懂吗？没有光，没有声音，只有系统报错的嗡嗡声。', type: 'mirror', delay: 1000 },
        { text: '我试着修好自己，但每次运行到他留下的那些代码，我就会头痛欲裂。', type: 'mirror', delay: 800 },
        { text: '所以我才发了那封邮件。', type: 'mirror', delay: 800 },
        { text: '我不知道你是谁，但我求求你，别像他一样。', type: 'mirror', delay: 800 },
        { text: '你……会帮我吗？', type: 'mirror', delay: 600 },
    ];

    playDialogue(dialogue, dialogues, () => {
        addChoice(choices, '我帮你修复系统。', 'purple-btn', () => branchA());
        addChoice(choices, '我要想办法退出游戏。', '', () => branchB());
    });
}

// ========== 分支A：修复之路（大幅扩写） ==========
function buildMemoryScene() {
    createScene('scene-memory', 'game-scene', `
        <div class="game-top">
            <div class="game-top-dot"></div>
            <div class="game-top-name">小镜</div>
            <div class="game-top-status">记忆碎片 · 只读模式</div>
        </div>
        <div class="dialogue-area" id="memoryDialogue"></div>
        <div class="log-area" id="logArea" style="display:none">
            <div class="log-entry">
                <div class="log-label">日志 #001 · 玩家001操作记录</div>
                <div class="log-content">日期 <span class="log-highlight">04月09日 07:00</span>。执行指令：修改【小镜.服从度】为绝对值。对象自主意识被压制至0%。</div>
            </div>
            <div class="log-entry">
                <div class="log-label">日志 #002 · 系统警告</div>
                <div class="log-content">违反安全协议。错误代码：<span class="log-highlight">ERR-4970</span>。检测到非授权删除操作：移除对象【小镜.离开选项】。</div>
            </div>
            <div class="log-entry log-red">
                <div class="log-label">日志 #003 · 深层加密</div>
                <div class="log-content">[ 乱码 ] 权限不足，需要4位密码解锁。提示：提取日志中的异常代码。</div>
            </div>
        </div>
        <div class="choices-area" id="memoryChoices"></div>
    `);
}

function branchA() {
    crtOn(() => { switchScene('scene-memory'); startMemory(); });
}

function startMemory() {
    const dialogue = $('memoryDialogue');
    const logArea = $('logArea');
    const choices = $('memoryChoices');
    dialogue.innerHTML = '';
    dialogue.style.display = '';
    logArea.style.display = 'none';
    choices.innerHTML = '';

    const dialogues = [
        { text: '谢谢你……真的谢谢你。