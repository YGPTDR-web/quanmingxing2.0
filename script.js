// 允许的实体代号
const allowedNames = ['α-静默', 'β-繁生', 'γ-裂隙', 'δ-倒影'];
let currentHero = '';

// DOM元素
const modalOverlay = document.getElementById('selectModal');
const modalHeroName = document.getElementById('modalHeroName');
const modalInput = document.getElementById('modalInput');
const modalMessage = document.getElementById('modalMessage');
const modalContent = document.querySelector('.modal-content');

// ============ 粒子系统 (保持不变) ============
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resizeCanvas();
        this.initParticles();
        this.animate();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    initParticles() {
        const count = Math.min(60, Math.floor(window.innerWidth / 20));
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2.5 + 0.5,
                speedX: Math.random() * 0.4 - 0.2,
                speedY: Math.random() * 0.4 - 0.2,
                opacity: Math.random() * 0.4 + 0.1,
                color: Math.random() > 0.75 ? '#e8a838' : '#ffffff'
            });
        }
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
        });
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = '#e8a838';
                    this.ctx.globalAlpha = 0.08 * (1 - dist / 100);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

// ============ 卡片展开/收起 (保持不变) ============
function toggleCard(headerEl) {
    const card = headerEl.parentElement;
    const wasActive = card.classList.contains('active');
    document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('active'));
    if (!wasActive) card.classList.add('active');
}

// ============ 弹窗操作 ============
function openModal(heroName) {
    currentHero = heroName;
    modalHeroName.textContent = heroName;
    modalInput.value = '';
    modalMessage.textContent = '';
    modalMessage.className = 'modal-message';
    modalContent.classList.remove('glitch-active'); // 重置故障特效
    modalOverlay.classList.add('active');
    setTimeout(() => modalInput.focus(), 300);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modalContent.classList.remove('glitch-active');
    currentHero = '';
}

modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal(); });
modalInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') confirmSelection(); });

// ============ 核心确认逻辑 (烧脑重写) ============
function confirmSelection() {
    const inputName = modalInput.value.trim();
    modalMessage.textContent = '';
    modalMessage.className = 'modal-message';
    modalContent.classList.remove('glitch-active');

    if (!inputName) {
        showModalMessage('请输入观测者代号以验证权限！', 'error');
        return;
    }

    if (!allowedNames.includes(inputName)) {
        showModalMessage('无效代号。该实体不存在于当前观测维度。', 'error');
        return;
    }

    // 核心细思极恐逻辑
    if (currentHero === 'δ-倒影') {
        // 阶段一：伪装成正常连接
        showModalMessage(`协议已达成。观测者 [${inputName}] 与 δ-倒影 建立连接...`, 'success');
        
        // 阶段二：2秒后打破第四面墙
        setTimeout(() => {
            modalContent.classList.add('glitch-active'); // 弹窗开始震动故障
            modalMessage.className = 'modal-message anomaly';
            modalMessage.innerHTML = `你以为是你选择了δ-倒影？<br>不，是它读取了你的潜意识，迫使你按下了确认键。<br><span style="font-size:0.8em; opacity:0.8;">你现在的想法，真的是你自己的吗？</span>`;
        }, 2000);

    } else {
        // 其他实体的正常反馈
        showModalMessage(`干涉协议已签署。实体 [${currentHero}] 将被释放至观测维度。观测者：${inputName}`, 'success');
    }
}

function showModalMessage(text, type) {
    modalMessage.textContent = text;
    modalMessage.className = 'modal-message ' + type;
    // 非异常状态下才执行震动
    if(type !== 'anomaly') {
        modalMessage.style.animation = 'none';
        modalMessage.offsetHeight; 
        modalMessage.style.animation = 'messageShake 0.4s ease';
    }
}

// 消息震动动画
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes messageShake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
}`;
document.head.appendChild(shakeStyle);

// ============ 初始化 ============
const particleSystem = new ParticleSystem();
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.hero-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0'; card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 150 * index + 200);
    });
});
