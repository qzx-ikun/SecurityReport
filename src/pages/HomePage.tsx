import {
    ArrowRight,
    BookOpen,
    Boxes,
    CalendarClock,
    // Database,
    GraduationCap,
    Grid2X2,
    Scale,
    // TableProperties,
    FileBarChart,
    Table2,
    Image,
    Layers3,
    // Trash2
} from "lucide-react";

import {Link} from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// import {REPORT_META} from '../data/latestReportData';
import {useEffect, useState, useRef, useCallback} from 'react';


const REPORT_STATS = [
    {
        title: "报告正文页数",
        value: 171,
        desc: "报告正文页数",
        icon: BookOpen,
        color: "from-blue-500 to-cyan-400",
    },
    {
        title: "表格数",
        desc: "结构化数据",
        value: 48,
        icon: Table2,
        color: "from-purple-500 to-indigo-400",
    },
    {
        title: "图片数",
        desc: "可视化素材",
        value: 22,
        icon: Image,
        color: "from-cyan-500 to-teal-400",
    },
    {
        title: "参考文献",      // （包括论文、网页、官方文档等）
        desc: "参考文献数量",
        value: 1243,
        icon: FileBarChart,
        color: "from-orange-400 to-yellow-400",
    },
];

const ENTRY_POINTS = [
    {
        title: "调研方法",
        desc: "采用全生命周期调研框架，划分七大分析阶段，对照核心研究问题，梳理现有防护手段与攻防演化趋势",
        icon: Layers3,
        color: "from-blue-500 to-cyan-400",
        route: "/methodology" // 跳转路由
    },
    {
        title: "学术现状",
        desc: "梳理全球高校与科研院所相关研究布局，归纳前沿理论、实验方案与主流学术攻关方向",
        icon: GraduationCap,
        color: "from-indigo-500 to-purple-400",
        route: "/academia" // 跳转路由
    },
    {
        title: "产业现状",
        desc: "剖析产业落地进展、关键技术路线、产品布局形态，研判商业化应用格局与发展趋势",
        icon: Boxes,
        color: "from-cyan-500 to-blue-400",
        route: "/industry" // 跳转路由
    },
    {
        title: "安全事件",
        desc: "梳理典型安全事件时间脉络，汇总高危安全漏洞、攻击手段与主流攻击工具特征",
        icon: CalendarClock,
        color: "from-orange-400 to-red-400",
        route: "/incidents" // 跳转路由
    },
    {
        title: "政策法规",
        desc: "汇总全球AI领域相关政策、监管条文、法律法规及行业合规约束要求",
        icon: Scale,
        color: "from-blue-500 to-indigo-400",
        route: "/policy" // 跳转路由
    },
    {
        title: "研究展望",
        desc: "预判重点研究方向，梳理现存技术瓶颈、安全挑战与产业发展趋势",
        icon: Grid2X2,
        color: "from-pink-500 to-purple-400",
        route: "/futuredirections" // 跳转路由
    },
];

//
// const METHODOLOGY_ENTRY_POINTS = [
//     {
//         path: '/survey',
//         title: '需求规划',
//         description: '七个阶段，对照问题、现有防护与攻防趋势。',
//         icon: Layers3,
//     },
//     {
//         path: '/research',
//         title: '架构设计',
//         description: '全球高校、科研机构、产学协同和硬件芯片。',
//         icon: GraduationCap,
//     },
//     {
//         path: '/products',
//         title: '编码开发',
//         description: '北美、欧洲与我国主流产品的完整对比。',
//         icon: Boxes,
//     },
//     {
//         path: '/incidents',
//         title: '安全测试',
//         description: '事件时间线、主要漏洞与攻击工具。',
//         icon: CalendarClock,
//     },
//     {
//         path: '/policy',
//         title: '部署交付',
//         description: '全球安全治理和出口管制政策。',
//         icon: Scale,
//     },
//     {
//         path: '/tables',
//         title: '运行迭代',
//         description: '浏览并搜索终稿第 2–6 章的全部 48 张原表。',
//         icon: TableProperties,
//     },
//     {
//         path: '/tables',
//         title: '退役销毁',
//         description: '浏览并搜索终稿第 2–6 章的全部 48 张原表。',
//         icon: TableProperties,
//     },
// ];


function CoverCarousel() {
    const covers = [
        "/report-cover.png",
        "/report_motivation.png",     // "/report_motivation.png",
        "/report_architecture.png"
    ];
    const total = covers.length;
    const duration = 600; // 建议不要低于400，过低动画会抖动

    // 当前激活下标
    const [activeIdx, setActiveIdx] = useState(0);
    const isAnimating = useRef(false);
    const timerRef = useRef<number | null>(null);

    // 获取环形下标
    const getCircularIndex = (idx: number) => ((idx % total) + total) % total;

    const goNext = useCallback(() => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        setActiveIdx(prev => getCircularIndex(prev + 1));
        setTimeout(() => {
            isAnimating.current = false;
        }, duration);
    }, []);

    const switchTo = useCallback((target: number) => {
        if (isAnimating.current || target === activeIdx) return;
        isAnimating.current = true;
        setActiveIdx(target);
        setTimeout(() => {
            isAnimating.current = false;
        }, duration);
    }, [activeIdx]);

    // 自动轮播
    useEffect(() => {
        timerRef.current = window.setInterval(goNext, 2000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [goNext]);

    const handleMouseEnter = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
    const handleMouseLeave = () => {
        timerRef.current = window.setInterval(goNext, 4000);
    };

    // 计算三张图下标
    const prevIndex = getCircularIndex(activeIdx - 1);
    const nextIndex = getCircularIndex(activeIdx + 1);

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="carousel-wrap">
            <div className="slider-view">
                {/* 左侧容器 */}
                <div className="slide-panel slide-left">
                    <img src={covers[prevIndex]} alt="preview"/>
                </div>
                {/* 中间【永久居中】容器 */}
                <div className="slide-panel slide-center">
                    <img src={covers[activeIdx]} alt="active"/>
                </div>
                {/* 右侧容器 */}
                <div className="slide-panel slide-right">
                    <img src={covers[nextIndex]} alt="preview"/>
                </div>
            </div>

            <div className="carousel-dots">
                {covers.map((_, i) => (
                    <span
                        key={i}
                        className={`dot ${activeIdx === i ? "dot-active" : ""}`}
                        onClick={() => switchTo(i)}
                    />
                ))}
            </div>
        </div>
    );
}


export default function HomePage() {
    // const citedWithUrl = REFERENCES.filter((reference) => reference.url).length;

    return (
        <div className="min-h-screen bg-white">
            <Header/>
            <main>
                <section className="border-b border-slate-200 bg-slate-50">
                    <div
                        className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_550px] lg:py-16">
                        {/* 左侧文字区域：PC&移动端全部居中 */}
                        <div className="self-center text-center">
                            <h1 className="mx-auto text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
                                AI 智能体安全调研报告<br/>
                                <span className="inline-flex items-center justify-center gap-3">
                                    {/* 纯文本，无链接 */}
                                    <span className="md:text-4xl text-3xl text-slate-950">(2026)</span>
                                    {/* 只有图片被a标签包裹，仅图标可点击 */}
                                    <a
                                        href="ai-agent-sec-report-20260731.pdf"
                                        download="AI智能体安全调研报告(2026).pdf"
                                        className="inline-flex transition-opacity hover:opacity-80"
                                    >
                                        <img
                                            src="download-logo.png"
                                            alt="下载报告"
                                            className="h-[45px] w-auto object-contain select-none pointer-events-none"
                                        />
                                    </a>
                                </span>
                            </h1>
                            <p className="mt-4 mx-auto text-lg font-bold leading-8 text-slate-600">
                                – 全生命周期视角下的风险机理、威胁演化与趋势分析
                            </p>

                            <div className="mt-20">
                                <p className="text-lg md:text-2xl font-normal leading-snug text-slate-900">
                                    <a
                                        href="https://cnic.cas.cn/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-600 hover:underline transition-colors"
                                    >
                                        中国科学院计算机网络信息中心 (CNIC)
                                    </a>
                                </p>
                            </div>
                            <div className="mt-3">
                                <p className="text-base md:text-lg font-normal leading-snug text-slate-800">
                                    网络空间安全技术与应用发展部 (安全部)
                                </p>
                            </div>

                            {/* 重点：justify-center 实现按钮居中 */}
                            <div className="mt-10 flex flex-wrap justify-center gap-12">
                                <Link
                                    to="/fullreport"
                                    className="inline-flex h-11 items-center gap-2 rounded bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
                                >
                                    阅读调研正文 <ArrowRight size={16}/>
                                </Link>
                                <Link
                                    to="/references"
                                    className="inline-flex h-11 items-center gap-2 rounded border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                                >
                                    <BookOpen size={16}/> 查看参考文献
                                </Link>
                            </div>
                        </div>

                        {/* 右侧轮播区域 */}
                        <div style={{minHeight: "420px"}}>
                            <CoverCarousel/>
                        </div>
                    </div>
                </section>

                {/*<section className="border-b border-slate-200">*/}
                <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
                    <div className="mb-7">
                        <h2 className="text-center text-3xl font-bold">调研统计信息</h2>
                        {/*<h2 className="mt-2 text-2xl font-bold text-slate-950">调研统计信息</h2>*/}
                    </div>

                    {/*<div className="border border-slate-200 overflow-hidden">*/}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 p-5">
                        {REPORT_STATS.map((item) => {
                            const Icon = item.icon;
                            const leftBracketIndex = item.title.indexOf("（");
                            let mainText = item.title;
                            let smallText = "";

                            if (leftBracketIndex !== -1) {
                                mainText = item.title.substring(0, leftBracketIndex);
                                smallText = item.title.substring(leftBracketIndex);
                            }

                            return (
                                <div
                                    key={item.title}
                                    className="flex items-start gap-4 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 transition hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    {/* fixed 防止图标挤压，宽高固定 */}
                                    <div
                                        className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                                        <Icon size={28} className="text-white"/>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="text-3xl font-extrabold text-slate-900">{item.value}</div>
                                        <div className="mt-1">
                                            <div className="text-sm font-semibold text-slate-600">{mainText}</div>
                                            {smallText && (
                                                <div className="mt-0.5 text-xs text-slate-400">{smallText}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/*</div>*/}

                    <div className="mt-10"></div>

                    {/* 图片横向容器：自动换行、水平均分、居中 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                            <img
                                src="/report-figures/fig-1-3-modified.png"
                                alt="论文统计"
                                className="w-full h-auto max-h-[280px] object-contain select-none pointer-events-none"

                            />
                            {/* 图片下方注释文字，可自由调整对齐、字号、颜色 */}
                            <span className="mt-2 text-xs font-bold text-slate-900 text-center">
                            注：参考文献包括论文、网页、官方文档等，但本图只统计论文信息
                          </span>
                        </div>

                        <div className="flex flex-col">
                            <img
                                src="/report-figures/figure-1-4-modified.png"
                                alt="研究主体来源统计"
                                className="w-full h-auto max-h-[280px] object-contain select-none pointer-events-none"
                            />
                        </div>
                        <div className="flex flex-col">
                            <img
                                src="/report-figures/fig-1-5-modified.png"
                                alt="第一作者国家分布统计"
                                className="w-full h-auto max-h-[280px] object-contain select-none pointer-events-none"
                            />
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-5 py-8">
                    <h2 className="text-center text-3xl font-bold">调研报告主要内容</h2>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {ENTRY_POINTS.map(({title, desc, icon: Icon, color, route}) => (
                            <Link
                                key={title}
                                to={route}
                                className="group rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl block"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white`}>
                                        <Icon size={28}/>
                                    </div>
                                    <h4 className="text-xl font-bold">{title}</h4>
                                </div>

                                <p className="mt-4 leading-7 text-slate-500">{desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/*<section className="mx-auto max-w-7xl px-5 py-10 md:px-8">*/}
                {/*    <div className="mb-7">*/}
                {/*        /!*<div className="text-xs font-bold text-blue-600">REPORT NAVIGATION</div>*!/*/}
                {/*        /!*<h2 className="mt-2 text-2xl font-bold text-slate-950">调研分析方法</h2>*!/*/}
                {/*        <h2 className="text-center text-3xl font-bold">全生命周期调研方法</h2>*/}
                {/*    </div>*/}
                {/*    <div className="grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">*/}
                {/*        {METHODOLOGY_ENTRY_POINTS.map((item) => {*/}
                {/*            const Icon = item.icon;*/}
                {/*            return (*/}
                {/*                <Link*/}
                {/*                    key={item.path}*/}
                {/*                    to={item.path}*/}
                {/*                    className="group min-h-44 border-b border-r border-slate-200 p-6 hover:bg-slate-50"*/}
                {/*                >*/}
                {/*                    <Icon size={22} className="text-blue-600"/>*/}
                {/*                    <h3 className="mt-6 text-lg font-bold text-slate-950 group-hover:text-blue-700">{item.title}</h3>*/}
                {/*                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>*/}
                {/*                </Link>*/}
                {/*            );*/}
                {/*        })}*/}
                {/*    </div>*/}

                <section className="mx-auto max-w-7xl px-5 py-12">
                    {/*<h2 className="text-center text-3xl font-bold mb-12">全生命周期调研方法</h2>*/}

                    {/*<div className="relative">*/}
                    {/*    /!* 中间连接线 *!/*/}
                    {/*    <div className="absolute top-[44px] left-0 w-full h-[2px] bg-blue-300 z-0"></div>*/}
                    {/*    <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-4 relative z-10">*/}
                    {/*        {lifeCycleList.map((item) => (*/}
                    {/*            <div key={item.title} className="flex flex-col items-center text-center">*/}
                    {/*                <div*/}
                    {/*                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-blue-500 bg-white">*/}
                    {/*                    <item.icon size={24} className="text-blue-500"/>*/}
                    {/*                </div>*/}
                    {/*                <h4 className="mt-4 font-bold text-lg">{item.title}</h4>*/}
                    {/*                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>*/}
                    {/*            </div>*/}
                    {/*        ))}*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* 图片横向容器：自动换行、水平均分、居中 */}
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                        <img
                            src="/report-figures/figure-1-2.png"
                            alt="调研方法图"
                            className="w-full h-auto max-h-[780px] object-contain select-none pointer-events-none"
                        />
                    </div>
                </section>

                {/*<section className="border-y border-slate-200 bg-slate-950 text-white">*/}
                {/*    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">*/}
                {/*        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">*/}
                {/*            <div>*/}
                {/*                <div className="text-xs font-bold text-blue-400"></div>*/}
                {/*                <h2 className="mt-2 text-2xl font-bold">重要研究方向</h2>*/}
                {/*                <p className="mt-3 text-sm leading-6 text-slate-400">*/}
                {/*                    /!* 面向规模化落地后的系统性风险，报告提出四条重点研究路线。 *!/*/}
                {/*                </p>*/}
                {/*            </div>*/}
                {/*            <ol className="grid gap-px bg-slate-700 sm:grid-cols-2">*/}
                {/*                {DIRECTIONS.map((direction, index) => (*/}
                {/*                    <li key={direction} className="flex min-h-24 items-start gap-4 bg-slate-900 p-5">*/}
                {/*                        <span className="text-xl font-bold text-blue-400">0{index + 1}</span>*/}
                {/*                        <span*/}
                {/*                            className="text-sm font-semibold leading-6 text-slate-100">{direction}</span>*/}
                {/*                    </li>*/}
                {/*                ))}*/}
                {/*            </ol>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</section>*/}


                <div className="mx-auto max-w-7xl px-5 md:px-8"><Footer/></div>

                {/* Footer Banner */}
                <section
                    className="mx-10 mb-20 flex justify-between rounded-3xl bg-gradient-to-r from-blue-50 to-cyan-50 p-10 items-center">
                    <div>
                        <h3 className="text-2xl font-bold">关于本报告</h3>
                        <p className="mt-4 text-slate-600">
                            本调研报告聚焦 2025—2026 年度 AI 智能体安全领域进展，资料截止 2026 年 7 月 31
                            日，依托专家主导、人机协同方式完成，全部内容经过人工溯源校验。
                            本调研报告仍存在一定局限：调研主体以我国、欧美头部机构为主，缺少日韩、东南亚及海外重点实验室相关资料；
                            同时行业发展尚处早期，大量核心文献为未经同行评审的预印本，相关结论仍需持续验证。
                            后续将持续吸纳全球前沿成果，完善分析框架，丰富实证案例，迭代研究体系。

                            {/*  本报告聚焦 2025—2026 年度 AI 智能体安全领域发展进展，全部调研资料整理截止至 2026 年 7 月 31 日。报告采用专家主导、人机协同的研究模式形成，
                             所有调研内容均完成人工溯源核查与深度研判，力求保障内容准确与论证严谨。*/}
                            {/*本次研究存在两处主要局限：*/}
                            {/*1）调研样本集中于国内与欧美头部科研机构、企业，日韩、东南亚相关机构及海外重点实验室的资料收集不足，全球维度对比分析存在短板；*/}
                            {/*2）当前领域仍处于快速发展阶段，大量核心参考文献为预印本成果，尚未完成同行评审，相关结论有待进一步验证。*/}
                            {/*后续研究将持续纳入全球前沿学术与产业成果，完善通用智能体分析框架，扩充落地实证案例，持续优化研究体系与研判结论。*/}

                        </p>
                    </div>
                    {/*<button className="rounded-full bg-blue-600 px-6 py-3 text-white">了解更多</button>*/}
                </section>

            </main>
            <footer className="mt-12 border-t border-slate-200 py-6 text-center text-sm text-slate-600">
                <p className="mt-1">© 2026。钱政希、杨琨 | 网站开发、维护与更新。
                    如有意见、建议或技术问题，可通过邮箱联系：
                    <a href="mailto:yangkun@cnic.cn" className="ml-1 text-blue-600 hover:underline">
                        yangkun@cnic.cn
                    </a>
                </p>
            </footer>
        </div>

    );
}
