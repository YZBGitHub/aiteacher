import React, { useState } from 'react';
import { PageId, KnowledgeBase, ReferenceFile, KnowledgeChunk } from '../../types';
import { INITIAL_KNOWLEDGE_BASES } from '../../data/mockData';
import {
  Layers,
  Search,
  Plus,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  BookOpen,
  Filter,
  Check,
  Download,
  Share2,
  RefreshCw,
  FolderOpen,
  Sliders,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KnowledgeBasePageProps {
  onNavigate: (page: PageId) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onNavigate }) => {
  // Knowledge bases state
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(INITIAL_KNOWLEDGE_BASES);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination states for list
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Detail view active tab
  const [detailTab, setDetailTab] = useState<'files' | 'search' | 'permissions'>('files');

  // Interactive RAG search state in detail view
  const [ragQuery, setRagQuery] = useState('接触器电气互锁防短路');
  const [isSearchingRag, setIsSearchingRag] = useState(false);
  const [ragResults, setRagResults] = useState<KnowledgeChunk[]>([]);

  // Snippet modal
  const [previewSnippet, setPreviewSnippet] = useState<{ title: string; content: string } | null>(null);

  // New KB Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [newKbCategory, setNewKbCategory] = useState('国家标准');
  const [newKbDesc, setNewKbDesc] = useState('');

  // Filter list
  const filteredKbs = knowledgeBases.filter((kb) => {
    if (categoryFilter !== 'all' && kb.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && kb.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kb.name.toLowerCase().includes(q);
      const matchDesc = kb.description.toLowerCase().includes(q);
      const matchCat = kb.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredKbs.length / pageSize));
  const startIndex = (currentPageNum - 1) * pageSize;
  const paginatedKbs = filteredKbs.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPageNum(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPageNum(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPageNum(1);
  };

  // Perform RAG vector search demo
  const handlePerformRagSearch = (targetKb: KnowledgeBase) => {
    setIsSearchingRag(true);
    setTimeout(() => {
      const queryLower = ragQuery.toLowerCase();
      const sample = targetKb.sampleChunks || [];
      // Filter or return default chunks with dynamic score
      const results = sample.map((c, i) => ({
        ...c,
        similarity: i === 0 ? 0.984 : 0.942,
      }));
      setRagResults(results);
      setIsSearchingRag(false);
    }, 450);
  };

  // Open detail
  const handleOpenDetail = (kb: KnowledgeBase, defaultTab: 'files' | 'search' | 'permissions' = 'files') => {
    setSelectedKb(kb);
    setDetailTab(defaultTab);
    if (defaultTab === 'search') {
      handlePerformRagSearch(kb);
    }
  };

  // Create new KB
  const handleCreateKb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKbName.trim()) return;

    const newKb: KnowledgeBase = {
      id: `kb-custom-${Date.now()}`,
      name: newKbName.trim(),
      category: newKbCategory,
      vectorCount: 1200,
      docCount: 1,
      status: 'ready',
      updatedAt: '刚刚创建',
      department: '智能制造与电气工程学院',
      description: newKbDesc.trim() || '教师团队自建专业课程知识库。',
      selected: false,
      files: [
        {
          id: `f-${Date.now()}`,
          name: `${newKbName.trim()}实施指南.pdf`,
          size: '2.4 MB',
          type: 'pdf',
          status: 'completed',
          isKeyReference: true,
          parseTime: '刚刚完成向量化切片',
          extractedSnippet: '已建立初始向量空间索引，支持教案与课件生成时实时检索引用。',
        },
      ],
      sampleChunks: [
        {
          id: `chunk-new-1`,
          content: '本知识库收录该专业领域的最新教学指导规范与实训典型工况案例。',
          sourceFile: `${newKbName.trim()}实施指南.pdf`,
          section: '第1章 总论',
        },
      ],
    };

    setKnowledgeBases([newKb, ...knowledgeBases]);
    setIsCreateModalOpen(false);
    setNewKbName('');
    setNewKbDesc('');
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch (e) {
      // ignore
    }
  };

  // Render Category Badge
  const renderCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      国家标准: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      规划教材: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      工程案例: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      技能竞赛: 'bg-purple-50 text-purple-600 border border-purple-200/60',
    };
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${colors[cat] || 'bg-slate-100 text-slate-600'}`}>
        {cat}
      </span>
    );
  };

  // =========================================================================
  // VIEW 1: DETAIL VIEW (When a Knowledge Base is selected)
  // =========================================================================
  if (selectedKb) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedKb(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回校级知识库列表</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">知识库编号:</span>
              <span className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {selectedKb.id}
              </span>
            </div>
          </div>

          {/* Knowledge Base Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {renderCategoryBadge(selectedKb.category)}
                  <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200/60 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>已就绪 · 向量索引生效中</span>
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{selectedKb.department || '智能制造与电气工程学院'}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Database className="w-6 h-6 text-blue-600 shrink-0" />
                  <span>{selectedKb.name}</span>
                </h1>

                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  {selectedKb.description}
                </p>
              </div>

              {/* Stats Box */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400">向量切片</div>
                  <div className="text-base font-bold font-mono text-blue-600 mt-0.5">
                    {selectedKb.vectorCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400">核心文献</div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                    {selectedKb.docCount || selectedKb.files?.length || 3} 份
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center px-2">
                  <div className="text-xs text-slate-400">同步更新</div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    {selectedKb.updatedAt || '最近同步'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-6 border-t border-slate-100 mt-6 pt-4 text-xs font-semibold">
              <button
                onClick={() => setDetailTab('files')}
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'files'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>知识切片与文档列表 ({selectedKb.files?.length || 0})</span>
              </button>

              <button
                onClick={() => {
                  setDetailTab('search');
                  handlePerformRagSearch(selectedKb);
                }}
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'search'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>语义检索体验 (RAG)</span>
              </button>

              <button
                onClick={() => setDetailTab('permissions')}
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors cursor-pointer ${
                  detailTab === 'permissions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>授权与应用课程</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT 1: FILES LIST */}
          {detailTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  知识库中文档已全部经过大模型语义解析与向量化编码，可在编制教案时自动召回支撑。
                </div>
                <button
                  onClick={() => alert('支持上传 PDF, DOCX, TXT 课程教材与标准文档进行自动向量切片。')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>上传新文档切片</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {selectedKb.files && selectedKb.files.length > 0 ? (
                    selectedKb.files.map((file) => (
                      <div
                        key={file.id}
                        className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{file.name}</h4>
                              <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {file.type}
                              </span>
                              {file.isKeyReference && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                  核心参考源
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>大小: {file.size}</span>
                              <span>·</span>
                              <span className="text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{file.parseTime || '向量化完成'}</span>
                              </span>
                            </div>

                            {file.extractedSnippet && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 font-mono leading-relaxed">
                                <span className="text-blue-600 font-semibold">【高频切片】：</span>
                                {file.extractedSnippet}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            onClick={() =>
                              setPreviewSnippet({
                                title: file.name,
                                content: file.extractedSnippet || '已包含该文献完整结构切片与电气工程图纸符号解析。',
                              })
                            }
                            className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors cursor-pointer"
                          >
                            查看切片内容
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      暂无文档，请点击右上角上传新文档切片
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: RAG SEARCH */}
          {detailTab === 'search' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>知识库向量语义检索实测</span>
                  </h3>
                  <span className="text-xs text-slate-400">Embedding: Text-Embedding-004 · 余弦相似度计算</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="输入教学专业知识点、实训安全规范或排故问题..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => handlePerformRagSearch(selectedKb)}
                    disabled={isSearchingRag}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingRag ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>向量检索中...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>检索知识库</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Queries */}
                <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500">
                  <span>快捷测试词：</span>
                  {['接触器电气互锁防短路', '三相异步电动机同步转速', '实训通电前三项检查', '接线虚接万用表测量'].map(
                    (kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setRagQuery(kw);
                          setTimeout(() => handlePerformRagSearch(selectedKb), 100);
                        }}
                        className="text-xs text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {kw}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* RAG Results */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>检索召回切片结果 (Top-K)</span>
                </div>

                <div className="space-y-3">
                  {ragResults.length > 0 ? (
                    ragResults.map((chunk, idx) => (
                      <div
                        key={chunk.id || idx}
                        className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600 font-mono">#{idx + 1}</span>
                            <span className="font-semibold text-slate-800">{chunk.sourceFile}</span>
                            {chunk.section && (
                              <span className="text-slate-400">· {chunk.section}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            <span>相似度: {((chunk.similarity || 0.95) * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {chunk.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                      点击“检索知识库”查看该知识库向量召回切片
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PERMISSIONS & COURSES */}
          {detailTab === 'permissions' && (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">已授权关联课程</h3>
                <p className="text-xs text-slate-500 mt-1">
                  以下课程在进行智能教案配置与 AI 课件生成时，已自动接入本知识库作为依据来源。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {['电气控制技术', '数控机床电气控制与PLC', '电机与拖动基础', '工业机器人电气控制系统装调'].map(
                  (course, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">{course}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                        已授权读取
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">全校知识库安全等级：校内教研专用（机密）</span>
                <button
                  onClick={() => alert('已将当前知识库最新切片同步至学校统一向量数据库。')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  重新同步全量索引
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Snippet Detail Modal */}
        {previewSnippet && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{previewSnippet.title}</h3>
                <button
                  onClick={() => setPreviewSnippet(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono leading-relaxed max-h-60 overflow-y-auto">
                {previewSnippet.content}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewSnippet(null)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
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
            <span>学校数字化资源平台</span>
            <span className="text-slate-400">/</span>
            <span>校级专业知识库管理</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-blue-600 stroke-[1.9]" />
                <span>校级知识库</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                收录国家标准规范、规划教材切片、车间工程案例与竞赛安全规范，支撑全校AI教案与课件生成
              </p>
            </div>

            {/* New KB Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>新建校级知识库</span>
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
                placeholder="搜索知识库名称、分类或检索关键词..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部分类</option>
                <option value="国家标准">国家标准</option>
                <option value="规划教材">规划教材</option>
                <option value="工程案例">工程案例</option>
                <option value="技能竞赛">技能竞赛</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 appearance-none focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全部状态</option>
                <option value="ready">已就绪</option>
                <option value="syncing">同步中</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0 self-end md:self-auto">
            <span>共 {filteredKbs.length} 个知识库</span>
          </div>
        </div>

        {/* Clean Cards Grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedKbs.map((kb) => (
            <div
              key={kb.id}
              onClick={() => handleOpenDetail(kb, 'files')}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                {/* Top Row: Category badge on left, status on right */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {renderCategoryBadge(kb.category)}
                  </div>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>已就绪</span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                  {kb.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {kb.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-medium">
                    {kb.vectorCount.toLocaleString()} 向量切片
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {kb.docCount || kb.files?.length || 3} 份文献
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{kb.updatedAt || '2026-11-08'}</span>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleOpenDetail(kb, 'search')}
                    className="px-2 py-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="检索测试"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>检索</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetail(kb, 'files')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
            显示第 <b className="text-slate-800">{filteredKbs.length === 0 ? 0 : startIndex + 1}</b> 至{' '}
            <b className="text-slate-800">{Math.min(startIndex + pageSize, filteredKbs.length)}</b> 条，共{' '}
            <b className="text-slate-800 font-mono">{filteredKbs.length}</b> 个知识库
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

      {/* Modal: Create Knowledge Base */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>新建校级知识库</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKb} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  知识库名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  placeholder="例如：《电气控制技术》车间真实排故案例库"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  分类标签
                </label>
                <select
                  value={newKbCategory}
                  onChange={(e) => setNewKbCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="国家标准">国家标准</option>
                  <option value="规划教材">规划教材</option>
                  <option value="工程案例">工程案例</option>
                  <option value="技能竞赛">技能竞赛</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  知识库定位说明
                </label>
                <textarea
                  rows={3}
                  value={newKbDesc}
                  onChange={(e) => setNewKbDesc(e.target.value)}
                  placeholder="说明收录的文献资料范围及面向的专业课程..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
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
