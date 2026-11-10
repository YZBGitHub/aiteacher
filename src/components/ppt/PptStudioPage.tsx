import React, { useState } from 'react';
import { PptSlide, PageId, LessonPlanDocument } from '../../types';
import { CircuitDiagram } from '../circuit/CircuitDiagram';
import {
  Presentation,
  Play,
  Download,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Palette,
  Layers,
  FileText,
  RotateCcw,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PptStudioPageProps {
  slides: PptSlide[];
  onUpdateSlides: (slides: PptSlide[]) => void;
  onNavigate: (page: PageId) => void;
  lessonPlanDoc?: LessonPlanDocument;
}

export const PptStudioPage: React.FC<PptStudioPageProps> = ({
  slides: initialSlides,
  onUpdateSlides,
  onNavigate,
  lessonPlanDoc,
}) => {
  const [slides, setSlides] = useState<PptSlide[]>(initialSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [themeStyle, setThemeStyle] = useState<'tech_blue' | 'industrial' | 'clean_white' | 'dark_stage'>('tech_blue');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showOutlineModal, setShowOutlineModal] = useState(false);

  // Outline generation parameters
  const [topicInput, setTopicInput] = useState('三相异步电动机正反转控制线路的识读与调试');
  const [audienceInput, setAudienceInput] = useState('高职机电一体化技术专业 二年级学生');
  const [slideCount, setSlideCount] = useState<number>(8);
  const [outlineSteps, setOutlineSteps] = useState<string[]>([
    '第1页：课程封面与主讲信息',
    '第2页：三维教学目标与职业标准',
    '第3页：工业工作情境引入（物料输送带）',
    '第4页：双重互锁控制线路电气图纸识读',
    '第5页：电机旋转磁场与同步转速公式推演',
    '第6页：接线实操四步法与配线工艺',
    '第7页：万用表静态排故与隐蔽故障诊断',
    '第8页：考核量表与课后拓展任务',
  ]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Update active slide
  const handleUpdateActiveSlide = (updated: Partial<PptSlide>) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = { ...newSlides[currentSlideIndex], ...updated };
    setSlides(newSlides);
    onUpdateSlides(newSlides);
  };

  // Reorder slides
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[target];
    newSlides[target] = temp;
    // Update slideNumber
    newSlides.forEach((s, idx) => (s.slideNumber = idx + 1));
    setSlides(newSlides);
    onUpdateSlides(newSlides);
    setCurrentSlideIndex(target);
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, idx) => idx !== index);
    newSlides.forEach((s, idx) => (s.slideNumber = idx + 1));
    setSlides(newSlides);
    onUpdateSlides(newSlides);
    setCurrentSlideIndex(Math.max(0, index - 1));
  };

  // Add slide
  const addSlide = () => {
    const newSlide: PptSlide = {
      id: `slide-${Date.now()}`,
      slideNumber: slides.length + 1,
      title: '新增课件章节要点',
      bulletPoints: ['点击输入本页核心授课内容要点 1', '点击输入本页核心授课内容要点 2'],
      layout: 'bullet',
      accent: 'blue',
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    onUpdateSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
  };

  // AI Single Slide Polish Actions
  const handleAiPolish = (actionType: 'simplify' | 'expand' | 'question') => {
    if (actionType === 'simplify') {
      const simplified = activeSlide.bulletPoints.map((b) =>
        b.length > 20 ? b.slice(0, 18) + '...' : b
      );
      handleUpdateActiveSlide({ bulletPoints: simplified });
    } else if (actionType === 'expand') {
      const expanded = [
        ...activeSlide.bulletPoints,
        '【车间工程拓展】：在自动化传送带现场，接触器动作频繁，需严格定期检查辅助互锁触点拉弧烧蚀情况。',
      ];
      handleUpdateActiveSlide({ bulletPoints: expanded });
    } else if (actionType === 'question') {
      const withQ = [
        ...activeSlide.bulletPoints,
        '【课堂互动提问】：若将反转启动按钮 SB3 的常开常闭触头接反，在按下启动时会出现什么故障？',
      ];
      handleUpdateActiveSlide({ bulletPoints: withQ });
    }
  };

  // Export PPTX as formatted HTML presentation file
  const handleExportPptx = () => {
    const slidesHtml = slides
      .map(
        (s) => `
      <section style="page-break-after: always; width: 960px; height: 540px; padding: 40px; box-sizing: border-box; background: #ffffff; border: 1px solid #ccc; margin: 20px auto; font-family: sans-serif;">
        <div style="font-size: 14px; color: #2563eb; font-weight: bold; margin-bottom: 10px;">${topicInput} · 第 ${s.slideNumber} 页</div>
        <h2 style="font-size: 26px; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">${s.title}</h2>
        ${s.subTitle ? `<p style="font-size: 16px; color: #64748b; margin-bottom: 20px;">${s.subTitle}</p>` : ''}
        <ul style="font-size: 18px; line-height: 1.8; color: #334155;">
          ${s.bulletPoints.map((p) => `<li style="margin-bottom: 10px;">${p}</li>`).join('')}
        </ul>
      </section>
    `
      )
      .join('');

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${topicInput} 授课课件</title></head><body style="background: #f1f5f9; padding: 20px;">${slidesHtml}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI课件_${topicInput}_${slides.length}页.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Theme Styling Map
  const getThemeClasses = () => {
    switch (themeStyle) {
      case 'tech_blue':
        return {
          container: 'bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white',
          title: 'text-white border-blue-400',
          kicker: 'text-blue-300',
          bullet: 'text-slate-200',
          boxBg: 'bg-white/10 backdrop-blur-sm border-white/15',
        };
      case 'industrial':
        return {
          container: 'bg-slate-900 text-slate-100',
          title: 'text-white border-amber-500',
          kicker: 'text-amber-400 font-mono',
          bullet: 'text-slate-200',
          boxBg: 'bg-slate-800 border-slate-700',
        };
      case 'clean_white':
        return {
          container: 'bg-white text-slate-900 border border-slate-200',
          title: 'text-slate-900 border-blue-600',
          kicker: 'text-blue-600 font-semibold',
          bullet: 'text-slate-700',
          boxBg: 'bg-slate-50 border-slate-200',
        };
      case 'dark_stage':
        return {
          container: 'bg-black text-white',
          title: 'text-white border-emerald-500',
          kicker: 'text-emerald-400',
          bullet: 'text-slate-300',
          boxBg: 'bg-neutral-900 border-neutral-800',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* PPT Studio Top Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 sticky top-14 z-30 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Presentation className="w-4 h-4 text-indigo-600" />
                  <span>AI PPT 课件工坊</span>
                </h1>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-medium">
                  共 {slides.length} 页 · 16:9 高清
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                主题：{topicInput}（支持修改要点、图文排版与全屏播放）
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowOutlineModal(true)}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>重新生成课件提纲</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md font-semibold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isFullScreen ? '退出播放' : '全屏放映'}</span>
            </button>

            <button
              onClick={handleExportPptx}
              className="px-3.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出课件 (PPTX / HTML)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main PPT Workspace: Left 2-Column Thumbnails + Large Center Canvas + Bottom Configuration */}
      <div className="flex-1 max-w-[1480px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* ================= LEFT COLUMN: 2-Column Slide Thumbnails List ================= */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3 sticky top-28 no-print max-h-[calc(100vh-130px)] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>课件幻灯片 ({slides.length} 页)</span>
            </span>
            <button
              onClick={addSlide}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>加一页</span>
            </button>
          </div>

          {/* 2-Column Grid of Slide Thumbnails */}
          <div className="grid grid-cols-2 gap-2">
            {slides.map((s, idx) => {
              const isSelected = idx === currentSlideIndex;
              return (
                <div
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all group relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/25 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-1 rounded ${
                        isSelected ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-slate-200/60'
                      }`}
                    >
                      #{s.slideNumber}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(idx, 'up');
                        }}
                        disabled={idx === 0}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="前移一页"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(idx, 'down');
                        }}
                        disabled={idx === slides.length - 1}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="后移一页"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(idx);
                        }}
                        className="p-0.5 text-slate-400 hover:text-red-600"
                        title="删除本页"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 16:9 Micro Thumbnail Preview Card */}
                  <div className="w-full aspect-video bg-gradient-to-br from-slate-900 to-indigo-950 rounded p-1.5 text-white flex flex-col justify-between overflow-hidden shadow-xs">
                    <div className="truncate text-[9px] font-bold text-slate-100 leading-tight">
                      {s.title}
                    </div>
                    <div className="space-y-0.5 opacity-60">
                      <div className="h-0.5 w-3/4 bg-blue-400 rounded-full"></div>
                      <div className="h-0.5 w-1/2 bg-slate-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ================= MAIN COLUMN: Large 16:9 Canvas + Bottom Configurations ================= */}
        <main
          className={`flex-1 min-w-0 w-full flex flex-col items-center ${
            isFullScreen
              ? 'fixed inset-0 z-50 bg-black p-8 flex flex-col justify-center'
              : ''
          }`}
        >
          {isFullScreen && (
            <div className="flex items-center justify-between text-white text-xs mb-4 w-full max-w-6xl">
              <span>全屏授课播放模式 · 第 {currentSlideIndex + 1} / {slides.length} 页</span>
              <button
                onClick={() => setIsFullScreen(false)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded cursor-pointer"
              >
                退出全屏 (ESC)
              </button>
            </div>
          )}

          {/* Large 16:9 Aspect Ratio Slide Canvas */}
          <div className="w-full aspect-video max-w-5xl xl:max-w-6xl mx-auto rounded-2xl shadow-xl overflow-hidden flex flex-col relative transition-all border border-slate-300/80">
            <div
              className={`flex-1 p-8 sm:p-14 flex flex-col justify-between ${themeClasses.container}`}
            >
              {/* Header on slide */}
              <div>
                <div
                  className={`text-xs uppercase tracking-widest mb-2 font-medium ${themeClasses.kicker}`}
                >
                  {lessonPlanDoc?.courseName || '《电气控制技术》'} · 理实一体化示范公开课件
                </div>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                  className={`text-2xl sm:text-3xl font-extrabold w-full bg-transparent border-b pb-2.5 focus:outline-hidden tracking-tight ${themeClasses.title}`}
                />
                {activeSlide.subTitle && (
                  <input
                    type="text"
                    value={activeSlide.subTitle}
                    onChange={(e) => handleUpdateActiveSlide({ subTitle: e.target.value })}
                    className="text-xs sm:text-sm text-slate-300 mt-2.5 w-full bg-transparent focus:outline-hidden"
                  />
                )}
              </div>

              {/* Body Content based on layout */}
              <div className="my-auto py-5">
                {activeSlide.hasDiagram ? (
                  <div className="space-y-4">
                    <div className="text-xs sm:text-sm opacity-90 leading-relaxed space-y-1.5">
                      {activeSlide.bulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="text-blue-400 font-bold">•</span>
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>
                    {/* Embedded Circuit schematic */}
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl">
                      <CircuitDiagram
                        editable={false}
                        caption="课件配套高保真电气原理图（含正反转与双重互锁）"
                      />
                    </div>
                  </div>
                ) : activeSlide.hasFormula ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                      {activeSlide.bulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{bp}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`p-5 rounded-xl space-y-3 font-mono text-xs ${themeClasses.boxBg}`}>
                      <div className="font-bold text-emerald-400">同步旋转磁场转速公式：</div>
                      <div className="text-lg text-center py-2.5 bg-black/40 rounded-lg border border-white/10 text-white font-bold tracking-wider">
                        n0 = 60f / p
                      </div>
                      <div className="font-bold text-emerald-400">异步电动机转差率关系：</div>
                      <div className="text-lg text-center py-2.5 bg-black/40 rounded-lg border border-white/10 text-white font-bold tracking-wider">
                        s = (n0 - n) / n0
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeSlide.bulletPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${themeClasses.boxBg}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <textarea
                          rows={2}
                          value={point}
                          onChange={(e) => {
                            const updated = [...activeSlide.bulletPoints];
                            updated[idx] = e.target.value;
                            handleUpdateActiveSlide({ bulletPoints: updated });
                          }}
                          className={`w-full bg-transparent text-xs sm:text-sm leading-relaxed border-none focus:outline-hidden resize-none ${themeClasses.bullet}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer on slide */}
              <div className="flex items-center justify-between text-[11px] opacity-70 pt-3 border-t border-white/10 font-mono">
                <span>机电一体化技术专业示范课 · 理实一体化精品课件</span>
                <span className="font-bold">
                  第 {currentSlideIndex + 1} / {slides.length} 页
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls below canvas */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs no-print w-full">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一页</span>
            </button>
            <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-700 font-bold shadow-2xs">
              {currentSlideIndex + 1} / {slides.length}
            </div>
            <button
              onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span>下一页</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* =========================================================
              BOTTOM CONFIGURATION AREA: Themes, AI Polish, Notes
              (Moved from right sidebar to below canvas as requested)
             ========================================================= */}
          <div className="w-full max-w-5xl xl:max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-12 gap-5 no-print">
            {/* 1. Theme Preset Switcher */}
            <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>课件模板主题风格</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'tech_blue', name: '现代科技蓝' },
                  { id: 'industrial', name: '理实工业风' },
                  { id: 'clean_white', name: '学术简约白' },
                  { id: 'dark_stage', name: '讲台深色高对比' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeStyle(th.id as any)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                      themeStyle === th.id
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. AI Single-Slide Polish Tools */}
            <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI 单页快速调整</span>
              </div>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => handleAiPolish('simplify')}
                  className="w-full py-2 px-3 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>精简当前页要点 (提炼短句)</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">AI</span>
                </button>
                <button
                  onClick={() => handleAiPolish('expand')}
                  className="w-full py-2 px-3 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>扩写工程案例与故障分析</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">AI</span>
                </button>
                <button
                  onClick={() => handleAiPolish('question')}
                  className="w-full py-2 px-3 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>生成课堂提问与互动讨论题</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">AI</span>
                </button>
              </div>
            </div>

            {/* 3. Presenter Notes Box */}
            <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>教师授课演讲备注 (备课用)</span>
              </div>
              <textarea
                rows={3}
                value={
                  activeSlide.notes ||
                  '注意引导学生分析双重互锁动作逻辑，强调通电试车双人复核安全准则。'
                }
                onChange={(e) => handleUpdateActiveSlide({ notes: e.target.value })}
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                placeholder="记录本页幻灯片授课要点提示与实验安全指导备忘..."
              />
            </div>
          </div>
        </main>
      </div>

      {/* Outline Regeneration Modal */}
      {showOutlineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>生成课件提纲确认</span>
              </div>
              <button
                onClick={() => setShowOutlineModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕ 关闭
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">授课主题</label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">授课对象</label>
                  <input
                    type="text"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">目标页数</label>
                  <select
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value={8}>8 页（标准示范课）</option>
                    <option value={12}>12 页（深入拓展课）</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  AI 生成的课件大纲（支持确认或微调）
                </label>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 max-h-48 overflow-y-auto">
                  {outlineSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowOutlineModal(false)}
                className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowOutlineModal(false);
                  try {
                    confetti({ particleCount: 30, spread: 60 });
                  } catch (e) {
                    // ignore
                  }
                }}
                className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认大纲并生成课件</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
