/* ========== 1. 全局配置与状态 ========== */
const globalHistory = [];
const ACTION_DELAY = 3000; // 聚光灯停留时长

window.state = {
  sessionId: "",
  eventId: "",
  step: 0,
  isAuto: false,
  waybills: [
    {
      id: "JSVA001234567",
      status: "运输中",
      route: "上海 -> 北京",
      goods: "iPhone 15 Pro",
      role: "寄件人",
      date: "2023-10-25 14:00",
    },
    {
      id: "JSVA009876543",
      status: "派送中",
      route: "广州 -> 深圳",
      goods: "机械键盘",
      role: "收件人",
      date: "2023-10-25 09:30",
    },
    {
      id: "JSVA004567890",
      status: "已签收",
      route: "成都 -> 西安",
      goods: "特产大礼包",
      role: "收件人",
      date: "2023-10-24 18:20",
    },
  ],
  selectedWaybillId: null,
  confirmedWaybillId: null,
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const getTimeStr = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, 0)}:${String(
    now.getMinutes()
  ).padStart(2, 0)}:${String(now.getSeconds()).padStart(2, 0)}.${String(
    now.getMilliseconds()
  ).padStart(3, 0)}`;
};

/* ========== 2. 聚光灯控制系统 ========== */
window.setFocus = function (targetType, selector) {
  const overlay = document.getElementById("focus-overlay");
  const phone = document.getElementById("phone-container");
  const workbench = document.getElementById("workbench-container");

  document
    .querySelectorAll(".focused-element")
    .forEach((el) => el.classList.remove("focused-element"));

  if (targetType === "none") {
    overlay.classList.remove("active");
    phone.classList.remove("focused");
    workbench.classList.remove("focused");
    workbench.classList.remove("dimmed");
  } else if (targetType === "phone") {
    overlay.classList.add("active");
    phone.classList.add("focused");
    workbench.classList.remove("focused");
    workbench.classList.remove("dimmed");
  } else if (targetType === "agent") {
    overlay.classList.add("active");
    workbench.classList.add("focused");
    workbench.classList.remove("dimmed");
    phone.classList.remove("focused");
  } else if (targetType === "element" && selector) {
    // 特写模式
    overlay.classList.add("active");
    workbench.classList.add("focused");
    workbench.classList.add("dimmed");
    phone.classList.remove("focused");

    const el = document.querySelector(selector);
    if (el) {
      el.classList.add("focused-element");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

/* ========== 3. 拟人化打字模拟 ========== */
window.simulateTyping = async function (selector, text, isPhone) {
  const input = document.querySelector(selector);
  if (!input) return;

  // 聚焦逻辑
  if (isPhone) {
    window.setFocus("phone");
  } else {
    window.setFocus("agent");
    await delay(1000);
    window.setFocus("element", selector);
  }

  input.value = "";
  input.classList.add("typing");
  await delay(500);

  for (let char of text) {
    input.value += char;
    await delay(30 + Math.random() * 80);
  }

  input.classList.remove("typing");
  await delay(500);

  if (isPhone) {
    const btn = document.getElementById("phone-send-btn");
    btn.classList.add("clicked");
    await delay(200);
    btn.classList.remove("clicked");
    window.userSend();
  }
};

/* ========== 4. 消息渲染核心 (修复布局) ========== */
window.appendMessage = function (sender, content, isHtml = false) {
  const phoneBox = document.getElementById("phone-chat-box");
  const agentBox = document.getElementById("agent-chat-box");
  const time = getTimeStr();

  const avatarUser = '<div class="chat-avatar avatar-user">👤</div>';
  const avatarAgent = '<div class="chat-avatar avatar-agent">🎧</div>';

  const createBubble = (text, timeStr) => {
    return (
      '<div class="bubble-container"><div class="message-bubble">' +
      text +
      '</div><div class="msg-time">' +
      timeStr +
      "</div></div>"
    );
  };

  const createRow = (sideClass, innerHtml) => {
    const div = document.createElement("div");
    div.className = "message-row " + sideClass;
    div.innerHTML = innerHtml;
    return div;
  };

  // 1. 手机端: User在右(row-right), Agent在左(row-left)
  if (sender === "user") {
    const html = avatarUser + createBubble(content, time);
    phoneBox.appendChild(createRow("row-right", html));
  } else {
    const html = avatarAgent + createBubble(content, time);
    phoneBox.appendChild(createRow("row-left", html));
  }

  // 2. 客服端: Agent在右(row-right), User在左(row-left)
  if (sender === "agent") {
    const html = avatarAgent + createBubble(content, time);
    agentBox.appendChild(createRow("row-right", html));
  } else {
    const html = avatarUser + createBubble(content, time);
    agentBox.appendChild(createRow("row-left", html));
  }

  phoneBox.scrollTop = phoneBox.scrollHeight;
  agentBox.scrollTop = agentBox.scrollHeight;
};

/* ========== 5. 自动化引擎 (AutoPilot) ========== */
window.runAutoSequence = async function () {
  if (!window.state.isAuto) return;

  // 1. 开场
  await delay(1000);
  await window.simulateTyping("#phone-input", "我想改下运单地址", true);

  await delay(1000);
  window.setFocus("element", "#col-chat");
  await delay(1000);
  window.appendMessage(
    "agent",
    "您好，京东客服很高兴为你服务，请问您有什么诉求"
  );

  // 2. 推荐运单
  await delay(1500);
  window.setFocus("agent");
  await delay(1000);
  await window.showAutoToast();
  if (!window.state.selectedWaybillId)
    window.selectWaybill(window.state.waybills[0].id);

  window.setFocus("element", "#btn-send-cards");
  await delay(ACTION_DELAY);
  window.sendWaybillCard();

  // RESULT
  window.setFocus("element", "#col-chat");
  await delay(2000);

  // 用户确认
  window.setFocus("phone");
  await delay(1500);
  const wbId = window.state.selectedWaybillId;
  const btnWb = document.getElementById(`btn-wb-${wbId}`);
  if (btnWb) {
    btnWb.style.transform = "scale(0.9)";
    await delay(200);
    btnWb.style.transform = "scale(1)";
    window.confirmWaybillByUser(wbId);
  }

  // 3. 询问地址
  await delay(1000);
  window.setFocus("element", "#btn-ask-addr");
  await window.showAutoToast();
  await delay(ACTION_DELAY);
  window.sendAskAddrScript();

  // RESULT
  window.setFocus("element", "#col-chat");
  await delay(2000);

  // 用户输入
  await window.simulateTyping("#phone-input", "北京市海淀区中关村软件园", true);

  // 4. 确认地址
  await delay(1500);
  window.setFocus("element", "#btn-send-addr-confirm");
  await window.showAutoToast();
  await delay(ACTION_DELAY);
  window.sendAddressConfirmCard();

  // RESULT
  window.setFocus("element", "#col-chat");
  await delay(2000);

  // 用户确认
  window.setFocus("phone");
  await delay(1500);
  const btnAddr = document.getElementById("btn-addr-yes");
  if (btnAddr) {
    btnAddr.style.transform = "scale(0.9)";
    await delay(200);
    btnAddr.style.transform = "scale(1)";
    window.confirmAddrByUser();
  }

  // 5. 发送运费
  await delay(1500);
  window.setFocus("agent");
  await delay(1000);
  window.setFocus("element", "#btn-send-fee");
  await delay(1000);
  await window.showAutoToast();
  await delay(ACTION_DELAY);
  window.sendFeeCard();

  // RESULT
  window.setFocus("element", "#col-chat");
  await delay(2000);

  // 用户支付
  window.setFocus("phone");
  await delay(1500);
  const btnFee = document.getElementById("btn-fee-yes");
  if (btnFee) {
    btnFee.style.transform = "scale(0.9)";
    await delay(200);
    btnFee.style.transform = "scale(1)";
    window.confirmFeeByUser();
  }

  // 6. 结束语
  await delay(1500);
  window.setFocus("element", "#col-chat");
  await window.showAutoToast();
  window.appendMessage(
    "agent",
    "运单地址修改成功，请您到小程序支付运费即可，祝您生活愉快；还有其他问题可以帮您吗？"
  );

  // 用户回复
  await delay(2500);
  await window.simulateTyping("#phone-input", "没有了，谢谢", true);

  // 7. 自动小结
  await delay(1500);
  await window.simulateTyping(
    "#summary-text",
    "用户作为寄件人需要改址，已经修改完成，服务结束",
    false
  );

  await delay(1000);
  window.setFocus("element", "#btn-finish-event");
  await delay(ACTION_DELAY);
  window.finishEvent();
  window.setFocus("none");
};

window.showAutoToast = async function () {
  const toast = document.getElementById("auto-toast");
  toast.classList.add("show");
  await delay(1500);
  toast.classList.remove("show");
  await delay(500);
};

// --- 业务功能函数 ---
window.userSend = function () {
  const input = document.getElementById("phone-input");
  const text = input.value.trim();
  if (!text) return;
  window.appendMessage("user", text);
  input.value = "";

  // 自动模式下更新地址
  if (window.state.step === 2.5 && text.length > 5) {
    document.getElementById("formatted-address-box").innerText = text;
    document.getElementById("formatted-address-box").style.color = "#333";
  }
};

window.agentSend = function () {
  const input = document.getElementById("agent-input");
  const text = input.value.trim();
  if (!text) return;
  window.appendMessage("agent", text);
  input.value = "";
};

window.startNewSession = function () {
  window.state.eventId = "TK-" + Math.floor(Math.random() * 10000000);
  window.state.sessionId = "SES-" + Date.now();
  window.state.step = 0;
  window.state.selectedWaybillId = null;
  window.state.confirmedWaybillId = null;

  document.getElementById("phone-chat-box").innerHTML = "";
  document.getElementById("agent-chat-box").innerHTML = "";
  document.getElementById("event-id-display").textContent =
    window.state.eventId;
  renderWaybillList();
  resetSection("section-biz");
  resetSection("section-fee");
  document.getElementById("auto-script-display").style.display = "none";
  document.getElementById("summary-text").value = "";
  document.getElementById("btn-send-cards").textContent = "发送运单卡片给用户";
  document.getElementById("btn-send-cards").disabled = true;
  document.getElementById("btn-reset-waybill").style.display = "none";
  renderHistoryList();

  window.setFocus("none");

  if (window.state.isAuto) {
    window.runAutoSequence();
  } else {
    setTimeout(() => window.appendMessage("user", "我想改下运单地址"), 600);
    setTimeout(
      () =>
        window.appendMessage(
          "agent",
          "您好，京东客服很高兴为你服务，请问您有什么诉求"
        ),
      1600
    );
  }
};

function resetSection(id) {
  const el = document.getElementById(id);
  el.classList.add("disabled-section");
  if (id === "section-biz") {
    document.getElementById("biz-step-ask").style.display = "block";
    document.getElementById("btn-ask-addr").textContent = "发送话术";
    document.getElementById("btn-ask-addr").disabled = false;
    document.getElementById("biz-step-confirm").style.display = "none";
    document.getElementById("formatted-address-box").textContent =
      "等待用户回复...";
    document.getElementById("addr-confirmed-msg").style.display = "none";
    document.getElementById("btn-send-addr-confirm").textContent =
      "发送地址确认卡片";
    document.getElementById("btn-send-addr-confirm").disabled = false;
  }
  if (id === "section-fee") {
    document.getElementById("fee-confirmed-msg").style.display = "none";
    document.getElementById("btn-send-fee").textContent = "发送费用确认卡片";
    document.getElementById("btn-send-fee").disabled = false;
  }
}

function renderWaybillList() {
  const container = document.getElementById("waybill-list-container");
  const sorted = [...window.state.waybills].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  container.innerHTML = sorted
    .map((wb) => {
      if (
        window.state.confirmedWaybillId &&
        wb.id !== window.state.confirmedWaybillId
      )
        return "";
      const isSel = window.state.selectedWaybillId === wb.id;
      const isConf = window.state.confirmedWaybillId === wb.id;
      const onClick = isConf
        ? ""
        : `onclick="window.selectWaybill('${wb.id}')"`;
      const bgClass = isSel || isConf ? "selected" : "";
      const roleClass = wb.role === "寄件人" ? "role-sender" : "role-recipient";
      let timeHtml = isConf
        ? `<div class="confirm-time" id="wb-time-${wb.id}"></div>`
        : "";
      return `<div class="waybill-item ${bgClass}" ${onClick}><div class="radio-custom"></div><div style="flex:1"><div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:2px;"><span>${wb.id}</span><span style="color:#fa8c16">${wb.status}</span></div><div style="margin-bottom:4px;"><span class="role-tag ${roleClass}">${wb.role}</span><span style="color:#999; font-size:11px;">${wb.date}</span></div><div style="color:#666;">${wb.route}</div>${timeHtml}</div></div>`;
    })
    .join("");
}

window.selectWaybill = function (id) {
  if (window.state.confirmedWaybillId) return;
  window.state.selectedWaybillId = id;
  renderWaybillList();
  const btn = document.getElementById("btn-send-cards");
  btn.disabled = false;
  btn.textContent = "发送运单卡片给用户";
};

window.resetWaybillSelection = function () {
  window.state.confirmedWaybillId = null;
  window.state.selectedWaybillId = null;
  window.state.step = 1;
  renderWaybillList();
  document.getElementById("btn-reset-waybill").style.display = "none";
  document.getElementById("btn-send-cards").textContent = "重新发送运单卡片";
  document.getElementById("btn-send-cards").disabled = true;
  document.getElementById("section-biz").classList.add("disabled-section");
  document.getElementById("auto-script-display").style.display = "none";
  document.getElementById("section-fee").classList.add("disabled-section");
};

window.sendWaybillCard = function () {
  if (!window.state.selectedWaybillId) return;
  const wb = window.state.waybills.find(
    (w) => w.id === window.state.selectedWaybillId
  );
  const html = `<div class="chat-card"><div class="card-header">请核对您的运单信息</div><div class="card-content" style="border-bottom:1px solid #eee"><div class="card-line"><span style="font-weight:bold;">${wb.id}</span></div><div class="card-line" style="font-size:11px; color:#666;"><span>${wb.route}</span></div><div class="card-line" style="font-size:11px; color:#999;">${wb.date}</div><button class="card-btn" id="btn-wb-${wb.id}" onclick="window.confirmWaybillByUser('${wb.id}')">确认是此单</button></div></div>`;
  window.appendMessage("agent", html, true);
  window.state.step = 1;
  document.getElementById("btn-send-cards").textContent = "等待用户确认...";
  document.getElementById("btn-send-cards").disabled = true;
};

window.confirmWaybillByUser = function (id) {
  if (window.state.step !== 1) return;
  document.getElementById(`btn-wb-${id}`).textContent = "已确认";
  document.getElementById(`btn-wb-${id}`).className += " confirmed";
  window.appendMessage("user", `我确认是这个运单：${id}`);
  window.state.confirmedWaybillId = id;
  window.state.step = 2;
  renderWaybillList();
  document.getElementById(`wb-time-${id}`).textContent = getTimeStr();
  document.getElementById("btn-reset-waybill").style.display = "inline-block";
  document.getElementById("section-biz").classList.remove("disabled-section");
};

window.sendAskAddrScript = function () {
  window.appendMessage("agent", "请问您需要把地址改成哪里，直接发送我即可");
  document.getElementById("btn-ask-addr").textContent = "已发送";
  document.getElementById("btn-ask-addr").disabled = true;
  document.getElementById("biz-step-confirm").style.display = "block";
  window.state.step = 2.5;
};

window.sendAddressConfirmCard = function () {
  const addr = document.getElementById("formatted-address-box").innerText;
  if (addr.includes("等待")) return;
  const html = `<div class="chat-card"><div class="card-header">改址信息确认</div><div class="card-content"><div>新地址：</div><div style="background:#f5f5f5; padding:5px; margin:5px 0;">${addr}</div><button class="card-btn" id="btn-addr-yes" onclick="window.confirmAddrByUser()">确认无误</button></div></div>`;
  window.appendMessage("agent", html, true);
  window.state.step = 3;
  document.getElementById("btn-send-addr-confirm").textContent = "等待确认...";
  document.getElementById("btn-send-addr-confirm").disabled = true;
};

window.confirmAddrByUser = function () {
  document.getElementById("btn-addr-yes").textContent = "已确认";
  document.getElementById("btn-addr-yes").className += " confirmed";
  window.appendMessage("user", "地址对的，改吧。");
  window.state.step = 4;
  document.getElementById("addr-confirmed-msg").style.display = "block";
  document.getElementById("addr-confirm-time").textContent = getTimeStr();
  document.getElementById("btn-send-addr-confirm").textContent = "地址已确认";

  document.getElementById("auto-script-display").style.display = "block";
  setTimeout(() => {
    window.appendMessage(
      "agent",
      "温馨提示：根据跨区转寄规则，该订单将产生5元转寄费，请您确认。"
    );
    document.getElementById("section-fee").classList.remove("disabled-section");
  }, 800);
};

window.sendFeeCard = function () {
  const html = `<div class="chat-card"><div class="card-header">费用确认</div><div class="card-content"><div class="card-line"><span>转寄费</span> <span class="price-tag">5.00元</span></div><div style="font-size:12px; color:#999; margin-bottom:5px;">由系统自动计算</div><button class="card-btn" id="btn-fee-yes" onclick="window.confirmFeeByUser()">同意支付</button></div></div>`;
  window.appendMessage("agent", html, true);
  window.state.step = 5;
  document.getElementById("btn-send-fee").disabled = true;
  document.getElementById("btn-send-fee").textContent = "等待支付...";
};

window.confirmFeeByUser = function () {
  document.getElementById("btn-fee-yes").textContent = "已同意";
  document.getElementById("btn-fee-yes").className += " confirmed";
  window.appendMessage("user", "好的，确认支付。");
  window.state.step = 6;
  document.getElementById("fee-confirmed-msg").style.display = "block";
  document.getElementById("fee-confirm-time").textContent = getTimeStr();
  document.getElementById("btn-send-fee").textContent = "费用已确认";
};

window.finishEvent = function () {
  const summary = document.getElementById("summary-text").value;
  globalHistory.unshift({
    id: window.state.eventId,
    time: new Date().toLocaleTimeString(),
    summary:
      summary || (window.state.isAuto ? "自动SOP执行归档" : "标准改址流程完成"),
  });

  const endOverlay = document.getElementById("end-overlay");
  endOverlay.classList.remove("hidden");

  renderHistoryList();
};

function renderHistoryList() {
  const container = document.getElementById("session-list-container");
  let html = `<div class="session-item active"><div class="s-title">王先生 (当前)</div><div class="s-time">进行中...</div></div>`;
  globalHistory.forEach((s) => {
    html += `<div class="session-item" style="opacity:0.6; background:#fff;"><div class="s-title">工单: ${s.id}</div><div class="s-time">${s.time}</div><div style="font-size:11px; color:#999; margin-top:4px;">${s.summary}</div></div>`;
  });
  container.innerHTML = html;
}

window.startDemo = function (mode) {
  window.state.isAuto = mode === "auto";
  const startOverlay = document.getElementById("start-overlay");
  startOverlay.classList.add("hidden");
  window.startNewSession();
};

window.restartDemo = function () {
  const endOverlay = document.getElementById("end-overlay");
  endOverlay.classList.add("hidden");
  setTimeout(() => {
    const startOverlay = document.getElementById("start-overlay");
    startOverlay.classList.remove("hidden");
  }, 500);
};

document.addEventListener("DOMContentLoaded", () => {
  const setupResizer = (resizer, target, isLeft) => {
    resizer.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.body.style.cursor = "col-resize";
      const startX = e.clientX;
      const startW = parseInt(window.getComputedStyle(target).width, 10);
      const doDrag = (e) => {
        const newW = isLeft
          ? startW + e.clientX - startX
          : startW - (e.clientX - startX);
        if (newW > 150 && newW < 800) target.style.width = newW + "px";
      };
      const stopDrag = () => {
        document.body.style.cursor = "default";
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };
      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    });
  };
  setupResizer(
    document.getElementById("resizer-left"),
    document.getElementById("col-sessions"),
    true
  );
  setupResizer(
    document.getElementById("resizer-right"),
    document.getElementById("col-sop"),
    false
  );

  document
    .getElementById("phone-input")
    .addEventListener(
      "keypress",
      (e) => e.key === "Enter" && window.userSend()
    );
  document
    .getElementById("agent-input")
    .addEventListener(
      "keypress",
      (e) =>
        e.key === "Enter" &&
        !e.shiftKey &&
        (e.preventDefault(), window.agentSend())
    );
});
