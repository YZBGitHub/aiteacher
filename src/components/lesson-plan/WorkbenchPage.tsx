import React, { useState, useEffect } from 'react';
import { LessonPlanDocument, PageId, DiffSuggestion } from '../../types';
import { CircuitDiagram } from '../circuit/CircuitDiagram';
import { exportToDocx, exportToPdfPrint } from '../../utils/exportUtils';
import {
  Save,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  GitCompare,
  History,
  FileCheck2,
  ExternalLink,
  Presentation,
  Check,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorkbenchPageProps {
  document: LessonPlanDocument;
  onUpdateDocument: (doc: LessonPlanDocument) => void;
  onNavigate: (page: PageId) => void;
}

export const WorkbenchPage: React.FC<WorkbenchPageProps> = ({
  document: initialDoc,
  onUpdateDocument,
  onNavigate,
}) => {
  const [doc, setDoc] = useState<LessonPlanDocument>(initialDoc);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [saveTime, setSaveTime] = useState<string>('刚刚');
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightTab, setRightTab] = useState<'ai_edit' | 'citations' | 'versions'>('ai_edit');
  const [viewMode, setViewMode] = useState<'continuous' | 'paginated'>('paginated');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Active section for TOC scrolling
  const [activeTocSection, setActiveTocSection] = useState<string>('sec-basic');

  // AI Refinement states
  const [refineScope, setRefineScope] = useState<'entire' | 'steps' | 'evaluation'>('steps');
  const [supplementFile, setSupplementFile] = useState<string>(
    '车间电动机互锁失效短路故障记录及排故指导书.docx'
  );
  const [refinePrompt, setRefinePrompt] = useState(
    '在保留总课时90分钟的前提下，增加15分钟接触器机械互锁与电气双重互锁深度对比排故环节，强化安全防短路意识。'
  );
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<DiffSuggestion | null>(null);

  // Versions history
  const [versionList, setVersionList] = useState([
    { version: 'v1.0', time: '10分钟前', author: '多智能体协同流水线初稿', current: false },
    { version: 'v1.1', time: '5分钟前', author: '教师手动优化接线工艺参数', current: false },
    { version: 'v1.2 (当前版本)', time: '刚刚', author: '融入排故记录强化双重互锁', current: true },
  ]);

  // Sync initialDoc changes
  useEffect(() => {
    setDoc(initialDoc);
  }, [initialDoc]);

  // Trigger simulated auto-save whenever doc changes
  const triggerAutoSave = (updated: LessonPlanDocument) => {
    setDoc(updated);
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      const now = new Date();
      setSaveTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      onUpdateDocument(updated);
    }, 600);
  };

  // Calculate total duration in teaching steps
  const totalDuration = doc.teachingSteps.reduce((acc, step) => acc + (step.duration || 0), 0);

  // Generate AI Refinement Suggestion (For Bidding Demo Step 4)
  const handleGenerateSuggestion = () => {
    setIsGeneratingSuggestion(true);
    setTimeout(() => {
      setIsGeneratingSuggestion(false);
      setActiveSuggestion({
        id: 'diff-001',
        targetSection: '六步法教学过程设计（第四、五环节）',
        reason: '依据补传材料《车间电动机互锁失效短路故障记录及排故指导书.docx》',
        summary: '在总课时严格控制在90分钟的前提下，优化课时分配：增加10分钟“双重互锁失效与相间短路排故模拟”，从接线环节调减10分钟。',
        beforeSnippet: `【实施环节】项目实施与规范接线 (用时 35 分钟)\n【检验环节】静态校验与通电试车 (用时 12 分钟)`,
        afterSnippet: `【实施环节】项目实施与精益接线 (用时 25 分钟)\n【检验环节】静态校验与双重互锁排故模拟 (用时 22 分钟)\n★ 增加项目：接触器互锁虚接与按钮机械互锁联动测试，使用万用表蜂鸣档排查隐蔽短路`,
        affectedSections: ['六步法教学过程设计', '教学评价标准 (排故技能考核占比提升至 35%)'],
      });
    }, 1000);
  };

  // Apply AI Suggestion
  const handleApplySuggestion = () => {
    if (!activeSuggestion) return;
    const updatedSteps = doc.teachingSteps.map((step) => {
      if (step.stepName.includes('四、项目实施')) {
        return {
          ...step,
          duration: 25,
          teacherActivity: '巡视指导装配配线，重点检查主回路相序与控制回路互锁常闭触点串联规范。',
        };
      }
      if (step.stepName.includes('五、静态校验')) {
        return {
          ...step,
          stepName: '五、静态校验与双重互锁排故模拟',
          duration: 22,
          teacherActivity: '设置接触器常闭互锁触点氧化虚接及机械卡死2处车间隐蔽故障，考核学生万用表静态诊断速度。',
          studentActivity: '执行双重互锁通断测试，排查互锁断路隐患，合格后通电试车观察正反向平稳换向。',
          deliverable: '《静态电阻检测报告》与《双重互锁排故诊断工单》',
        };
      }
      return step;
    });

    const updatedDoc: LessonPlanDocument = {
      ...doc,
      version: 'v1.2 (融入排故记录强化双重互锁)',
      teachingSteps: updatedSteps,
    };

    triggerAutoSave(updatedDoc);
    setActiveSuggestion(null);

    // Confetti celebration
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Export handlers
  const handleExportDocx = () => {
    const html = `
      <h1>${doc.title}</h1>
      <p style="text-align: center; color: #475569;">${doc.subTitle} · 归档编号：${doc.archiveNumber}</p>
      <hr/>
      <h2>一、教学基本信息</h2>
      <table>
        <tr><th>课程名称</th><td>${doc.courseName}</td><th>所属项目</th><td>${doc.project}</td></tr>
        <tr><th>授课课时</th><td>${doc.periods} 课时 (90分钟)</td><th>授课教师</th><td>${doc.instructor}</td></tr>
        <tr><th>授课班级</th><td>${doc.basicInfo.classGroup}</td><th>实训场地</th><td>${doc.basicInfo.venue}</td></tr>
      </table>

      <h2>二、学情分析与教学策略</h2>
      <p>${doc.studentAnalysis}</p>

      <h2>三、三维立体教学目标</h2>
      <h3>1. 知识目标</h3>
      <ul>${doc.learningObjectives.knowledge.map((k) => `<li>${k}</li>`).join('')}</ul>
      <h3>2. 技能目标</h3>
      <ul>${doc.learningObjectives.skills.map((s) => `<li>${s}</li>`).join('')}</ul>
      <h3>3. 素养目标</h3>
      <ul>${doc.learningObjectives.literacy.map((l) => `<li>${l}</li>`).join('')}</ul>

      <h2>四、六步法教学过程设计（总计 90 分钟）</h2>
      <table>
        <tr>
          <th>环节名称</th>
          <th>用时</th>
          <th>教师活动</th>
          <th>学生活动</th>
          <th>教学成果</th>
        </tr>
        ${doc.teachingSteps
          .map(
            (s) => `
          <tr>
            <td><b>${s.stepName}</b></td>
            <td>${s.duration}分钟</td>
            <td>${s.teacherActivity}</td>
            <td>${s.studentActivity}</td>
            <td>${s.deliverable}</td>
          </tr>
        `
          )
          .join('')}
      </table>

      <h2>五、电气原理图与核心数理公式</h2>
      <p><b>图1 电气原理图：</b>${doc.circuitInfo.caption}</p>
      ${doc.formulas
        .map(
          (f) => `
        <div class="formula-box">
          <b>${f.title}</b><br/>
          公式：${f.latex}<br/>
          说明：${f.explanation}
        </div>
      `
        )
        .join('')}

      <h2>六、教学评价体系与考核量表</h2>
      <table>
        <tr><th>考核维度</th><th>权重</th><th>评分细则与指标</th></tr>
        ${doc.evaluationRubric
          .map((r) => `<tr><td><b>${r.dimension}</b></td><td>${r.weight}</td><td>${r.criteria}</td></tr>`)
          .join('')}
      </table>
    `;

    exportToDocx(
      `职业教育智能教案_${doc.courseName}_${doc.title}_${doc.archiveNumber}`,
      doc.title,
      html
    );
  };

  const handleExportPdf = () => {
    exportToPdfPrint();
  };

  const scrollToSection = (secId: string) => {
    setActiveTocSection(secId);
    const element = window.document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Workbench Control Bar */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 sticky top-14 z-30 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Back, Doc Title & Real-time Auto-save state */}
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => onNavigate('plan-list')}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
              title="返回教案列表"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 truncate">
                  {doc.title}
                </h1>
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-medium shrink-0">
                  {doc.version}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>课程：{doc.courseName}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  {saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">已保存 ({saveTime})</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                      <span className="text-blue-600">实时保存中...</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Center: View mode toggles & Zoom */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'continuous'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              连续排版
            </button>
            <button
              onClick={() => setViewMode('paginated')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'paginated'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 分页预览
            </button>
            <div className="h-3.5 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-600 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(125, z + 10))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Quick actions & Export */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('ppt')}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">一键生成授课 PPT</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handleExportDocx}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                title="导出符合院校归档标准的 Word 文档"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出 Word</span>
              </button>
              <button
                onClick={handleExportPdf}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
                title="打印或保存为高保真 A4 PDF 档案"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>导出 PDF</span>
              </button>
            </div>

            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className={`p-1.5 rounded-md border text-slate-600 transition-colors ${
                rightSidebarOpen
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
              title={rightSidebarOpen ? '收起右侧面板' : '展开AI修改与参考资料面板'}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Workbench Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
        {/* ================= LEFT COLUMN: TOC Table of Contents ================= */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-32 space-y-4 no-print">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-900">教案章节目录</span>
              <span className="text-[10px] text-slate-400 font-mono">共 9 节</span>
            </div>

            <nav className="space-y-1 text-xs">
              {[
                { id: 'sec-header', label: '封面与归档眉首' },
                { id: 'sec-basic', label: '1. 教学基本信息' },
                { id: 'sec-student', label: '2. 学情与教学策略' },
                { id: 'sec-objectives', label: '3. 三维教学目标' },
                { id: 'sec-keypoints', label: '4. 重点难点化解' },
                { id: 'sec-prep', label: '5. 教学准备与工器具' },
                { id: 'sec-steps', label: '6. 六步法过程表格' },
                { id: 'sec-circuit', label: '7. 电路原理图与公式' },
                { id: 'sec-rubric', label: '8. 教学评价量表' },
                { id: 'sec-homework', label: '9. 课后拓展与作业' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors truncate block ${
                    activeTocSection === item.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs text-xs space-y-2">
            <div className="font-semibold text-slate-700">教案质量自检指标</div>
            <div className="flex items-center justify-between text-slate-500">
              <span>合计课时</span>
              <span className="font-mono font-bold text-blue-700">
                {totalDuration} 分钟 (合 2 课时)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>图表与公式</span>
              <span className="font-mono text-emerald-700 font-medium">1原理图 / 3公式</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>知识库引用</span>
              <span className="font-mono text-indigo-700 font-medium">4处 权威来源</span>
            </div>
          </div>
        </aside>

        {/* ================= MIDDLE COLUMN: Main Document Canvas ================= */}
        <main
          className="flex-1 min-w-0 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <div
            id="print-container"
            className={`bg-white border border-slate-200 shadow-md mx-auto p-8 sm:p-12 transition-all ${
              viewMode === 'paginated' ? 'max-w-[850px] min-h-[1100px]' : 'max-w-4xl'
            }`}
          >
            {/* Document Institutional Header */}
            <header id="sec-header" className="border-b-2 border-slate-900 pb-5 mb-8 text-center">
              <div className="text-xs font-semibold text-slate-600 tracking-widest uppercase mb-1">
                全国职业教育“十四五”规划高水平专业群示范课
              </div>
              <div className="text-xs text-blue-800 font-mono font-medium mb-2">
                【理实一体化标准教学实施方案与教案档案】
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {doc.title}
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                课程名称：{doc.courseName} · 项目代号：{doc.project} · 归档编号：
                {doc.archiveNumber}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 text-left">
                <div>
                  <span className="text-slate-400">授课教师：</span>
                  <span className="font-semibold text-slate-800">{doc.instructor}</span>
                </div>
                <div>
                  <span className="text-slate-400">所属院系：</span>
                  <span className="font-semibold text-slate-800">{doc.college}</span>
                </div>
                <div>
                  <span className="text-slate-400">授课课时：</span>
                  <span className="font-semibold text-blue-700">{doc.periods} 课时 (90分钟)</span>
                </div>
                <div>
                  <span className="text-slate-400">教研室审核：</span>
                  <span className="font-semibold text-emerald-700">已审定通过</span>
                </div>
              </div>
            </header>

            {/* Section 1: 教学基本信息 */}
            <section id="sec-basic" className="mb-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  <span>一、教学基本信息与条件</span>
                </h2>
                <span className="text-xs text-slate-400">点击文字可直接在线编辑</span>
              </div>

              <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-600">授课班级：</span>
                  <input
                    type="text"
                    value={doc.basicInfo.classGroup}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...doc,
                        basicInfo: { ...doc.basicInfo, classGroup: e.target.value },
                      })
                    }
                    className="w-full mt-1 bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="font-semibold text-slate-600">实训场地与台位：</span>
                  <input
                    type="text"
                    value={doc.basicInfo.venue}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...doc,
                        basicInfo: { ...doc.basicInfo, venue: e.target.value },
                      })
                    }
                    className="w-full mt-1 bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-slate-600">核心实训装备配置：</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {doc.basicInfo.devices.map((dev, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-700 text-[11px]"
                      >
                        {dev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: 学情分析与教学策略 */}
            <section id="sec-student" className="mb-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  <span>二、学情分析与教学策略</span>
                </h2>
                <div className="text-[11px] text-blue-600 flex items-center gap-1 cursor-pointer">
                  <span>[引自: 十四五国规教材 §4.2]</span>
                </div>
              </div>

              <textarea
                rows={4}
                value={doc.studentAnalysis}
                onChange={(e) => triggerAutoSave({ ...doc, studentAnalysis: e.target.value })}
                className="w-full text-xs text-slate-800 leading-relaxed bg-slate-50/50 hover:bg-white border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </section>

            {/* Section 3: 三维立体教学目标 */}
            <section id="sec-objectives" className="mb-8">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <span>三、三维立体教学目标</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 知识目标 */}
                <div className="p-3.5 rounded-lg bg-blue-50/40 border border-blue-100">
                  <div className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>知识目标 (认知逻辑)</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                    {doc.learningObjectives.knowledge.map((k, idx) => (
                      <li key={idx} className="leading-snug">
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 技能目标 */}
                <div className="p-3.5 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <div className="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>技能目标 (实操能力)</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                    {doc.learningObjectives.skills.map((s, idx) => (
                      <li key={idx} className="leading-snug">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 素养目标 */}
                <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-100">
                  <div className="font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>职业素养 (安全与6S)</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                    {doc.learningObjectives.literacy.map((l, idx) => (
                      <li key={idx} className="leading-snug">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: 重点难点及化解策略 */}
            <section id="sec-keypoints" className="mb-8">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <span>四、教学重点难点及化解策略</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 text-blue-700">★ 教学重点</div>
                  <p className="text-slate-800 font-medium mb-2">
                    {doc.keyAndDifficultPoints.keyPoint}
                  </p>
                  <div className="font-semibold text-slate-500 text-[11px]">化解策略：</div>
                  <p className="text-slate-600 mt-0.5">
                    {doc.keyAndDifficultPoints.keyResolution}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1 text-indigo-700">▲ 教学难点</div>
                  <p className="text-slate-800 font-medium mb-2">
                    {doc.keyAndDifficultPoints.difficultPoint}
                  </p>
                  <div className="font-semibold text-slate-500 text-[11px]">化解策略：</div>
                  <p className="text-slate-600 mt-0.5">
                    {doc.keyAndDifficultPoints.difficultResolution}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: 教学准备与工器具 */}
            <section id="sec-prep" className="mb-8">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <span>五、教学准备与元器件清单</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold text-left">
                    <tr>
                      <th className="p-2.5 border-b border-r border-slate-200">代号</th>
                      <th className="p-2.5 border-b border-r border-slate-200">元器件名称</th>
                      <th className="p-2.5 border-b border-r border-slate-200">规格型号及参数</th>
                      <th className="p-2.5 border-b border-slate-200 text-center">数量</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doc.teachingPreparation.components.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-blue-700">
                          {comp.code}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-900 font-medium">
                          {comp.name}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-600">
                          {comp.spec}
                        </td>
                        <td className="p-2 text-center text-slate-700 font-mono">
                          {comp.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: 六步法教学过程设计表格 */}
            <section id="sec-steps" className="mb-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  <span>六、理实一体化六步教学过程设计</span>
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">课时合计：</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      totalDuration === 90
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {totalDuration} 分钟
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-800 font-semibold text-left">
                    <tr>
                      <th className="p-2.5 border-b border-r border-slate-200 w-28">环节 / 用时</th>
                      <th className="p-2.5 border-b border-r border-slate-200 w-1/3">教师主导活动</th>
                      <th className="p-2.5 border-b border-r border-slate-200 w-1/3">学生主体活动</th>
                      <th className="p-2.5 border-b border-slate-200">阶段交付成果</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {doc.teachingSteps.map((step, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 border-r border-slate-200 align-top">
                          <div className="font-bold text-slate-900">{step.stepName}</div>
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-blue-700 font-semibold">
                            <Clock className="w-3 h-3" />
                            <span>{step.duration} 分钟</span>
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top text-slate-700 leading-relaxed">
                          <textarea
                            rows={3}
                            value={step.teacherActivity}
                            onChange={(e) => {
                              const updated = [...doc.teachingSteps];
                              updated[idx].teacherActivity = e.target.value;
                              triggerAutoSave({ ...doc, teachingSteps: updated });
                            }}
                            className="w-full bg-transparent hover:bg-white border border-transparent hover:border-slate-300 rounded p-1 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2.5 border-r border-slate-200 align-top text-slate-700 leading-relaxed">
                          <textarea
                            rows={3}
                            value={step.studentActivity}
                            onChange={(e) => {
                              const updated = [...doc.teachingSteps];
                              updated[idx].studentActivity = e.target.value;
                              triggerAutoSave({ ...doc, teachingSteps: updated });
                            }}
                            className="w-full bg-transparent hover:bg-white border border-transparent hover:border-slate-300 rounded p-1 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2.5 align-top text-slate-600 font-medium leading-relaxed">
                          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                            {step.deliverable}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 7: 电气控制原理图与数理公式 */}
            <section id="sec-circuit" className="mb-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                  <span>七、专业图文呈现（电路原理图与数理公式）</span>
                </h2>
                <div className="text-[11px] text-blue-600 flex items-center gap-1 cursor-pointer">
                  <span>[引自: 国标 GB/T 4728 电气图样标准]</span>
                </div>
              </div>

              {/* Interactive Circuit Schematic */}
              <div className="mb-6">
                <CircuitDiagram
                  editable={true}
                  caption={doc.circuitInfo.caption}
                  onCaptionChange={(newCaption) =>
                    triggerAutoSave({
                      ...doc,
                      circuitInfo: { ...doc.circuitInfo, caption: newCaption },
                    })
                  }
                />
              </div>

              {/* Mathematical Formulas Render */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700">电机拖动核心理论公式推演：</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {doc.formulas.map((form, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5"
                    >
                      <div className="font-semibold text-slate-900">{form.title}</div>
                      <div className="p-2 bg-white border border-slate-200 rounded font-mono text-center text-blue-900 text-sm font-semibold tracking-wide">
                        {form.latex}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {form.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8: 教学评价量表 */}
            <section id="sec-rubric" className="mb-8">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <span>八、教学评价体系与考核量表</span>
              </h2>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {doc.evaluationRubric.map((rubric, idx) => (
                  <div key={idx} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{rubric.dimension}</div>
                      <p className="text-slate-600 leading-relaxed">{rubric.criteria}</p>
                    </div>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded shrink-0">
                      {rubric.weight}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 9: 课后拓展与作业任务 */}
            <section id="sec-homework" className="mb-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <span>九、课后拓展与企业进阶任务</span>
              </h2>

              <ul className="space-y-2 text-xs text-slate-700 list-decimal list-inside bg-slate-50 p-4 rounded-lg border border-slate-200">
                {doc.homeworkAndExtension.map((hw, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {hw}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>

        {/* ================= RIGHT COLUMN: Collapsible Sidebar ================= */}
        {rightSidebarOpen && (
          <aside className="w-80 shrink-0 sticky top-32 space-y-4 no-print transition-all">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
                <button
                  onClick={() => setRightTab('ai_edit')}
                  className={`flex-1 py-2.5 px-3 transition-colors ${
                    rightTab === 'ai_edit'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI 二次创作
                </button>
                <button
                  onClick={() => setRightTab('citations')}
                  className={`flex-1 py-2.5 px-3 transition-colors ${
                    rightTab === 'citations'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  参考资料
                </button>
                <button
                  onClick={() => setRightTab('versions')}
                  className={`flex-1 py-2.5 px-3 transition-colors ${
                    rightTab === 'versions'
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  版本历史
                </button>
              </div>

              {/* Tab 1: AI 二次创作 (投标演示步骤 ④ 关键) */}
              {rightTab === 'ai_edit' && (
                <div className="p-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      修改范围指定
                    </label>
                    <select
                      value={refineScope}
                      onChange={(e) => setRefineScope(e.target.value as any)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="steps">指定章节：六步教学过程设计 (排故环节)</option>
                      <option value="entire">整篇教案全局联动润色</option>
                      <option value="evaluation">指定章节：教学评价体系与量表</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      补传参考材料 (可选)
                    </label>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-1.5 truncate">
                        <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{supplementFile}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium shrink-0">
                        已解析
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      输入二次修改要求
                    </label>
                    <textarea
                      rows={3}
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                      placeholder="输入修改要求，例如：在保留总课时的前提下加强互锁排故..."
                    />
                  </div>

                  <button
                    onClick={handleGenerateSuggestion}
                    disabled={isGeneratingSuggestion}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    {isGeneratingSuggestion ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>多智能体分析并生成建议...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>生成修改建议并预览</span>
                      </>
                    )}
                  </button>

                  {/* Diff suggestion preview box */}
                  {activeSuggestion && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2 mt-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-xs">
                          AI 修改建议 (前后对照)
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                          联动校验通过
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {activeSuggestion.summary}
                      </p>

                      <div className="bg-white p-2 rounded border border-amber-200 font-mono text-[11px] space-y-1.5">
                        <div className="text-red-700 line-through whitespace-pre-wrap">
                          {activeSuggestion.beforeSnippet}
                        </div>
                        <div className="text-emerald-700 font-semibold whitespace-pre-wrap">
                          {activeSuggestion.afterSnippet}
                        </div>
                      </div>

                      <div className="text-[10px] text-amber-800">
                        ★ 联动影响提醒：{activeSuggestion.affectedSections.join(' · ')}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setActiveSuggestion(null)}
                          className="flex-1 py-1.5 text-slate-600 bg-white border border-slate-300 rounded font-medium hover:bg-slate-50"
                        >
                          放弃
                        </button>
                        <button
                          onClick={handleApplySuggestion}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-xs flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>应用此修改</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: 关联资料出处 */}
              {rightTab === 'citations' && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="font-semibold text-slate-800">本教案引用的依据原文：</div>
                  {[
                    {
                      tag: '国规教材 §4.2',
                      title: '接触器电气联锁工作原理与防止相间短路',
                      snippet: '将KM1常闭辅助触点串入KM2回路，反之亦然，形成电气互锁。',
                    },
                    {
                      tag: '国家标准 GB/T 4728',
                      title: '电气简图用图形符号与文字符号规范',
                      snippet: '正转交流接触器标为 KM1，反转标为 KM2，热继电器标为 FR。',
                    },
                    {
                      tag: '企业工程案例',
                      title: '物料双向输送传送带正反向运行工况',
                      snippet: '工业输送带换向要求平稳，避免电机相间短路导致跳闸停线。',
                    },
                  ].map((cite, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-blue-700">
                        <span>{cite.tag}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="font-medium text-slate-900">{cite.title}</div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {cite.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: 版本历史 */}
              {rightTab === 'versions' && (
                <div className="p-4 space-y-3 text-xs">
                  <div className="font-semibold text-slate-800">版本历史记录：</div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {versionList.map((ver, i) => (
                      <div
                        key={i}
                        className={`p-2.5 space-y-0.5 ${
                          ver.current ? 'bg-blue-50/70 font-medium' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{ver.version}</span>
                          <span className="text-[10px] text-slate-400">{ver.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{ver.author}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
