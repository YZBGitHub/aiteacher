import React, { useState, useEffect } from 'react';
import { PlanConfig, ReferenceFile, PageId, LessonPlanDocument, DiffSuggestion } from '../../types';
import { CircuitDiagram } from '../circuit/CircuitDiagram';
import { exportToDocx, exportToPdfPrint } from '../../utils/exportUtils';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Database,
  Layers,
  Trash2,
  RefreshCw,
  Cpu,
  BookOpen,
  Check,
  Star,
  ChevronLeft,
  Download,
  Save,
  Presentation,
  ZoomIn,
  ZoomOut,
  Edit3,
  FileCheck2,
  Upload,
  Play,
  Send,
  Plus,
  X,
  AlertCircle,
  FileCheck,
  Eye,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanConfigPageProps {
  initialConfig: PlanConfig;
  initialDocument: LessonPlanDocument;
  onSaveDocument: (doc: LessonPlanDocument, config: PlanConfig) => void;
  onNavigate: (page: PageId) => void;
  initialTab?: 'form' | 'kb' | 'preview';
}

export const PlanConfigPage: React.FC<PlanConfigPageProps> = ({
  initialConfig,
  initialDocument,
  onSaveDocument,
  onNavigate,
  initialTab = 'form',
}) => {
  // Steps: 'form' (01 教学设计) | 'kb' (02 知识库) | 'preview' (03 在线排版)
  const [activeTab, setActiveTab] = useState<'form' | 'kb' | 'preview'>(initialTab);

  // Configuration state with exact defaults from screenshot
  const [config, setConfig] = useState<PlanConfig>({
    ...initialConfig,
    courseName: initialConfig.courseName || '电气控制技术',
    trainingProject:
      initialConfig.trainingProject || '三相异步电动机正反转控制线路的识读与调试',
    textbookVersion:
      initialConfig.textbookVersion || '高等教育出版社·“十四五”规划教材（第3版）',
    pedagogyTheory: initialConfig.pedagogyTheory || '理实一体化项目教学法',
    periods: initialConfig.periods || 6,
    selectedObjectives:
      initialConfig.selectedObjectives && initialConfig.selectedObjectives.length > 0
        ? initialConfig.selectedObjectives
        : [
            '掌握接触器互锁与按钮互锁正反转控制原理',
            '按电气图完成主回路与控制回路接线及调试',
            '识别相间短路风险，落实安全操作与 6S 管理',
          ],
    studentAnalysis:
      initialConfig.studentAnalysis || '高职机电大二学生，已掌握常用低压电器。',
    teachingStoryline:
      initialConfig.teachingStoryline || '以物料双向传输任务串联识图、接线和调试。',
    situationPreference:
      initialConfig.situationPreference || '工业自动化流水线双向送料输送带。',
    otherRequirements:
      initialConfig.otherRequirements ||
      '2 课时内完成，包含规范电气原理图和接触器联锁安全分析。',
    archiveTemplate:
      initialConfig.archiveTemplate || '国家双高理实一体化标准模板',
  });

  const [doc, setDoc] = useState<LessonPlanDocument>(initialDocument);

  // Teaching Objectives Helper States
  const [customObjectiveInput, setCustomObjectiveInput] = useState('');
  const [selectedPresetDropdown, setSelectedPresetDropdown] = useState('');

  // Save status
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Preview vs Edit Mode in Step 3 (03 在线排版)
  const [docEditMode, setDocEditMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'continuous' | 'paginated'>('paginated');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTocSection, setActiveTocSection] = useState<string>('sec-basic');

  // AI Refinement states (inside preview tab)
  const [showAiRefinePanel, setShowAiRefinePanel] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState(
    '增加15分钟接触器机械互锁与电气双重互锁深度对比排故环节，强化安全防短路意识。'
  );
  const [activeSuggestion, setActiveSuggestion] = useState<DiffSuggestion | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  // =========================================================
  // AI Generation & Execution Steps States (Matching Screenshot)
  // =========================================================
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'step1' | 'step2' | 'step3' | 'completed'>('idle');
  const [chatInputText, setChatInputText] = useState('');
  const [aiFeedbackMessage, setAiFeedbackMessage] = useState<string | null>(null);

  // Pre-configured course learning objectives pool for dropdown
  const presetObjectivesPool = [
    '掌握接触器互锁与按钮互锁正反转控制原理',
    '按电气图完成主回路与控制回路接线及调试',
    '识别相间短路风险，落实安全操作与 6S 管理',
    '熟练运用同步转速与转差率公式分析换向冲击',
    '掌握接触器主触头熔焊等突发机械故障的应急判定与处置流程',
    '熟练使用示波器与万用表排查虚接、错接与元器件触点氧化故障',
  ];

  const handleSelectPresetObjective = (val: string) => {
    if (!val) return;
    if (!config.selectedObjectives.includes(val)) {
      setConfig({
        ...config,
        selectedObjectives: [...config.selectedObjectives, val],
      });
    }
    setSelectedPresetDropdown('');
  };

  const handleAddManualObjective = () => {
    const trimmed = customObjectiveInput.trim();
    if (!trimmed) return;
    if (!config.selectedObjectives.includes(trimmed)) {
      setConfig({
        ...config,
        selectedObjectives: [...config.selectedObjectives, trimmed],
      });
    }
    setCustomObjectiveInput('');
  };

  const handleRemoveObjective = (objToRemove: string) => {
    setConfig({
      ...config,
      selectedObjectives: config.selectedObjectives.filter((item) => item !== objToRemove),
    });
  };

  // Knowledge base toggles
  const toggleKnowledgeBase = (kbId: string) => {
    const exists = config.selectedKnowledgeBases.includes(kbId);
    setConfig({
      ...config,
      selectedKnowledgeBases: exists
        ? config.selectedKnowledgeBases.filter((id) => id !== kbId)
        : [...config.selectedKnowledgeBases, kbId],
    });
  };

  const toggleKeyReference = (fileId: string) => {
    setConfig({
      ...config,
      referenceFiles: config.referenceFiles.map((f) =>
        f.id === fileId ? { ...f, isKeyReference: !f.isKeyReference } : f
      ),
    });
  };

  const removeReferenceFile = (fileId: string) => {
    setConfig({
      ...config,
      referenceFiles: config.referenceFiles.filter((f) => f.id !== fileId),
    });
  };

  const handleSimulateUpload = () => {
    const newFile: ReferenceFile = {
      id: `ref-${Date.now()}`,
      name: `新增参考资料_${config.trainingProject}.pdf`,
      size: '2.4 MB',
      type: 'pdf',
      status: 'parsing',
      isKeyReference: true,
      parseTime: '解析中...',
    };
    setConfig({
      ...config,
      referenceFiles: [newFile, ...config.referenceFiles],
    });

    setTimeout(() => {
      setConfig((prev) => ({
        ...prev,
        referenceFiles: prev.referenceFiles.map((f) =>
          f.id === newFile.id
            ? {
                ...f,
                status: 'completed',
                parseTime: '刚刚解析完成',
                extractedSnippet:
                  '已提取：接触器互锁触点接线工艺规范与通电前静态电阻检测量规。',
              }
            : f
        ),
      }));
    }, 1000);
  };

  // Save document
  const triggerSaveDocument = (updatedDoc: LessonPlanDocument) => {
    setDoc(updatedDoc);
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      onSaveDocument(updatedDoc, config);
    }, 400);
  };

  // Start Generation: Moves through step1 -> step2 -> step3 -> completed
  const handleStartGeneration = () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationPhase('step1');

    setTimeout(() => setGenerationPhase('step2'), 900);
    setTimeout(() => setGenerationPhase('step3'), 1900);
    setTimeout(() => {
      setGenerationPhase('completed');
      setIsGenerating(false);

      const generatedDoc: LessonPlanDocument = {
        ...doc,
        title: config.trainingProject,
        courseName: config.courseName,
        periods: config.periods,
        studentAnalysis: config.studentAnalysis,
        lastSavedAt: '刚刚通过 AI 智能生成',
        version: 'v1.0',
        approvalStatus: '待审核',
      };

      triggerSaveDocument(generatedDoc);

      try {
        confetti({ particleCount: 35, spread: 65 });
      } catch (e) {
        // ignore
      }
    }, 2900);
  };

  // AI chat adjustments
  const handleSendChatMessage = () => {
    const text = chatInputText.trim();
    if (!text || isGenerating) return;

    setAiFeedbackMessage(`已根据您的反馈：“${text}”对教学设计进行微调，优化了实训环节时间分配与安全考评权重。`);
    setChatInputText('');
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
        <tr><th>授课课时</th><td>${doc.periods} 课时</td><th>授课教师</th><td>${doc.instructor}</td></tr>
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
      <h2>四、六步法教学过程设计</h2>
      <table>
        <tr><th>环节名称</th><th>用时</th><th>教师活动</th><th>学生活动</th><th>阶段成果</th></tr>
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
    `;

    exportToDocx(`智能教案_${doc.courseName}_${doc.title}`, doc.title, html);
  };

  const scrollToSection = (secId: string) => {
    setActiveTocSection(secId);
    const element = window.document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplySuggestion = () => {
    if (!activeSuggestion) return;
    const updatedSteps = doc.teachingSteps.map((step) => {
      if (step.stepName === '实施（任务实操）') {
        return {
          ...step,
          duration: 45,
          teacherActivity: activeSuggestion.afterSnippet,
        };
      }
      return step;
    });

    const updatedDoc: LessonPlanDocument = {
      ...doc,
      teachingSteps: updatedSteps,
      lastSavedAt: '已采纳 AI 排故增量修改',
    };

    triggerSaveDocument(updatedDoc);
    setActiveSuggestion(null);
    setShowAiRefinePanel(false);
  };

  // =========================================================
  // Handlers for Step 3 Content Editing Mode
  // =========================================================
  const handleUpdateDocBasicInfo = (key: keyof LessonPlanDocument['basicInfo'], val: any) => {
    const updated: LessonPlanDocument = {
      ...doc,
      basicInfo: {
        ...doc.basicInfo,
        [key]: val,
      },
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleObjectiveItemChange = (
    category: 'knowledge' | 'skills' | 'literacy',
    idx: number,
    value: string
  ) => {
    const list = [...doc.learningObjectives[category]];
    list[idx] = value;
    const updated: LessonPlanDocument = {
      ...doc,
      learningObjectives: {
        ...doc.learningObjectives,
        [category]: list,
      },
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleAddObjectiveItem = (category: 'knowledge' | 'skills' | 'literacy') => {
    const defaultLabels = {
      knowledge: '新教学知识点掌握要求',
      skills: '新教学操作与排故技能要求',
      literacy: '新职业素养与安全规范要求',
    };
    const list = [...doc.learningObjectives[category], defaultLabels[category]];
    const updated: LessonPlanDocument = {
      ...doc,
      learningObjectives: {
        ...doc.learningObjectives,
        [category]: list,
      },
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleRemoveObjectiveItem = (
    category: 'knowledge' | 'skills' | 'literacy',
    idx: number
  ) => {
    const list = doc.learningObjectives[category].filter((_, i) => i !== idx);
    const updated: LessonPlanDocument = {
      ...doc,
      learningObjectives: {
        ...doc.learningObjectives,
        [category]: list,
      },
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleTeachingStepFieldChange = (
    idx: number,
    field: keyof LessonPlanDocument['teachingSteps'][0],
    value: any
  ) => {
    const nextSteps = [...doc.teachingSteps];
    nextSteps[idx] = {
      ...nextSteps[idx],
      [field]: value,
    };
    const updated: LessonPlanDocument = {
      ...doc,
      teachingSteps: nextSteps,
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleAddTeachingStepRow = () => {
    const newStep = {
      stepName: `环节${doc.teachingSteps.length + 1}：深化拓展与总结`,
      duration: 10,
      teacherActivity: '组织各小组展示接线工艺与排故记录，归纳安全操作规范与核心理论要点。',
      studentActivity: '核对万用表静态校验表，交流互锁触点串联体会，反思相间短路防范意识。',
      mediaTool: '实训台多媒体大屏、实训工作页',
      deliverable: '实训记录单及阶段评价表',
      assessmentPoint: '关注规范操作、工艺标准及互锁原理理解深度。',
    };
    const updated: LessonPlanDocument = {
      ...doc,
      teachingSteps: [...doc.teachingSteps, newStep],
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleRemoveTeachingStepRow = (idx: number) => {
    if (doc.teachingSteps.length <= 1) return;
    const nextSteps = doc.teachingSteps.filter((_, i) => i !== idx);
    const updated: LessonPlanDocument = {
      ...doc,
      teachingSteps: nextSteps,
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleMoveTeachingStepRow = (idx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === doc.teachingSteps.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const nextSteps = [...doc.teachingSteps];
    const temp = nextSteps[idx];
    nextSteps[idx] = nextSteps[targetIdx];
    nextSteps[targetIdx] = temp;

    const updated: LessonPlanDocument = {
      ...doc,
      teachingSteps: nextSteps,
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  const handleUpdateKeyPoints = (
    key: keyof LessonPlanDocument['keyAndDifficultPoints'],
    value: string
  ) => {
    const updated: LessonPlanDocument = {
      ...doc,
      keyAndDifficultPoints: {
        ...doc.keyAndDifficultPoints,
        [key]: value,
      },
      lastSavedAt: '正在编辑中',
    };
    setDoc(updated);
    onSaveDocument(updated, config);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 flex flex-col font-sans">
      {/* =========================================================
          SUB-HEADER: Breadcrumb, Title, Tags, Action Buttons
          (Matches screenshot perfectly)
         ========================================================= */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-4 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumbs & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={() => onNavigate('plan-list')}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>智能教案</span>
              </button>
              <span>/</span>
              <span>编辑教案</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {config.trainingProject}
            </h1>

            {/* Tags line */}
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                {config.courseName}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
                {config.periods} 课时
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 font-mono">
                {doc.version}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium ml-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已保存</span>
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button
              onClick={() => triggerSaveDocument(doc)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span>保存</span>
            </button>

            <button
              onClick={handleExportDocx}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              title="导出 Word"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Word</span>
            </button>

            <button
              onClick={exportToPdfPrint}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              title="导出 PDF"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => onNavigate('ppt')}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-indigo-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              title="转为课件 PPT"
            >
              <Presentation className="w-3.5 h-3.5 text-indigo-600" />
              <span>转 PPT</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          HORIZONTAL STEP CAPSULES BAR
          (01 教学设计 ───── 02 知识库 3个库授权 ───── 03 在线排版 成果与导出)
         ========================================================= */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-5 pb-3 flex items-center gap-3 no-print">
        {/* Step 1: 教学设计 */}
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeTab === 'form'
              ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              activeTab === 'form' ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-500'
            }`}
          >
            01
          </span>
          <span>教学设计</span>
        </button>

        {/* Connector Line */}
        <div className="w-12 h-px bg-slate-200" />

        {/* Step 2: 知识库 */}
        <button
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeTab === 'kb'
              ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              activeTab === 'kb' ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-500'
            }`}
          >
            02
          </span>
          <span>知识库</span>
          <span className="text-[11px] text-slate-400">
            {config.selectedKnowledgeBases.length || 3} 个库授权
          </span>
        </button>

        {/* Connector Line */}
        <div className="w-12 h-px bg-slate-200" />

        {/* Step 3: 在线排版 */}
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all ${
            activeTab === 'preview'
              ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-500'
            }`}
          >
            03
          </span>
          <span>在线排版</span>
          <span className="text-[11px] text-slate-400">成果与导出</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: 教学设计 (MATCHING SCREENSHOT LAYOUT)
         ========================================================= */}
      {activeTab === 'form' && (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ---------------------------------------------------
                LEFT CARD: 教学设计 (lg:col-span-8)
               --------------------------------------------------- */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              {/* Card Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">教学设计</h2>
                </div>
                <span className="text-xs text-slate-400">已预置课程标准默认值</span>
              </div>

              {/* 1. 课程与实训 */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>课程与实训</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      课程名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.courseName}
                      onChange={(e) => setConfig({ ...config, courseName: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      实训项目 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.trainingProject}
                      onChange={(e) => setConfig({ ...config, trainingProject: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      教材版本 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={config.textbookVersion}
                      onChange={(e) => setConfig({ ...config, textbookVersion: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 truncate"
                    >
                      <option value="高等教育出版社·“十四五”规划教材（第3版）">
                        高等教育出版社·“十四五”规划教材（第3版）
                      </option>
                      <option value="机械工业出版社《电气控制与PLC应用》">
                        机械工业出版社《电气控制与PLC应用》
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      教学理论 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={config.pedagogyTheory}
                      onChange={(e) => setConfig({ ...config, pedagogyTheory: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="理实一体化项目教学法">理实一体化项目教学法</option>
                      <option value="行动导向项目教学法">行动导向项目教学法</option>
                      <option value="任务驱动式工学交替法">任务驱动式工学交替法</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      授课课时 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { periods: 2, label: '2 课时 (90分钟)' },
                        { periods: 4, label: '4 课时 (180分钟)' },
                        { periods: 6, label: '6 课时 (270分钟)' },
                      ].map((item) => (
                        <button
                          key={item.periods}
                          type="button"
                          onClick={() => setConfig({ ...config, periods: item.periods })}
                          className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all text-center ${
                            config.periods === item.periods
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      归档模板 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={config.archiveTemplate}
                      onChange={(e) => setConfig({ ...config, archiveTemplate: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 truncate"
                    >
                      <option value="国家双高理实一体化标准模板">国家双高理实一体化标准模板</option>
                      <option value="省级职业院校示范教案归档模板">省级职业院校示范教案归档模板</option>
                      <option value="全国技能大赛规范教案模板">全国技能大赛规范教案模板</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. 三维教学目标 */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>三维教学目标</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-4">
                    <select
                      value={selectedPresetDropdown}
                      onChange={(e) => handleSelectPresetObjective(e.target.value)}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white truncate"
                    >
                      <option value="">选择预设目标</option>
                      {presetObjectivesPool.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={customObjectiveInput}
                      onChange={(e) => setCustomObjectiveInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddManualObjective();
                        }
                      }}
                      placeholder="手动输入新目标"
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddManualObjective}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加</span>
                    </button>
                  </div>
                </div>

                {/* Objectives Pill Badges */}
                <div className="space-y-2 pt-1 text-xs">
                  {config.selectedObjectives.map((obj, idx) => {
                    const tagType = idx === 0 ? '知识' : idx === 1 ? '技能' : '素养';
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 bg-white group hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] shrink-0">
                            {tagType}
                          </span>
                          <span className="text-slate-800 truncate">{obj}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(obj)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. 学情与实施 */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                  <span>学情与实施</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      学生学情 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.studentAnalysis}
                      onChange={(e) => setConfig({ ...config, studentAnalysis: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      教学主线 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.teachingStoryline}
                      onChange={(e) => setConfig({ ...config, teachingStoryline: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      工作情境 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.situationPreference}
                      onChange={(e) =>
                        setConfig({ ...config, situationPreference: e.target.value })
                      }
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      排版与安全要求 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.otherRequirements}
                      onChange={(e) =>
                        setConfig({ ...config, otherRequirements: e.target.value })
                      }
                      className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Warning / Consistency Banner (as shown in screenshot) */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  授课课时与排版要求不一致，请确认 (当前授课课时: {config.periods} 课时; 排版要求: 2 课时)。
                </span>
              </div>
            </div>

            {/* ---------------------------------------------------
                RIGHT CARD: AI 教案编排引擎 (lg:col-span-4)
               --------------------------------------------------- */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">AI 教案编排引擎</h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{isGenerating ? '生成中' : '就绪'}</span>
                  </div>
                </div>

                {/* Info Notice Box */}
                <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>确认教学设计后，即可生成教案。</span>
                </div>

                {/* Big Blue Start Button */}
                <button
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>正在协同编排教案...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>开始生成教案</span>
                    </>
                  )}
                </button>

                {/* 生成过程 Timeline */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                    <span>生成过程</span>
                  </div>

                  <div className="space-y-4 relative pl-1 text-xs">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>读取教学设计</span>
                      </div>
                      <span
                        className={`text-xs ${
                          generationPhase !== 'idle'
                            ? 'text-emerald-600 font-semibold flex items-center gap-1'
                            : 'text-slate-400'
                        }`}
                      >
                        {generationPhase !== 'idle' ? '✓ 完成' : '○ 等待中'}
                      </span>
                    </div>

                    <div className="w-px h-3 bg-slate-200 ml-2" />

                    {/* Item 2 */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                        <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>生成教案结构</span>
                      </div>
                      <span
                        className={`text-xs ${
                          generationPhase === 'step2'
                            ? 'text-blue-600 font-bold animate-pulse'
                            : generationPhase === 'step3' || generationPhase === 'completed'
                            ? 'text-emerald-600 font-semibold flex items-center gap-1'
                            : 'text-slate-400'
                        }`}
                      >
                        {generationPhase === 'step2'
                          ? '● 执行中'
                          : generationPhase === 'step3' || generationPhase === 'completed'
                          ? '✓ 完成'
                          : '○ 等待中'}
                      </span>
                    </div>

                    <div className="w-px h-3 bg-slate-200 ml-2" />

                    {/* Item 3 */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-2.5 text-slate-800 font-medium">
                        <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>编排教学内容</span>
                      </div>
                      <span
                        className={`text-xs ${
                          generationPhase === 'step3'
                            ? 'text-blue-600 font-bold animate-pulse'
                            : generationPhase === 'completed'
                            ? 'text-emerald-600 font-semibold flex items-center gap-1'
                            : 'text-slate-400'
                        }`}
                      >
                        {generationPhase === 'step3'
                          ? '● 执行中'
                          : generationPhase === 'completed'
                          ? '✓ 完成'
                          : '○ 等待中'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completion Switch Option */}
                {generationPhase === 'completed' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs animate-fade-in">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>教案生成完成并已自动归档！</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>进入「03 在线排版」查看与编辑</span>
                    </button>
                  </div>
                )}

                {aiFeedbackMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed animate-fade-in">
                    {aiFeedbackMessage}
                  </div>
                )}
              </div>

              {/* Bottom Chat Input */}
              <div className="pt-4 border-t border-slate-100">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    placeholder="向 AI 提出调整要求..."
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="absolute right-1.5 top-1.5 p-1.5 bg-slate-300 hover:bg-blue-600 text-white rounded-full transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: 课程知识库 (02 知识库)
         ========================================================= */}
      {activeTab === 'kb' && (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">课程向量知识库与重点资料</h2>
              </div>
              <button
                onClick={handleStartGeneration}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>基于知识库生成教案</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  id: 'kb-std',
                  name: '《电气控制技术》专业教学标准与课程大纲库',
                  type: '国家标准',
                  vectors: '14,250 向量',
                  desc: '涵盖教育部最新职教专业大纲、1+X技能标准及课程目标规范。',
                },
                {
                  id: 'kb-textbook',
                  name: '高教版《电气控制与PLC技术》（“十四五”国规教材）',
                  type: '规划教材',
                  vectors: '46,800 向量',
                  desc: '包含完整章节内容、电机正反转原理、电路图纸及低压安全规程。',
                },
                {
                  id: 'kb-case',
                  name: '电机正反转控制典型接线错误与电气互锁故障案例库',
                  type: '工程案例',
                  vectors: '9,600 向量',
                  desc: '汇集58种接线虚接、短路隐患与万用表排故工单记录。',
                },
                {
                  id: 'kb-safety',
                  name: '职业技能大赛机电一体化项目安全生产与6S规范',
                  type: '技能竞赛',
                  vectors: '8,400 向量',
                  desc: '国家级职业技能大赛实操考核评分表及现场定置管理标准。',
                },
              ].map((kb) => {
                const isSelected = config.selectedKnowledgeBases.includes(kb.id);
                return (
                  <div
                    key={kb.id}
                    onClick={() => toggleKnowledgeBase(kb.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-75'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-slate-900">{kb.name}</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{kb.desc}</p>
                      <div className="text-slate-400 text-[10px]">
                        {kb.type} · {kb.vectors}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reference Files */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">本地参考材料</span>
                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>上传新资料</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {config.referenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{file.name}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">{file.size}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleKeyReference(file.id)}
                        className={`px-2 py-0.5 text-xs rounded border ${
                          file.isKeyReference
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {file.isKeyReference ? '重点' : '设为重点'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReferenceFile(file.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: 在线排版与成果编辑 (03 在线排版)
         ========================================================= */}
      {activeTab === 'preview' && (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8 flex gap-6 items-start">
          {/* TOC Navigation */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-20 space-y-3 no-print text-xs">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
              <div className="font-bold text-slate-900 pb-2 border-b border-slate-100">
                教案章节目录
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'sec-header', label: '封面与档案编号' },
                  { id: 'sec-basic', label: '1. 教学基本信息' },
                  { id: 'sec-student', label: '2. 学情与教学策略' },
                  { id: 'sec-objectives', label: '3. 三维教学目标' },
                  { id: 'sec-steps', label: '4. 六步法过程表格' },
                  { id: 'sec-circuit', label: '5. 原理图与仿真' },
                  { id: 'sec-rubric', label: '6. 教学评价量规' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors text-xs ${
                      activeTocSection === item.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document Content */}
          <main className="flex-1 space-y-5">
            {/* Control Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
              <div className="flex items-center gap-3">
                {/* Mode Switcher: Preview vs Edit */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">工作模式：</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg font-semibold">
                    <button
                      type="button"
                      onClick={() => setDocEditMode(false)}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        !docEditMode
                          ? 'bg-white text-blue-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>排版预览</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocEditMode(true)}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        docEditMode
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>在线编辑模式</span>
                    </button>
                  </div>
                </div>

                {!docEditMode && (
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <span className="text-slate-500 font-medium">版面：</span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg font-semibold">
                      <button
                        onClick={() => setViewMode('paginated')}
                        className={`px-2.5 py-1 rounded ${
                          viewMode === 'paginated'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        A4 规范页
                      </button>
                      <button
                        onClick={() => setViewMode('continuous')}
                        className={`px-2.5 py-1 rounded ${
                          viewMode === 'continuous'
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        连续视图
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!docEditMode && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono w-8 text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {docEditMode ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerSaveDocument(doc)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saveStatus === 'saving' ? '正在保存...' : '保存教案'}</span>
                    </button>
                    <button
                      onClick={() => setDocEditMode(false)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>完成并预览</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDocEditMode(true)}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑教案内容</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAiRefinePanel(!showAiRefinePanel)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 智能修订</span>
                </button>
              </div>
            </div>

            {/* AI Refine Diff Banner */}
            {showAiRefinePanel && (
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 space-y-3 text-xs no-print">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="输入修改要求..."
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() => {
                      setIsGeneratingSuggestion(true);
                      setTimeout(() => {
                        setIsGeneratingSuggestion(false);
                        setActiveSuggestion({
                          id: 'sug-1',
                          targetSection: '六步法实施环节',
                          summary: '强化接触器机械与电气双重互锁深度对比',
                          beforeSnippet:
                            '引导学生按图接线，巡视指导安全规范，强调断电后合闸校验。',
                          afterSnippet:
                            '重点增加接触器机械互锁与电气双重互锁深度对比：引导学生先断开互锁触点观察相间短路险情，再规范接入常闭辅助触点，使用万用表电阻档进行静态对线排查。',
                          reason: '依据国家标准将相间短路防范作为核心考点。',
                          affectedSections: ['六步法教学过程设计'],
                        });
                      }, 800);
                    }}
                    disabled={isGeneratingSuggestion}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                  >
                    {isGeneratingSuggestion ? '生成中...' : '提交建议'}
                  </button>
                </div>

                {activeSuggestion && (
                  <div className="bg-white rounded-xl p-3 border border-blue-200 space-y-2">
                    <div className="font-bold text-blue-900">{activeSuggestion.summary}</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-red-50 rounded border border-red-200 text-red-900">
                        {activeSuggestion.beforeSnippet}
                      </div>
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                        {activeSuggestion.afterSnippet}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveSuggestion(null)}
                        className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleApplySuggestion}
                        className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                      >
                        应用修改
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================
                DOCUMENT VIEW: (1) EDIT MODE vs (2) PREVIEW MODE
               ========================================================= */}
            {docEditMode ? (
              /* ================= EDIT MODE FORM ================= */
              <div className="bg-white border border-blue-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-8">
                {/* Active Edit Mode Banner */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-blue-900">
                    <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium">
                      当前处于<b>【在线编辑模式】</b>：您可以直接修改教案基本信息、学情策略、三维目标条目、六步教学环节表格及重点难点。修改自动同步保存。
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDocEditMode(false)}
                      className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>查看排版预览</span>
                    </button>
                  </div>
                </div>

                {/* 封面与档案编号 */}
                <section id="sec-header" className="space-y-4 pb-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                      <span>封面标题与归档信息</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 space-y-1">
                      <label className="text-xs font-medium text-slate-700">教案大标题 *</label>
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => {
                          const next = { ...doc, title: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs font-medium text-slate-700">审批状态</label>
                      <select
                        value={doc.approvalStatus || '编制中'}
                        onChange={(e) => {
                          const next: LessonPlanDocument = {
                            ...doc,
                            approvalStatus: e.target.value as any,
                          };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="编制中">编制中</option>
                        <option value="待审核">待审核</option>
                        <option value="已通过">已通过</option>
                        <option value="已归档">已归档</option>
                      </select>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs font-medium text-slate-700">教案副标题 / 示范课说明</label>
                      <input
                        type="text"
                        value={doc.subTitle}
                        onChange={(e) => {
                          const next = { ...doc, subTitle: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs font-medium text-slate-700">归档档案编号</label>
                      <input
                        type="text"
                        value={doc.archiveNumber}
                        onChange={(e) => {
                          const next = { ...doc, archiveNumber: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </section>

                {/* 一、教学基本信息 */}
                <section id="sec-basic" className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                    <span>一、教学基本信息编辑</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">课程名称</label>
                      <input
                        type="text"
                        value={doc.courseName}
                        onChange={(e) => {
                          const next = { ...doc, courseName: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">实训项目</label>
                      <input
                        type="text"
                        value={doc.project}
                        onChange={(e) => {
                          const next = { ...doc, project: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">授课教师</label>
                      <input
                        type="text"
                        value={doc.instructor}
                        onChange={(e) => {
                          const next = { ...doc, instructor: e.target.value };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">授课课时（课时数）</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={doc.periods}
                        onChange={(e) => {
                          const next = { ...doc, periods: parseInt(e.target.value) || 2 };
                          setDoc(next);
                          onSaveDocument(next, config);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">授课班级</label>
                      <input
                        type="text"
                        value={doc.basicInfo?.classGroup || ''}
                        onChange={(e) => handleUpdateDocBasicInfo('classGroup', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">实训场地 / 中心</label>
                      <input
                        type="text"
                        value={doc.basicInfo?.venue || ''}
                        onChange={(e) => handleUpdateDocBasicInfo('venue', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </section>

                {/* 二、学情分析与实施策略 */}
                <section id="sec-student" className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                    <span>二、学情分析与实施策略编辑</span>
                  </h3>
                  <textarea
                    rows={3}
                    value={doc.studentAnalysis}
                    onChange={(e) => {
                      const next = { ...doc, studentAnalysis: e.target.value };
                      setDoc(next);
                      onSaveDocument(next, config);
                    }}
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:border-blue-500 focus:outline-hidden leading-relaxed"
                    placeholder="输入学生学情特征与教学实施痛点分析..."
                  />
                </section>

                {/* 三、三维教学目标编辑 */}
                <section id="sec-objectives" className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                    <span>三、三维教学目标编辑（条目增删）</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* 知识目标 */}
                    <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-blue-200/80">
                        <span className="font-bold text-blue-900">知识目标 ({doc.learningObjectives.knowledge.length})</span>
                        <button
                          type="button"
                          onClick={() => handleAddObjectiveItem('knowledge')}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>加一条</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {doc.learningObjectives.knowledge.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                            <span className="text-blue-500 font-bold shrink-0 mt-1">•</span>
                            <textarea
                              rows={2}
                              value={item}
                              onChange={(e) => handleObjectiveItemChange('knowledge', idx, e.target.value)}
                              className="w-full text-xs text-slate-800 bg-transparent border-none focus:outline-hidden resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveObjectiveItem('knowledge', idx)}
                              className="text-slate-400 hover:text-red-500 p-0.5 shrink-0"
                              title="删除此条"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 技能目标 */}
                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-emerald-200/80">
                        <span className="font-bold text-emerald-900">技能目标 ({doc.learningObjectives.skills.length})</span>
                        <button
                          type="button"
                          onClick={() => handleAddObjectiveItem('skills')}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>加一条</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {doc.learningObjectives.skills.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                            <span className="text-emerald-500 font-bold shrink-0 mt-1">•</span>
                            <textarea
                              rows={2}
                              value={item}
                              onChange={(e) => handleObjectiveItemChange('skills', idx, e.target.value)}
                              className="w-full text-xs text-slate-800 bg-transparent border-none focus:outline-hidden resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveObjectiveItem('skills', idx)}
                              className="text-slate-400 hover:text-red-500 p-0.5 shrink-0"
                              title="删除此条"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 素养目标 */}
                    <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-amber-200/80">
                        <span className="font-bold text-amber-900">素养目标 ({doc.learningObjectives.literacy.length})</span>
                        <button
                          type="button"
                          onClick={() => handleAddObjectiveItem('literacy')}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>加一条</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {doc.learningObjectives.literacy.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 bg-white p-2 rounded-lg border border-amber-100 shadow-2xs">
                            <span className="text-amber-500 font-bold shrink-0 mt-1">•</span>
                            <textarea
                              rows={2}
                              value={item}
                              onChange={(e) => handleObjectiveItemChange('literacy', idx, e.target.value)}
                              className="w-full text-xs text-slate-800 bg-transparent border-none focus:outline-hidden resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveObjectiveItem('literacy', idx)}
                              className="text-slate-400 hover:text-red-500 p-0.5 shrink-0"
                              title="删除此条"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 四、理实一体化六步教学过程（表格编辑） */}
                <section id="sec-steps" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                      <span>四、理实一体化六步教学过程表格编辑 ({doc.teachingSteps.length} 环节)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddTeachingStepRow}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加教学环节</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 w-10 text-center">#</th>
                          <th className="p-2.5 w-36 text-left">环节名称</th>
                          <th className="p-2.5 w-20 text-center">时长</th>
                          <th className="p-2.5 text-left">教师导学活动</th>
                          <th className="p-2.5 text-left">学生活动</th>
                          <th className="p-2.5 w-36 text-left">阶段成果</th>
                          <th className="p-2.5 w-24 text-center">行操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {doc.teachingSteps.map((step, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 align-top">
                            <td className="p-2 text-center font-bold text-slate-400 pt-3">
                              {idx + 1}
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={step.stepName}
                                onChange={(e) => handleTeachingStepFieldChange(idx, 'stepName', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 font-bold text-slate-900 focus:border-blue-500 focus:outline-hidden text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={180}
                                  value={step.duration}
                                  onChange={(e) => handleTeachingStepFieldChange(idx, 'duration', parseInt(e.target.value) || 5)}
                                  className="w-14 bg-white border border-slate-200 rounded px-1.5 py-1.5 text-center font-mono font-bold text-blue-600 focus:border-blue-500 focus:outline-hidden text-xs"
                                />
                                <span className="text-[11px] text-slate-500">分</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <textarea
                                rows={3}
                                value={step.teacherActivity}
                                onChange={(e) => handleTeachingStepFieldChange(idx, 'teacherActivity', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                              />
                            </td>
                            <td className="p-2">
                              <textarea
                                rows={3}
                                value={step.studentActivity}
                                onChange={(e) => handleTeachingStepFieldChange(idx, 'studentActivity', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                              />
                            </td>
                            <td className="p-2">
                              <textarea
                                rows={3}
                                value={step.deliverable}
                                onChange={(e) => handleTeachingStepFieldChange(idx, 'deliverable', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-hidden leading-relaxed"
                              />
                            </td>
                            <td className="p-2 text-center pt-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveTeachingStepRow(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-slate-200 disabled:opacity-20 text-slate-600 rounded cursor-pointer"
                                  title="上移"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTeachingStepRow(idx, 'down')}
                                  disabled={idx === doc.teachingSteps.length - 1}
                                  className="p-1 hover:bg-slate-200 disabled:opacity-20 text-slate-600 rounded cursor-pointer"
                                  title="下移"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeachingStepRow(idx)}
                                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                  title="删除环节"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 五、重点难点与化解策略 */}
                <section id="sec-keypoints" className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                    <span>五、教学重点难点及化解策略编辑</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-900 text-xs">教学重点与化解</div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium">教学重点内容</label>
                        <input
                          type="text"
                          value={doc.keyAndDifficultPoints?.keyPoint || ''}
                          onChange={(e) => handleUpdateKeyPoints('keyPoint', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium">化解策略与突破手段</label>
                        <textarea
                          rows={2}
                          value={doc.keyAndDifficultPoints?.keyResolution || ''}
                          onChange={(e) => handleUpdateKeyPoints('keyResolution', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-900 text-xs">教学难点与化解</div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium">教学难点内容</label>
                        <input
                          type="text"
                          value={doc.keyAndDifficultPoints?.difficultPoint || ''}
                          onChange={(e) => handleUpdateKeyPoints('difficultPoint', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-medium">化解策略与突破手段</label>
                        <textarea
                          rows={2}
                          value={doc.keyAndDifficultPoints?.difficultResolution || ''}
                          onChange={(e) => handleUpdateKeyPoints('difficultResolution', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 底部保存与切换预览按钮 */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => triggerSaveDocument(doc)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>保存所有教案修改</span>
                  </button>
                  <button
                    onClick={() => setDocEditMode(false)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>退出编辑并查看排版预览</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= PREVIEW MODE (A4 SPEC) ================= */
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`transition-transform duration-150 ${
                  viewMode === 'paginated'
                    ? 'max-w-[850px] mx-auto bg-white border border-slate-200 shadow-lg rounded-2xl p-10 space-y-8 relative group'
                    : 'bg-white border border-slate-200 shadow-sm rounded-2xl p-8 space-y-8 relative group'
                }`}
              >
                {/* Quick Edit Mode Floating CTA Badge */}
                <div className="absolute top-4 right-4 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setDocEditMode(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>点击直接编辑内容</span>
                  </button>
                </div>

                <div id="sec-header" className="text-center pb-5 border-b border-slate-300 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-mono tracking-widest uppercase">
                    NATIONAL VOCATIONAL EDUCATION LESSON PLAN
                  </div>
                  <h1 className="w-full text-center text-2xl font-black text-slate-900 tracking-tight">
                    {doc.title}
                  </h1>
                  {doc.subTitle && (
                    <p className="text-xs text-slate-600 max-w-xl mx-auto">{doc.subTitle}</p>
                  )}
                  <div className="text-xs text-slate-500 font-mono pt-1">
                    编号：{doc.archiveNumber} · 状态：
                    <span className="font-semibold text-blue-700">{doc.approvalStatus || '编制中'}</span>
                  </div>
                </div>

                {/* 1. Basic Info */}
                <section id="sec-basic" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>一、教学基本信息</span>
                  </h2>
                  <table className="w-full text-xs border border-slate-300 border-collapse">
                    <tbody>
                      <tr>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left w-24">课程名称</th>
                        <td className="border border-slate-300 p-2.5 font-medium">{doc.courseName}</td>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left w-24">实训项目</th>
                        <td className="border border-slate-300 p-2.5 font-medium">{doc.project}</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left">授课课时</th>
                        <td className="border border-slate-300 p-2.5 font-mono">{doc.periods} 课时 ({doc.periods * 45}分钟)</td>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left">授课教师</th>
                        <td className="border border-slate-300 p-2.5">{doc.instructor}</td>
                      </tr>
                      <tr>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left">授课班级</th>
                        <td className="border border-slate-300 p-2.5">{doc.basicInfo?.classGroup || '2024级 机电1班'}</td>
                        <th className="bg-slate-50 border border-slate-300 p-2.5 text-left">实训场地</th>
                        <td className="border border-slate-300 p-2.5">{doc.basicInfo?.venue || '电气控制实训中心'}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                {/* 2. Student Analysis */}
                <section id="sec-student" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>二、学情分析与实施策略</span>
                  </h2>
                  <div className="w-full text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 leading-relaxed">
                    {doc.studentAnalysis}
                  </div>
                </section>

                {/* 3. Objectives */}
                <section id="sec-objectives" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>三、三维教学目标</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200">
                      <div className="font-bold text-blue-900 mb-1.5">知识目标</div>
                      <ul className="space-y-1 text-slate-700 text-xs">
                        {doc.learningObjectives.knowledge.map((k, idx) => (
                          <li key={idx}>• {k}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                      <div className="font-bold text-emerald-900 mb-1.5">技能目标</div>
                      <ul className="space-y-1 text-slate-700 text-xs">
                        {doc.learningObjectives.skills.map((s, idx) => (
                          <li key={idx}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200">
                      <div className="font-bold text-amber-900 mb-1.5">素养目标</div>
                      <ul className="space-y-1 text-slate-700 text-xs">
                        {doc.learningObjectives.literacy.map((l, idx) => (
                          <li key={idx}>• {l}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 4. Six Steps */}
                <section id="sec-steps" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>四、理实一体化六步教学过程（{doc.periods * 45}分钟）</span>
                  </h2>
                  <table className="w-full text-xs border border-slate-300 border-collapse">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="border border-slate-300 p-2.5 w-32 text-left">环节</th>
                        <th className="border border-slate-300 p-2.5 w-16 text-center">时长</th>
                        <th className="border border-slate-300 p-2.5 text-left">教师导学</th>
                        <th className="border border-slate-300 p-2.5 text-left">学生活动</th>
                        <th className="border border-slate-300 p-2.5 w-32 text-left">阶段成果</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.teachingSteps.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 align-top">
                          <td className="border border-slate-300 p-2.5 font-bold text-slate-900">{s.stepName}</td>
                          <td className="border border-slate-300 p-2.5 text-center font-mono font-semibold text-blue-600">{s.duration}m</td>
                          <td className="border border-slate-300 p-2.5 leading-relaxed">{s.teacherActivity}</td>
                          <td className="border border-slate-300 p-2.5 leading-relaxed">{s.studentActivity}</td>
                          <td className="border border-slate-300 p-2.5 text-slate-600 font-medium">{s.deliverable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                {/* 5. Key and Difficult Points */}
                <section id="sec-keypoints" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>五、教学重点难点及化解策略</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-blue-900 mb-1">【教学重点】</div>
                      <p className="text-slate-800 font-medium mb-1.5">{doc.keyAndDifficultPoints?.keyPoint}</p>
                      <div className="text-slate-500 text-[11px] leading-relaxed">
                        <b>化解对策：</b>{doc.keyAndDifficultPoints?.keyResolution}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-amber-900 mb-1">【教学难点】</div>
                      <p className="text-slate-800 font-medium mb-1.5">{doc.keyAndDifficultPoints?.difficultPoint}</p>
                      <div className="text-slate-500 text-[11px] leading-relaxed">
                        <b>化解对策：</b>{doc.keyAndDifficultPoints?.difficultResolution}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Circuit Simulation */}
                <section id="sec-circuit" className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                    <span>六、电气原理图与交互仿真</span>
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden p-2 bg-slate-50">
                    <CircuitDiagram />
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
