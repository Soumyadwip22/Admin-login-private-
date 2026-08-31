import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Trophy,
  Flame,
  CheckCircle,
  Eye,
  EyeOff,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Crown,
  Medal,
  Award,
  Zap,
  Sliders,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TournamentStandings,
  TeamMatchResult,
  Team,
  Tournament,
  MatchFixture
} from '../../types';
import { dbService, DEFAULT_PLACEMENT_POINTS } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface PointTableCalculatorProps {
  standings: TournamentStandings[];
  teams: Team[];
  matches: MatchFixture[];
  selectedTournamentId: string;
}

export const PointTableCalculator: React.FC<PointTableCalculatorProps> = ({
  standings,
  teams,
  matches,
  selectedTournamentId
}) => {
  const { user } = useAuth();

  // Active Standings Sheet
  const [activeGroup, setActiveGroup] = useState<string>('A');
  const [activeStage, setActiveStage] = useState<'overall' | 'group_stage' | 'finals'>('overall');

  // Match Results live calculator buffer
  const [resultsList, setResultsList] = useState<TeamMatchResult[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize or load standings for current group/stage
  useEffect(() => {
    const currentStandingsDoc = standings.find(
      s => s.tournamentId === selectedTournamentId && (s.group === activeGroup || s.stage === activeStage)
    );

    if (currentStandingsDoc && currentStandingsDoc.results.length > 0) {
      setResultsList(currentStandingsDoc.results);
      setIsPublished(currentStandingsDoc.isPublished);
    } else {
      // Auto-populate from qualified teams
      const groupTeams = teams.filter(t => t.group === activeGroup || activeGroup === 'All' || t.status === 'qualified');
      const initial: TeamMatchResult[] = (groupTeams.length ? groupTeams : teams.slice(0, 12)).map((t, idx) => {
        const placement = idx + 1;
        const placementPoints = DEFAULT_PLACEMENT_POINTS[placement] || 0;
        const kills = idx === 0 ? 12 : idx === 1 ? 8 : idx === 2 ? 6 : Math.max(0, 5 - idx);
        const killPoints = kills * 1;
        return {
          teamId: t.id,
          teamName: t.teamName,
          slotNumber: t.slotNumber || idx + 1,
          placement,
          placementPoints,
          kills,
          killPoints,
          totalPoints: placementPoints + killPoints,
          isBooyah: placement === 1
        };
      });

      // Sort by totalPoints desc, then kills desc, then placement asc
      initial.sort((a, b) => b.totalPoints - a.totalPoints || b.kills - a.kills || a.placement - b.placement);
      setResultsList(initial);
      setIsPublished(false);
    }
  }, [standings, selectedTournamentId, activeGroup, activeStage, teams]);

  // Recalculate row points whenever kills or placement changes
  const updateRow = (index: number, field: keyof TeamMatchResult, value: any) => {
    const updated = [...resultsList];
    const row = { ...updated[index] };

    if (field === 'placement') {
      const p = Number(value);
      row.placement = p;
      row.placementPoints = DEFAULT_PLACEMENT_POINTS[p] || 0;
      row.isBooyah = p === 1;
    } else if (field === 'kills') {
      const k = Math.max(0, Number(value));
      row.kills = k;
      row.killPoints = k * 1;
    } else if (field === 'placementPoints') {
      row.placementPoints = Number(value);
    } else if (field === 'isBooyah') {
      row.isBooyah = Boolean(value);
    }

    row.totalPoints = Number(row.placementPoints) + Number(row.killPoints);
    updated[index] = row;

    // Auto sort
    updated.sort((a, b) => b.totalPoints - a.totalPoints || b.kills - a.kills || a.placement - b.placement);
    setResultsList(updated);
  };

  // Add Team to table
  const addTeamRow = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || resultsList.some(r => r.teamId === teamId)) return;

    const nextPlacement = resultsList.length + 1;
    const pPoints = DEFAULT_PLACEMENT_POINTS[nextPlacement] || 0;
    const newRow: TeamMatchResult = {
      teamId: team.id,
      teamName: team.teamName,
      slotNumber: team.slotNumber || nextPlacement,
      placement: nextPlacement,
      placementPoints: pPoints,
      kills: 0,
      killPoints: 0,
      totalPoints: pPoints,
      isBooyah: nextPlacement === 1
    };

    const updated = [...resultsList, newRow].sort((a, b) => b.totalPoints - a.totalPoints || b.kills - a.kills);
    setResultsList(updated);
  };

  const removeRow = (index: number) => {
    const updated = resultsList.filter((_, i) => i !== index);
    setResultsList(updated);
  };

  // Save Table to Firestore
  const handleSaveStandings = async () => {
    setIsSaving(true);
    const standingsObj: TournamentStandings = {
      id: `standings-${selectedTournamentId}-${activeGroup.toLowerCase()}`,
      tournamentId: selectedTournamentId || 'ff-championship-s4',
      stage: activeStage,
      group: activeGroup,
      results: resultsList,
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString()
    };

    await dbService.saveStandings(standingsObj, user?.email || 'admin@ffesports.in');
    setIsSaving(false);
  };

  // One-click Publish Standings with Confetti
  const handlePublishStandings = async () => {
    const newPublishedState = !isPublished;
    setIsPublished(newPublishedState);

    const standingsObj: TournamentStandings = {
      id: `standings-${selectedTournamentId}-${activeGroup.toLowerCase()}`,
      tournamentId: selectedTournamentId || 'ff-championship-s4',
      stage: activeStage,
      group: activeGroup,
      results: resultsList,
      isPublished: newPublishedState,
      publishedAt: newPublishedState ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString()
    };

    await dbService.saveStandings(standingsObj, user?.email || 'admin@ffesports.in');

    if (newPublishedState) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  // Copy WhatsApp Broadcast format
  const copyBroadcastText = () => {
    let text = `🏆 *FREE FIRE ESPORTS OFFICIAL STANDINGS* 🏆\n⚔️ Group: ${activeGroup} | Format: Squad\n\n`;
    text += `*RANK | TEAM NAME | PLACEMENT PTS | KILLS | TOTAL PTS*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;

    resultsList.forEach((r, idx) => {
      const crown = idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : `#${idx + 1} `;
      const booyah = r.isBooyah ? ' [BOOYAH 👑]' : '';
      text += `${crown} *${r.teamName}*${booyah}\n   ➡️ Place: ${r.placementPoints} pts | Kills: ${r.kills} pts | *Total: ${r.totalPoints} PTS*\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━\n*OFFICIAL RESULT PUBLISHED BY TOURNAMENT ADMIN*`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Export CSV
  const exportStandingsCSV = () => {
    const rows = [
      ['Rank', 'Team Name', 'Slot #', 'Placement Finish', 'Placement Points', 'Kill Count', 'Kill Points', 'Total Score', 'Booyah']
    ];

    resultsList.forEach((r, idx) => {
      rows.push([
        `"${idx + 1}"`,
        `"${r.teamName}"`,
        `"${r.slotNumber}"`,
        `"${r.placement}"`,
        `"${r.placementPoints}"`,
        `"${r.kills}"`,
        `"${r.killPoints}"`,
        `"${r.totalPoints}"`,
        `"${r.isBooyah ? 'YES' : 'NO'}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FF_Esports_Standings_Group_${activeGroup}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls Bar */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF4D00]" />
              <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
                POINT TABLE & STANDINGS CALCULATOR
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Standard Free Fire Scoring Engine: 1st=12pts, 2nd=9pts, 3rd=8pts... + 1pt per kill. Instant ranking calculation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyBroadcastText}
              className="flex items-center gap-1.5 bg-[#1A1A24] hover:bg-[#222230] text-zinc-200 border border-zinc-700/80 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Copy formatted text for WhatsApp/Discord announcement"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-[#00FF66]" /> : <Share2 className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedSummary ? 'Copied Summary!' : 'Share Text'}</span>
            </button>

            <button
              onClick={exportStandingsCSV}
              className="flex items-center gap-1.5 bg-[#1A1A24] hover:bg-[#222230] text-zinc-200 border border-zinc-700/80 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Export Point Table to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleSaveStandings}
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>Save Table</span>
            </button>

            {/* One-Click Publish Standings */}
            <button
              onClick={handlePublishStandings}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                isPublished
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-600/20'
                  : 'bg-gradient-to-r from-[#00FF66] to-[#00CC52] text-black shadow-[#00FF66]/25 hover:scale-102'
              }`}
            >
              {isPublished ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Unpublish Standings</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Standings Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Group Selector & Stage Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-mono mr-1">Select Group:</span>
            {['A', 'B', 'C', 'Finals', 'All'].map((grp) => (
              <button
                key={grp}
                onClick={() => setActiveGroup(grp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeGroup === grp
                    ? 'bg-[#FF4D00] text-white shadow-md shadow-[#FF4D00]/25'
                    : 'bg-[#181820] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Group {grp}
              </button>
            ))}
          </div>

          {/* Published Status Pill */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 font-mono">Public Portal Visibility:</span>
            {isPublished ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                VISIBLE TO PUBLIC PLAYERS
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                DRAFT / HIDDEN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Esports Standard Rules Reference Banner */}
      <div className="bg-[#14141A] p-3.5 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Flame className="w-4 h-4 text-[#FF4D00]" />
          <span className="font-bold text-white font-mono">FF Scoring Matrix:</span>
          <span className="text-zinc-400">#1: <strong className="text-[#00FF66]">12pts</strong> | #2: 9pts | #3: 8pts | #4: 7pts | #5: 6pts | #6: 5pts | #7: 4pts | #8: 3pts | #9: 2pts | #10: 1pt | #11-12: 0pts | +1pt/Kill</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          Auto-Calculates Live
        </span>
      </div>

      {/* Standings Interactive Table */}
      <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181822] text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Team Name & Slot</th>
                <th className="py-3.5 px-3 text-center w-28">Finish Place</th>
                <th className="py-3.5 px-3 text-center w-28">Place Pts</th>
                <th className="py-3.5 px-3 text-center w-28">Kills Count</th>
                <th className="py-3.5 px-3 text-center w-28">Kill Pts</th>
                <th className="py-3.5 px-3 text-center w-28">Booyah 👑</th>
                <th className="py-3.5 px-4 text-center w-32 font-bold text-white">TOTAL PTS</th>
                <th className="py-3.5 px-3 text-right w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {resultsList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-zinc-400 text-xs">
                    No teams in point table. Click &ldquo;Add Team to Table&rdquo; below.
                  </td>
                </tr>
              ) : (
                resultsList.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={row.teamId}
                      className={`hover:bg-[#1A1A24] transition-colors ${
                        isTop1 ? 'bg-[#FF4D00]/5' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center">
                          {isTop1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 flex items-center justify-center text-xs shadow-sm">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 font-bold border border-slate-300/40 flex items-center justify-center text-xs">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 font-bold border border-amber-600/40 flex items-center justify-center text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">
                              #{rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team Name & Slot */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs font-sans flex items-center gap-2">
                          <span>{row.teamName}</span>
                          {row.isBooyah && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[9px] font-mono font-bold flex items-center gap-1">
                              👑 BOOYAH
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          Slot #{row.slotNumber}
                        </div>
                      </td>

                      {/* Placement Finish Input (1-12) */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={row.placement}
                          onChange={(e) => updateRow(idx, 'placement', e.target.value)}
                          className="bg-[#0E0E12] border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:border-[#FF4D00] outline-none cursor-pointer"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                            <option key={p} value={p}>
                              #{p} ({DEFAULT_PLACEMENT_POINTS[p] || 0} pts)
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Placement Points Display */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-bold text-[#00FF66]">
                          {row.placementPoints}
                        </span>
                      </td>

                      {/* Kills Input */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={row.kills}
                          onChange={(e) => updateRow(idx, 'kills', e.target.value)}
                          className="w-16 bg-[#0E0E12] border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:border-[#FF4D00] outline-none"
                        />
                      </td>

                      {/* Kill Points */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-bold text-amber-400">
                          {row.killPoints}
                        </span>
                      </td>

                      {/* Booyah Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.isBooyah}
                          onChange={(e) => updateRow(idx, 'isBooyah', e.target.checked)}
                          className="rounded bg-[#0E0E12] border-zinc-700 text-[#FF4D00] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Total Points */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-black text-white px-2 py-1 rounded-lg bg-[#1D1D28] border border-zinc-700/80 block font-mono">
                          {row.totalPoints} PTS
                        </span>
                      </td>

                      {/* Delete row */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => removeRow(idx)}
                          className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove team from standings table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add Team Dropdown Bar */}
        <div className="p-3.5 bg-[#181822] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-300 font-medium">Add Team to Point Table:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addTeamRow(e.target.value);
                  e.target.value = '';
                }
              }}
              className="bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:border-[#FF4D00] outline-none cursor-pointer"
            >
              <option value="">-- Choose Registered Squad --</option>
              {teams
                .filter(t => !resultsList.some(r => r.teamId === t.id))
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.teamName} (Group {t.group}, Slot #{t.slotNumber || 'Unassigned'})
                  </option>
                ))}
            </select>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Teams Ranked: <strong className="text-white">{resultsList.length}</strong> / 12
          </div>
        </div>
      </div>
    </div>
  );
};
