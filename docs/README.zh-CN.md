# Zr–Nb 结构实验室

一个用来理解锆铌合金结构、氢行为与辐照影响的离线 HTML 教学程序。打开 `index.html` 即可使用，不需要安装依赖或联网。文件夹需要保持完整（HTML 会读取同目录下的 CSS 和 JS）。

## 从这里开始

1. 双击 `index.html`，使用 Chrome、Edge 或 Safari 打开。浏览器是运行环境，直接用文本编辑器打开只会看到代码。
2. 在「晶格观察」中切换 α-Zr、Nb 与 δ 氢化物，拖动旋转；观察密排层、体心、面心和间隙位置。
3. 回到「结构演化」，选择「仅充氢」，点击五次「推进 100 步」。观察左边界的氢进入、局部俘获与氢化物示意。
4. 记录快照。恢复相同种子和样品设置，改变一个条件后再做对照。
5. 「切换为加热阶段」保留结构和历史，停止氢与缺陷源并设定 600 °C。继续推进，比较状态重新分配与缺陷恢复。
6. 「XRD 衍射」中先单独改变均匀应变，再改变相干衍射域尺寸，分清峰位移动与峰宽变化。

每条时间历史最多 2000 演化步。切换到其他模块或将页面放入后台会暂停运行。刷新页面会清空当前实验；需要保留时请先导出。

## 你可以得到什么

- HCP、BCC 和 FCC 金属骨架的可交互几何模型。
- 原子氢示踪量的迁移、可逆俘获与析出过程，以及缺陷产生、复合与晶界吸收的可视化。
- 中子、质子、重离子和电子的作用形式示意；质子额外携带氢，电子不携带氢。
- 氢状态与缺陷计数曲线、局部网格信息、最多 6 条快照。
- 合成 XRD 参考峰与 Bragg 定律、尺寸/微应变展宽的联系。
- 可追溯参数、模型规则、参考文献和三组练习。

## 科学边界

二维过程模型尚未标定。演化步不是秒，氢示踪计数不是 ppm，缺陷计数不是 dpa，二维面积比例不是 Nb 的质量分数。网格没有实际长度。此版本不是分子动力学、相场或有限元求解器；不计算强度、韧性、裂纹或寿命。所有教学速率和假设列在 `MODEL.md` 与界面「原理与文献」中。

晶格参数来自具体文献中的代表值。XRD 峰位按晶格几何计算；峰强度为教学权重，峰宽采用各向同性近似。演化、晶格与 XRD 三个模块是相互解释的独立模型，不自动把示踪计数换算成实际相含量或晶格应变。

论文中可以把此程序称为「用于机制学习的交互式教学模型」。从中导出的计数和谱线不能标成实测结果，也不能用于预测真实合金的处理工艺或服役性能。

## 导出的内容

- **CSV**：随步数变化的氢、缺陷与守恒计数；头部带版本、种子、初始参数、最终参数和中途参数变化记录。
- **JSON**：上述历史、最终完整网格、快照与参数变更。文件带有模型类型和单位说明。
- 无云端存储或后台传输。当前版本不提供导入/恢复界面。JSON 可用于代码分析或按种子与变更历史重演，不能将最终网格直接视为已保存的随机数生成器状态。

## 文件结构

- `index.html` — 界面、原理、来源。
- `styles.css` — 响应式布局。
- `engine.js` — 可独立运行的模型与衍射公式。
- `app.js` — 可视化、交互与导出。
- `MODEL.md` — 完整规则与适用范围。
- `tests/` — 计数守恒、可重复性、XRD 与浏览器交互测试。
- `qa/` — 界面检查截图与验证记录。

程序运行不需要 Node。开发者可用 Node 执行 `node tests/engine.test.js`。浏览器测试需要 Playwright，并默认使用 macOS 上的 Google Chrome，可通过环境变量 `BROWSER_EXECUTABLE` 更换浏览器可执行路径。

## 后续研究所需信息

请先向科研导师确认合金牌号、Nb 含量与其他元素、热处理和初始相组成、真实样品尺寸、氢浓度/充氢方式、辐照粒子/能量/剂量/温度和可用表征。之后才能选择有针对性的物理模型、确定参数并用实验验证。

## Interactive 2D map

- **Structure & symbols**: continuous grain guides, outlined Nb regions, blue mobile-H dots, gold trapped-H squares, purple hydride diamonds, coral vacancy rings and lime interstitial crosses. Symbols indicate presence, not one atom per symbol. Nb outlines retain the actual grid mask; continuous grain outlines are visual guides.
- **Layers**: toggle species independently. Exact counts in the inspector always include hidden species.
- **H density / Defect density**: per-cell totals on an explicitly labelled, auto-ranging logarithmic colour scale. These views include all relevant reservoirs irrespective of symbol-layer filters. Do not compare colour brightness between runs without checking the displayed range.
- **Inspect**: click/tap a cell or use arrow keys. The panel gives exact cell counts and totals in the surrounding 5 × 5 neighbourhood (clipped at sample edges).
- **Zoom / Pan**: zoom 1–5×, drag with Pan, or use Ctrl/Command + wheel. Fit sample restores the full view. Plus/minus keys work with the map focused.
- **Find highest count**: selects the highest total-H cell in structure/H mode, or the highest total-defect cell in defect mode, and zooms to it. Ties select the first grid index.
- **+1 step**: pause and advance one model step to inspect individual state changes.

All map operations other than advancing the model change only the view; they do not alter material state or random-number history.
