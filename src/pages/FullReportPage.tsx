import {useEffect, useMemo, useState} from 'react';
import {
    AlertTriangle,
    ArrowUp,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Flag,
    FlaskConical,
    Globe2,
    ShieldCheck,
    TrendingUp,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CitationText from '../components/report/CitationText';
import DataTable from '../components/report/DataTable';
import {REPORT_TABLES, SURVEY_CHAPTERS} from '../data/latestReportData';

const CHAPTER_ICONS = {
    'chapter-1': BookOpen,
    'chapter-2': Globe2,
    'chapter-3': AlertTriangle,
    'chapter-4': ShieldCheck,
    'chapter-5': TrendingUp,
    'chapter-6': FlaskConical,
    'chapter-7': Flag,
};

export default function FullReportPage() {
    const [activeChapterId, setActiveChapterId] = useState(SURVEY_CHAPTERS[0].id);
    const [activeSectionId, setActiveSectionId] = useState(SURVEY_CHAPTERS[0].sections[0].id);

    const chapter = useMemo(
        () => SURVEY_CHAPTERS.find((item) => item.id === activeChapterId) ?? SURVEY_CHAPTERS[0],
        [activeChapterId],
    );
    const section = useMemo(
        () => chapter.sections.find((item) => item.id === activeSectionId) ?? chapter.sections[0],
        [activeSectionId, chapter],
    );
    const sectionTables = useMemo(
        () =>
            (section.tableIds ?? [])
                .map((tableId) => REPORT_TABLES.find((table) => table.id === tableId))
                .filter((table): table is (typeof REPORT_TABLES)[number] => Boolean(table)),
        [section],
    );

    const selectChapter = (chapterId: string) => {
        const nextChapter = SURVEY_CHAPTERS.find((item) => item.id === chapterId);
        if (!nextChapter) return;
        setActiveChapterId(chapterId);
        setActiveSectionId(nextChapter.sections[0].id);
    };

    useEffect(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }, [activeChapterId, activeSectionId]);

    return (
        <div className="min-h-screen bg-white">
            <Header/>
            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-5 py-9 md:px-8">
                    {/* 父容器 flex items-center gap-2 并排图标+标题 */}
                    <div className="mb-2 flex items-center gap-2">
                        {/* 渐变图标方块，单独元素 */}
                        <div
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400 flex-none">
                            <BookOpen size={24} className="text-white"
                                      style={{shapeRendering: "geometricPrecision"}}/>
                        </div>
                        {/* h1 和图标同级，不要嵌套！ */}
                        <h1 className="text-3xl font-bold text-slate-950 md:text-3xl">AI智能体安全调研</h1>
                    </div>
                    {/*<p className="leading-7 text-slate-600">*/}
                    {/*    本报告以自主 AI 智能体安全为研究对象，构建全生命周期的调研分析框架。*/}
                    {/*    该框架以需求规划、架构设计、编码开发、安全测试、部署交付、运行迭代、退役销毁七大递进阶段作为生命周期主线覆盖智能体*/}
                    {/*    从研发至下线完整链路，沿业务流转链路划分感知、记忆、决策、行动、交互、治理六大功能模块构成横向切面以定位风险实体分布边界，*/}
                    {/*    依托该分析框架完成全阶段系统性的风险研判与防护体系梳理。*/}
                    {/*</p>*/}
                </div>
            </section>

            {/*/!* Modules Section *!/*/}
            {/*    <section className="mx-auto max-w-[1270px] px-5 py-8">*/}
            {/*        /!*<div className="mt-1 grid gap-8 md:grid-cols-4">*!/*/}
            {/*        /!*    {FUTURE_DIRECTIONS.map(({title, desc, icon: Icon, color}) => (*!/*/}
            {/*        /!*        <div*!/*/}
            {/*        /!*            key={title}*!/*/}
            {/*        /!*            className="group rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"*!/*/}
            {/*        /!*        >*!/*/}
            {/*        /!*            <div className="flex items-center gap-3">*!/*/}
            {/*        /!*                <div*!/*/}
            {/*        /!*                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shrink-0`}>*!/*/}
            {/*        /!*                    <Icon size={35}/>*!/*/}
            {/*        /!*                </div>*!/*/}
            {/*        /!*                <h4 className="text-lg font-bold">{title}</h4>*!/*/}
            {/*        /!*            </div>*!/*/}

            {/*        /!*            <p className="mt-4 leading-7 text-slate-500">{desc}</p>*!/*/}
            {/*        /!*        </div>*!/*/}
            {/*        /!*    ))}*!/*/}
            {/*        /!*</div>*!/*/}

            {/*        <div className="mt-1 grid grid-cols-1 sm:grid-cols-1 gap-6 mb-24">*/}
            {/*            <img*/}
            {/*                src="/report-figures/figure-1-10.png"*/}
            {/*                alt="报告章节结构图"*/}
            {/*                className="w-full h-auto max-h-[780px] object-contain select-none pointer-events-none"*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*    </section>*/}

            <div className="mx-auto flex max-w-7xl items-start">
                <aside
                    className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-80 flex-none overflow-y-auto border-r border-slate-200 bg-slate-50 p-5 lg:block">
                    <div className="mb-4 text-lg font-bold text-slate-900">目录</div>
                    <nav className="space-y-2">
                        {SURVEY_CHAPTERS.map((item) => {
                            const Icon = CHAPTER_ICONS[item.id as keyof typeof CHAPTER_ICONS] ?? BookOpen;
                            const expanded = item.id === activeChapterId;
                            return (
                                <div key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => selectChapter(item.id)}
                                        className={`flex w-full items-start gap-3 rounded px-3 py-3 text-left transition-colors ${
                                            expanded
                                                ? 'bg-slate-900 font-bold text-white'
                                                : 'text-slate-700 hover:bg-white hover:text-blue-700'
                                        }`}
                                    >
                                        <Icon size={17} className="mt-0.5 flex-none"/>
                                        <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold opacity-99">
                        {item.id === 'frontmatter' ? '' : `第 ${item.number} 章`}
                      </span>
                      <span className="mt-1 block text-sm font-bold leading-5">{item.title}</span>
                    </span>
                                        {expanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                    </button>

                                    {expanded && (
                                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-3">
                                            {item.sections.map((subsection) => (
                                                <button
                                                    key={subsection.id}
                                                    type="button"
                                                    onClick={() => setActiveSectionId(subsection.id)}
                                                    className={`w-full rounded px-3 py-2.5 text-left text-lg leading-5 transition-colors ${
                                                        subsection.id === section.id
                                                            ? 'bg-blue-50 font-bold text-blue-700'
                                                            : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                                    }`}
                                                >
                                                    <span className="mr-2 text-sm opacity-70">{subsection.number}</span>
                                                    <span className="mr-2 text-sm opacity-90">{subsection.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
                    <div className="mb-6 grid gap-3 lg:hidden">
                        <label>
                            <span className="mb-2 block text-xs font-bold text-slate-500">章节</span>
                            <select
                                value={activeChapterId}
                                onChange={(event) => selectChapter(event.target.value)}
                                className="h-11 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold"
                            >
                                {SURVEY_CHAPTERS.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.id === 'frontmatter' ? '前置' : `第 ${item.number} 章`} {item.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="mb-2 block text-sm font-bold text-slate-500">小节</span>
                            <select
                                value={section.id}
                                onChange={(event) => setActiveSectionId(event.target.value)}
                                className="h-11 w-full rounded border border-slate-200 bg-white px-3 text-sm font-semibold"
                            >
                                {chapter.sections.map((item) => (
                                    <option key={item.id} value={item.id}>{item.number} {item.title}</option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <header className="mb-8 border-b border-slate-200 pb-6">
                        <div className="mb-0.1 text-lg font-bold text-blue-600">
                            {chapter.id === 'frontmatter' ? '' : `第 ${chapter.number} 章`} {chapter.title} · {section.number} {section.title}
                        </div>
                        {/*<h2 className="text-2xl font-bold leading-tight text-slate-950">{section.title}</h2>*/}
                        {/*/!*<p className="mt-3 text-sm text-slate-500">{chapter.title}</p>*!/*/}
                    </header>

                    <article>
                        <div className="mb-6 flex items-center border-b border-slate-200 pb-4">
                            <h3 className="text-lg font-bold text-slate-700">正文</h3>
                            <span className="ml-auto text-xs font-semibold text-slate-400">
                                     {section.paragraphs.length} 个段落
              </span>
                        </div>
                        <div className="mx-auto max-w-3xl space-y-5">
                            {section.blocks
                                ? section.blocks.map((block, index) =>
                                    block.type === 'heading' ? (
                                        <h3
                                            key={`${section.id}-heading-${index}`}
                                            className="border-l-4 border-blue-600 pl-4 pt-2 text-sm font-bold leading-8 text-slate-950"
                                        >
                                            {block.text}
                                        </h3>
                                    ) : (
                                        <p
                                            key={`${section.id}-paragraph-${index}`}
                                            className="text-[15px] leading-8 text-slate-700"
                                        >
                                            <CitationText text={block.text}/>
                                        </p>
                                    ),
                                )
                                : section.paragraphs.map((paragraph, index) => (
                                    <p key={`${section.id}-${index}`} className="text-[15px] leading-8 text-slate-700">
                                        <CitationText text={paragraph}/>
                                    </p>
                                ))}
                        </div>
                        {section.figures && section.figures.length > 0 && (
                            <div className="mx-auto mt-12 max-w-4xl space-y-10">
                                {section.figures.map((figure) => (
                                    <figure key={figure.number}>
                                        <img
                                            src={figure.src}
                                            alt={`图 ${figure.number} ${figure.caption}`}
                                            loading="lazy"
                                            className="mx-auto h-auto w-full max-w-4xl"
                                        />
                                        <figcaption className="mt-3 text-center text-sm leading-6 text-slate-500">
                                            图 {figure.number}：{figure.caption}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        )}
                        {sectionTables.length > 0 && (
                            <div className="mt-12 space-y-12">
                                {sectionTables.map((table) => (
                                    <DataTable key={table.id} table={table} compact/>
                                ))}
                            </div>
                        )}
                    </article>
                </main>
            </div>

            <button
                type="button"
                title="返回顶部"
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                className="fixed bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-white text-slate-500 shadow-lg hover:text-blue-600"
            >
                <ArrowUp size={18}/>
            </button>
            <div className="mx-auto max-w-7xl px-5 md:px-8"><Footer/></div>
        </div>
    );
}
