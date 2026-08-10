import {Boxes} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// import PageIntro from '../components/report/PageIntro';
import TableExplorer from '../components/report/TableExplorer';
import {REPORT_TABLES} from '../data/latestReportData';

//const TABLES = REPORT_TABLES.filter((table) => table.category === 'products');  //8.10修改
const TABLES = REPORT_TABLES.filter((table) =>
    ['products', 'collaboration', 'hardware'].includes(table.category),
);

export default function IndustryPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header/>
            {/*<PageIntro*/}
            {/*  // eyebrow="第 2.2 节"*/}
            {/*     eyebrow=""*/}
            {/*  title="全球 AI 智能体安全产品"*/}
            {/*  description="按北美、欧洲与我国三个区域完整展示主流产品、厂商、核心能力、适用场景与安全落地方向"*/}
            {/*  meta={`${TABLES.length} 张表 · ${TABLES.reduce((sum, table) => sum + table.rows.length, 0)} 行产品记录`}*/}
            {/*  icon={<Boxes size={35} />}*/}
            {/*/>*/}

            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-5 py-9 md:px-8">
                    {/* 父容器 flex items-center gap-2 并排图标+标题 */}
                    <div className="mb-2 flex items-center gap-2">
                        {/* 渐变图标方块，单独元素 */}
                        <div
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-400 flex-none">
                            <Boxes size={24} className="text-white" style={{shapeRendering: "geometricPrecision"}}/>
                        </div>
                        {/* h1 和图标同级，不要嵌套！ */}
                        <h1 className="text-3xl font-bold text-slate-950 md:text-3xl">产业界现状</h1>
                    </div>
                    {/* 独立段落，换行展示正文 */}
                    <p className="leading-7 text-slate-600">
                        本报告梳理北美、欧洲、国内主流厂商技术布局与产品特点：北美以 OpenAI、DeepMind、NVIDIA 为核心，深耕基础模型安全与智能体运行防护；
                        欧洲以 Mistral AI、Darktrace 为主，侧重可信 AI 架构与合规安全治理；国内百度、阿里、腾讯、智谱 AI、字节跳动等平台，
                        着力推进国产大模型安全与产业级智能体安全能力建设。
                    </p>
                </div>
            </section>

            {/* Modules Section */}
                <section className="mx-auto max-w-[1270px] px-5 py-8">
                    {/*<div className="mt-1 grid gap-8 md:grid-cols-4">*/}
                    {/*    {FUTURE_DIRECTIONS.map(({title, desc, icon: Icon, color}) => (*/}
                    {/*        <div*/}
                    {/*            key={title}*/}
                    {/*            className="group rounded-3xl border bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"*/}
                    {/*        >*/}
                    {/*            <div className="flex items-center gap-3">*/}
                    {/*                <div*/}
                    {/*                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shrink-0`}>*/}
                    {/*                    <Icon size={35}/>*/}
                    {/*                </div>*/}
                    {/*                <h4 className="text-lg font-bold">{title}</h4>*/}
                    {/*            </div>*/}

                    {/*            <p className="mt-4 leading-7 text-slate-500">{desc}</p>*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}

                    <div className="mt-1 grid grid-cols-1 sm:grid-cols-1 gap-6 mb-24">
                        <img
                            src="/report-figures/figure-2-3.png"
                            alt="产业现状"
                            className="w-full h-auto max-h-[780px] object-contain select-none pointer-events-none"
                        />
                    </div>
                </section>

            <TableExplorer tables={TABLES} filters={[
                                                    {id: 'all', label: '全部'},
                                                    {id: 'products', label: '产品总览'},
                                                    {id: 'collaboration', label: '产学协同'},
                                                    {id: 'hardware', label: '硬件与芯片'}]}/>
            <div className="mx-auto max-w-7xl px-5 md:px-8"><Footer/></div>
        </div>
    );
}

