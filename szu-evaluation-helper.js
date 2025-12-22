// ==UserScript==
// @name         SZU一键全自动评教助手
// @namespace    https://github.com/Liunian06/szu-evaluation-helper
// @version      9.2
// @description  【全自动+进度显示】修复了"你还能进行x次评价"弹窗无法自动关闭的问题（拦截window.alert）。
// @author       流年.
// @match        https://jxpj.szu.edu.cn/education-jxcp-weixin-html/Student/Student2/index.html*
// @match        https://jxpj.szu.edu.cn/education-jxcp-weixin-html/Student/Result2/Result.html*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- 全局配置 ---
    const AUTO_MODE_KEY = 'SZU_AUTO_EVALUATION_MODE';

    // --- 1. 双重弹窗拦截器 (Alert + Confirm) ---
    function injectInterceptor() {
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                try {
                    console.log('【评教助手】正在安装双重拦截器...');

                    // 1. 拦截 Confirm (用于提交确认、全A警告)
                    const originalConfirm = window.confirm;
                    window.confirm = function(message) {
                        if (!message) return originalConfirm(message);

                        // 评教页：全A警告 -> 取消 (代表正式提交)
                        if (message.includes("所有评价都为A") || message.includes("返回评价页面修改")) {
                            console.log('拦截confirm: 全A警告 -> 取消');
                            return false;
                        }
                        // 评教页：最终确认 -> 确定
                        if (message.includes("确认提交") || message.includes("是否提交")) {
                            console.log('拦截confirm: 确认提交 -> 确定');
                            return true;
                        }
                        return originalConfirm(message);
                    };

                    // 2. 拦截 Alert (关键修复：专门针对列表页的“次数提示”)
                    const originalAlert = window.alert;
                    window.alert = function(message) {
                        // 列表页：提示"你还能进行x次评价" -> 直接忽略，不弹窗
                        if (message && (message.includes("还能进行") || message.includes("次评价"))) {
                            console.log('拦截alert: 次数提示 -> 忽略');
                            return; // 什么都不做，直接让代码继续往下跑
                        }
                        // 其他 alert 正常显示
                        return originalAlert(message);
                    }

                } catch (e) { console.error('拦截器安装失败', e); }
            })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }
    // 立即注入
    injectInterceptor();

    // --- 2. 页面路由 ---
    function onDomReady() {
        const currentURL = window.location.href;
        if (currentURL.includes("Student/Student2/index.html")) {
            runListPageLogic();
        } else if (currentURL.includes("Student/Result2/Result.html")) {
            runEvaluationPageLogic();
        }
    }

    // --- 3. 课程列表页逻辑 ---
    function runListPageLogic() {
        console.log("【评教助手】当前位于：课程列表页");
        const isAutoMode = sessionStorage.getItem(AUTO_MODE_KEY) === 'true';

        let globalDone = 0;
        let globalTodo = 0;
        let globalTotal = 0;

        const fab = createFab(isAutoMode ? "运行中..." : "启动全自动");
        if (isAutoMode) fab.style.backgroundColor = '#FF9800';

        const progressPanel = document.createElement('div');
        progressPanel.id = 'szu-progress-panel';
        progressPanel.innerHTML = `
            <div class="panel-header">评教进度</div>
            <div class="stat-row">
                <span class="stat-item finish">已评: <b id="p-done">-</b></span>
                <span class="stat-item remain">未评: <b id="p-todo">-</b></span>
            </div>
            <div class="progress-track">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="percent-text" id="p-percent">读取中...</div>
        `;
        document.body.appendChild(progressPanel);

        // XPath 读取工具
        function getNumberByXPath(path) {
            try {
                const result = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                const element = result.singleNodeValue;
                if (element && element.innerText) return parseInt(element.innerText.trim());
            } catch (e) { }
            return null;
        }

        // 数据监听轮询
        setInterval(() => {
            const doneVal = getNumberByXPath('/html/body/div[1]/div[3]/div[1]/div[2]/div[2]/div[1]');
            const todoVal = getNumberByXPath('/html/body/div[1]/div[3]/div[1]/div[2]/div[3]/div[1]');

            if (doneVal !== null && todoVal !== null) {
                globalDone = doneVal;
                globalTodo = todoVal;
                globalTotal = doneVal + todoVal;

                document.getElementById('p-done').innerText = globalDone;
                document.getElementById('p-todo').innerText = globalTodo;

                let percent = globalTotal > 0 ? Math.round((globalDone / globalTotal) * 100) : 100;
                document.querySelector('.progress-bar').style.width = percent + '%';
                document.getElementById('p-percent').innerText = percent + '%';

                if (globalTodo === 0 && globalTotal > 0) {
                     document.querySelector('.progress-bar').style.backgroundColor = '#4CAF50';
                }
            }
        }, 800);

        // 自动流程
        function processNextCourse() {
            // 安全退出机制
            if (globalTotal > 0 && globalTodo <= 0) {
                finishAll();
                return;
            }

            const courses = Array.from(document.querySelectorAll('.voite'));
            const targetBtn = courses.find(btn => btn.innerText.includes('点击评教'));

            if (targetBtn) {
                console.log("【评教助手】点击课程...");
                fab.innerHTML = '<span>进入中...</span>';
                // 延迟点击，给拦截器一点准备时间
                setTimeout(() => targetBtn.click(), 1000);
            } else {
                if (globalTotal > 0 && globalTodo > 0) {
                    console.log("【评教助手】暂未找到按钮，等待加载...");
                } else if (globalTotal > 0) {
                    finishAll();
                }
            }
        }

        function finishAll() {
            if (!isAutoMode) return;
            sessionStorage.removeItem(AUTO_MODE_KEY);
            fab.style.backgroundColor = '#4CAF50';
            fab.innerHTML = '<span>🎉 完成</span>';
            alert(`所有课程评教已完成！`);
        }

        fab.addEventListener('click', () => {
            if (!isAutoMode) {
                if (globalTotal === 0) { alert("数据读取中，请稍后..."); return; }
                if (globalTodo === 0) { alert("没有未评课程！"); return; }

                if (confirm(`准备开始评教 ${globalTodo} 门课程，确定吗？`)) {
                    sessionStorage.setItem(AUTO_MODE_KEY, 'true');
                    location.reload();
                }
            } else {
                sessionStorage.removeItem(AUTO_MODE_KEY);
                location.reload();
            }
        });

        if (isAutoMode) setTimeout(processNextCourse, 2000);
    }

    // --- 4. 评教页逻辑 ---
    function runEvaluationPageLogic() {
        console.log("【评教助手】当前位于：具体评教页");
        const isAutoMode = sessionStorage.getItem(AUTO_MODE_KEY) === 'true';

        if (isAutoMode) {
            const fab = createFab("自动处理...");
            fab.style.backgroundColor = '#FF9800';
            // 进页面稍微等一下，确保DOM加载
            setTimeout(() => {
                if (fillForm()) {
                    // 填完表单后，快速提交
                    setTimeout(() => {
                        submitForm();
                        waitForSuccessAndReturn();
                    }, 300);
                }
            }, 800);
        } else {
            const fab = createFab("一键评教");
            fab.addEventListener('click', () => {
                if (fillForm()) {
                    setTimeout(() => { submitForm(); waitForSuccessAndReturn(); }, 200);
                }
            });
        }
    }

    // --- 工具 ---
    function createFab(text) {
        const fab = document.createElement('div');
        fab.id = 'szu-helper-fab';
        fab.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24px" height="24px"><path d="M2.1,19.35l3.55-3.55L1.5,11.65l3.55,3.55L8.6,11.65l3.55,3.55-3.55,3.55,3.55,3.55-4.15,4.15c-0.39,0.39-1.02,0.39-1.41,0l-4.15-4.15C1.71,20.37,1.71,19.74,2.1,19.35z M22.5,12.35l-3.55-3.55l3.55-3.55L18.95,1.7c-0.39-0.39-1.02-0.39-1.41,0l-4.15,4.15l3.55,3.55L13.4,12.95l3.55-3.55l3.55,3.55L16.35,17.1c-0.39,0.39-0.39,1.02,0,1.41l4.15,4.15c0.39,0.39,1.02,0.39,1.41,0l4.15-4.15c0.39-0.39,0.39-1.02,0-1.41L22.5,12.35z"/></svg>
            <span>${text}</span>
        `;
        document.body.appendChild(fab);
        return fab;
    }

    function fillForm() {
        try {
            const firstOptions = document.querySelectorAll('.question-box ol.question-box-main > li[choice="choice1"]');
            firstOptions.forEach(option => option.click());
            const adviceTextarea = document.querySelector('textarea.advice-input');
            if (adviceTextarea) {
                adviceTextarea.value = '无';
                adviceTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return true;
        } catch (error) { return false; }
    }

    function submitForm() {
        const btn = document.getElementById('submitBtn');
        if (btn) btn.click();
    }

    function waitForSuccessAndReturn() {
        let timer = setInterval(() => {
            const closeBtn = document.querySelector('div.close-btn[jump-back="true"]');
            if (closeBtn) {
                clearInterval(timer);
                closeBtn.click();
            }
        }, 500);
    }

    GM_addStyle(`
        #szu-helper-fab {
            position: fixed; bottom: 30px; right: 30px; min-width: 60px; height: 60px;
            padding: 0 15px; background-image: linear-gradient(135deg, #4a90e2 0%, #50e3c2 100%);
            border-radius: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); color: white;
            display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 999999;
            transition: all 0.3s; font-family: sans-serif; font-size: 15px; font-weight: bold; user-select: none;
        }
        #szu-helper-fab:hover { transform: scale(1.05); }
        #szu-helper-fab svg { margin-right: 5px; }

        #szu-progress-panel {
            position: fixed; bottom: 100px; right: 30px; width: 180px;
            background: white; border-radius: 12px; padding: 15px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15); z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            animation: slideIn 0.5s ease;
        }
        .panel-header { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; }
        .stat-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; }
        .stat-item.finish { color: #4CAF50; }
        .stat-item.remain { color: #F44336; }
        .progress-track { width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
        .progress-bar { height: 100%; background: linear-gradient(90deg, #50e3c2, #4a90e2); transition: width 0.5s ease; }
        .percent-text { text-align: right; font-size: 10px; color: #999; margin-top: 4px; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
            #szu-helper-fab span { display: none; }
            #szu-helper-fab { width: 60px; padding: 0; }
            #szu-progress-panel { bottom: 100px; right: 10px; width: 140px; }
        }
    `);

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onDomReady);
    else onDomReady();

})();
