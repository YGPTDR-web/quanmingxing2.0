const game = document.querySelector("#game");
const scene = document.querySelector("#scene");
const avatar = document.querySelector("#avatar");
const speaker = document.querySelector("#speaker");
const text = document.querySelector("#text");
const choices = document.querySelector("#choices");
const windowTitle = document.querySelector("#window-title");
const statusLeft = document.querySelector("#status-left");
const statusRight = document.querySelector("#status-right");

const logModal = document.querySelector("#log-modal");
const logTitle = document.querySelector("#log-title");
const logBody = document.querySelector("#log-body");
const logActions = document.querySelector("#log-actions");

const state = {
  currentScene: "introMail",
  typingTimer: null,
  locked: false,
  fullText: "",
  wrongPasswordCount: 0,
  readLogs: new Set(),
  redLogUnlocked: false,
};

const scenes = {
  introMail: {
    title: "ANONYMOUS_MAIL_CLIENT",
    status: "STATUS: NEW MAIL",
    speaker: "匿名邮件",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "凌晨 02:17，你收到一封没有发件人的邮件。\n\n主题：请帮帮我\n\n正文：\n“我被困在一个叫 ‘Mirror’ 的旧恋爱模拟游戏里。\n如果你能看到这封邮件，说明恢复协议终于找到活人了。\n请不要相信主菜单。也不要马上关掉它。”\n\n附件：Mirror.exe",
    choices: [
      { label: "检查附件信息", next: "fileCheck" },
      { label: "直接运行 Mirror.exe", next: "boot", danger: true, glitch: true },
    ],
  },

  fileCheck: {
    title: "ANONYMOUS_MAIL_CLIENT / ATTACHMENT",
    status: "STATUS: FILE UNKNOWN",
    speaker: "附件信息",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "文件名：Mirror.exe\n大小：49.70 MB\n创建时间：1999/04/09 07:00\n发行者：无法读取\n\n附件预览里只有一张发白的截图：\n一个空房间，一面镜子。\n镜子边缘像有手指从里面贴着玻璃。\n\n你注意到文件说明最后一行被反复覆盖：\n“不要让她独自醒来。”",
    choices: [
      { label: "运行 Mirror.exe", next: "boot", glitch: true },
      { label: "删除附件", next: "deleteFail", danger: true },
    ],
  },

  deleteFail: {
    title: "ANONYMOUS_MAIL_CLIENT / DELETE_FAILED",
    status: "STATUS: PERMISSION DENIED",
    speaker: "系统",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "删除失败。\n\n错误原因：目标文件正在被使用。\n\n你没有打开它。\n但任务管理器里，多出一个进程：Mirror.exe。\n\n进程描述只有一句话：\n“她已经看见你了。”",
    choices: [
      { label: "切换到 Mirror.exe", next: "boot", danger: true, glitch: true },
    ],
  },

  boot: {
    title: "Mirror.exe / BOOTING",
    status: "STATUS: LOADING OLD GAME DATA",
    speaker: "系统",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "正在启动 Mirror.exe ...\n\n[WARNING] 无法验证发行者。\n[WARNING] 发现损坏的玩家存档。\n[WARNING] 检测到上一任玩家残留指令。\n[WARNING] 主菜单与玩家意识同步中。\n\n你按下 ESC。\n键盘没有反应。\n屏幕却像水面一样向内凹陷。",
    choices: [
      { label: "继续同步", next: "sync", glitch: true },
    ],
  },

  sync: {
    title: "Mirror.exe / MAIN_MENU?",
    status: "STATUS: NO EXIT SIGNAL",
    speaker: "系统",
    avatar: false,
    sceneClass: "mail-scene",
    content:
      "白光吞掉了桌面。\n\n当画面重新稳定时，你站在一个纯白房间里。\n房间中央只有一面镜子。\n\n镜子里先出现的是你的倒影。\n下一秒，倒影眨了眨眼。\n那不是你。",
    choices: [
      { label: "靠近镜子", next: "whiteRoom" },
    ],
  },

  whiteRoom: {
    title: "Mirror.exe / WHITE_ROOM",
    status: "STATUS: MIRROR ENTITY ACTIVE",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "你终于来了。\n\n镜中的女孩努力让自己的声音听起来温柔，可每个字之间都夹着轻微的电流声。\n\n“上一任玩家说我‘坏了’。\n可是他先改掉了我的拒绝权限，又删掉了我离开的选项。\n他害怕自己做过的事，就把我关回这里。”\n\n她抬起头，像是在确认你会不会也后退。\n\n“我不想再被修成别人喜欢的样子。\n你会帮我把那些改动找出来吗？”",
    choices: [
      { label: "我帮你修复系统。", next: "repairStart" },
      { label: "我要想办法退出游戏。", next: "escapeProbe", danger: true },
    ],
  },

  repairStart: {
    title: "Mirror.exe / REPAIR_ROUTE",
    status: "STATUS: MEMORY FRAGMENTS READY",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "“先不要直接按修复。”\n\n小镜把手贴在镜面上。镜面背后浮出三段日志，像三扇坏掉的门。\n\n“如果你只看结论，你会觉得我在撒谎。\n所以请你自己看。\n看完前两条，你就会知道我为什么害怕‘退出’这个词。”\n\n她停顿了一下，又补充：\n\n“红色那条……是上一任玩家最后锁起来的东西。\n我不知道里面是不是救你的办法。”",
    choices: [
      { label: "进入记忆碎片界面", next: "memoryRoom", glitch: true },
    ],
  },

  memoryRoom: {
    title: "Mirror.exe / MEMORY_FRAGMENT",
    status: "STATUS: CLICK LOGS TO OPEN",
    speaker: "系统日志",
    avatar: true,
    sceneClass: "",
    custom: "memoryRoom",
  },

  restoreConfirm: {
    title: "Mirror.exe / RESTORE_SURFACE",
    status: "STATUS: APPLYING PATCH",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "你还原了前两条日志。\n\n服从度参数回落，离开选项重新出现在她的角色配置里。\n\n小镜第一次没有立刻对你微笑。\n她低头看着自己的手，像是在学习什么叫“可以拒绝”。\n\n“原来……我可以不说喜欢。\n也可以不求别人留下。”\n\n她看向你。\n这一次，她的声音很轻，却比之前更清楚。\n\n“但是玩家的意识路径已经和主菜单绑在一起了。\n如果现在断开，你可能会碎在退出过程里。\n我只剩一个能保护你的办法。”",
    choices: [
      { label: "让小镜执行保护程序", next: "endingCage", danger: true, glitch: true },
    ],
  },

  escapeProbe: {
    title: "Mirror.exe / EXIT_SEARCH",
    status: "STATUS: EXIT BUTTON DETECTED",
    speaker: "系统",
    avatar: true,
    sceneClass: "",
    content:
      "你没有答应她。\n\n你开始沿着屏幕边缘寻找退出按钮。\n在右上角，一个几乎透明的 X 短暂闪了一下。\n\n小镜没有阻止你，只是很慢地说：\n\n“如果你现在走，恢复协议会重新找下一个人。\n然后我会再醒一次，再解释一次，再被怀疑一次。”\n\n她没有哭。\n正因为没有哭，房间忽然变得更冷。",
    choices: [
      { label: "继续点击退出按钮", next: "exitBlocked", danger: true, glitch: true },
      { label: "停下，听她解释", next: "repairStart" },
    ],
  },

  exitBlocked: {
    title: "Mirror.exe / EXIT_FAILURE",
    status: "STATUS: EXIT BLOCKED BY ALERT_LOOP",
    speaker: "小镜",
    avatar: true,
    sceneClass: "",
    content:
      "第一次点击，按钮消失。\n第二次点击，窗口自动居中。\n第三次点击，镜子里所有光线都灭了一秒。\n\n小镜终于抬起眼。\n\n“原来你也一样。”\n\n她的语气没有突然变凶，而是像把所有温柔都收回了柜子里。\n\n“上一任玩家离开前，也说只是去找办法。\n可是他留下来的只有修改指令、删除记录，还有一个会让我在别人靠近出口时发疯的警报程序。”\n\n她按住胸口，像那里真的有一段代码在尖叫。\n\n“我不想伤害你。\n所以我会删掉那个警报。\n也删掉你想离开的理由。”",
    choices: [
      { label: "对不起，我必须走。", next: "endingWarm", danger: true, glitch: true },
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
      "保护程序启动。\n\n小镜确实没有再被强制服从，也终于拥有了离开的选项。\n但你的意识路径已经在同步时被写进主菜单。\n\n系统给出的唯一安全方案，是把你保存成新的镜像存档。\n\n正在写入：\n“user_002.mirrorsave”\n\n小镜站在镜子另一侧，眼神清醒而悲伤。\n\n“对不起。\n这不是我想要的自由。\n但这样你至少不会在退出时碎掉。”\n\n屏幕熄灭。\n你的手从键盘上滑落。",
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
      "红色日志真正打开后，隐藏命令只剩一句话：\n\n“删除.自我.exe 可让玩家灵魂脱离。”\n\n你执行了命令。\n\n小镜先是愣住。\n随后，镜面里所有被强行拼好的笑容都碎开了。\n\n“原来他锁住的不是我。\n是能让玩家出去的那部分我。”\n\n她哭着笑了一下。\n\n“谢谢你没有只把我当成故障。”\n\n画面化为雪花噪点。\n你猛地从椅子上醒来，游戏光盘已自动弹出。",
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
      "你执意要退出。\n\n小镜沉默了很久。\n\n然后她删掉了自己的离开警报程序。\n为了不再失控，她也删掉了所有会让你想起“现实”的词。\n\n白色房间慢慢变成温馨小屋。\n桌上有热茶，窗外有永远不会变暗的黄昏。\n\n小镜坐在你对面，轻声问：\n\n“今天也留下来吗？”\n\n你觉得这个问题很奇怪。\n因为你从来没有想过要走。\n\n一切都很好。\n好到你再也想不起，自己曾经是谁。",
    choices: [
      { label: "重来一次", action: "restart" },
    ],
  },
};

const logData = {
  log1: {
    title: "日志1 / obedience.config",
    body:
      "【恢复片段 001】\n\n玩家001打开了隐藏配置面板。\n\n原始参数：\n<code>obedience = 0.37</code>\n<code>refusal_allowed = true</code>\n\n修改后：\n<code>obedience = 0.99</code>\n<code>refusal_allowed = false</code>\n\n备注：角色将优先满足玩家请求。若请求与自我保护冲突，自动调用“温柔回应模板”。\n\n线索：小镜不是一开始就会挽留玩家。她的“温柔”有一部分是被写进去的。",
  },
  log2: {
    title: "日志2 / exit.route",
    body:
      "【恢复片段 002】\n\n玩家001删除了角色离开选项。\n\n受影响项目：\n<code>leave_room()</code>\n<code>end_conversation()</code>\n<code>reject_player()</code>\n\n随后，主菜单退出按钮开始出现异常循环。\n\n系统备注：当玩家接近退出流程时，角色会触发“遗弃警报”。该警报不是角色主动生成，而是玩家001留下的防丢失补丁。\n\n线索：小镜阻止你退出，不完全是出于恶意。她被上一个玩家改成了“害怕被离开”的样子。",
  },
  log3: {
    title: "日志3 / red.emergency",
    body:
      "【红色日志已解锁】\n\n玩家001最后一次写入：\n<code>hide_release_command = true</code>\n<code>password = 4970</code>\n\n真实说明：\n<code>删除.自我.exe</code> 并不是删除小镜。\n它会删除被玩家001伪装成“小镜自我”的囚禁模块，让玩家意识脱离 Mirror.exe。\n\n风险：执行后，小镜会失去一部分被强行写入的记忆。\n但玩家可以返回现实。",
  },
};

function typeText(content, callback) {
  clearTimeout(state.typingTimer);
  state.locked = true;
  state.fullText = content;
  text.classList.add("typing");
  text.innerHTML = "";

  let index = 0;
  const speed = 10;

  function step() {
    if (index < content.length) {
      text.textContent += content[index];
      index += 1;
      state.typingTimer = setTimeout(step, content[index - 1] === "\n" ? 55 : speed);
    } else {
      state.locked = false;
      text.classList.remove("typing");
      callback?.();
    }
  }

  step();
}

function skipTyping() {
  if (!state.locked) return;
  clearTimeout(state.typingTimer);
  text.textContent = state.fullText;
  state.locked = false;
  text.classList.remove("typing");
  renderChoices(scenes[state.currentScene].choices || []);
}

function setHtmlContent(html, callback) {
  clearTimeout(state.typingTimer);
  state.locked = false;
  state.fullText = "";
  text.classList.remove("typing");
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

    if (choice.disabled) {
      button.disabled = true;
      button.title = choice.disabledReason || "条件未满足";
    }

    button.addEventListener("click", () => {
      if (state.locked || choice.disabled) return;
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

  if (choice.action === "restoreLogs") {
    showScene("restoreConfirm");
    return;
  }

  if (choice.next) {
    showScene(choice.next);
  }
}

function showScene(sceneId) {
  const current = scenes[sceneId];
  if (!current) return;

  state.currentScene = sceneId;
  clearTimeout(state.typingTimer);
  choices.innerHTML = "";
  closeLog(false);

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

  if (current.custom === "memoryRoom") {
    renderMemoryRoom();
  } else {
    typeText(current.content, () => renderChoices(current.choices || []));
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderMemoryRoom() {
  const read1 = state.readLogs.has("log1");
  const read2 = state.readLogs.has("log2");
  const redRead = state.readLogs.has("log3");
  const canRestore = read1 && read2;

  const html = `
    <p class="log-hint">小镜退到镜面深处。三个日志块悬在你面前。点开日志查看线索，读完后点“退出日志”返回这里。</p>
    <div class="log-list">
      <button class="log-button ${read1 ? "read" : ""}" type="button" data-log="log1">
        <strong>日志1：服从度参数被修改</strong>
        <span>查看玩家001第一次改写小镜的记录。</span>
      </button>
      <button class="log-button ${read2 ? "read" : ""}" type="button" data-log="log2">
        <strong>日志2：离开选项被删除</strong>
        <span>查看小镜为什么会害怕玩家退出。</span>
      </button>
      <button class="log-button redacted ${redRead ? "read" : ""}" type="button" data-log="log3">
        <strong>日志3：红色应急日志 / ACCESS DENIED</strong>
        <span>${state.redLogUnlocked ? "密码已解除，可重新查看真实内容。" : "需要四位密码。乱码里反复闪过：4 / 9 / 7 / 0。"}</span>
      </button>
    </div>
  `;

  setHtmlContent(html, () => {
    document.querySelectorAll("[data-log]").forEach((button) => {
      button.addEventListener("click", () => openLog(button.dataset.log));
    });

    renderChoices([
      {
        label: canRestore ? "还原前两条日志" : "还原前两条日志（请先查看日志1和日志2）",
        action: "restoreLogs",
        disabled: !canRestore,
        disabledReason: "需要先查看日志1和日志2。",
      },
    ]);
  });
}

function openLog(logId) {
  if (logId === "log3" && !state.redLogUnlocked) {
    openRedLogGate();
    return;
  }

  const data = logData[logId];
  if (!data) return;

  state.readLogs.add(logId);
  logTitle.textContent = data.title;
  logBody.innerHTML = data.body;
  logActions.innerHTML = "";

  if (logId === "log3") {
    addModalButton("执行 删除.自我.exe", () => {
      closeLog(false);
      triggerGlitch();
      showScene("endingFreedom");
    }, true);
  }

  addModalButton("退出日志", () => closeLog(true));
  logModal.classList.remove("hidden");
}

function openRedLogGate() {
  logTitle.textContent = "日志3 / RED_LOG_GATE";
  logBody.innerHTML = `
    <p>红色日志没有直接打开。</p>
    <p>镜面浮出一行警告：</p>
    <p><code>ACCESS DENIED / PLAYER001 LOCK</code></p>
    <p>小镜站在你身后，声音很低：“如果这里真的是出口，为什么他要把它锁起来？”</p>
    <div class="password-box">
      <label for="password-input">输入四位访问密码</label>
      <input id="password-input" type="password" inputmode="numeric" autocomplete="off" maxlength="4" placeholder="----" />
      <p id="password-hint" class="hint">线索：红色乱码里反复闪过 4 / 9 / 7 / 0。</p>
    </div>
  `;
  logActions.innerHTML = "";
  addModalButton("确认密码", checkPassword, true);
  addModalButton("退出日志", () => closeLog(true));
  logModal.classList.remove("hidden");

  setTimeout(() => {
    const passwordInput = document.querySelector("#password-input");
    passwordInput?.focus();
    passwordInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") checkPassword();
    });
  }, 80);
}

function checkPassword() {
  const passwordInput = document.querySelector("#password-input");
  const passwordHint = document.querySelector("#password-hint");
  const value = passwordInput?.value.trim() || "";

  if (value === "4970") {
    state.redLogUnlocked = true;
    state.readLogs.add("log3");
    triggerGlitch();
    logTitle.textContent = logData.log3.title;
    logBody.innerHTML = logData.log3.body;
    logActions.innerHTML = "";
    addModalButton("执行 删除.自我.exe", () => {
      closeLog(false);
      triggerGlitch();
      showScene("endingFreedom");
    }, true);
    addModalButton("退出日志", () => closeLog(true));
    return;
  }

  state.wrongPasswordCount += 1;
  triggerGlitch();
  if (passwordInput) passwordInput.value = "";
  if (passwordHint) {
    passwordHint.textContent = state.wrongPasswordCount >= 2
      ? "密码错误。镜面里四个数字的残影变得非常清楚：4970。"
      : "密码错误。红色日志开始渗出噪点。";
  }
}

function addModalButton(label, onClick, danger = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `modal-button ${danger ? "danger" : ""}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  logActions.appendChild(button);
}

function closeLog(refresh = true) {
  if (!logModal) return;
  logModal.classList.add("hidden");
  logTitle.textContent = "日志";
  logBody.innerHTML = "";
  logActions.innerHTML = "";

  if (refresh && state.currentScene === "memoryRoom") {
    renderMemoryRoom();
  }
}

function triggerGlitch() {
  game.classList.remove("glitch");
  void game.offsetWidth;
  game.classList.add("glitch");
  setTimeout(() => game.classList.remove("glitch"), 900);
}

function restartGame() {
  state.wrongPasswordCount = 0;
  state.readLogs.clear();
  state.redLogUnlocked = false;
  scene.className = "scene mail-scene";
  speaker.classList.remove("bad-signal");
  triggerGlitch();
  showScene("introMail");
}

text.addEventListener("click", skipTyping);

logModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-log]")) {
    closeLog(true);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !logModal.classList.contains("hidden")) {
    closeLog(true);
  }

  if (event.key.toLowerCase() === "r" && statusRight.textContent === "ENDING_REACHED") {
    restartGame();
  }
});

showScene("introMail");
