import React, { useState } from 'react';
import { LessonPlanDocument, PageId } from '../../types';
import { exportToDocx, exportToPdfPrint } from '../../utils/exportUtils';
import {
  Plus,
  Search,
  FileText,
  Clock,
  Download,
  Edit3,
  Trash2,
  Presentation,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  X,
  FileCheck2,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlanListPageProps {
  plans: LessonPlanDocument[];
  onSelectPlan: (plan: LessonPlanDocument) => void;
  onEditDesign: (plan: LessonPlanDocument, tab?: 'form' | 'kb' | 'preview') => void;
  onCreateNew: () => void;
  onDeletePlan: (planId: string) => void;
  onDuplicatePlan: (plan: LessonPlanDocument) => void;
  onNavigate: (page: PageId) => void;
  onGeneratePptFromPlan?: (plan: LessonPlanDocument) => void;
}

export const PlanListPage: React.FC<PlanListPageProps> = ({
  plans,
  onSelectPlan,
  onEditDesign,
  onCreateNew,
  onDeletePlan,
  onDuplicatePlan,
  onNavigate,
  onGeneratePptFromPlan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Active popup modal for selected plan
  const [activeModalPlan, setActiveModalPlan] = useState<LessonPlanDocument | null>(null);

  // Delete confirm modal
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Pagination states
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Format project name for clean card presentation (e.g. "项目四：电动机正反转" -> "项目四")
  const formatProjectName = (proj: string) => {
    if (!proj) return '项目实训';
    if (proj.includes('：')) {
      return proj.split('：')[0];
    }
    if (proj.includes(':')) {
      return proj.split(':')[0];
    }
    return proj;
  };

  // Format clean subtitle line
  const formatSubTitle = (plan: LessonPlanDocument) => {
    if (plan.subTitle) {
      if (plan.subTitle.includes(' · ')) {
        return plan.subTitle.split(' · ').pop() || plan.subTitle;
      }
      return plan.subTitle;
    }
    return '理实一体化项目教学实施方案';
  };

  // Filter plans
  const filteredPlans = plans.filter((plan) => {
    if (selectedCourseFilter !== 'all' && plan.courseName !== selectedCourseFilter) {
      return false;
    }
    if (selectedStatusFilter !== 'all' && plan.approvalStatus !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = plan.title.toLowerCase().includes(q);
      const matchCourse = plan.courseName.toLowerCase().includes(q);
      const matchProject = plan.project.toLowerCase().includes(q);
      const matchTags = plan.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCourse && !matchProject && !matchTags) return false;
    }
    return true;
  });

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const startIndex = (currentPageNum - 1) * pageSize;
  const paginatedPlans = filteredPlans.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPageNum(1);
  };

  const handleCourseFilterChange = (val: string) => {
    setSelectedCourseFilter(val);
    setCurrentPageNum(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setSelectedStatusFilter(val);
    setCurrentPageNum(1);
  };

  // Export DOCX for a specific plan
  const handleExportPlanDocx = (plan: LessonPlanDocument) => {
    const html = `
      <h1>${plan.title}</h1>
      <p style="text-align: center; color: #475569;">${plan.subTitle} · 归档编号：${plan.archiveNumber}</p>
      <hr/>
      <h2>一、教学基本信息</h2>
      <table>
        <tr><th>课程名称</th><td>${plan.courseName}</td><th>所属项目</th><td>${plan.project}</td></tr>
        <tr><th>授课课时</th><td>${plan.periods} 课时</td><th>授课教师</th><td>${plan.instructor}</td></tr>
        <tr><th>授课班级</th><td>${plan.basicInfo.classGroup}</td><th>实训场地</th><td>${plan.basicInfo.venue}</td></tr>
      </table>
      <h2>二、学情分析与教学策略</h2>
      <p>${plan.studentAnalysis}</p>
      <h2>三、六步法教学过程设计</h2>
      <table>
        <tr><th>环节名称</th><th>用时</th><th>教师活动</th><th>学生活动</th><th>阶段成果</th></tr>
        ${plan.teachingSteps
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

    exportToDocx(`智能教案_${plan.courseName}_${plan.title}`, plan.title, html);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Helper for status badge style
  const renderStatusBadge = (status?: string) => {
    if (status === '已归档' || status === '已通过') {
      return (
        <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md font-medium">
          {status || '已归档'}
        </span>
      );
    }
    if (status === '待审核') {
      return (
        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md font-medium">
          待审核
        </span>
      );
    }
    return (
      <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md font-medium">
        {status || '编制中'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Sub-header Breadcrumb & Page Top Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal">
            <span>教学教案资产中心</span>
            <span className="text-slate-400">/</span>
            <span>理实一体化实施方案库</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-blue-600 stroke-[1.9]" />
                <span>智能教案管理</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                集中管理课程教案，支持浏览、编辑与归档导出
              </p>
            </div>

            {/* New Plan Button */}
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>新建智能教案</span>
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
                placeholder="搜索教案标题、课程或技能标签"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Course Filter */}
            <div className="relative">
              <select
                value={selectedCourseFilter}
                onChange={(e) => handleCourseFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部课程</option>
                <option value="电气控制技术">电气控制技术</option>
                <option value="数控机床电气控制与PLC">数控机床电气控制与PLC</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="已归档">已归档</option>
                <option value="已通过">已通过</option>
                <option value="待审核">待审核</option>
                <option value="编制中">编制中</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0 self-end md:self-auto">
            <span>共 {filteredPlans.length} 份教案</span>
          </div>
        </div>

        {/* Clean Text-first Cards Grid matching screenshot: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setActiveModalPlan(plan)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Top Row: File icon + Course Name on left, Status Badge on right */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{plan.courseName}</span>
                  </div>
                  {renderStatusBadge(plan.approvalStatus)}
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-3 mb-2 leading-snug">
                  {plan.title}
                </h3>

                {/* Project & Periods */}
                <div className="text-xs text-slate-500">
                  {formatProjectName(plan.project)} · {plan.periods} 课时
                </div>

                {/* Subtitle / Description */}
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {formatSubTitle(plan)}
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3.5">
                  {plan.tags &&
                    plan.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Card Footer: Timestamp on left, Action buttons on right */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{plan.updatedAt || '2026-11-08 16:40'}</span>
                </div>

                {/* Action buttons on right */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEditDesign(plan)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="进入编辑设计"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>编辑</span>
                  </button>

                  <button
                    onClick={() => handleExportPlanDocx(plan)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                    title="导出 Word"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingPlanId(plan.id)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="删除教案"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            显示第 <b className="text-slate-800">{filteredPlans.length === 0 ? 0 : startIndex + 1}</b> 至{' '}
            <b className="text-slate-800">{Math.min(startIndex + pageSize, filteredPlans.length)}</b> 条，共{' '}
            <b className="text-slate-800 font-mono">{filteredPlans.length}</b> 条教案
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

      {/* =========================================================
          POP-UP MODAL: Function Operations on Click Plan
          “点击某个教案之后弹窗显示对应功能”
         ========================================================= */}
      {activeModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden space-y-0 animate-fade-in">
            {/* Modal Top Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white relative">
              <button
                onClick={() => setActiveModalPlan(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold bg-blue-600/80 px-2 py-0.5 rounded">
                  {activeModalPlan.courseName}
                </span>
                <span className="text-blue-300 text-xs">
                  {activeModalPlan.periods} 课时 ({activeModalPlan.periods * 45}分钟)
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-300 text-xs font-semibold">
                  {activeModalPlan.approvalStatus || '已归档'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {activeModalPlan.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                {activeModalPlan.subTitle}
              </p>
            </div>

            {/* Modal Body: Information & Operations Grid */}
            <div className="p-6 space-y-6">
              {/* Teaching Essentials Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">归档编号</div>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">
                    {activeModalPlan.archiveNumber}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">授课班级</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">
                    {activeModalPlan.basicInfo?.classGroup || '2024级 机电1班'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">教学设计</div>
                  <div className="font-semibold text-blue-700 mt-0.5">
                    六步法 ({activeModalPlan.periods * 45}分钟)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">保存状态</div>
                  <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已同步</span>
                  </div>
                </div>
              </div>

              {/* Functional Actions Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>教案功能操作</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Action 1: 表单配置与AI生成 */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      onEditDesign(plan, 'form');
                    }}
                    className="p-3.5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-900">
                        表单配置与AI生成
                      </div>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        调整课时、学情与目标，一键AI智能重构生成
                      </p>
                    </div>
                  </button>

                  {/* Action 2: 在线编辑调整与排版 */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      onEditDesign(plan, 'preview');
                    }}
                    className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        在线编辑调整并保存
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        在线修改教案表、实时排版调整并保存同步
                      </p>
                    </div>
                  </button>

                  {/* Action 3: 专属课程知识库 */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      onEditDesign(plan, 'kb');
                    }}
                    className="p-3.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-900">
                        专属课程知识库 (Tab)
                      </div>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        查阅国家标准、实训参考教材与课件切片
                      </p>
                    </div>
                  </button>

                  {/* Action 4: 进入理实一体工作台 */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      onSelectPlan(plan);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex items-start gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        理实一体工作台 (仿真)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        A4分页预览、电路仿真交互与智能差异修订
                      </p>
                    </div>
                  </button>

                  {/* Action 5: 导出 Word DOCX */}
                  <button
                    onClick={() => handleExportPlanDocx(activeModalPlan)}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        导出 Word 文档 (DOCX)
                      </div>
                      <div className="text-[10px] text-slate-400">标准归档格式</div>
                    </div>
                  </button>

                  {/* Action 6: 导出 PDF */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      onSelectPlan(plan);
                      setTimeout(() => exportToPdfPrint(), 500);
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        导出 PDF 规范本
                      </div>
                      <div className="text-[10px] text-slate-400">A4打印与电子存档</div>
                    </div>
                  </button>

                  {/* Action 7: 转为授课 PPT */}
                  <button
                    onClick={() => {
                      const plan = activeModalPlan;
                      setActiveModalPlan(null);
                      if (onGeneratePptFromPlan) onGeneratePptFromPlan(plan);
                      onNavigate('ppt');
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Presentation className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        一键生成授课课件 (PPT)
                      </div>
                      <div className="text-[10px] text-slate-400">自动带入本教案内容</div>
                    </div>
                  </button>

                  {/* Action 8: 复制教案 */}
                  <button
                    onClick={() => {
                      onDuplicatePlan(activeModalPlan);
                      setActiveModalPlan(null);
                    }}
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Copy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        以此教案为模板复制
                      </div>
                      <div className="text-[10px] text-slate-400">快速克隆教学方案</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Actions: Delete */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <button
                  onClick={() => {
                    setDeletingPlanId(activeModalPlan.id);
                    setActiveModalPlan(null);
                  }}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除此教案实施方案</span>
                </button>

                <button
                  onClick={() => setActiveModalPlan(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  关闭弹窗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlanId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">确认删除此教案方案？</h3>
              <p className="text-xs text-slate-500 mt-1">
                删除后将从当前教师方案列表中移除，此操作不可逆。
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setDeletingPlanId(null)}
                className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onDeletePlan(deletingPlanId);
                  setDeletingPlanId(null);
                }}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
