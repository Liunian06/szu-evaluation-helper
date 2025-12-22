# SZU一键评教助手 | SZU One-Click Evaluation Helper

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-9.2-blue.svg)](https://github.com/Liunian2000/szu-evaluation-helper)
[![Platform](https://img.shields.io/badge/platform-Tampermonkey-brightgreen.svg)](https://www.tampermonkey.net/)

一个为深圳大学（SZU）学生设计的油猴脚本，旨在简化 `jxpj.szu.edu.cn` 上的教学评教流程，将繁琐的重复性操作自动化，节省宝贵时间。

## ✨ 功能特性

-   **🚀 全自动流水线**：在课程列表页一键启动，脚本自动循环执行“进入课程 -> 填写 -> 提交 -> 拦截弹窗 -> 返回列表 -> 下一门课”的全套流程。
-   **📊 可视化进度面板**：精准读取系统数据，在页面右下角实时悬浮显示“已评/未评”课程数量及百分比进度条。
-   **🛡️ 强力弹窗拦截**：
    -   自动拦截并确认“你还能进行x次评价”的 Alert 提示。
    -   自动处理“所有评价都为A”的警告弹窗（自动选择“取消”以正式提交）。
    -   自动确认“是否提交”的二次确认弹窗。
-   **⚡ 极速填充**：自动为所有单选题选择第一个选项（通常是最高分），并自动在建议栏填写“无”。

## 🛠️ 安装步骤

1.  **安装用户脚本管理器**
    首先，你的浏览器需要一个用户脚本管理器扩展。推荐使用 [**Tampermonkey**](https://www.tampermonkey.net/)。
    -   [Chrome 用户](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    -   [Firefox 用户](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
    -   [Edge 用户](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2.  **安装本脚本**
    点击下面的链接，Tampermonkey 会自动弹出安装页面。

    -   **[点击此处从greasyfork安装](https://greasyfork.org/zh-CN/scripts/553863-szu%E4%B8%80%E9%94%AE%E8%AF%84%E6%95%99%E5%8A%A9%E6%89%8B)**
  
## 📖 使用方法

1.  登录并进入深圳大学教学评教页面（课程列表页）。
2.  等待页面右下角出现**进度面板**（显示已评/未评数量）。
3.  点击悬浮按钮 **“启动全自动”**。
4.  **请松开鼠标，喝口水** ☕️。脚本会自动逐个进入课程并完成评教，直到进度条变绿提示“完成”。

### ⚠️ 注意事项

-   **全自动模式**：启动后请不要随意点击页面，以免干扰脚本运行。脚本会自动处理所有跳转。
-   **评教内容**：脚本默认评价均为 **“A”**（最高选项）且建议为 **“无”**。如需个性化评价某位老师，请在启动全自动前手动完成该课程，或不使用全自动功能（进入具体课程页后，脚本仍提供单课“一键填写”功能）。
  

## 📄 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 授权。
