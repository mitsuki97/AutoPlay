// ==UserScript==
// @name         自动刷课脚本
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  自动判断视频播放完毕，跳转至下一个视频学习，加入用户选择倍速功能，支持模拟鼠标悬停查找按钮，添加可视化提示框
// @author       You
// @match        https://tjgq.enetedu.com/Course/CourseVideo?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let selectedPlaybackRate = 2;

    // 创建可视化提示框
    function createNotificationBox() {
        const box = document.createElement('div');
        box.style.position = 'fixed';
        box.style.top = '20px';
        box.style.right = '20px';
        box.style.backgroundColor = '#fff';
        box.style.padding = '10px';
        box.style.border = '1px solid #ccc';
        box.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.2)';
        box.style.zIndex = '9999';

        const statusText = document.createElement('p');
        statusText.textContent = '脚本已开启';
        box.appendChild(statusText);

        const authorText = document.createElement('p');
        authorText.textContent = '编写人：三木';
        box.appendChild(authorText);

        const speedSelector = document.createElement('div');
        const speedOptions = [
            { value: 1, label: '正常' },
            { value: 2, label: '2 倍速' },
            { value: 10, label: '10 倍速' }
        ];

        speedOptions.forEach(option => {
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'playbackRate';
            radio.value = option.value;
            radio.id = `rate-${option.value}`;
            if (option.value === 2) {
                radio.checked = true;
            }
            radio.addEventListener('change', () => {
                selectedPlaybackRate = parseFloat(radio.value);
                setPlaybackRate();
            });
            speedSelector.appendChild(radio);

            const label = document.createElement('label');
            label.htmlFor = `rate-${option.value}`;
            label.textContent = option.label;
            speedSelector.appendChild(label);
        });

        box.appendChild(speedSelector);

        document.body.appendChild(box);
    }

    // 获取当前课程ID
    function getCurrentCourseId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('Coursewareid');
    }

    // 获取所有课程链接
    function getAllCourseLinks() {
        const courseLinks = [];
        const links = document.querySelectorAll('.courseteacher ul li a');
        links.forEach(link => {
            if (link.href.includes('Coursewareid=')) {
                courseLinks.push(link.href);
            }
        });
        return courseLinks;
    }

    // 查找当前课程在列表中的索引
    function findCurrentCourseIndex(courseId, courseLinks) {
        for (let i = 0; i < courseLinks.length; i++) {
            const linkParams = new URLSearchParams(new URL(courseLinks[i]).search);
            if (linkParams.get('Coursewareid') === courseId) {
                return i;
            }
        }
        return -1;
    }

    // 查找下一个课程链接
    function findNextCourseLink(currentIndex, courseLinks) {
        if (currentIndex < courseLinks.length - 1) {
            return courseLinks[currentIndex + 1];
        }
        return null;
    }

    // 模拟鼠标悬停并查找二倍速按钮
    function findDoubleSpeedButton() {
        const player = document.querySelector('.your-player-class'); // 替换为实际的播放器类名
        if (player) {
            const event = new Event('mouseover', { bubbles: true });
            player.dispatchEvent(event);

            // 等待一段时间，确保按钮显示出来
            setTimeout(() => {
                const doubleSpeedButton = document.querySelector('.your-double-speed-button-class'); // 替换为实际的二倍速按钮类名
                if (doubleSpeedButton) {
                    doubleSpeedButton.click();
                    console.log('已点击二倍速按钮');
                } else {
                    console.log('未找到二倍速按钮');
                }
            }, 500); // 可根据实际情况调整等待时间
        } else {
            console.log('未找到播放器元素');
        }
    }

    // 设置播放速度
    function setPlaybackRate() {
        const video = document.querySelector('video');
        if (video) {
            try {
                video.playbackRate = selectedPlaybackRate;
                console.log(`已将视频设置为 ${selectedPlaybackRate} 倍速播放`);
            } catch (error) {
                console.log(`直接设置 ${selectedPlaybackRate} 倍速失败，尝试模拟点击按钮`, error);
                if (selectedPlaybackRate === 2) {
                    findDoubleSpeedButton();
                }
            }
        }
    }

    // 监听视频播放结束事件
    function listenVideoEnd() {
        const video = document.querySelector('video');
        if (video) {
            // 初始设置播放速度
            setPlaybackRate();

            video.addEventListener('ended', () => {
                const currentCourseId = getCurrentCourseId();
                const courseLinks = getAllCourseLinks();
                const currentIndex = findCurrentCourseIndex(currentCourseId, courseLinks);
                const nextCourseLink = findNextCourseLink(currentIndex, courseLinks);
                if (nextCourseLink) {
                    console.log('当前视频播放完毕，跳转至下一个视频');
                    window.location.href = nextCourseLink;
                } else {
                    console.log('所有视频已学习完毕');
                }
            });
        } else {
            console.log('未找到视频元素');
        }
    }

    // 页面加载完成后执行
    window.addEventListener('load', () => {
        createNotificationBox();
        listenVideoEnd();
    });
})();