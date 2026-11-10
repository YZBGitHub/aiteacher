import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Power, Info } from 'lucide-react';

interface CircuitDiagramProps {
  editable?: boolean;
  onCaptionChange?: (newCaption: string) => void;
  caption?: string;
}

type CircuitState = 'stopped' | 'forward' | 'reverse' | 'interlock_protected' | 'short_fault';

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  editable = false,
  onCaptionChange,
  caption = '图1 三相异步电动机双重联锁正反转控制线路电气原理图（主电路与控制电路）',
}) => {
  const [circuitState, setCircuitState] = useState<CircuitState>('stopped');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const getStatusText = () => {
    switch (circuitState) {
      case 'stopped':
        return '系统处于待机停机状态：主回路断路器QF合闸，线圈均断电，电机静止。';
      case 'forward':
        return '正转运行中：KM1线圈得电自锁，KM1主触头接通相序(L1-U, L2-V, L3-W)，KM1辅助常闭触头切断KM2回路实现电气互锁。';
      case 'reverse':
        return '反转运行中：KM2线圈得电自锁，KM2主触头对调相序(L1-W, L2-V, L3-U)，KM2辅助常闭触头切断KM1回路实现电气互锁。';
      case 'interlock_protected':
        return '双重互锁安全保护触发：同时按下SB2与SB3时，复合按钮常闭触点先断开对应回路，两接触器无法同时吸合，有效杜绝相间短路！';
      case 'short_fault':
        return '【隐患警示模拟】：若无电气与机械互锁，两接触器若同时吸合，L1相与L3相将直接碰线短路，产生上千安培短路电弧爆炸！';
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
      {/* Schematic Action Toolbar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 tracking-wide">
            电气回路动作仿真：
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCircuitState('stopped')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                circuitState === 'stopped'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              停止 (SB1)
            </button>
            <button
              onClick={() => setCircuitState('forward')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                circuitState === 'forward'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              正转运行 (SB2)
            </button>
            <button
              onClick={() => setCircuitState('reverse')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                circuitState === 'reverse'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              反转运行 (SB3)
            </button>
            <button
              onClick={() => setCircuitState('interlock_protected')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                circuitState === 'interlock_protected'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              双重互锁动作
            </button>
            <button
              onClick={() => setCircuitState('short_fault')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                circuitState === 'short_fault'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              模拟短路隐患
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>点击原理图中元件符号可查看工程参数与选型依据</span>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      <div
        className={`px-4 py-2 text-xs flex items-center gap-2 transition-colors ${
          circuitState === 'stopped'
            ? 'bg-slate-100 text-slate-700'
            : circuitState === 'forward'
            ? 'bg-blue-50 text-blue-800'
            : circuitState === 'reverse'
            ? 'bg-indigo-50 text-indigo-800'
            : circuitState === 'interlock_protected'
            ? 'bg-emerald-50 text-emerald-800'
            : 'bg-amber-50 text-amber-900 font-medium'
        }`}
      >
        <span className="font-semibold">【当前回路状态】</span>
        <span>{getStatusText()}</span>
      </div>

      {/* SVG Canvas */}
      <div className="p-4 bg-slate-900 flex justify-center items-center overflow-x-auto">
        <svg
          viewBox="0 0 920 480"
          className="w-full max-w-4xl h-auto select-none font-mono"
          style={{ minWidth: '760px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="circuitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
            {/* Arrow marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>
          <rect width="920" height="480" fill="#0f172a" />
          <rect width="920" height="480" fill="url(#circuitGrid)" />

          {/* Area Separators: Main Circuit on Left, Control Circuit on Right */}
          <line x1="460" y1="20" x2="460" y2="450" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="230" y="32" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">
            主电路 (三相交流 380V)
          </text>
          <text x="690" y="32" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">
            控制电路 (单相控制 220V)
          </text>

          {/* === LEFT: MAIN CIRCUIT === */}
          {/* Power Incomers L1, L2, L3 */}
          <g>
            <text x="80" y="60" fill="#fbbf24" fontSize="12" fontWeight="bold">L1</text>
            <text x="160" y="60" fill="#34d399" fontSize="12" fontWeight="bold">L2</text>
            <text x="240" y="60" fill="#f87171" fontSize="12" fontWeight="bold">L3</text>
            
            {/* Power wires down to QF */}
            <line x1="85" y1="68" x2="85" y2="90" stroke="#fbbf24" strokeWidth="2" />
            <line x1="165" y1="68" x2="165" y2="90" stroke="#34d399" strokeWidth="2" />
            <line x1="245" y1="68" x2="245" y2="90" stroke="#f87171" strokeWidth="2" />
          </g>

          {/* QF Breaker */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('QF (低压断路器 DZ47-63 3P 16A)')}
          >
            <rect x="65" y="90" width="200" height="30" fill="#1e293b" stroke="#475569" rx="4" />
            <text x="165" y="110" textAnchor="middle" fill="#e2e8f0" fontSize="11">
              QF 低压断路器 (已闭合)
            </text>
          </g>

          {/* Down from QF to FU1 */}
          <line x1="85" y1="120" x2="85" y2="140" stroke="#94a3b8" strokeWidth="2" />
          <line x1="165" y1="120" x2="165" y2="140" stroke="#94a3b8" strokeWidth="2" />
          <line x1="245" y1="120" x2="245" y2="140" stroke="#94a3b8" strokeWidth="2" />

          {/* FU1 Fuses */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('FU1 (主回路熔断器 RL1-15 15A)')}
          >
            <rect x="75" y="140" width="20" height="24" fill="#334155" stroke="#64748b" rx="2" />
            <rect x="155" y="140" width="20" height="24" fill="#334155" stroke="#64748b" rx="2" />
            <rect x="235" y="140" width="20" height="24" fill="#334155" stroke="#64748b" rx="2" />
            <text x="275" y="156" fill="#94a3b8" fontSize="11">FU1</text>
          </g>

          {/* Branch Nodes to KM1 (Forward) and KM2 (Reverse) */}
          <g>
            <line x1="85" y1="164" x2="85" y2="185" stroke="#94a3b8" strokeWidth="2" />
            <line x1="165" y1="164" x2="165" y2="185" stroke="#94a3b8" strokeWidth="2" />
            <line x1="245" y1="164" x2="245" y2="185" stroke="#94a3b8" strokeWidth="2" />

            {/* Junction dots */}
            <circle cx="85" cy="185" r="3" fill="#38bdf8" />
            <circle cx="165" cy="185" r="3" fill="#38bdf8" />
            <circle cx="245" cy="185" r="3" fill="#38bdf8" />

            {/* Cross to KM2 */}
            <path
              d="M 85 185 L 320 185 L 320 205"
              fill="none"
              stroke={circuitState === 'reverse' ? '#a5b4fc' : '#64748b'}
              strokeWidth="2"
            />
            <path
              d="M 165 185 L 370 185 L 370 205"
              fill="none"
              stroke={circuitState === 'reverse' ? '#a5b4fc' : '#64748b'}
              strokeWidth="2"
            />
            <path
              d="M 245 185 L 420 185 L 420 205"
              fill="none"
              stroke={circuitState === 'reverse' ? '#a5b4fc' : '#64748b'}
              strokeWidth="2"
            />
          </g>

          {/* KM1 Main Contacts (Straight: L1-U, L2-V, L3-W) */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('KM1 (正转交流接触器 CJX2-1210)')}
          >
            <rect
              x="65"
              y="205"
              width="200"
              height="34"
              fill={circuitState === 'forward' ? '#1e3a8a' : '#1e293b'}
              stroke={circuitState === 'forward' ? '#3b82f6' : '#475569'}
              strokeWidth={circuitState === 'forward' ? 2 : 1}
              rx="4"
            />
            <text
              x="165"
              y="226"
              textAnchor="middle"
              fill={circuitState === 'forward' ? '#60a5fa' : '#94a3b8'}
              fontSize="11"
              fontWeight="bold"
            >
              KM1 主触头 {circuitState === 'forward' ? '【已闭合通电】' : '【分断】'}
            </text>
          </g>

          {/* KM2 Main Contacts (Reversed: L1->W, L2->V, L3->U) */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('KM2 (反转交流接触器 CJX2-1201)')}
          >
            <rect
              x="300"
              y="205"
              width="140"
              height="34"
              fill={circuitState === 'reverse' ? '#312e81' : '#1e293b'}
              stroke={circuitState === 'reverse' ? '#6366f1' : '#475569'}
              strokeWidth={circuitState === 'reverse' ? 2 : 1}
              rx="4"
            />
            <text
              x="370"
              y="226"
              textAnchor="middle"
              fill={circuitState === 'reverse' ? '#818cf8' : '#94a3b8'}
              fontSize="10"
              fontWeight="bold"
            >
              KM2 换相触头 {circuitState === 'reverse' ? '【闭合】' : '【分断】'}
            </text>
          </g>

          {/* Short Circuit Hazard indicator if stimulated */}
          {circuitState === 'short_fault' && (
            <g>
              <circle cx="340" cy="275" r="28" fill="#ef4444" opacity="0.3" />
              <path d="M 330 260 L 350 290 M 350 260 L 330 290" stroke="#f87171" strokeWidth="4" />
              <text x="340" y="315" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">
                ⚡ 相间直接短路！
              </text>
            </g>
          )}

          {/* Merge back to FR (Thermal Relay) */}
          <g>
            <line x1="85" y1="239" x2="85" y2="280" stroke={circuitState === 'forward' ? '#60a5fa' : '#94a3b8'} strokeWidth="2" />
            <line x1="165" y1="239" x2="165" y2="280" stroke={circuitState === 'forward' ? '#60a5fa' : '#94a3b8'} strokeWidth="2" />
            <line x1="245" y1="239" x2="245" y2="280" stroke={circuitState === 'forward' ? '#60a5fa' : '#94a3b8'} strokeWidth="2" />

            {/* Inverted lines from KM2 */}
            <path d="M 320 239 L 320 260 L 245 270" fill="none" stroke={circuitState === 'reverse' ? '#818cf8' : '#64748b'} strokeWidth="1.5" />
            <path d="M 370 239 L 370 265 L 165 270" fill="none" stroke={circuitState === 'reverse' ? '#818cf8' : '#64748b'} strokeWidth="1.5" />
            <path d="M 420 239 L 420 270 L 85 270" fill="none" stroke={circuitState === 'reverse' ? '#818cf8' : '#64748b'} strokeWidth="1.5" />
          </g>

          {/* FR Thermal Relay */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('FR (热继电器 JR16-20/3D 7-11A)')}
          >
            <rect x="65" y="280" width="200" height="30" fill="#1e293b" stroke="#475569" rx="4" />
            <text x="165" y="300" textAnchor="middle" fill="#cbd5e1" fontSize="11">
              FR 热继电器发热元件
            </text>
          </g>

          {/* From FR to Motor M 3~ */}
          <line x1="85" y1="310" x2="135" y2="360" stroke="#94a3b8" strokeWidth="2" />
          <line x1="165" y1="310" x2="165" y2="355" stroke="#94a3b8" strokeWidth="2" />
          <line x1="245" y1="310" x2="195" y2="360" stroke="#94a3b8" strokeWidth="2" />

          {/* Motor M 3~ */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('M (三相异步电动机 Y112M-4 4kW 380V)')}
          >
            <circle
              cx="165"
              cy="390"
              r="34"
              fill={
                circuitState === 'forward'
                  ? '#1d4ed8'
                  : circuitState === 'reverse'
                  ? '#4338ca'
                  : '#1e293b'
              }
              stroke={
                circuitState === 'forward'
                  ? '#60a5fa'
                  : circuitState === 'reverse'
                  ? '#818cf8'
                  : '#64748b'
              }
              strokeWidth="2.5"
            />
            <text x="165" y="390" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
              M
            </text>
            <text x="165" y="405" textAnchor="middle" fill="#93c5fd" fontSize="10">
              3~ 异步
            </text>
            {/* Rotation Arrow */}
            {circuitState === 'forward' && (
              <path
                d="M 140 370 A 25 25 0 0 1 190 370"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                markerEnd="url(#arrow)"
              />
            )}
            {circuitState === 'reverse' && (
              <path
                d="M 190 370 A 25 25 0 0 0 140 370"
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
                markerEnd="url(#arrow)"
              />
            )}
          </g>

          <text x="165" y="445" textAnchor="middle" fill="#94a3b8" fontSize="11">
            U - V - W 进线端
          </text>

          {/* === RIGHT: CONTROL CIRCUIT === */}
          {/* Control Power Lines: Top = L1/Live, Bottom = N/Neutral */}
          <line x1="500" y1="65" x2="880" y2="65" stroke="#fbbf24" strokeWidth="2" />
          <text x="480" y="70" fill="#fbbf24" fontSize="11" fontWeight="bold">L1</text>
          <text x="890" y="70" fill="#fbbf24" fontSize="11">FU2 (控制保险)</text>

          {/* FR normally closed contact */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('FR常闭触点 (过载断开控制回路)')}
          >
            <line x1="520" y1="65" x2="520" y2="95" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="500" y="95" width="40" height="24" fill="#1e293b" stroke="#64748b" rx="2" />
            <text x="520" y="111" textAnchor="middle" fill="#e2e8f0" fontSize="10">FR 95-96</text>
          </g>

          {/* SB1 Stop button */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedComponent('SB1 (红色常闭总停止按钮 LAY3-11)')}
          >
            <line x1="520" y1="119" x2="520" y2="145" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="495" y="145" width="50" height="24" fill="#7f1d1d" stroke="#ef4444" rx="2" />
            <text x="520" y="161" textAnchor="middle" fill="#fee2e2" fontSize="10">SB1 (停)</text>
          </g>

          {/* Bus splits into Forward branch (left) and Reverse branch (right) */}
          <line x1="520" y1="169" x2="520" y2="185" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="520" y1="185" x2="620" y2="185" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="620" y1="185" x2="780" y2="185" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="620" cy="185" r="3" fill="#38bdf8" />
          <circle cx="780" cy="185" r="3" fill="#38bdf8" />

          {/* Branch 1: Forward (KM1) Control Path */}
          {/* SB2 & KM1 Self-Holding (Parallel) */}
          <g>
            {/* SB2 Start Button */}
            <line x1="620" y1="185" x2="620" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="590"
              y="210"
              width="60"
              height="24"
              fill={circuitState === 'forward' ? '#14532d' : '#1e293b'}
              stroke="#22c55e"
              rx="2"
            />
            <text x="620" y="226" textAnchor="middle" fill="#dcfce7" fontSize="10">SB2 (正开)</text>

            {/* KM1-NO Self-Holding contact in parallel */}
            <path d="M 590 195 L 560 195 L 560 222 L 575 222" fill="none" stroke="#94a3b8" strokeWidth="1" />
            <rect
              x="535"
              y="210"
              width="45"
              height="24"
              fill={circuitState === 'forward' ? '#1e3a8a' : '#1e293b'}
              stroke="#3b82f6"
              rx="2"
            />
            <text x="557" y="226" textAnchor="middle" fill="#bfdbfe" fontSize="9">KM1 自锁</text>
            <path d="M 560 234 L 560 250 L 620 250" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Electrical Interlock: KM2-NC Contact (Must be closed for KM1 to energize) */}
          <g>
            <line x1="620" y1="234" x2="620" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="580"
              y="270"
              width="80"
              height="24"
              fill={circuitState === 'reverse' ? '#7f1d1d' : '#1e293b'}
              stroke={circuitState === 'reverse' ? '#ef4444' : '#64748b'}
              rx="2"
            />
            <text x="620" y="286" textAnchor="middle" fill="#e2e8f0" fontSize="10">
              KM2 常闭互锁
            </text>
          </g>

          {/* KM1 Coil */}
          <g>
            <line x1="620" y1="294" x2="620" y2="330" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="590"
              y="330"
              width="60"
              height="30"
              fill={circuitState === 'forward' ? '#2563eb' : '#1e293b'}
              stroke={circuitState === 'forward' ? '#60a5fa' : '#64748b'}
              strokeWidth={circuitState === 'forward' ? 2 : 1}
              rx="3"
            />
            <text x="620" y="350" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              KM1 线圈
            </text>
          </g>

          {/* Branch 2: Reverse (KM2) Control Path */}
          {/* SB3 & KM2 Self-Holding (Parallel) */}
          <g>
            <line x1="780" y1="185" x2="780" y2="210" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="750"
              y="210"
              width="60"
              height="24"
              fill={circuitState === 'reverse' ? '#312e81' : '#1e293b'}
              stroke="#6366f1"
              rx="2"
            />
            <text x="780" y="226" textAnchor="middle" fill="#ede9fe" fontSize="10">SB3 (反开)</text>

            {/* KM2-NO Self-Holding contact in parallel */}
            <path d="M 810 195 L 840 195 L 840 222 L 825 222" fill="none" stroke="#94a3b8" strokeWidth="1" />
            <rect
              x="825"
              y="210"
              width="45"
              height="24"
              fill={circuitState === 'reverse' ? '#312e81' : '#1e293b'}
              stroke="#6366f1"
              rx="2"
            />
            <text x="847" y="226" textAnchor="middle" fill="#ddd6fe" fontSize="9">KM2 自锁</text>
            <path d="M 840 234 L 840 250 L 780 250" fill="none" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Electrical Interlock: KM1-NC Contact (Must be closed for KM2 to energize) */}
          <g>
            <line x1="780" y1="234" x2="780" y2="270" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="740"
              y="270"
              width="80"
              height="24"
              fill={circuitState === 'forward' ? '#7f1d1d' : '#1e293b'}
              stroke={circuitState === 'forward' ? '#ef4444' : '#64748b'}
              rx="2"
            />
            <text x="780" y="286" textAnchor="middle" fill="#e2e8f0" fontSize="10">
              KM1 常闭互锁
            </text>
          </g>

          {/* KM2 Coil */}
          <g>
            <line x1="780" y1="294" x2="780" y2="330" stroke="#94a3b8" strokeWidth="1.5" />
            <rect
              x="750"
              y="330"
              width="60"
              height="30"
              fill={circuitState === 'reverse' ? '#4f46e5' : '#1e293b'}
              stroke={circuitState === 'reverse' ? '#818cf8' : '#64748b'}
              strokeWidth={circuitState === 'reverse' ? 2 : 1}
              rx="3"
            />
            <text x="780" y="350" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              KM2 线圈
            </text>
          </g>

          {/* Neutral Wire (N) at bottom */}
          <line x1="500" y1="410" x2="880" y2="410" stroke="#38bdf8" strokeWidth="2" />
          <text x="480" y="415" fill="#38bdf8" fontSize="11" fontWeight="bold">N</text>
          <text x="890" y="415" fill="#38bdf8" fontSize="11">零线回路</text>

          {/* Connect Coils to Neutral */}
          <line x1="620" y1="360" x2="620" y2="410" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="620" cy="410" r="3" fill="#38bdf8" />
          <line x1="780" y1="360" x2="780" y2="410" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="780" cy="410" r="3" fill="#38bdf8" />
        </svg>
      </div>

      {/* Component Details Card on Click */}
      {selectedComponent && (
        <div className="px-4 py-2.5 bg-blue-50/70 border-t border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div>
            <span className="font-semibold">元件参数详情：</span>
            <span>{selectedComponent}</span>
          </div>
          <button
            onClick={() => setSelectedComponent(null)}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            关闭详情
          </button>
        </div>
      )}

      {/* Editable / Display Caption */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
        {editable ? (
          <input
            type="text"
            value={caption}
            onChange={(e) => onCaptionChange?.(e.target.value)}
            className="w-full text-center text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          />
        ) : (
          <p className="text-xs font-medium text-slate-600 tracking-wide">{caption}</p>
        )}
      </div>
    </div>
  );
};
