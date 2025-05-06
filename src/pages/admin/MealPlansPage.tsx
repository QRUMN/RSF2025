import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import MealPlanBuilder from '../../components/admin/MealPlanBuilder';
import ClientSearch from '../../components/admin/ClientSearch';
import { Utensils, AlertCircle } from 'lucide-react';

// Placeholder meal plans data
const initialMealPlans = [
  {
    id: '1',
    name: 'Spring Shred 90',
    client: 'Ape Jawn',
    status: 'Active',
    date: '2025-05-01',
  },
  {
    id: '2',
    name: 'Muscle Gain 90',
    client: 'Jane Smith',
    status: 'Draft',
    date: '2025-04-28',
  },
  {
    id: '3',
    name: 'Lean Bulk',
    client: 'Ape Jawn',
    status: 'Archived',
    date: '2025-03-15',
  },
  {
    id: '4',
    name: 'Vegan Power',
    client: 'John Doe',
    status: 'Active',
    date: '2025-05-02',
  },
];

const MealPlansPage: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; age?: number; goals?: string[]; dietaryPrefs?: string[] } | null>(null);
  const [mealPlans, setMealPlans] = useState(initialMealPlans);
  const [statusChanged, setStatusChanged] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId?: string }>({ open: false });
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; plan?: typeof mealPlans[0] }>({ open: false });

  // Reminders system
  const [remindDialog, setRemindDialog] = useState<{ open: boolean; plan?: typeof mealPlans[0] }>({ open: false });
  const [planReminders, setPlanReminders] = useState<{ [planId: string]: { id: string; date: string; message: string }[] }>({});
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [remindDate, setRemindDate] = useState('');
  const [remindMsg, setRemindMsg] = useState('');

  // Fetch reminders from Supabase on mount
  useEffect(() => {
    const fetchReminders = async () => {
      setRemindersLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*');
      if (!error && data) {
        // Group reminders by meal_plan_id
        const grouped: { [planId: string]: { id: string; date: string; message: string }[] } = {};
        data.forEach((rem: any) => {
          if (!grouped[rem.meal_plan_id]) grouped[rem.meal_plan_id] = [];
          grouped[rem.meal_plan_id].push({
            id: rem.id,
            date: rem.remind_at,
            message: rem.message,
          });
        });
        setPlanReminders(grouped);
      }
      setRemindersLoading(false);
    };
    fetchReminders();
  }, []);

  // Browser Notification Logic
  useEffect(() => {
    // Request notification permission
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Track notified reminders to avoid duplicate notifications
  const notifiedRemindersRef = React.useRef<Set<string>>(new Set());

  // Check for due reminders every minute
  useEffect(() => {
    if (!window.Notification || Notification.permission !== 'granted') return;
    const interval = setInterval(() => {
      const now = new Date();
      const soon = new Date(now.getTime() + 5 * 60 * 1000); // next 5 min
      Object.entries(planReminders).forEach(([planId, reminders]) => {
        reminders.forEach(rem => {
          const remDate = new Date(rem.date);
          if (
            remDate > now &&
            remDate <= soon &&
            !notifiedRemindersRef.current.has(rem.id)
          ) {
            // Show notification
            new Notification('Meal Plan Reminder', {
              body: rem.message + ' (' + remDate.toLocaleString() + ')',
              tag: rem.id,
            });
            notifiedRemindersRef.current.add(rem.id);
          }
        });
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [planReminders]);

  const openRemindDialog = (plan: typeof mealPlans[0]) => {
    setRemindDialog({ open: true, plan });
    setRemindDate('');
    setRemindMsg('');
  };
  const closeRemindDialog = () => setRemindDialog({ open: false });
  // Add reminder to Supabase
  const handleAddReminder = async () => {
    if (!remindDialog.plan || !remindDate || !remindMsg.trim()) return;
    const planId = remindDialog.plan.id;
    // TODO: Replace with actual user_id in production
    const userId = '00000000-0000-0000-0000-000000000000';
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          user_id: userId,
          meal_plan_id: planId,
          message: remindMsg.trim(),
          remind_at: remindDate,
        },
      ])
      .select('*')
      .single();
    if (!error && data) {
      setPlanReminders(prev => ({
        ...prev,
        [planId]: prev[planId]
          ? [{ id: data.id, date: data.remind_at, message: data.message }, ...prev[planId]]
          : [{ id: data.id, date: data.remind_at, message: data.message }],
      }));
    }
    setRemindDate('');
    setRemindMsg('');
    setRemindDialog({ open: false });
  };
  // Delete reminder from Supabase
  const handleClearReminder = async (planId: string, idx: number) => {
    const reminder = planReminders[planId][idx];
    if (!reminder) return;
    await supabase.from('reminders').delete().eq('id', reminder.id);
    setPlanReminders(prev => ({
      ...prev,
      [planId]: prev[planId].filter((_, i) => i !== idx),
    }));
  };

  // Notes/Comments system
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; plan?: typeof mealPlans[0] }>({ open: false });
  const [planNotes, setPlanNotes] = useState<{ [planId: string]: { text: string; date: string }[] }>({});
  const [newNote, setNewNote] = useState('');

  const openNotesDialog = (plan: typeof mealPlans[0]) => {
    setNotesDialog({ open: true, plan });
    setNewNote('');
  };
  const closeNotesDialog = () => setNotesDialog({ open: false });
  const handleAddNote = () => {
    if (!notesDialog.plan || !newNote.trim()) return;
    const planId = notesDialog.plan.id;
    const note = { text: newNote.trim(), date: new Date().toLocaleString() };
    setPlanNotes(prev => ({
      ...prev,
      [planId]: prev[planId] ? [note, ...prev[planId]] : [note],
    }));
    setNewNote('');
  };

  // Duplicate plan
  const handleDuplicate = (plan: typeof mealPlans[0]) => {
    const newPlan = {
      ...plan,
      id: Math.random().toString(36).slice(2),
      name: plan.name + ' (Copy)',
      date: new Date().toISOString().slice(0, 10),
      status: 'Draft',
    };
    setMealPlans([newPlan, ...mealPlans]);
  };

  // Delete plan dialog
  const openDeleteDialog = (plan: typeof mealPlans[0]) => {
    setDeleteDialog({ open: true, planId: plan.id });
  };
  const confirmDelete = () => {
    if (deleteDialog.planId) {
      setMealPlans(mealPlans.filter(p => p.id !== deleteDialog.planId));
    }
    setDeleteDialog({ open: false });
  };
  const cancelDelete = () => setDeleteDialog({ open: false });

  // Plan history dialog
  const openHistoryDialog = (plan: typeof mealPlans[0]) => {
    setHistoryDialog({ open: true, plan });
  };
  const closeHistoryDialog = () => setHistoryDialog({ open: false });

  const filteredPlans = mealPlans
    .filter((plan: typeof mealPlans[0]) => {
      const matchesClient = selectedClient ? plan.client === selectedClient.name : true;
      return matchesClient;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Gather all upcoming reminders
  const today = new Date().toISOString().slice(0, 10);
  const upcomingReminders = Object.entries(planReminders)
    .flatMap(([planId, reminders]) => {
      const remindersWithPlanName = reminders.map(rem => ({ ...rem, planId, planName: mealPlans.find(p => p.id === planId)?.name || '' }));
      return remindersWithPlanName;
    })
    .filter(rem => rem.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const remindersDueToday = upcomingReminders.filter(rem => rem.date === today);

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 md:p-10">
      {/* Notification banner for reminders due today */}
      {remindersDueToday.length > 0 && (
        <div className="mb-4 p-4 bg-cyan-700/20 border-l-4 border-cyan-400 text-cyan-200 rounded">
          <strong>Reminders for Today:</strong>
          <ul className="mt-2 list-disc ml-6">
            {remindersDueToday.map((rem, idx) => (
              <li key={idx}>
                <span className="font-semibold">{rem.planName}:</span> {rem.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Upcoming reminders */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <div className="text-cyan-300 font-semibold mb-2">Upcoming Reminders</div>
          <div className="rounded bg-dark border border-cyan-800 p-4">
            <ul>
              {upcomingReminders.map((rem, idx) => (
                <li key={idx} className="mb-2 flex items-center gap-3">
                  <span className="text-cyan-400">{rem.date}</span>
                  <span className="font-semibold text-cyan-200">{rem.planName}:</span>
                  <span>{rem.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* --- WIDGETS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Meal Plan Stats Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col items-center shadow">
          <div className="text-primary font-bold text-lg mb-2">Meal Plan Stats</div>
          <div className="flex gap-4 w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-green-400 text-2xl font-bold">{mealPlans.filter(p => p.status === 'Active').length}</span>
              <span className="text-xs text-light/60">Active</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-yellow-300 text-2xl font-bold">{mealPlans.filter(p => p.status === 'Draft').length}</span>
              <span className="text-xs text-light/60">Draft</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-300 text-2xl font-bold">{mealPlans.filter(p => p.status === 'Archived').length}</span>
              <span className="text-xs text-light/60">Archived</span>
            </div>
          </div>
        </div>
        {/* Recent Meal Plans Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col shadow">
          <div className="text-primary font-bold text-lg mb-2">Recent Meal Plans</div>
          <ul className="text-light/90 text-sm space-y-1">
            {mealPlans.slice(0, 5).map(plan => (
              <li key={plan.id} className="flex justify-between items-center">
                <span>{plan.name}</span>
                <span className="text-xs text-light/50">{plan.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Quick Actions Widget */}
        <div className="bg-dark/80 border border-primary/20 rounded-xl p-5 flex flex-col items-center shadow">
          <div className="text-primary font-bold text-lg mb-2">Quick Actions</div>
          <button
            className="w-full bg-primary text-dark font-semibold rounded-lg py-2 mb-2 hover:bg-primary/90 transition"
            onClick={() => setShowBuilder(true)}
          >
            + Create New Meal Plan
          </button>
          <button
            className="w-full border border-primary text-primary font-semibold rounded-lg py-2 hover:bg-primary/10 transition"
            onClick={() => setDropdownOpen('templates')}
          >
            View Templates
          </button>
        </div>
      </div>
      {/* --- Compact Upcoming Reminders Widget --- */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <div className="text-cyan-300 font-semibold mb-2">Upcoming Reminders</div>
          <div className="rounded bg-dark border border-cyan-800 p-4 overflow-x-auto">
            <ul className="flex flex-wrap gap-4">
              {upcomingReminders.slice(0, 6).map((rem, idx) => (
                <li key={idx} className="flex flex-col items-start gap-1 min-w-[120px]">
                  <span className="text-cyan-400 text-xs">{rem.date}</span>
                  <span className="font-semibold text-cyan-200 text-xs">{rem.planName}</span>
                  <span className="text-light/80 text-xs">{rem.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* --- END WIDGETS ROW --- */}
      <ClientSearch
        onSelect={client => {
          if (!client) return setSelectedClient(null);
          setSelectedClient({
            ...client,
            age: 28,
            goals: ['Weight Loss', 'Muscle Gain'],
            dietaryPrefs: ['Vegetarian', 'No Restrictions'],
          });
        }}
        selectedClient={selectedClient}
      />
      {!selectedClient ? (
        <div className="flex flex-col items-center justify-center text-light/50 py-16">
          <Utensils className="w-12 h-12 mb-2 opacity-20" />
          <div className="mt-2">Select a client to view or edit their meal plan.</div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-light/50 py-16">
          <Utensils className="w-12 h-12 mb-2 opacity-20" />
          <div className="mt-2">No meal plans found for this client.</div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto mt-8">
          <h1 className="text-3xl font-bold text-primary mb-6 tracking-tight">Meal Plans</h1>
          <div className="overflow-x-auto rounded-2xl shadow-xl bg-dark/90 border border-primary/20 p-4">
            <table className="min-w-full divide-y divide-primary/10">
              <thead className="bg-dark/90">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary tracking-wider uppercase">Plan Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary tracking-wider uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary tracking-wider uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary tracking-wider uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-primary tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredPlans.map((plan, idx) => (
                  <tr key={plan.id} className={`transition ${idx % 2 === 0 ? 'bg-dark/80' : 'bg-dark/60'} hover:bg-primary/10 ${planReminders[plan.id]?.some(rem => new Date(rem.date) <= new Date() && new Date(rem.date).toISOString().slice(0, 10) === today) ? 'ring-2 ring-cyan-400/70' : ''}`}>
                    <td className="px-4 py-2 whitespace-nowrap text-light font-medium flex items-center gap-2">
                      {plan.name}
                      {planReminders[plan.id]?.length > 0 && (
                        <span title="Reminders" className="ml-1 flex items-center text-cyan-300 text-xs">
                          <AlertCircle className="w-4 h-4 mr-0.5" />{planReminders[plan.id].length}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-light/70 text-sm">{plan.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-light/80 text-sm">{plan.client}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${plan.status === 'Active' ? 'bg-green-700/30 text-green-300' : plan.status === 'Draft' ? 'bg-yellow-700/30 text-yellow-200' : 'bg-gray-700/30 text-gray-300'}`}>{plan.status}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap min-w-[60px]">
                      {/* Minimal More Actions Dropdown */}
                      <div className="relative">
                        <button
                          className="rounded p-1 hover:bg-primary/10 focus:bg-primary/20 transition"
                          aria-label="More actions"
                          onClick={e => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === plan.id ? null : plan.id);
                          }}
                        >
                          <span className="text-xl">⋮</span>
                        </button>
                        {dropdownOpen === plan.id && (
                          <div className="absolute right-0 mt-2 z-30 min-w-[170px] rounded-lg border border-primary/30 bg-dark/95 shadow-xl backdrop-blur-sm">
                            <button
                              onClick={() => { setShowBuilder(true); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-light/90 hover:bg-primary/10 transition text-sm rounded-t-lg"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></span> View/Edit
                            </button>
                            <button
                              onClick={() => { handleDuplicate(plan); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-light/90 hover:bg-primary/10 transition text-sm"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg></span> Duplicate
                            </button>
                            <button
                              onClick={() => { openRemindDialog(plan); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-cyan-300 hover:bg-cyan-800/20 transition text-sm"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span> Remind
                            </button>
                            <button
                              onClick={() => { openNotesDialog(plan); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-purple-300 hover:bg-purple-800/20 transition text-sm"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/><path d="M3 7h18"/><path d="M7 3v2"/><path d="M17 3v2"/></svg></span> Notes
                            </button>
                            <button
                              onClick={() => { openHistoryDialog(plan); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-gray-300 hover:bg-gray-800/20 transition text-sm"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span> History
                            </button>
                            <div className="border-t border-primary/20 my-1" />
                            <button
                              onClick={() => { openDeleteDialog(plan); setDropdownOpen(null); }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-red-300 hover:bg-red-800/20 transition text-sm rounded-b-lg"
                            >
                              <span className="w-4 h-4"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6"/><path d="M19 6l-1-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2l-1 2"/></svg></span> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    {showBuilder && (
      <MealPlanBuilder client={selectedClient || { id: '', name: '' }} onClose={() => setShowBuilder(false)} />
    )}
    {deleteDialog.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-dark rounded-lg p-8 shadow-lg border border-red-700 flex flex-col items-center">
          <div className="text-lg font-bold text-red-400 mb-4">Delete Meal Plan?</div>
          <div className="mb-6 text-light/80">Are you sure you want to delete this meal plan? This action cannot be undone.</div>
          <div className="flex gap-4">
            <button
              className="px-6 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-800 transition"
              onClick={confirmDelete}
            >
              Delete
            </button>
            <button
              className="px-6 py-2 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
              onClick={cancelDelete}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Plan History Modal */}
    {historyDialog.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-dark rounded-lg p-8 shadow-lg border border-gray-700 flex flex-col items-center min-w-[340px]">
          <div className="text-lg font-bold text-gray-200 mb-4">Plan History</div>
          <div className="mb-2 text-primary font-semibold">{historyDialog.plan?.name}</div>
          <div className="mb-6 text-light/80">No previous versions yet.</div>
          <button
            className="px-6 py-2 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
            onClick={closeHistoryDialog}
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Notes/Comments Modal */}
    {notesDialog.open && notesDialog.plan && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-dark rounded-lg p-8 shadow-lg border border-purple-700 flex flex-col items-center min-w-[340px] max-w-md w-full">
          <div className="text-lg font-bold text-purple-200 mb-4">Notes for {notesDialog.plan.name}</div>
          <div className="w-full mb-4">
            <textarea
              className="w-full rounded bg-dark border border-primary/20 text-light p-3 mb-2 resize-none"
              rows={3}
              placeholder="Add a note or comment..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
            />
            <button
              className="w-full px-4 py-2 rounded bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
            >
              Add Note
            </button>
          </div>
          <div className="w-full max-h-48 overflow-y-auto mb-4">
            {(planNotes[notesDialog.plan.id]?.length ?? 0) === 0 ? (
              <div className="text-light/60 text-sm text-center">No notes yet.</div>
            ) : (
              planNotes[notesDialog.plan.id].map((note, idx) => (
                <div key={idx} className="border-b border-primary/10 py-2">
                  <div className="text-light/90 text-sm">
                    {note.text.split(/(\s+)/).map((part, i) =>
                      part.match(/^@\w+$/) ? (
                        <span key={i} className="text-primary font-semibold">{part}</span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                  <div className="text-xs text-light/50 mt-1">{note.date}</div>
                </div>
              ))
            )}
          </div>
          <button
            className="px-6 py-2 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
            onClick={closeNotesDialog}
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Reminders Modal */}
    {remindDialog.open && remindDialog.plan && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-dark rounded-lg p-8 shadow-lg border border-cyan-700 flex flex-col items-center min-w-[340px] max-w-md w-full">
          <div className="text-lg font-bold text-cyan-200 mb-4">Reminders for {remindDialog.plan.name}</div>
          <div className="w-full mb-4 flex flex-col gap-2">
            <input
              type="date"
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              value={remindDate}
              onChange={e => setRemindDate(e.target.value)}
            />
            <input
              type="text"
              className="w-full rounded bg-dark border border-primary/20 text-light p-2"
              placeholder="Reminder message..."
              value={remindMsg}
              onChange={e => setRemindMsg(e.target.value)}
            />
            <button
              className="w-full px-4 py-2 rounded bg-cyan-700 text-white font-semibold hover:bg-cyan-800 transition"
              onClick={handleAddReminder}
              disabled={!remindDate || !remindMsg.trim()}
            >
              Add Reminder
            </button>
          </div>
          <div className="w-full max-h-40 overflow-y-auto mb-4">
            {(planReminders[remindDialog.plan.id]?.length ?? 0) === 0 ? (
              <div className="text-light/60 text-sm text-center">No reminders set.</div>
            ) : (
              planReminders[remindDialog.plan.id].map((reminder, idx) => (
                <div key={idx} className="border-b border-primary/10 py-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-light/90 text-sm">{reminder.message}</div>
                    <div className="text-xs text-light/50 mt-1">{reminder.date}</div>
                  </div>
                  <button
                    className="ml-2 text-xs text-cyan-400 hover:text-cyan-200"
                    onClick={() => handleClearReminder(remindDialog.plan!.id, idx)}
                  >
                    Clear
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            className="px-6 py-2 rounded bg-primary/20 text-primary font-semibold hover:bg-primary/40 transition"
            onClick={closeRemindDialog}
          >
            Close
          </button>
        </div>
      </div>
    )}

</>
 );
 };

 export default MealPlansPage;