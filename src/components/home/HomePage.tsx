import React, { useState } from 'react';
import { PageId, ResourceTab } from '../../types';
import {
  Search,
  BookOpen,
  FileText,
  Presentation,
  ListOrdered,
  HelpCircle,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileCode,
  Check,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, tab?: ResourceTab) => void;
  onApplyIntentConfig?: (intent: { project: string; periods: number }) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onApplyIntentConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchResult, setActiveSearchResult] = useState<'none' | 'materials' | 'intent_plan' | 'intent_ppt'>('none');
  const [previewMaterialModal, setPreviewMaterialModal] = useState<string | null>(null);

  // Intent detection logic
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setActiveSearchResult('none');
      return;
    }

    if (query.includes('教案') || query.includes('课时') || query.includes('正反转')) {
      setActiveSearchResult('intent_plan');
    } else if (query.includes('ppt') || query.includes('课件')) {
      setActiveSearchResult('intent_ppt');
    } else if (query.includes('资料') || query.includes('电气控制') || query.includes('教材') || query.includes('查找')) {
      setActiveSearchResult('materials');
    } else {
      setActiveSearchResult('materials');
    }
  };

  const handleSelectPresetQuery = (queryText: string) => {
    setSearchQuery(queryText);
    if (queryText.includes('教案')) {
      setActiveSearchResult('intent_plan');
    } else if (queryText.includes('实训资料')) {
      setActiveSearchResult('materials');
    } else if (queryText.includes('课件') || queryText.includes('PPT')) {
      setActiveSearchResult('intent_ppt');
    }
  };

  const handleConfirmPlanIntent = () => {
    onApplyIntentConfig?.({
      project: '三相异步电动机正反转控制线路的识读与调试',
      periods: 2,
    });
    onNavigate('plan-create');
  };

  // Sample course materials matching PRD 《电气控制技术》
  const courseMaterials = [
    {
      id: 'mat-1',
      title: '高教版《电气控制技术》第四章：三相异步电动机继电接触控制',
      category: '规划教材章节',
      source: '高教社“十四五”国规教材库 · 数字化教材',
      format: 'PDF / 42页',
      desc: '详细阐述换相原理、接触器自锁互锁电气逻辑图及低压电工安全操作禁令。',
    },
    {
      id: 'mat-2',
      title: '三相异步电动机双重联锁正反转控制线路接线实操图纸',
      category: '国家标准图纸',
      source: '国家标准 GB/T 4728 电气图样规范库',
      format: 'DWG / SVG',
      desc: '标有标准元件代号 QF, FU1, FU2, KM1, KM2, FR, SB1-SB3 的完整工程图。',
    },
    {
      id: 'mat-3',
      title: '智能制造车间流水线物料双向输送机控制工程案例',
      category: '企业工程案例',
      source: '产教融合校企实训案例库（装备制造）',
      format: 'DOCX / 18页',
      desc: '涵盖传送带双向正反向运转工况、机械限位防护及互锁防短路设计要求。',
    },
    {
      id: 'mat-4',
      title: '典型相间短路与接触器触头粘连拉弧故障排查视频微课',
      category: '微课视频',
      source: '国家级职业教育专业教学资源库',
      format: 'MP4 / 8分15秒',
      desc: '高清展示未加互锁导致的相间短路爆鸣及数字万用表静态电阻排查法。',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white flex flex-col justify-between">
      {/* Hero & AI Search Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        {/* Title & Kicker */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>面向职业院校教师的专业级 AI 备课平台</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight text-balance">
            AI 教师助理
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            自然语言驱动的理实一体化教学方案设计与课程教学资源生成工作台
          </p>
        </div>

        {/* AI Natural Language Search Bar */}
        <div className="max-w-3xl mx-auto relative">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white rounded-xl shadow-lg shadow-blue-900/5 border-2 border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all p-1.5"
          >
            <div className="pl-3.5 text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索教学资料，或告诉我你想生成什么..."
              className="w-full py-3 px-3 text-slate-800 placeholder-slate-400 bg-transparent text-sm sm:text-base focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
            >
              <span>智能识别</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompt Recommendation Chips */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="text-slate-400">试一试指令：</span>
            <button
              type="button"
              onClick={() => handleSelectPresetQuery('帮我生成电动机正反转控制的 2 课时教案')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/80"
            >
              “帮我生成电动机正反转控制的 2 课时教案”
            </button>
            <button
              type="button"
              onClick={() => handleSelectPresetQuery('查找《电气控制技术》的实训资料')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/80"
            >
              “查找《电气控制技术》的实训资料”
            </button>
            <button
              type="button"
              onClick={() => handleSelectPresetQuery('生成电动机正反转控制线路的授课课件')}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors border border-slate-200/80"
            >
              “生成电动机正反转控制线路的授课课件”
            </button>
          </div>
        </div>

        {/* Dynamic Intent & Results Container */}
        {activeSearchResult === 'intent_plan' && (
          <div className="mt-8 max-w-3xl mx-auto p-5 bg-blue-50/70 border border-blue-200 rounded-xl text-left shadow-xs transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                    已智能识别为：教案生成意图
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  三相异步电动机正反转控制线路的识读与调试（2 课时）
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  系统已自动为您匹配关联课程《电气控制技术》、实训项目及2课时标准结构模板。点击下方按钮即可进入配置页补齐材料并生成。
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span>课程：电气控制技术</span>
                  <span aria-hidden="true">·</span>
                  <span>课时：2 课时 (90分钟)</span>
                  <span aria-hidden="true">·</span>
                  <span>课型：理实一体化实训</span>
                </div>
              </div>
              <button
                onClick={handleConfirmPlanIntent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs shrink-0 self-center"
              >
                <span>进入教案配置</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeSearchResult === 'intent_ppt' && (
          <div className="mt-8 max-w-3xl mx-auto p-5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-left shadow-xs transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    已智能识别为：AI PPT 课件生成意图
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  电动机正反转控制线路授课课件（含双重互锁与原理图）
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  系统可将教案中的情境、教学重点、公式与电气原理图自动编排为大屏授课 PPT。
                </p>
              </div>
              <button
                onClick={() => onNavigate('ppt')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs shrink-0 self-center"
              >
                <span>进入课件制作</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {activeSearchResult === 'materials' && (
          <div className="mt-8 max-w-3xl mx-auto p-5 bg-slate-50 border border-slate-200 rounded-xl text-left shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>教师已授权课程资料（共检索到 4 项有效依据）</span>
              </div>
              <span className="text-xs text-slate-500">来源：已接入校级向量知识库</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {courseMaterials.map((mat) => (
                <div key={mat.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-700">{mat.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{mat.format}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 hover:text-blue-600 cursor-pointer">
                      {mat.title}
                    </h4>
                    <p className="text-xs text-slate-600">{mat.desc}</p>
                    <div className="text-[11px] text-slate-400">来源：{mat.source}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                    <button
                      onClick={() => setPreviewMaterialModal(mat.title)}
                      className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
                    >
                      查看原文
                    </button>
                    <button
                      onClick={() => {
                        onApplyIntentConfig?.({
                          project: '三相异步电动机正反转控制线路的识读与调试',
                          periods: 2,
                        });
                        onNavigate('plan-create');
                      }}
                      className="px-2.5 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      生成教案
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5 Core Lightweight Tools Entrance Grid */}
      <section className="py-12 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">五个核心教学工具</h2>
              <p className="text-xs text-slate-500 mt-1">
                点击直接打开对应页面，协同赋能职业院校教师教学全生命周期
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>实施方案</span>
              <span aria-hidden="true">·</span>
              <span>授课课件</span>
              <span aria-hidden="true">·</span>
              <span>课程大纲 / 题库 / 标准</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tool 1: 智能教案 */}
            <div
              onClick={() => onNavigate('plan-list')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  智能教案
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  理实一体化实训方案。多智能体协同生成，含规范六步法、电路图与数理公式。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>进入教案库</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 2: AI PPT */}
            <div
              onClick={() => onNavigate('ppt')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Presentation className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  AI PPT
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  根据主题、教材或教案一键生成 16:9 授课课件，电路图与要点可在线编辑与导出。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>生成课件</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 3: AI 课程大纲 */}
            <div
              onClick={() => onNavigate('resources', 'syllabus')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  AI 课程大纲
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  编排学期项目顺序、模块目标、理论与实训学时分配，自动校验总课时合计。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600">
                <span>配置大纲</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 4: AI 课程题库 */}
            <div
              onClick={() => onNavigate('resources', 'question-bank')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  AI 课程题库
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  按知识点与故障排查技能生成单选、多选、实操分析题，支持逐题编辑与 XLSX 导出。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>组卷出题</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 5: AI 课程标准 */}
            <div
              onClick={() => onNavigate('resources', 'standard')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  AI 课程标准
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  对标专业目录与岗位能力，生成课程定位、内容学时及实施评价规范草案。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600">
                <span>制定标准</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Trust Markers */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AI 教师助理</span>
            <span>· 职业院校教学实施方案与数字化教学资源协同生成平台</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>支持国家规范 DOCX / PDF / PPTX / XLSX 格式无损导出</span>
            <span>·</span>
            <span>依据教育部职业院校“双高”专业建设标准</span>
          </div>
        </div>
      </footer>

      {/* Material Preview Modal */}
      {previewMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <FileCode className="w-4 h-4" />
                <span>知识库原始依据预览</span>
              </div>
              <button
                onClick={() => setPreviewMaterialModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                ✕ 关闭
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900">{previewMaterialModal}</h3>
            <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-700 leading-relaxed space-y-2 border border-slate-200 font-mono">
              <p>【向量抽取原文摘要】</p>
              <p>
                三相异步电动机正反转控制线路是低压继电接触控制的核心基石。主电路通过KM1与KM2两组主触头实现对调相序（调换L1与L3进线），使定子三相绕组建立反向旋转磁场。
              </p>
              <p>
                【安全控制底线】：必须严防KM1与KM2同时吸合。若同时动作，L1与L3将在接触器触点处形成直接闭合回路，造成灾难性电源相间短路，产生巨大短路电弧并毁坏触点及导线。因此，控制回路中必须严格串入接触器辅助常闭触点实现电气互锁，并配合复合按钮实现机械互锁。
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewMaterialModal(null)}
                className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  setPreviewMaterialModal(null);
                  onApplyIntentConfig?.({
                    project: '三相异步电动机正反转控制线路的识读与调试',
                    periods: 2,
                  });
                  onNavigate('plan-create');
                }}
                className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                确认并预填此项生成教案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
