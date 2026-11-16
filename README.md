本地预览：直接用浏览器打开 index.html，或在本目录运行 python -m http.server 8000 后访问 http://localhost:8000。
文案与知识来源集中在 content.js；图片路径也在该文件配置。
请提供真实照片：assets/yellow-bell.jpg、assets/yellow-display.jpg、assets/yellow-panel.jpg。缺图会显示占位，不影响任务。拿到展柜照片后在 panelBounds 配置真实展板的百分比位置；未配置时不添加虚假框线。
OTHER_COLORS 保留后续资料接口；当前无其他颜色资料，因此隐藏可选入口。
本地存储 key 为 liuli-color-v1，仅保存颜色关进度；不可用时使用内存继续体验。

更新：颜色任务已改为手机分屏流程（答题 → 错误时展板提示及直接重选 / 正确时知识卡 → 完成页）。每次进入可直接答题；完成记录不会锁住新的尝试。正常手机视口采用紧凑布局，极短屏和放大字体时保留自然滚动，避免裁切。
