import React, { useState, useEffect } from 'react';
import {
  Settings,
  QrCode,
  IndianRupee,
  Shield,
  Phone,
  Mail,
  Save,
  Check,
  Activity,
  UserPlus,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { OrganizerSettings, AuditLog } from '../../types';
import { dbService } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface SettingsConfiguratorProps {
  settings: OrganizerSettings | null;
  auditLogs: AuditLog[];
}

export const SettingsConfigurator: React.FC<SettingsConfiguratorProps> = ({
  settings,
  auditLogs
}) => {
  const { user } = useAuth();

  const [upiId, setUpiId] = useState<string>(settings?.upiId || 'ffesports.org@oksbi');
  const [payeeName, setPayeeName] = useState<string>(settings?.payeeName || 'Free Fire Esports Org');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(settings?.qrCodeUrl || '');
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState<string>(settings?.whatsappSupportNumber || '+91 98765 43210');
  const [discordInviteUrl, setDiscordInviteUrl] = useState<string>(settings?.discordInviteUrl || 'https://discord.gg/ffesports');
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(
    settings?.authorizedAdminEmails || ['mondalsoumyadwip1110@gmail.com', 'admin@ffesports.in']
  );
  const [newEmail, setNewEmail] = useState<string>('');

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setUpiId(settings.upiId || 'ffesports.org@oksbi');
      setPayeeName(settings.payeeName || 'Free Fire Esports Org');
      setQrCodeUrl(settings.qrCodeUrl || '');
      setWhatsappSupportNumber(settings.whatsappSupportNumber || '+91 98765 43210');
      setDiscordInviteUrl(settings.discordInviteUrl || 'https://discord.gg/ffesports');
      setAuthorizedEmails(settings.authorizedAdminEmails || ['mondalsoumyadwip1110@gmail.com', 'admin@ffesports.in']);
    }
  }, [settings]);

  // Generate dynamic standard UPI QR code URL using quickchart / qrserver
  const generatedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR`
  )}`;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const newSettings: OrganizerSettings = {
      upiId,
      payeeName,
      qrCodeUrl: qrCodeUrl.trim() ? qrCodeUrl : generatedQrUrl,
      whatsappSupportNumber,
      discordInviteUrl,
      authorizedAdminEmails: authorizedEmails,
      updatedAt: new Date().toISOString()
    };

    await dbService.saveSettings(newSettings, user?.email || 'admin@ffesports.in');
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim() || authorizedEmails.includes(newEmail.trim().toLowerCase())) return;
    setAuthorizedEmails([...authorizedEmails, newEmail.trim().toLowerCase()]);
    setNewEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (emailToRemove === 'mondalsoumyadwip1110@gmail.com') {
      alert('Primary Super Admin email cannot be removed.');
      return;
    }
    setAuthorizedEmails(authorizedEmails.filter(e => e !== emailToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#14141A] p-4 md:p-6 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF4D00]" />
            <h2 className="text-lg md:text-xl font-bold text-white font-['Chakra_Petch'] tracking-wide">
              ORGANIZER CONFIGURATOR & AUDIT STATION
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure UPI payment handles, dynamic QR codes, support channels, and view tamper-evident admin activity audit logs.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 text-xs font-mono font-bold animate-pulse">
            <Check className="w-4 h-4" />
            <span>Settings Saved to Firestore!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: UPI & Payment Settings */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  UPI & Payment Receiver Setup
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Used for Player Checkout</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Organizer UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. organizer@oksbi"
                  required
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Payee / Merchant Name
                </label>
                <input
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Free Fire Tournament Org"
                  required
                  className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                />
              </div>
            </div>

            {/* Dynamic UPI QR Code Preview */}
            <div className="p-4 bg-[#0E0E14] rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center shadow-lg">
                <img
                  src={generatedQrUrl}
                  alt="Dynamic UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                  <QrCode className="w-3.5 h-3.5 text-[#00FF66]" /> Dynamic UPI QR Code Active
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Payload: upi://pay?pa={upiId}&pn={payeeName}
                </p>
                <p className="text-[10px] text-zinc-400">
                  Any BHIM, GPay, PhonePe, Paytm scanner auto-populates your verified merchant details.
                </p>
              </div>
            </div>

            {/* Support Channels */}
            <div className="pt-2 border-t border-zinc-800 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#FF4D00]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Player Support Channels
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    WhatsApp Support Helpline
                  </label>
                  <input
                    type="tel"
                    value={whatsappSupportNumber}
                    onChange={(e) => setWhatsappSupportNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Discord Community Server Link
                  </label>
                  <input
                    type="url"
                    value={discordInviteUrl}
                    onChange={(e) => setDiscordInviteUrl(e.target.value)}
                    placeholder="https://discord.gg/..."
                    className="w-full bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs text-white bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] font-semibold shadow-lg shadow-[#FF4D00]/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save All Configurations'}</span>
              </button>
            </div>
          </form>

          {/* Admin Email Whitelist Manager */}
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#FF4D00]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Authorized Admin Access Whitelist
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">RBAC Security</span>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="co-organizer@gmail.com"
                className="flex-1 bg-[#0E0E12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-[#FF4D00] outline-none"
              />
              <button
                type="button"
                onClick={handleAddEmail}
                className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Admin</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {authorizedEmails.map((email) => {
                const isPrimary = email === 'soumyadwipmondal869@gmail.com' || email === 'mondalsoumyadwip1110@gmail.com';
                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E0E12] border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-zinc-200 font-mono">{email}</span>
                      {isPrimary && (
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FF4D00]/20 text-[#FF4D00] border border-[#FF4D00]/30">
                          ORGANIZER
                        </span>
                      )}
                    </div>

                    {!isPrimary && (
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-zinc-400 hover:text-red-400 p-1 cursor-pointer"
                        title="Remove admin access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Reset & Purge Controls */}
          <div className="bg-[#14141A] rounded-2xl border border-red-950/40 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase">
                <Trash2 className="w-4 h-4" />
                <span>Database Wipe & Zero-State Tool</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Wipe all demo/stored tournaments, teams, matches, payments, and announcements to start with 100% empty lists.
            </p>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Are you sure you want to completely wipe all tournament, team, match, and payment lists to zero?')) {
                  await dbService.clearAllLists(user?.email || 'admin');
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors cursor-pointer"
            >
              Wipe All Lists to 0 (Fresh Start)
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Activity Audit Log Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#14141A] rounded-2xl border border-zinc-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Admin Activity Audit Trail
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF66] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-ping" /> Real-Time
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  No activity logs recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#0E0E14] border border-zinc-800/80 space-y-1.5 text-xs transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-white font-medium text-xs">
                      {log.details}
                    </div>

                    <div className="text-[10px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/60 flex items-center justify-between">
                      <span>Target: {log.target}</span>
                      <span className="text-zinc-400 truncate max-w-[140px]">{log.adminEmail}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
