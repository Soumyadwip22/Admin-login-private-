import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Eye,
  IndianRupee,
  Phone,
  ShieldCheck,
  FileImage,
  AlertTriangle,
  Send
} from 'lucide-react';
import { PaymentReceipt, PaymentStatus, Team, Tournament } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface PaymentVerificationPortalProps {
  payments: PaymentReceipt[];
  teams: Team[];
  tournaments: Tournament[];
  selectedTournamentId: string;
}

export const PaymentVerificationPortal: React.FC<PaymentVerificationPortalProps> = ({
  payments,
  teams,
  tournaments,
  selectedTournamentId
}) => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Rejection Note Modal
  const [rejectingPayment, setRejectingPayment] = useState<PaymentReceipt | null>(null);
  const [rejectionNote, setRejectionNote] = useState<string>('Invalid UTR / Transaction reference mismatch in bank statement.');

  // Screenshot Lightbox Modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (selectedTournamentId && p.tournamentId && p.tournamentId !== selectedTournamentId) {
        return false;
      }
      if (filterStatus !== 'all' && p.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          p.teamName.toLowerCase().includes(query) ||
          p.utrNumber.toLowerCase().includes(query) ||
          p.captainPhone.toLowerCase().includes(query) ||
          p.captainName.toLowerCase().includes(query) ||
          p.upiId.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [payments, selectedTournamentId, filterStatus, searchQuery]);

  const handleVerify = async (p: PaymentReceipt) => {
    await dbService.verifyPayment(
      p.id,
      'verified',
      'Verified by Tournament Admin - Payment Confirmed',
      user?.email || 'admin@ffesports.in'
    );
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    await dbService.verifyPayment(
      rejectingPayment.id,
      'rejected',
      rejectionNote,
      user?.email || 'admin@ffesports.in'
    );
    setRejectingPayment(null);
  };

  const copyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const totalAmountCollected = useMemo(() => {
    return payments.filter(p => p.status === 'verified').reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FF4D00]" />
              <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
                UPI PAYMENT & UTR VERIFICATION PORTAL
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Verify 12-digit UTR numbers, check payee screenshots, and auto-qualify squads upon approval.
            </p>
          </div>

          {/* Revenue Stat */}
          <div className="bg-[#181822] px-4 py-2.5 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00FF66]/10 text-[#00FF66]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-mono block">VERIFIED ENTRY FEES</span>
              <span className="text-base font-bold text-white font-mono">
                ₹{totalAmountCollected.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter / Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 12-digit UTR, Team Name, Captain Phone, or UPI ID..."
              className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-400 outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified & Approved</option>
              <option value="rejected">Rejected Receipts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Receipts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#14141A] rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
            No payment records found matching criteria.
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isVerified = p.status === 'verified';
            const isRejected = p.status === 'rejected';

            return (
              <div
                key={p.id}
                className={`bg-[#14141A] rounded-2xl border p-5 space-y-4 flex flex-col justify-between transition-all ${
                  isVerified
                    ? 'border-[#00FF66]/30 bg-[#141816]'
                    : isRejected
                    ? 'border-red-500/30 bg-[#181414]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top Status & Amount */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <span
                      className={`px-2.5 py-0.8 rounded-full text-[10px] font-mono font-bold ${
                        isVerified
                          ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                          : isRejected
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {p.status.toUpperCase()}
                    </span>

                    <span className="text-sm font-bold text-white font-mono flex items-center">
                      ₹{p.amount}
                    </span>
                  </div>

                  {/* Team & Captain Details */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate font-['Chakra_Petch']">
                        {p.teamName}
                      </h4>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Captain: <strong className="text-zinc-300">{p.captainName}</strong>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-zinc-400" /> {p.captainPhone}
                      </div>
                    </div>

                    {/* UTR & UPI Card */}
                    <div className="bg-[#0E0E14] p-3 rounded-xl border border-zinc-800 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">UTR / Ref No:</span>
                        <button
                          onClick={() => copyUtr(p.utrNumber)}
                          className="flex items-center gap-1 text-[10px] text-[#FF4D00] hover:underline"
                        >
                          {copiedUtr === p.utrNumber ? <Check className="w-2.5 h-2.5 text-[#00FF66]" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>{copiedUtr === p.utrNumber ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="text-xs font-bold text-[#00FF66] tracking-wider select-all">
                        {p.utrNumber}
                      </div>

                      <div className="pt-1 text-[10px] text-zinc-400 truncate">
                        From UPI: <span className="text-zinc-300">{p.upiId || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Screenshot Preview */}
                    {p.screenshotUrl && (
                      <button
                        onClick={() => setPreviewScreenshotUrl(p.screenshotUrl)}
                        className="w-full bg-[#181822] hover:bg-[#20202E] border border-zinc-800 rounded-xl p-2 flex items-center justify-center gap-2 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <FileImage className="w-3.5 h-3.5 text-[#FF4D00]" />
                        <span>View Payment Screenshot</span>
                      </button>
                    )}

                    {p.adminNote && (
                      <div className="text-[10px] text-zinc-400 bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                        <strong>Note:</strong> {p.adminNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-zinc-400 font-mono">
                    {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!isVerified && (
                      <button
                        onClick={() => handleVerify(p)}
                        className="flex items-center gap-1 bg-[#00FF66] hover:bg-[#00CC52] text-black font-bold px-3 py-1.5 rounded-xl text-[11px] shadow-sm shadow-[#00FF66]/20 transition-all cursor-pointer"
                        title="Approve Payment and Qualify Squad"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Verify & Approve</span>
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => {
                          setRejectingPayment(p);
                          setRejectionNote('Invalid UTR / Transaction reference mismatch in bank statement.');
                        }}
                        className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border border-red-500/30 transition-colors"
                        title="Reject receipt with custom note"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141A] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white font-['Chakra_Petch']">
                  REJECT PAYMENT RECEIPT
                </h3>
              </div>
              <button
                onClick={() => setRejectingPayment(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-zinc-300">
              Rejecting payment for team: <strong className="text-white">{rejectingPayment.teamName}</strong> (UTR: {rejectingPayment.utrNumber})
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason / Note for Captain</label>
              <textarea
                rows={3}
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-red-400 outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-xs text-white bg-red-600 hover:bg-red-700 font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div className="max-w-xl max-h-[85vh] bg-[#14141A] border border-zinc-800 rounded-2xl p-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-300">UPI Payment Screenshot Preview</span>
              <button onClick={() => setPreviewScreenshotUrl(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <img
              src={previewScreenshotUrl}
              alt="Payment screenshot"
              className="max-w-full max-h-[70vh] rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
