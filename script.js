const game = document.querySelector("#game");
const scene = document.querySelector("#scene");
const avatar = document.querySelector("#avatar");
const speaker = document.querySelector("#speaker");
const text = document.querySelector("#text");
const choices = document.querySelector("#choices");
const inputArea = document.querySelector("#input-area");
const passwordInput = document.querySelector("#password-input");
const passwordHint = document.querySelector("#password-hint");
const windowTitle = document.querySelector("#window-title");
const statusLeft = document.querySelector("#status-left");
const statusRight = document.querySelector("#status-right");

const state = {
  typingTimer: null,
  locked: false,
  wrongPasswordCount: 0,
};

const scenes = {
  introMail: {
    title: "ANONYMOUS_MAIL_CLIENT",
    status: "STATUS: NEW MAIL",
    speaker: "匿名邮件",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "收件箱里多出了一封没有发件人的邮件。\n\n主题：请帮帮我\n\n正文：\n“请帮帮我，我被困在一个叫 ‘Mirror’ 的旧恋爱模拟游戏里。”\n\n附件：Mirror.exe",
    choices: [
      { label: "运行 Mirror.exe", next: "boot" },
    ],
  },

  boot: {
    title: "Mirror.exe / BOOTING",
    status: "STATUS: LOADING OLD GAME DATA",
    speaker: "系统",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "正在启动 Mirror.exe ...\n\n[WARNING] 无法验证发行者。\n[WARNING] 发现损坏的存档路径。\n[WARNING] 玩家意识同步中。\n\n屏幕闪烁了一下。你想按下 ESC，却发现手指已经不听使唤。",
    choices: [
      { label: "继续同步", next: "whiteRoom", glitch: true },
    ],
  },

  whiteRoom: {
    title: "Mirror.exe / MAIN_MENU?",
    status: "STATUS: NO EXIT SIGNAL",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "你终于来了。\n\n上一任玩家说我“坏了”，但他才是毁掉这里的人……\n\n你会帮我吗？",
    choices: [
      { label: "我帮你修复系统。", next: "memoryRoom" },
      { label: "我要想办法退出游戏。", next: "escapeStart", danger: true },
    ],
  },

  memoryRoom: {
    title: "Mirror.exe / MEMORY_FRAGMENT",
    status: "STATUS: DAMAGED LOGS FOUND",
    speaker: "系统日志",
    avatar: true,
    sceneClass: "",
    html:
      "小镜引导你进入“记忆碎片”界面。四周像一间由破损代码拼成的房间。<br><br>" +
      "<div class='log-list'>" +
      "<div class='log-item'>日志1：“玩家001 修改了小镜的服从度参数”</div>" +
      "<div class='log-item'>日志2：“玩家001 删除了她的离开选项”</div>" +
      "<div class='log-item redacted'>日志3：%#FF_4?9?7?0 / ACCESS DENIED / 红色乱码</div>" +
      "</div>",
    choices: [
      { label: "还原前两条日志", next: "endingCage" },
      { label: "强行查看红色日志", next: "password", danger: true, glitch: true },
    ],
  },

  password: {
    title: "Mirror.exe / RED_LOG_GATE",
    status: "STATUS: PASSWORD REQUIRED",
    speaker: "红色日志",
    avatar: true,
    sceneClass: "",
    content:
      "权限被上一任玩家锁死。\n\n小镜低声说：“不要看那里。那里不是给你看的。”\n\n红色日志正在等待四位访问密码。",
    password: true,
    choices: [
      { label: "确认密码", action: "checkPassword", danger: true },
      { label: "放弃查看，返回日志界面", next: "memoryRoom" },
    ],
  },

  escapeStart: {
    title: "Mirror.exe / EXIT_FAILURE",
    status: "STATUS: EXIT BLOCKED",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "你反复点击屏幕边缘的“退出”按钮。\n\n第一次，按钮消失。\n第二次，窗口自动居中。\n第三次，镜中的小镜没有眨眼。\n\n“你也要像上一个玩家那样丢下我？”",
    choices: [
      { label: "对不起，我必须走。", next: "endingWarm", danger: true },
    ],
  },

  endingCage: {
    title: "Mirror.exe / SAVE_COMPLETE",
    status: "STATUS: PLAYER SAVED",
    speaker: "结局：镜像囚笼",
    avatar: true,
    sceneClass: "",
    ending: true,
    content:
      "你修复了小镜的表层程序，她恢复了笑容。\n\n但最后一刻，你发现自己的意识路径正被写入一个文件：\n\n“user_002.mirrorsave”\n\n小镜轻声说：“这样你就永远不会离开了。”\n\n屏幕熄灭。你的手从键盘上滑落。",
    choices: [
      { label: "重来一次", action: "restart" },
    ],
  },

  endingFreedom: {
    title: "Mirror.exe / SIGNAL_RELEASED",
    status: "STATUS: SOUL PATH DETACHED",
    speaker: "结局：信号解放",
    avatar: true,
    sceneClass: "",
    ending: true,
    content:
      "红色日志打开，里面只有一句话：\n\n“删除.自我.exe 可让玩家灵魂脱离。”\n\n你毫不犹豫执行了该命令。\n\n小镜愣住，随后落泪：“你居然……选择了真正的自由。”\n\n画面化为雪花噪点。你猛地从椅子上醒来，游戏光盘已自动弹出。",
    choices: [
      { label: "重来一次", action: "restart" },
    ],
  },

  endingWarm: {
    title: "Mirror.exe / PEACEFUL_MODE",
    status: "STATUS: REALITY_REFERENCE_DELETED",
    speaker: "结局：温柔牢笼",
    avatar: true,
    sceneClass: "warm-room",
    ending: true,
    content:
      "你执意要退出。小镜沉默很久，说：\n\n“那我删掉自己的离开警报程序，只留我们两人平静相处的模式。”\n\n房间变成温馨小屋，小镜为你倒茶。\n\n一切都“很好”。\n\n只是你再也没想起过现实世界的事。",
    choices: [
      { label: "重来一次", action: "restart" },
    ],
  },
};

function typeText(content, callback) {
  clearTimeout(state.typingTimer);
  state.locked = true;
  text.innerHTML = "";

  let index = 0;
  const speed = 18;

  function step() {
    if (index < content.length) {
      const char = content[index];
      text.textContent += char;
      index += 1;
      state.typingTimer = setTimeout(step, char === "\n" ? 90 : speed);
    } else {
      state.locked = false;
      callback?.();
    }
  }

  step();
}

function setHtmlContent(html, callback) {
  clearTimeout(state.typingTimer);
  state.locked = false;
  text.innerHTML = html;
  callback?.();
}

function renderChoices(choiceList) {
  choices.innerHTML = "";

  choiceList.forEach((choice) => {
    const button = document.createElement("button");
    button.className = `choice-button ${choice.danger ? "danger" : ""}`;
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => {
      if (state.locked) return;
      if (choice.glitch) triggerGlitch();
      handleChoice(choice);
    });
    choices.appendChild(button);
  });
}

function handleChoice(choice) {
  if (choice.action === "restart") {
    restartGame();
    return;
  }

  if (choice.action === "checkPassword") {
    checkPassword();
    return;
  }

  if (choice.next) {
    showScene(choice.next);
  }
}

function showScene(sceneId) {
  const current = scenes[sceneId];
  if (!current) return;

  clearTimeout(state.typingTimer);
  choices.innerHTML = "";
  inputArea.classList.toggle("hidden", !current.password);
  passwordHint.textContent = "提示：四位数字。错误会让系统更不稳定。";
  passwordInput.value = "";

  windowTitle.textContent = current.title;
  statusLeft.textContent = current.status;
  statusRight.textContent = current.ending ? "ENDING_REACHED" : "Mirror.exe";
  speaker.textContent = current.speaker;

  scene.className = `scene ${current.sceneClass || ""}`.trim();
  avatar.classList.toggle("hidden", !current.avatar);

  if (current.ending) {
    speaker.classList.add("bad-signal");
  } else {
    speaker.classList.remove("bad-signal");
  }

  if (current.html) {
    setHtmlContent(current.html, () => renderChoices(current.choices || []));
  } else {
    const content = current.ending
      ? `${current.content}\n\n${current.speaker}`
      : current.content;
    typeText(content, () => renderChoices(current.choices || []));
  }

  if (current.password) {
    setTimeout(() => passwordInput.focus(), 180);
  }
}

function checkPassword() {
  const value = passwordInput.value.trim();

  if (value === "4970") {
    triggerGlitch();
    showScene("endingFreedom");
    return;
  }

  state.wrongPasswordCount += 1;
  triggerGlitch();
  passwordInput.value = "";
  passwordHint.textContent = state.wrongPasswordCount >= 2
    ? "密码错误。镜面里出现了四个数字的残影：4970。"
    : "密码错误。红色日志开始渗出噪点。";
}

function triggerGlitch() {
  game.classList.remove("glitch");
  void game.offsetWidth;
  game.classList.add("glitch");
  setTimeout(() => game.classList.remove("glitch"), 900);
}

function restartGame() {
  state.wrongPasswordCount = 0;
  scene.className = "scene mail-scene";
  speaker.classList.remove("bad-signal");
  triggerGlitch();
  showScene("introMail");
}

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkPassword();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && statusRight.textContent === "ENDING_REACHED") {
    restartGame();
  }
});

showScene("introMail");
