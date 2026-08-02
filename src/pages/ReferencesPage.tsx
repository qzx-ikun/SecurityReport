import {useEffect, useMemo, useState} from 'react';
import {ExternalLink, Search} from 'lucide-react';
import {useLocation} from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// import PageIntro from '../components/report/PageIntro';
import {BIB_ENTRIES, REFERENCES} from '../data/latestReportData';
import type {ReferenceEntry} from '../data/latestReportData';

const CITE_TYPE_TABS = [
    {key: 'all', label: '全部'},
    {key: 'article', label: '期刊论文'},
    {key: 'conference', label: '会议论文'},
    {key: 'govdoc', label: '政府政策与报告'},
    {key: 'arxiv', label: '预印本论文'},
    {key: 'techdoc', label: '技术文档'},
    {key: 'researchwebpage', label: '学术与项目主页'},
] as const;

type ReferenceTypeTab = (typeof CITE_TYPE_TABS)[number]['key'];
type ReferenceCategory = Exclude<ReferenceTypeTab, 'all'>;

const BIB_ENTRY_BY_KEY = new Map(BIB_ENTRIES.map((entry) => [entry.key, entry]));

const GOVERNMENT_SOURCE_PATTERN = /(?:\.gov(?:\.|\/)|\.gouv(?:\.|\/)|gov\.cn|europa\.eu|canada\.ca|parliament|commission|government|ministry|国务院|政府|委员会|管理局|法案|条例|政策文件)/i;
const TECHNICAL_SOURCE_PATTERN = /(?:\/docs?\/|documentation|developer|api[-_ ]?reference|technical[-_ ]?report|whitepaper|system[-_ ]?card|security[-_ ]?card|技术文档|开发者文档|用户指南|白皮书)/i;

function classifyReference(reference: ReferenceEntry): ReferenceCategory {
    const bibEntry = reference.key ? BIB_ENTRY_BY_KEY.get(reference.key) : undefined;
    const bibType = bibEntry?.type.toLowerCase() ?? '';
    const searchableText = [
        reference.citation,
        reference.url,
        bibEntry?.title,
        bibEntry?.venue,
        bibEntry?.url,
    ].filter(Boolean).join(' ');

    if (/arxiv|preprint|预印本/i.test(searchableText)) {
        return 'arxiv';
    }

    if (GOVERNMENT_SOURCE_PATTERN.test(searchableText)) {
        return 'govdoc';
    }

    if (bibType === 'inproceedings' || bibType === 'incollection' || bibType === 'book') {
        return 'conference';
    }

    if (bibType === 'article' || bibType === 'artile') {
        return 'article';
    }

    if (
        bibType === 'techreport' ||
        bibType === 'report' ||
        bibType === 'software' ||
        TECHNICAL_SOURCE_PATTERN.test(searchableText)
    ) {
        return 'techdoc';
    }

    return 'researchwebpage';
}

export default function ReferencesPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const citationKey = params.get('key') ?? '';
    const [query, setQuery] = useState(citationKey);
    // ========== 新增：文献分类Tab状态 ==========
    const [activeTypeTab, setActiveTypeTab] = useState<ReferenceTypeTab>('all');

    useEffect(() => {
        setQuery(citationKey);
    }, [citationKey]);

    useEffect(() => {
        if (!location.hash) return;
        const id = decodeURIComponent(location.hash.slice(1));
        window.requestAnimationFrame(() => {
            document.getElementById(id)?.scrollIntoView({block: 'start'});
        });
    }, [location.hash]);

    const keyedEntry = useMemo(
        () => (citationKey ? BIB_ENTRIES.find((entry) => entry.key === citationKey) : undefined),
        [citationKey],
    );

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        let list = REFERENCES;

        // 1. 文献类型过滤
        if (activeTypeTab !== 'all') {
            list = list.filter((reference) => classifyReference(reference) === activeTypeTab);
        }

        // 2. 关键词搜索过滤
        if (!needle) return list;
        return list.filter((reference) =>
            reference.citation.toLowerCase().includes(needle) ||
            reference.key.toLowerCase().includes(needle) ||
            String(reference.number) === needle,
        );
    }, [query, activeTypeTab]);

    return (
        <div className="min-h-screen bg-white">
            <Header/>
            {/*<PageIntro*/}
            {/*  eyebrow="参考文献"*/}
            {/*  title="引用与外部来源"*/}
            {/*  description="正文中的数字引用可直接定位到本页对应条目；存在 URL 的题录可继续打开原始论文、政策文件、厂商公告或安全通报。"*/}
            {/*  meta={`${REFERENCES.length} 条报告参考文献 · ${REFERENCES.filter((item) => item.url).length} 条含 URL`}*/}
            {/*  icon={<BookOpen size={24} />}*/}
            {/*/>*/}

            {/* ==========【新增Tab区域，放在PageIntro与搜索框中间】========== */}
            <div className="mx-auto max-w-5xl px-5 md:px-8 py-6">
                <div className="flex flex-wrap gap-3">
                    {CITE_TYPE_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTypeTab(tab.key)}
                            className={`px-6 py-2.5 rounded-full transition-all text-sm font-bold whitespace-nowrap ${
                                activeTypeTab === tab.key
                                    ? "bg-[#209964] text-white"
                                    : "bg-slate-50 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 搜索框 sticky 区域保持原样 */}
            <div className="sticky top-[72px] z-30 border-b border-slate-200 bg-white/95 py-4 backdrop-blur">
                <div className="mx-auto max-w-5xl px-5 md:px-8">
                    <label className="relative block">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="搜索编号、题名、作者或 citation key"
                            className="h-11 w-full rounded border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </label>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-5 py-8 md:px-8">
                {keyedEntry && (
                    <section className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
                        <div className="mb-2 text-xs font-bold text-blue-700">BibTeX citation key
                            · {keyedEntry.key}</div>
                        <h2 className="font-bold text-slate-950">{keyedEntry.title}</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {[keyedEntry.author, keyedEntry.venue, keyedEntry.year].filter(Boolean).join(' · ')}
                        </p>
                        {keyedEntry.url && (
                            <a
                                href={keyedEntry.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline"
                            >
                                打开外部来源 <ExternalLink size={14}/>
                            </a>
                        )}
                    </section>
                )}

                <div className="mb-5 text-xs font-bold text-slate-400">显示 {visible.length} 条</div>
                <ol className="divide-y divide-slate-200 border-y border-slate-200">
                    {visible.map((reference) => (
                        <li
                            key={reference.number}
                            id={`ref-${reference.number}`}
                            className="grid scroll-mt-36 gap-3 py-5 md:grid-cols-[56px_minmax(0,1fr)_36px]"
                            style={{contentVisibility: 'auto', containIntrinsicSize: '1px 110px'}}
                        >
                            <div className="text-sm font-bold text-blue-600">[{reference.number}]</div>
                            <div>
                                <p className="text-sm leading-7 text-slate-700">{reference.citation}</p>
                                {reference.key && (
                                    <div className="mt-2 font-mono text-[11px] text-slate-400">{reference.key}</div>
                                )}
                            </div>
                            {reference.url ? (
                                <a
                                    href={reference.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="打开外部来源"
                                    className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600"
                                >
                                    <ExternalLink size={15}/>
                                </a>
                            ) : <span/>}
                        </li>
                    ))}
                </ol>
            </main>

            <div className="mx-auto max-w-7xl px-5 md:px-8"><Footer/></div>
        </div>
    );
}
