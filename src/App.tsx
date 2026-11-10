import React, { useState } from 'react';
import { PageId, ResourceTab, PlanConfig, LessonPlanDocument, PptSlide } from './types';
import {
  INITIAL_PLAN_CONFIG,
  INITIAL_LESSON_PLAN,
  INITIAL_LESSON_PLANS_LIST,
  INITIAL_PPT_SLIDES,
} from './data/mockData';
import { Header } from './components/common/Header';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { PlanListPage } from './components/lesson-plan/PlanListPage';
import { PlanConfigPage } from './components/lesson-plan/PlanConfigPage';
import { WorkbenchPage } from './components/lesson-plan/WorkbenchPage';
import { PptStudioPage } from './components/ppt/PptStudioPage';
import { CourseResourcesPage } from './components/resources/CourseResourcesPage';
import { KnowledgeBasePage } from './components/knowledge/KnowledgeBasePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [currentResourceTab, setCurrentResourceTab] = useState<ResourceTab>('syllabus');

  // Authentication State: admin / 123456
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ai_teacher_auth') === 'true';
  });
  const [pendingPage, setPendingPage] = useState<PageId>('plan-list');

  // Core Data States
  const [plansList, setPlansList] = useState<LessonPlanDocument[]>(INITIAL_LESSON_PLANS_LIST);
  const [planConfig, setPlanConfig] = useState<PlanConfig>(INITIAL_PLAN_CONFIG);
  const [lessonPlanDoc, setLessonPlanDoc] = useState<LessonPlanDocument>(INITIAL_LESSON_PLAN);
  const [pptSlides, setPptSlides] = useState<PptSlide[]>(INITIAL_PPT_SLIDES);

  // Master Studio Tab state when entering plan-create
  const [planConfigTab, setPlanConfigTab] = useState<'form' | 'kb' | 'preview'>('form');

  // Navigation handler with Protected Route Enforcement
  const handleNavigate = (page: PageId, tab?: string) => {
    // If navigating to any page other than 'home' or 'login' while unauthenticated, redirect to login
    if (page !== 'home' && page !== 'login' && !isAuthenticated) {
      setPendingPage(page);
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    if (tab && (tab === 'syllabus' || tab === 'question-bank' || tab === 'standard')) {
      setCurrentResourceTab(tab as ResourceTab);
    }
    if (tab && (tab === 'form' || tab === 'kb' || tab === 'preview')) {
      setPlanConfigTab(tab as 'form' | 'kb' | 'preview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ai_teacher_auth', 'true');
    setCurrentPage(pendingPage || 'plan-list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ai_teacher_auth');
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-fill from Home search intent (e.g. "帮我生成电动机正反转控制的 2 课时教案")
  const handleApplyIntentConfig = (intent: { project: string; periods: number }) => {
    setPlanConfig((prev) => ({
      ...prev,
      trainingProject: intent.project,
      periods: intent.periods,
    }));
  };

  // Select a plan to view in Workbench
  const handleSelectPlan = (plan: LessonPlanDocument) => {
    setLessonPlanDoc(plan);
    setPlanConfig((prev) => ({
      ...prev,
      courseName: plan.courseName,
      trainingProject: plan.title,
      periods: plan.periods,
      studentAnalysis: plan.studentAnalysis,
    }));
    setCurrentPage('plan-workbench');
  };

  // "编辑即是设计界面" - Enter PlanConfigPage with plan's data
  const handleEditDesign = (plan: LessonPlanDocument, tab: 'form' | 'kb' | 'preview' = 'form') => {
    setLessonPlanDoc(plan);
    setPlanConfig((prev) => ({
      ...prev,
      courseName: plan.courseName,
      trainingProject: plan.title,
      periods: plan.periods,
      studentAnalysis: plan.studentAnalysis,
    }));
    setPlanConfigTab(tab);
    setCurrentPage('plan-create');
  };

  // Create new plan - resets to fresh template and opens design interface
  const handleCreateNew = () => {
    setPlanConfig(INITIAL_PLAN_CONFIG);
    setPlanConfigTab('form');
    setCurrentPage('plan-create');
  };

  // Delete plan from list
  const handleDeletePlan = (planId: string) => {
    setPlansList((prev) => prev.filter((p) => p.id !== planId));
  };

  // Duplicate plan into list
  const handleDuplicatePlan = (plan: LessonPlanDocument) => {
    const newId = `lp-${Date.now()}`;
    const duplicatedPlan: LessonPlanDocument = {
      ...plan,
      id: newId,
      title: `${plan.title} (副本)`,
      archiveNumber: `JD-COPY-${Date.now().toString().slice(-4)}`,
      approvalStatus: '编制中',
      version: 'v1.0 (草案副本)',
      lastSavedAt: '刚刚复制',
      updatedAt: '刚刚',
    };
    setPlansList((prev) => [duplicatedPlan, ...prev]);
  };

  // Save document from PlanConfigPage (Online editing or AI Generation)
  const handleSaveDocument = (doc: LessonPlanDocument, config: PlanConfig) => {
    setLessonPlanDoc(doc);
    setPlanConfig(config);
    setPlansList((prev) => {
      const idx = prev.findIndex((p) => p.id === doc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = doc;
        return next;
      }
      return [doc, ...prev];
    });
  };

  // Generate PPT directly from selected plan
  const handleGeneratePptFromPlan = (plan: LessonPlanDocument) => {
    const updatedSlides: PptSlide[] = [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: plan.title,
        subTitle: plan.subTitle,
        bulletPoints: [
          `主讲教师：${plan.instructor}`,
          `所属课程：《${plan.courseName}》`,
          `授课课时：${plan.periods} 课时（90分钟理实一体化）`,
          `授课班级：${plan.basicInfo?.classGroup || '2024级 机电1班'}`,
        ],
        layout: 'title',
        accent: 'blue',
      },
      ...pptSlides.slice(1),
    ];
    setPptSlides(updatedSlides);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 3-Zone Standard Top Navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userName="张敏 教授"
      />

      {/* Page Content Routing */}
      <div className="flex-1">
        {/* 登录界面 */}
        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => handleNavigate('home')}
          />
        )}

        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onApplyIntentConfig={handleApplyIntentConfig}
          />
        )}

        {/* 智能教案图文列表管理页面 */}
        {currentPage === 'plan-list' && (
          <PlanListPage
            plans={plansList}
            onSelectPlan={handleSelectPlan}
            onEditDesign={handleEditDesign}
            onCreateNew={handleCreateNew}
            onDeletePlan={handleDeletePlan}
            onDuplicatePlan={handleDuplicatePlan}
            onNavigate={handleNavigate}
            onGeneratePptFromPlan={handleGeneratePptFromPlan}
          />
        )}

        {/* 智能教案设计/配置界面 */}
        {currentPage === 'plan-create' && (
          <PlanConfigPage
            initialConfig={planConfig}
            initialDocument={lessonPlanDoc}
            onSaveDocument={handleSaveDocument}
            onNavigate={handleNavigate}
            initialTab={planConfigTab}
          />
        )}

        {/* 教案编辑与实施方案工作台 */}
        {currentPage === 'plan-workbench' && (
          <WorkbenchPage
            document={lessonPlanDoc}
            onUpdateDocument={(updated) => {
              setLessonPlanDoc(updated);
              setPlansList((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              );
            }}
            onNavigate={handleNavigate}
          />
        )}

        {/* AI PPT 课件工坊 */}
        {currentPage === 'ppt' && (
          <PptStudioPage
            slides={pptSlides}
            onUpdateSlides={(updated) => setPptSlides(updated)}
            onNavigate={handleNavigate}
            lessonPlanDoc={lessonPlanDoc}
          />
        )}

        {/* 课程教学资源协同生成工坊 */}
        {currentPage === 'resources' && (
          <CourseResourcesPage
            initialTab={currentResourceTab}
            onNavigate={handleNavigate}
          />
        )}

        {/* 校级专业知识库管理 */}
        {currentPage === 'knowledge' && (
          <KnowledgeBasePage onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}

