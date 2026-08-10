import {GraduationCap} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// import PageIntro from '../components/report/PageIntro';
import TableExplorer from '../components/report/TableExplorer';
import {REPORT_TABLES} from '../data/latestReportData';

/*const TABLES = REPORT_TABLES.filter((table) =>
    ['research', 'collaboration', 'hardware'].includes(table.category),
);*/ //8.10修改

const TABLES = REPORT_TABLES.filter((table) => table.category === 'research');

export default function AcademiaPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header/>
            {/*<PageIntro*/}
            {/*    // eyebrow="第 2.1、2.3、2.4 节"*/}
            {/*    eyebrow=""*/}
            {/*    title="全球研究与技术底座"*/}
            {/*    description="汇总北美、欧洲与我国的顶尖高校和科研机构、产学协同体系，以及 AI 硬件与芯片安全研究现状"*/}
            {/*    meta={`${TABLES.length} 张表 · ${TABLES.reduce((sum, table) => sum + table.rows.length, 0)} 行`}*/}
            {/*    icon={<GraduationCap size={35}/>}*/}
            {/*/>*/}

            <section className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl px-5 py-9 md:px-8">
                    {/* 父容器 flex items-center gap-2 并排图标+标题 */}
                    <div className="mb-2 flex items-center gap-2">
                        {/* 渐变图标方块，单独元素 */}
                        <div
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-400 flex-none">
                            <GraduationCap size={24} className="text-white"
                                           style={{shapeRendering: "geometricPrecision"}}/>
                        </div>
                        {/* h1 和图标同级，不要嵌套！ */}
                        <h1 className="text-3xl font-bold text-slate-950 md:text-3xl">学术界现状</h1>
                    </div>
                    {/* 独立段落，换行展示正文 */}
                    <p className="leading-7 text-slate-600">
                        本报告围绕全球 AI 智能体安全学术研究格局开展系统性梳理，选取北美、欧洲及国内顶尖高校、国家级重点实验室作为调研对象，
                        对现有相关研究成果进行归纳与分析。报告对比不同区域团队在智能体攻击范式、防护框架、协同安全、可信验证等方向的研究进展，
                        为领域后续研究方向规划、关键技术攻关布局提供参考依据。
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
                            src="/report-figures/figure-2-2.png"
                            alt="学术研究现状"
                            className="w-full h-auto max-h-[780px] object-contain select-none pointer-events-none"
                        />
                    </div>
                </section>

            <TableExplorer
                tables={TABLES}
                filters={[
                    {id: 'all', label: '全部'},
                    {id: 'research', label: '学术研究'},
                    //{id: 'collaboration', label: '产学协同'},
                    //{id: 'hardware', label: '硬件与芯片'},
                ]}
            />
            <div className="mx-auto max-w-7xl px-5 md:px-8"><Footer/></div>
        </div>
    );
}

