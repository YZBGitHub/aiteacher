import React, { useState } from 'react';
import {
  ResourceTab,
  PageId,
  SyllabusModule,
  QuestionItem,
  CurriculumStandardDoc,
  CourseResourcePackage,
} from '../../types';
import { INITIAL_COURSE_RESOURCES } from '../../data/mockData';
import { exportToDocx, exportToXlsx } from '../../utils/exportUtils';
import {
  ListOrdered,
  HelpCircle,
  FileCheck,
  Download,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Filter,
  FileSpreadsheet,
  FileText,
  Search,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronDown,
  X,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourseResourcesPageProps {
  initialTab?: ResourceTab;
  onNavigate: (page: PageId) => void;
}

export const CourseResourcesPage: React.FC<CourseResourcesPageProps> = ({
  initialTab = 'syllabus',
  onNavigate,
}) => {
  // Course Resource Packages state
  const [packages, setPackages] = useState<CourseResourcePackage[]>(INITIAL_COURSE_RESOURCES);

  // When selectedPackage is null, show list view + pagination
  // When selected, show detail view with tabs
  const [selectedPackage, setSelectedPackage] = useState<CourseResourcePackage | null>(null);

  // Active tab within the detail view
  const [activeTab, setActiveTab] = useState<ResourceTab>(initialTab);

  // Search & Filter states for List View
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [packageTypeFilter, setPackageTypeFilter] = useState('all');

  // Pagination states
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Detail view state holders (synced when entering a package)
  const [currentModules, setCurrentModules] = useState<SyllabusModule[]>([]);
  const [totalHours, setTotalHours] = useState<number>(64);
  const [currentQuestions, setCurrentQuestions] = useState<QuestionItem[]>([]);
  const [currentStandard, setCurrentStandard] = useState<CurriculumStandardDoc | null>(null);
  const [questionFilter, setQuestionFilter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);

  // New Resource Package Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('机电一体化技术');
  const [newPkgType, setNewPkgType] = useState('理实一体化全套包');
  const [newHours, setNewHours] = useState(64);

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (specialtyFilter !== 'all' && pkg.specialty !== specialtyFilter) return false;
    if (packageTypeFilter !== 'all' && pkg.packageType !== packageTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pkg.courseName.toLowerCase().includes(q);
      const matchTitle = pkg.title.toLowerCase().includes(q);
      const matchSpec = pkg.specialty.toLowerCase().includes(q);
      const matchDesc = pkg.description.toLowerCase().includes(q);
      const matchTags = pkg.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchSpec && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize));
  const startIndex = (currentPageNum - 1) * pageSize;
  const paginatedPackages = filteredPackages.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPageNum(1);
  };

  const handleSpecialtyFilterChange = (val: string) => {
    setSpecialtyFilter(val);
    setCurrentPageNum(1);
  };

  const handlePackageTypeFilterChange = (val: string) => {
    setPackageTypeFilter(val);
    setCurrentPageNum(1);
  };

  // Open a package detail
  const handleOpenPackageDetail = (pkg: CourseResourcePackage, tab: ResourceTab = 'syllabus') => {
    setSelectedPackage(pkg);
    setActiveTab(tab);
    setCurrentModules(pkg.modules);
    setTotalHours(pkg.totalHours);
    setCurrentQuestions(pkg.questions);
    setCurrentStandard(pkg.standardDoc);
  };

  // Calculations for Syllabus
  const calcTheorySum = currentModules.reduce((acc, m) => acc + (m.theoryHours || 0), 0);
  const calcPracticeSum = currentModules.reduce((acc, m) => acc + (m.practiceHours || 0), 0);
  const calcSum = calcTheorySum + calcPracticeSum;
  const isHoursValid = calcSum === totalHours;

  // Re-generate single question
  const handleRegenerateQuestion = (qId: string) => {
    setGeneratingQuestionId(qId);
    setTimeout(() => {
      setCurrentQuestions((prev) =>
        prev.map((q) =>
          q.id === qId
            ? {
                ...q,
                stem: q.stem + '（AI已依据最新低压电工考证规程优化设问）',
                analysis: q.analysis + '【更新考核要点：重点考核防短路安全意识与6S规范】',
              }
            : q
        )
      );
      setGeneratingQuestionId(null);
    }, 700);
  };

  // Export handlers for Syllabus
  const handleExportSyllabusDocx = () => {
    if (!selectedPackage) return;
    const rowsHtml = currentModules
      .map(
        (m) => `
      <tr>
        <td><b>${m.projectNumber}</b></td>
        <td><b>${m.title}</b></td>
        <td>${m.tasks}</td>
        <td>${m.theoryHours}</td>
        <td>${m.practiceHours}</td>
        <td>${m.theoryHours + m.practiceHours}</td>
        <td>${m.assessment}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <h1>《${selectedPackage.courseName}》课程教学大纲与实训项目编排</h1>
      <p>总学时：${totalHours} 学时（理论：${calcTheorySum} 学时，实训：${calcPracticeSum} 学时）</p>
      <table>
        <tr>
          <th>序号</th><th>项目名称</th><th>核心实训任务</th><th>理论学时</th><th>实训学时</th><th>总学时</th><th>考核方式</th>
        </tr>
        ${rowsHtml}
      </table>
    `;
    exportToDocx(`课程大纲_${selectedPackage.courseName}_${totalHours}学时`, `《${selectedPackage.courseName}》教学大纲`, html);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Export handlers for Question Bank (XLSX)
  const handleExportQuestionsXlsx = () => {
    if (!selectedPackage) return;
    const header = ['序号', '题型', '技能考点', '难度', '题干', '正确答案', '考点解析'];
    const rows = currentQuestions.map((q, idx) => [
      idx + 1,
      q.type,
      q.skillPoint,
      q.difficulty,
      q.stem,
      q.answer,
      q.analysis,
    ]);
    exportToXlsx(`课程题库_${selectedPackage.courseName}_${currentQuestions.length}题`, [header, ...rows]);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Export handlers for Standard (DOCX)
  const handleExportStandardDocx = () => {
    if (!selectedPackage || !currentStandard) return;
    const modulesHtml = currentStandard.contentAndRequirements
      .map(
        (m) => `
      <tr>
        <td><b>${m.module}</b></td>
        <td>${m.hours}</td>
        <td>${m.tasks.join('；')}</td>
        <td>${m.standards}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <h1>${currentStandard.specialtyName}专业《${selectedPackage.courseName}》课程标准（草案）</h1>
      <p style="color: #b91c1c; font-weight: bold;">【标记：课程标准草案·待教研室审核备案】</p>
      <p>专业代码：${currentStandard.specialtyCode} · 建议学时：${currentStandard.suggestedHours} 学时 · 学分：${currentStandard.credits} 学分</p>
      <hr/>
      <h2>一、课程性质与定位</h2>
      <p>${currentStandard.courseDescription}</p>
      <h2>二、课程目标（三维立体）</h2>
      <h3>1. 素养目标</h3>
      <ul>${currentStandard.courseObjectives.quality.map((q) => `<li>${q}</li>`).join('')}</ul>
      <h3>2. 知识目标</h3>
      <ul>${currentStandard.courseObjectives.knowledge.map((k) => `<li>${k}</li>`).join('')}</ul>
      <h3>3. 能力目标</h3>
      <ul>${currentStandard.courseObjectives.capability.map((c) => `<li>${c}</li>`).join('')}</ul>
      <h2>三、课程内容与学时分配</h2>
      <table>
        <tr><th>模块名称</th><th>学时</th><th>主要任务</th><th>考核标准</th></tr>
        ${modulesHtml}
      </table>
      <h2>四、教学实施条件与建议</h2>
      <p><b>师资条件：</b>${currentStandard.implementationConditions.teachers}</p>
      <p><b>设备条件：</b>${currentStandard.implementationConditions.equipment}</p>
      <p><b>考核评价方案：</b>${currentStandard.evaluationMethod}</p>
    `;
    exportToDocx(`课程标准_${currentStandard.specialtyName}_${selectedPackage.courseName}`, `课程标准草案`, html);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Create new package handler
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newPkg: CourseResourcePackage = {
      id: `res-pkg-${Date.now()}`,
      courseName: newCourseName.trim(),
      title: newTitle.trim() || `《${newCourseName.trim()}》理实一体化教学资源包`,
      specialty: newSpecialty,
      packageType: newPkgType,
      totalHours: newHours,
      projectCount: 4,
      questionCount: 30,
      hasStandard: true,
      description: `教师团队编制的《${newCourseName.trim()}》课程教学大纲、试题库与课程标准资源集。`,
      instructor: '张敏 教授',
      updatedAt: '刚刚创建',
      tags: ['理实一体', '学分标准', '考证对标'],
      modules: INITIAL_COURSE_RESOURCES[0].modules.slice(0, 4),
      questions: INITIAL_COURSE_RESOURCES[0].questions.slice(0, 3),
      standardDoc: INITIAL_COURSE_RESOURCES[0].standardDoc,
    };

    setPackages([newPkg, ...packages]);
    setIsCreateModalOpen(false);
    setNewCourseName('');
    setNewTitle('');
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  const filteredQuestions = currentQuestions.filter((q) => {
    if (questionFilter !== 'all' && q.type !== questionFilter) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  // =========================================================================
  // VIEW 1: DETAIL VIEW (When a Course Resource is selected)
  // =========================================================================
  if (selectedPackage) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
        {/* Top Bar with Back Link & 3 Tab Switchers */}
        <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-14 z-30 shadow-2xs no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPackage(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>返回课程资源列表</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-900">
                    {selectedPackage.title}
                  </h1>
                  <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {selectedPackage.courseName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {selectedPackage.specialty} · 总计 {totalHours} 学时 · {selectedPackage.instructor}
                </p>
              </div>
            </div>

            {/* 3 Tab Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'syllabus'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>教学大纲与项目</span>
              </button>
              <button
                onClick={() => setActiveTab('question-bank')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'question-bank'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>智能考核题库</span>
              </button>
              <button
                onClick={() => setActiveTab('standard')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'standard'
                    ? 'bg-white text-amber-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>专业课程标准</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
          {/* TAB 1: SYLLABUS */}
          {activeTab === 'syllabus' && (
            <>
              {/* Left Settings */}
              <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4 no-print">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <ListOrdered className="w-4 h-4 text-blue-600" />
                  <span>大纲参数与课时设置</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">所属课程</label>
                  <input
                    type="text"
                    disabled
                    value={selectedPackage.courseName}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    总学时指标 (学分基准)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={totalHours}
                      onChange={(e) => setTotalHours(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                    />
                    <span className="text-xs text-slate-500 shrink-0">学时</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-700">实时课时校验统计：</div>
                  <div className="flex justify-between text-slate-600">
                    <span>理论课时合计</span>
                    <span className="font-mono font-semibold">{calcTheorySum} 学时</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>实训课时合计</span>
                    <span className="font-mono font-semibold">{calcPracticeSum} 学时</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold">
                    <span>分项总和</span>
                    <span className={`font-mono ${isHoursValid ? 'text-emerald-600' : 'text-red-600'}`}>
                      {calcSum} / {totalHours} 学时
                    </span>
                  </div>
                </div>

                {!isHoursValid && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>分项学时合计与总学时指标不一致，请调整下方各模块课时。</span>
                  </div>
                )}

                <button
                  onClick={handleExportSyllabusDocx}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>导出教学大纲 (Word)</span>
                </button>
              </div>

              {/* Right Modules Table */}
              <div className="flex-1 w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    实训项目与学时模块编排 ({currentModules.length} 个项目)
                  </h3>
                  <button
                    onClick={() => {
                      const newMod: SyllabusModule = {
                        id: `mod-${Date.now()}`,
                        projectNumber: `项目${currentModules.length + 1}`,
                        title: '新实训项目实施方案',
                        tasks: '学生按图接线并进行静态故障排查',
                        theoryHours: 2,
                        practiceHours: 6,
                        objectives: '掌握典型低压控制线路识图与装调。',
                        assessment: '实操考评 + 接线工艺',
                      };
                      setCurrentModules([...currentModules, newMod]);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加项目模块</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="p-2.5 border border-slate-200 w-16">序号</th>
                        <th className="p-2.5 border border-slate-200">实训项目名称</th>
                        <th className="p-2.5 border border-slate-200">核心实训任务</th>
                        <th className="p-2.5 border border-slate-200 w-20 text-center">理论学时</th>
                        <th className="p-2.5 border border-slate-200 w-20 text-center">实训学时</th>
                        <th className="p-2.5 border border-slate-200">考核评价方式</th>
                        <th className="p-2.5 border border-slate-200 w-12 text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentModules.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 border border-slate-200 font-bold text-blue-700">
                            {m.projectNumber}
                          </td>
                          <td className="p-2.5 border border-slate-200 font-semibold text-slate-800">
                            {m.title}
                          </td>
                          <td className="p-2.5 border border-slate-200 text-slate-600">
                            {m.tasks}
                          </td>
                          <td className="p-2.5 border border-slate-200 text-center font-mono font-bold text-slate-700">
                            {m.theoryHours}h
                          </td>
                          <td className="p-2.5 border border-slate-200 text-center font-mono font-bold text-blue-600">
                            {m.practiceHours}h
                          </td>
                          <td className="p-2.5 border border-slate-200 text-slate-600">
                            {m.assessment}
                          </td>
                          <td className="p-2.5 border border-slate-200 text-center">
                            <button
                              onClick={() => setCurrentModules(currentModules.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              title="删除此项目"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: QUESTION BANK */}
          {activeTab === 'question-bank' && (
            <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <select
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                  >
                    <option value="all">全部题型</option>
                    <option value="单选题">单选题</option>
                    <option value="多选题">多选题</option>
                    <option value="判断题">判断题</option>
                    <option value="故障分析题">故障分析题</option>
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
                  >
                    <option value="all">全部难度</option>
                    <option value="初级">初级</option>
                    <option value="中级">中级</option>
                    <option value="高级">高级</option>
                  </select>

                  <span className="text-xs text-slate-500">
                    共 {filteredQuestions.length} 道考核题
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportQuestionsXlsx}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>导出试题库 (Excel)</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">第 {idx + 1} 题</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {q.type}
                        </span>
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                          考点：{q.skillPoint}
                        </span>
                        <span className="text-amber-600 font-medium">难度：{q.difficulty}</span>
                      </div>

                      <button
                        onClick={() => handleRegenerateQuestion(q.id)}
                        disabled={generatingQuestionId === q.id}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            generatingQuestionId === q.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>AI重新优化</span>
                      </button>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{q.stem}</p>

                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                        {q.options.map((opt, i) => (
                          <div key={i} className="p-2 bg-white rounded border border-slate-200">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200/60">
                      <div>
                        <span className="font-bold text-emerald-700">参考答案：</span>
                        <span className="font-mono font-bold text-slate-900">{q.answer}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] max-w-xl">
                        <span className="font-semibold text-slate-700">解析：</span>
                        {q.analysis}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CURRICULUM STANDARD */}
          {activeTab === 'standard' && currentStandard && (
            <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {currentStandard.specialtyName}专业《{selectedPackage.courseName}》课程标准
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    对标教育部国家职业教育教学标准与 1+X 证书规范
                  </p>
                </div>
                <button
                  onClick={handleExportStandardDocx}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>导出课程标准 (Word)</span>
                </button>
              </div>

              {/* Standard Sections */}
              <div className="space-y-5 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">一、课程性质与定位</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {currentStandard.courseDescription}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">二、三维立体教学目标</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                      <div className="font-bold text-blue-900 mb-1.5">1. 知识目标</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {currentStandard.courseObjectives.knowledge.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="font-bold text-emerald-900 mb-1.5">2. 技能目标</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {currentStandard.courseObjectives.capability.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg">
                      <div className="font-bold text-purple-900 mb-1.5">3. 素养目标</div>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                        {currentStandard.courseObjectives.quality.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">三、教学实施与考核建议</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-slate-600 leading-relaxed">
                    <p>
                      <b className="text-slate-800">师资队伍配置：</b>
                      {currentStandard.implementationConditions.teachers}
                    </p>
                    <p>
                      <b className="text-slate-800">实训场地与装备：</b>
                      {currentStandard.implementationConditions.equipment}
                    </p>
                    <p>
                      <b className="text-slate-800">多维考核评价机制：</b>
                      {currentStandard.evaluationMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LIST VIEW (Default View with Cards + Pagination)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Sub-header Breadcrumb & Page Top Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
            <span>教学资源资产中心</span>
            <span className="text-slate-400">/</span>
            <span>课程资源库</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-blue-600 stroke-[1.9]" />
                <span>课程资源库</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                汇集专业核心课程大纲、智能试题库与国家课程建设标准，支持一键查看、编辑与导出
              </p>
            </div>

            {/* New Resource Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>新建课程资源</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="搜索课程名称、资源包关键词或专业..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Specialty Filter */}
            <div className="relative">
              <select
                value={specialtyFilter}
                onChange={(e) => handleSpecialtyFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部专业</option>
                <option value="机电一体化技术">机电一体化技术</option>
                <option value="数控技术">数控技术</option>
                <option value="电气自动化技术">电气自动化技术</option>
                <option value="工业机器人技术">工业机器人技术</option>
                <option value="智能制造大类通识">智能制造大类通识</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Package Type Filter */}
            <div className="relative">
              <select
                value={packageTypeFilter}
                onChange={(e) => handlePackageTypeFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部类型</option>
                <option value="理实一体化全套包">理实一体化全套包</option>
                <option value="工程实训包">工程实训包</option>
                <option value="考证专项资源包">考证专项资源包</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0 self-end md:self-auto">
            <span>共 {filteredPackages.length} 份课程资源</span>
          </div>
        </div>

        {/* Clean Cards Grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleOpenPackageDetail(pkg, 'syllabus')}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Top Row: Course name & package type badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{pkg.courseName}</span>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md font-medium">
                    {pkg.packageType}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-3 mb-2 leading-snug line-clamp-2">
                  {pkg.title}
                </h3>

                {/* Specialty & Hours */}
                <div className="text-xs text-slate-500">
                  {pkg.specialty} · 总计 {pkg.totalHours} 课时
                </div>

                {/* Description */}
                <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {pkg.description}
                </div>

                {/* Included components badges */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {pkg.totalHours}学时大纲 ({pkg.projectCount}个项目)
                  </span>
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    题库 ({pkg.questionCount}题)
                  </span>
                  {pkg.hasStandard && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      专业课标
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pkg.updatedAt || '2026-11-08'}</span>
                </div>

                {/* Action buttons on right */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenPackageDetail(pkg, 'syllabus')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="查看大纲与题库详情"
                  >
                    <span>详情</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            显示第 <b className="text-slate-800">{filteredPackages.length === 0 ? 0 : startIndex + 1}</b> 至{' '}
            <b className="text-slate-800">{Math.min(startIndex + pageSize, filteredPackages.length)}</b> 条，共{' '}
            <b className="text-slate-800 font-mono">{filteredPackages.length}</b> 份课程资源
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>每页显示:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPageNum(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={6}>6 条/页</option>
                <option value={9}>9 条/页</option>
                <option value={12}>12 条/页</option>
              </select>
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                disabled={currentPageNum === 1}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 font-medium text-slate-600 cursor-pointer"
              >
                上一页
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPageNum(page)}
                    className={`w-7 h-7 rounded border font-mono font-medium transition-colors cursor-pointer ${
                      currentPageNum === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageNum === totalPages || totalPages === 0}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-slate-50 font-medium text-slate-600 cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Course Resource */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>新建课程教学资源包</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  课程名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="例如：工厂电气控制与自动化"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  资源包标题
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="留空则自动生成为《课程名称》理实一体化教学资源包"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    所属专业
                  </label>
                  <select
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="机电一体化技术">机电一体化技术</option>
                    <option value="数控技术">数控技术</option>
                    <option value="电气自动化技术">电气自动化技术</option>
                    <option value="工业机器人技术">工业机器人技术</option>
                    <option value="智能制造大类通识">智能制造大类通识</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    总学时 (学分基准)
                  </label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  资源包类型
                </label>
                <select
                  value={newPkgType}
                  onChange={(e) => setNewPkgType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="理实一体化全套包">理实一体化全套包 (大纲+题库+课标)</option>
                  <option value="工程实训包">工程实训包 (实训大纲+技能题库)</option>
                  <option value="考证专项资源包">考证专项资源包 (考证题库+标准)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
