import {useState, useRef, useEffect} from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

type TeamMember = {
    name: string;
    title: React.ReactNode;
    avatar: string;
    research: string;
    link?: string;
};

type TeamGroup = {
    label: React.ReactNode;
    key: string;
    footnote?: string;
    members: TeamMember[];
};

const TEAM_DATA: TeamGroup[] = [
    {
        label: "策划",
        key: "leadership",
        members: [
            {
                name: "孙德刚",
                title: <>中心党委书记<br/>正高级工程师</>,
                avatar: "/assets/avatar/sundegang.png",
                research: "网络体系结构、网络与系统安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "龙春",
                title: <>中心副主任<br/>正高级工程师</>,
                avatar: "/assets/avatar/longchun.png",
                research: "网络与系统安全监测与分析、数据安全、主动网络安全保障",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202107/t20210702_6125783.html"
            },
        ],
    },
    {
        label: "调研小组组长",
        key: "faculty",
        members: [
            {
                name: "杨琨",
                title: "研究员",
                avatar: "/assets/avatar/yangkun.png",
                research: "人工智能安全、智能体安全、网络空间安全",
                link: "https://cnic.cas.cn/rcdw/yjy/202603/t20260311_8155339.html"
            },
        ],
    },
    {
        label: <>调研小组成员<sup className="ml-0.5">†</sup></>,
        key: "postdoc-master-undergraduate",
        footnote: "† 研究成员依照姓氏排序",
        members: [
            {
                name: "丁文乐",
                title: "本科生",
                avatar: "/assets/avatar/male.png",
                research: "网络空间安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "李兴元",
                title: "本科生",
                avatar: "/assets/avatar/male.png",
                research: "网络空间安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "刘亚伟",
                title: "算法工程师",
                avatar: "/assets/avatar/male.png",
                research: "网络空间安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "钱政希",
                title: "本科生",
                avatar: "/assets/avatar/qianzhengxi.png",
                research: "智能体安全、多智能体系统",
                link: "https://github.com/qzx-ikun"
            },
            {
                name: "王耀辉",
                title: "博士",
                avatar: "/assets/avatar/male.png",
                research: "恶意加密流量检测，智能体安全，大模型安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "王蓉",
                title: "算法工程师",
                avatar: "/assets/avatar/wangrong.png",
                research: "网络安全、大模型安全",
                link: "https://github.com/KassieRgr"
            },
            {
                name: "张驰",
                title: "硕士生",
                avatar: "/assets/avatar/zhangchi.png",
                research: "人工智能安全、智能体系统安全、统计学习",
                link: "https://www.linkedin.com/in/chi-zhang123/"
            },
            {
                name: "郑思成",
                title: "本科生",
                avatar: "/assets/avatar/male.png",
                research: "网络空间安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
            {
                name: "祝慕",
                title: "博士后",
                avatar: "/assets/avatar/male.png",
                research: "网络空间安全",
                link: "https://cnic.cas.cn/sourcedb_cnic_cas/zw/rcdw/yjy/202209/t20220915_6512886.html"
            },
        ],
    },
];

export default function TeamPage() {
    const [activeTab, setActiveTab] = useState<string>("leadership");
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const isClickScrolling = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (isClickScrolling.current) return;
                let maxRatio = 0;
                let visibleKey = "";
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        visibleKey = entry.target.id;
                    }
                });
                if (visibleKey && visibleKey !== activeTab) {
                    setActiveTab(visibleKey);
                }
            },
            {
                threshold: [0.2, 0.5, 0.8],
                rootMargin: "-160px 0px -40% 0px",
            }
        );

        TEAM_DATA.forEach((group) => {
            const dom = sectionRefs.current[group.key];
            if (dom) observer.observe(dom);
        });

        return () => observer.disconnect();
    }, [activeTab]);

    const handleTabClick = (key: string) => {
        if (activeTab === key) return;
        setActiveTab(key);
        const targetDom = sectionRefs.current[key];
        if (!targetDom) return;

        isClickScrolling.current = true;
        targetDom.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        setTimeout(() => {
            isClickScrolling.current = false;
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white">
            <Header/>

            <section className="sticky top-[72px] z-30 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
                    <div className="overflow-x-auto pb-1">
                        <div className="flex flex-nowrap justify-center gap-3 min-w-max mx-auto">
                            {TEAM_DATA.map((group) => (
                                <button
                                    key={group.key}
                                    onClick={() => handleTabClick(group.key)}
                                    className={`px-6 py-2.5 rounded-full transition-all text-lg font-bold whitespace-nowrap ${
                                        activeTab === group.key
                                            ? "bg-[#209964] text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {group.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 space-y-24">
                {TEAM_DATA.map((group) => (
                    <div
                        key={group.key}
                        id={group.key}
                        ref={(el) => {
                            sectionRefs.current[group.key] = el;
                        }}
                        className="scroll-mt-[180px]"
                    >
                        <h3 className="text-center tracking-widest text-[#209964] font-semibold mb-2 text-lg">
                            {group.label}
                        </h3>

                        {group.footnote && (
                            <p className="text-center text-xs text-slate-500 mb-10">
                                {group.footnote}
                            </p>
                        )}

                        <div
                            className={`mx-auto max-w-[960px] gap-x-12 gap-y-16 ${
                                group.members.length > 4
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 place-items-center"
                                    : "flex flex-wrap justify-center items-center"
                            }`}
                        >
                            {group.members.map((person, idx) => {
                                const CardContent = (
                                    <>
                                        <div
                                            className="mx-auto w-[140px] h-[140px] overflow-hidden rounded-full border border-slate-100 shadow-sm mb-4 bg-slate-50">
                                            <img
                                                src={person.avatar}
                                                alt={person.name}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 will-change:transform"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.dataset.fallbackTriggered) {
                                                        target.dataset.fallbackTriggered = "true";
                                                        target.src = "/assets/avatar/default-avatar.png";
                                                    }
                                                }}
                                            />
                                        </div>
                                        <h4 className="text-lg font-semibold text-slate-1000">{person.name}</h4>
                                        <p className="text-sm font-semibold text-slate-1000 mt-1">{person.title}</p>
                                        {/*新增：展示研究方向*/}
                                        <p className="text-xs text-slate-500 mt-0.5 italic font-semibold">{person.research}</p>
                                    </>
                                );
                                return (
                                    <div key={idx} className="text-center group w-full max-w-[170px]">
                                        {person.link ? (
                                            <a
                                                href={person.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                {CardContent}
                                            </a>
                                        ) : (
                                            CardContent
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {group.members.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <p>Coming soon</p>
                            </div>
                        )}
                    </div>
                ))}
            </main>

            <Footer/>
        </div>
    );
}