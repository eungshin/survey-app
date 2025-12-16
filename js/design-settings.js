/**
 * Design Settings Panel
 * Allows users to customize fonts, layout, and navigate between pages
 * Features: Draggable panel, real-time preview, persistent settings
 */

(function () {
    'use strict';

    // Page flow configuration
    const PAGE_FLOW = [
        { name: 'index', label: '홈', url: 'index.html' },
        { name: 'survey-intro', label: '설문 안내', url: 'survey-intro.html' },
        { name: 'survey-info-consent', label: '개인정보 동의', url: 'survey-info-consent.html' },
        { name: 'medical-info', label: '의료진 정보', url: 'medical-info.html' },
        { name: 'patient-cases', label: '환자 케이스', url: 'patient-cases.html' },
        { name: 'patient-cases_end', label: '케이스 완료', url: 'patient-cases_end.html' },
        { name: 'mypage', label: '마이페이지', url: 'mypage.html' }
    ];

    // Default settings
    const DEFAULT_SETTINGS = {
        fontFamily: 'Pretendard, sans-serif',
        titleFontSize: 32,
        sectionTitleSize: 24,
        questionFontSize: 18,
        answerFontSize: 16,
        buttonFontSize: 16,
        mainSectionWidth: 1440,
        cardPaddingX: 40,
        cardPaddingY: 40,
        elementGap: 16,
        buttonHeight: 48
    };

    let currentSettings = { ...DEFAULT_SETTINGS };
    let isDragging = false;
    let dragStartX, dragStartY, panelStartX, panelStartY;

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        loadSettings();
        createPanelHTML();
        attachEventListeners();
        applySettings();
    });

    function loadSettings() {
        const saved = localStorage.getItem('designSettings');
        if (saved) {
            try {
                currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            } catch (e) {
                currentSettings = { ...DEFAULT_SETTINGS };
            }
        }
    }

    function saveSettings() {
        localStorage.setItem('designSettings', JSON.stringify(currentSettings));
    }

    function createPanelHTML() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

        // Create floating button
        const btn = document.createElement('button');
        btn.className = 'design-settings-btn';
        btn.innerHTML = '?';
        btn.title = '디자인 설정';
        btn.onclick = openPanel;
        document.body.appendChild(btn);

        // Create panel (no overlay for draggable functionality)
        const panel = document.createElement('div');
        panel.className = 'design-panel';
        panel.id = 'designPanel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="design-panel-header" id="designPanelHeader">
                <h2>🎨 디자인 설정</h2>
                <button class="design-panel-close" onclick="closeDesignPanel()">&times;</button>
            </div>
            <div class="design-panel-body">
                <div class="design-tabs">
                    <button class="design-tab active" data-tab="fonts">텍스트 스타일</button>
                    <button class="design-tab" data-tab="layout">레이아웃</button>
                    <button class="design-tab" data-tab="navigation">페이지 흐름</button>
                </div>

                <!-- Tab 1: Fonts -->
                <div class="design-tab-content active" id="tab-fonts">
                    <div class="control-group">
                        <div class="control-group-title">폰트 설정</div>
                        <div class="control-row">
                            <label class="control-label">폰트 종류</label>
                            <select class="control-select" id="fontFamily" onchange="previewLive()">
                                <option value="Pretendard, sans-serif">Pretendard</option>
                                <option value="'Nanum Gothic', sans-serif">나눔고딕</option>
                                <option value="'Noto Sans KR', sans-serif">Noto Sans KR</option>
                                <option value="'Malgun Gothic', sans-serif">맑은 고딕</option>
                            </select>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="control-group-title">폰트 크기</div>
                        <div class="control-row">
                            <label class="control-label">페이지 제목</label>
                            <input type="range" class="control-range" id="titleFontSize" min="20" max="50" value="${currentSettings.titleFontSize}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="titleFontSizeVal">${currentSettings.titleFontSize}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">섹션 제목</label>
                            <input type="range" class="control-range" id="sectionTitleSize" min="16" max="36" value="${currentSettings.sectionTitleSize}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="sectionTitleSizeVal">${currentSettings.sectionTitleSize}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">질문 텍스트</label>
                            <input type="range" class="control-range" id="questionFontSize" min="14" max="28" value="${currentSettings.questionFontSize}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="questionFontSizeVal">${currentSettings.questionFontSize}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">답변 텍스트</label>
                            <input type="range" class="control-range" id="answerFontSize" min="12" max="24" value="${currentSettings.answerFontSize}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="answerFontSizeVal">${currentSettings.answerFontSize}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">버튼 텍스트</label>
                            <input type="range" class="control-range" id="buttonFontSize" min="12" max="24" value="${currentSettings.buttonFontSize}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="buttonFontSizeVal">${currentSettings.buttonFontSize}px</span>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Layout -->
                <div class="design-tab-content" id="tab-layout">
                    <div class="control-group">
                        <div class="control-group-title">메인 섹션</div>
                        <div class="control-row">
                            <label class="control-label">최대 너비</label>
                            <input type="range" class="control-range" id="mainSectionWidth" min="800" max="1920" step="20" value="${currentSettings.mainSectionWidth}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="mainSectionWidthVal">${currentSettings.mainSectionWidth}px</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="control-group-title">카드 패딩</div>
                        <div class="control-row">
                            <label class="control-label">좌우 패딩</label>
                            <input type="range" class="control-range" id="cardPaddingX" min="16" max="100" value="${currentSettings.cardPaddingX}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="cardPaddingXVal">${currentSettings.cardPaddingX}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">상하 패딩</label>
                            <input type="range" class="control-range" id="cardPaddingY" min="16" max="100" value="${currentSettings.cardPaddingY}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="cardPaddingYVal">${currentSettings.cardPaddingY}px</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="control-group-title">요소 간격</div>
                        <div class="control-row">
                            <label class="control-label">요소 간격</label>
                            <input type="range" class="control-range" id="elementGap" min="8" max="40" value="${currentSettings.elementGap}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="elementGapVal">${currentSettings.elementGap}px</span>
                        </div>
                        <div class="control-row">
                            <label class="control-label">버튼 높이</label>
                            <input type="range" class="control-range" id="buttonHeight" min="36" max="64" value="${currentSettings.buttonHeight}" oninput="updateValueAndPreview(this)">
                            <span class="control-value" id="buttonHeightVal">${currentSettings.buttonHeight}px</span>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Navigation -->
                <div class="design-tab-content" id="tab-navigation">
                    <div class="control-group">
                        <div class="control-group-title">페이지 흐름</div>
                        <div class="page-flow">
                            ${PAGE_FLOW.map((page, i) => `
                                <a href="${page.url}" class="page-flow-item ${currentPage === page.name ? 'current' : ''}">${page.label}</a>
                                ${i < PAGE_FLOW.length - 1 ? '<span class="page-flow-arrow">→</span>' : ''}
                            `).join('')}
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="control-group-title">빠른 이동</div>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            ${PAGE_FLOW.map(page => `
                                <a href="${page.url}" class="page-flow-item" style="text-align: center;">${page.label}</a>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <button class="design-apply-btn" onclick="saveDesignSettings()">💾 저장하기</button>
                <button class="design-reset-btn" onclick="resetDesignSettings()">기본값으로 초기화</button>
            </div>
        `;

        document.body.appendChild(panel);

        // Set current font family
        const fontSelect = document.getElementById('fontFamily');
        if (fontSelect) {
            fontSelect.value = currentSettings.fontFamily;
        }

        // Setup dragging
        setupDragging();
    }

    function setupDragging() {
        const panel = document.getElementById('designPanel');
        const header = document.getElementById('designPanelHeader');

        header.style.cursor = 'grab';

        header.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('design-panel-close')) return;
            isDragging = true;
            header.style.cursor = 'grabbing';
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            const rect = panel.getBoundingClientRect();
            panelStartX = rect.left;
            panelStartY = rect.top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            panel.style.left = (panelStartX + dx) + 'px';
            panel.style.top = (panelStartY + dy) + 'px';
            panel.style.transform = 'none';
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
            const header = document.getElementById('designPanelHeader');
            if (header) header.style.cursor = 'grab';
        });
    }

    function attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.design-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.design-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.design-tab-content').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('tab-' + this.dataset.tab).classList.add('active');
            });
        });
    }

    function openPanel() {
        const panel = document.getElementById('designPanel');
        panel.style.display = 'block';
        // Center the panel
        panel.style.top = '50%';
        panel.style.left = '50%';
        panel.style.transform = 'translate(-50%, -50%)';
    }

    function closePanel() {
        document.getElementById('designPanel').style.display = 'none';
    }

    // Read current values from controls
    function readCurrentValues() {
        return {
            fontFamily: document.getElementById('fontFamily')?.value || currentSettings.fontFamily,
            titleFontSize: parseInt(document.getElementById('titleFontSize')?.value) || currentSettings.titleFontSize,
            sectionTitleSize: parseInt(document.getElementById('sectionTitleSize')?.value) || currentSettings.sectionTitleSize,
            questionFontSize: parseInt(document.getElementById('questionFontSize')?.value) || currentSettings.questionFontSize,
            answerFontSize: parseInt(document.getElementById('answerFontSize')?.value) || currentSettings.answerFontSize,
            buttonFontSize: parseInt(document.getElementById('buttonFontSize')?.value) || currentSettings.buttonFontSize,
            mainSectionWidth: parseInt(document.getElementById('mainSectionWidth')?.value) || currentSettings.mainSectionWidth,
            cardPaddingX: parseInt(document.getElementById('cardPaddingX')?.value) || currentSettings.cardPaddingX,
            cardPaddingY: parseInt(document.getElementById('cardPaddingY')?.value) || currentSettings.cardPaddingY,
            elementGap: parseInt(document.getElementById('elementGap')?.value) || currentSettings.elementGap,
            buttonHeight: parseInt(document.getElementById('buttonHeight')?.value) || currentSettings.buttonHeight
        };
    }

    // Apply settings to the page
    function applySettings(settings = currentSettings) {
        // Apply to page title
        document.querySelectorAll('.page-title').forEach(el => {
            el.style.fontFamily = settings.fontFamily;
            el.style.fontSize = settings.titleFontSize + 'px';
        });

        // Apply to section titles
        document.querySelectorAll('.section-title, .dashboard-title, .modal-title').forEach(el => {
            el.style.fontFamily = settings.fontFamily;
            el.style.fontSize = settings.sectionTitleSize + 'px';
        });

        // Apply to question labels
        document.querySelectorAll('.question-group label, .form-group label').forEach(el => {
            el.style.fontFamily = settings.fontFamily;
            el.style.fontSize = settings.questionFontSize + 'px';
        });

        // Apply to inputs/answers
        document.querySelectorAll('input:not(.control-range), textarea, select:not(.control-select)').forEach(el => {
            el.style.fontFamily = settings.fontFamily;
            el.style.fontSize = settings.answerFontSize + 'px';
        });

        // Apply to buttons
        document.querySelectorAll('.btn, button').forEach(el => {
            if (!el.classList.contains('design-settings-btn') &&
                !el.classList.contains('design-panel-close') &&
                !el.classList.contains('design-tab') &&
                !el.classList.contains('design-apply-btn') &&
                !el.classList.contains('design-reset-btn')) {
                el.style.fontFamily = settings.fontFamily;
                el.style.fontSize = settings.buttonFontSize + 'px';
            }
        });

        // Apply layout to page sections
        document.querySelectorAll('.page-section').forEach(el => {
            el.style.maxWidth = settings.mainSectionWidth + 'px';
        });

        // Apply to cards
        document.querySelectorAll('.card').forEach(el => {
            el.style.padding = settings.cardPaddingY + 'px ' + settings.cardPaddingX + 'px';
        });
    }

    // Global functions
    window.closeDesignPanel = closePanel;

    window.updateValueAndPreview = function (input) {
        const valSpan = document.getElementById(input.id + 'Val');
        if (valSpan) {
            valSpan.textContent = input.value + 'px';
        }
        // Apply real-time preview
        const liveSettings = readCurrentValues();
        applySettings(liveSettings);
    };

    window.previewLive = function () {
        const liveSettings = readCurrentValues();
        applySettings(liveSettings);
    };

    window.saveDesignSettings = function () {
        currentSettings = readCurrentValues();
        saveSettings();
        alert('설정이 저장되었습니다!');
    };

    window.resetDesignSettings = function () {
        if (confirm('설정을 기본값으로 초기화하시겠습니까?')) {
            currentSettings = { ...DEFAULT_SETTINGS };
            localStorage.removeItem('designSettings');
            location.reload();
        }
    };

})();
