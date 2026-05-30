
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Clock, AlertCircle, ArrowRight, Building, Target, Sparkles, Send, FileText, Plus, X, Search, Activity, Network, Link2, Check, Cpu, Webhook } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { JobApplication as Job } from '../../types';
import { auth } from '../../services/firebase';

interface AutomationPanelProps {
  resumeData: any;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ resumeData }) => {
  const [autoJobs, setAutoJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState(94);
  const [activeRules, setActiveRules] = useState([
    { id: 1, name: 'Background Outreach Agent (Headless AI)', status: 'active', type: 'headless', lastRun: '2 hours ago', appliesCount: 14 },
    { id: 2, name: 'Save 90%+ Match Technical Roles', status: 'paused', type: 'routine', lastRun: '1 day ago', appliesCount: 0 },
    { id: 3, name: 'GitHub -> Resume Sync (MCP Agent)', status: 'active', type: 'mcp', lastRun: '15 mins ago', appliesCount: 3 }
  ]);

  const [mcpConnectors, setMcpConnectors] = useState([
    { id: 'github', name: 'GitHub MCP', status: 'connected', description: 'Real-time commit & skills sync' },
    { id: 'notion', name: 'Notion MCP', status: 'disconnected', description: 'Sync career docs & portfolios' },
    { id: 'linear', name: 'Linear MCP', status: 'disconnected', description: 'Extract project management skills' },
  ]);

  const [settings, setSettings] = useState([
    { id: 'tailor', label: 'Auto-Tailor Resume', desc: 'AI adjusts keywords for every job', active: true },
    { id: 'cover', label: 'Auto-Generate Cover Letter', desc: 'Creates targeted letters automatically', active: true },
    { id: 'headless', label: 'Headless Agent API', desc: 'Allow external scripts to trigger workflows', active: true },
    { id: 'track', label: 'Smart Tracking', desc: 'Adds applications to your board', active: true },
  ]);

  useEffect(() => {
    const loadJobs = async () => {
      let allJobs: Job[] = [];
      if (auth.currentUser) {
        allJobs = await jobService.getJobs();
      } else {
        const saved = localStorage.getItem('huntdesk_saved_jobs');
        if (saved) allJobs = JSON.parse(saved);
      }
      
      // Filter for jobs that were "Auto-Applied"
      const filtered = allJobs.filter(j => j.source === 'Auto-Apply' || j.notes?.includes('Automatically applied'));
      setAutoJobs(filtered);
      setLoading(false);
    };
    loadJobs();
  }, []);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditScore(98);
    }, 3000);
  };

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const stats = [
    { label: 'Total Auto-Applies', value: autoJobs.length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Tailored Resumes', value: autoJobs.length, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Cover Letters', value: autoJobs.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Success Rate', value: '100%', icon: CheckCircle2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Automation Rules & Activity Feed */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Rules Section - NEW FEATURE */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Automation Routines</h3>
                <p className="text-sm font-bold text-slate-400">Manage your active AI job seeking agents</p>
              </div>
              <button 
                onClick={() => setShowRuleModal(true)}
                className="w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {activeRules.map((rule) => (
                <div key={rule.id} className="group p-5 rounded-3xl border border-slate-100 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${rule.status === 'active' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400'}`}>
                      {rule.status === 'active' ? <Activity className="w-5 h-5 animate-pulse" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 truncate pr-4 flex items-center gap-2">
                        {rule.name}
                        {rule.type === 'headless' && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] uppercase tracking-widest rounded-md border border-indigo-100">Headless AI</span>}
                        {rule.type === 'mcp' && <span className="px-2 py-0.5 bg-violet-50 text-violet-600 text-[8px] uppercase tracking-widest rounded-md border border-violet-100">MCP Client</span>}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {rule.appliesCount} applies</span>
                        <span>•</span>
                        <span>Last run: {rule.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setActiveRules(rules => rules.map(r => r.id === rule.id ? {...r, status: r.status === 'active' ? 'paused' : 'active'} : r));
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        rule.status === 'active' 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                      }`}
                    >
                      {rule.status === 'active' ? 'Pause' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MCP Connectors Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-500" />
                  Model Context Protocol (MCP)
                </h3>
                <p className="text-sm font-bold text-slate-400 mt-1">Connect your workspace tools directly to your AI agents via standardized MCP.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mcpConnectors.map(connector => (
                <div key={connector.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       {connector.id === 'github' ? <Webhook className="w-5 h-5 text-slate-700" /> : <Link2 className="w-5 h-5 text-slate-400" />}
                       <h4 className="font-black text-slate-900">{connector.name}</h4>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mb-4">{connector.description}</p>
                  </div>
                  <button 
                    onClick={() => {
                       setMcpConnectors(cx => cx.map(c => c.id === connector.id ? {...c, status: c.status === 'connected' ? 'disconnected' : 'connected'} : c));
                    }}
                    className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${connector.status === 'connected' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {connector.status === 'connected' ? 'Connected' : 'Connect MCP'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity Feed</h3>
              <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : autoJobs.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                  <Zap className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">No auto-applications yet</h4>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
                  Create an automation routine above or use AI Auto-Apply in the Job Search tab.
                </p>
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                  Go to Job Search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {autoJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-400 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                        ) : (
                          <Building className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 truncate">{job.role}</h4>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">Applied</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{job.company} • {job.dateAdded}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600" title="Resume Tailored">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600" title="Cover Letter Generated">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600" title="Application Submitted">
                            <Send className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Insights */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Headless AI Status</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Optimization Score</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black tracking-tight">{isAuditing ? <span className="animate-pulse">--</span> : auditScore}</span>
                <span className="text-emerald-400 font-bold mb-1">/100</span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                {isAuditing 
                  ? 'Analyzing your profile matches, success rate, and active rules...'
                  : auditScore > 95 
                    ? 'Your AI profile is highly optimized. We\'ve identified 12 new roles that match your criteria perfectly.' 
                    : 'We found 3 suggestions to improve your auto-apply success rate.'}
              </p>
              <button 
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuditing ? 'Auditing...' : 'Run Full Audit'} <Target className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Automation Settings</h3>
            <div className="space-y-6">
              {settings.map(setting => (
                <div key={setting.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">{setting.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{setting.desc}</p>
                  </div>
                  <div 
                    onClick={() => toggleSetting(setting.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${setting.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${setting.active ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="bg-slate-900 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <h4 className="text-white font-black mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Chrome Extension
                  </h4>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                    Enable true 1-click auto-filling for Workday, Greenhouse, Lever, and 30+ other ATS portals.
                  </p>
                  <button className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                    Install Extension <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Rule Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowRuleModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Automation</h2>
                </div>
                <button onClick={() => setShowRuleModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Rule Name</label>
                  <input type="text" placeholder="e.g. Apply to Remote React Jobs" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Trigger Conditions</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer">
                      <option>Keyword Match</option>
                      <option>AI Match Score {'>'} 90%</option>
                      <option>Salary {'>'} $100k</option>
                    </select>
                    <input type="text" placeholder="Value" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Action Limit</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm appearance-none cursor-pointer">
                    <option>Max 5 applies / day</option>
                    <option>Max 10 applies / day</option>
                    <option>Max 20 applies / day</option>
                  </select>
                  <div className="mt-3 flex items-start gap-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-tight">Setting limits too high may cause employer systems to flag your applications as spam.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setActiveRules([...activeRules, { id: Date.now(), name: 'New Custom Rule', status: 'active', lastRun: 'Just now', appliesCount: 0 }]);
                      setShowRuleModal(false);
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Activate Routine <Zap className="w-4 h-4 fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutomationPanel;

