import { useState } from 'react';

export default function PokerCalculator() {
  const [players, setPlayers] = useState([
    { id: 1, name: '', buyIn: '', cashOut: '' }
  ]);
  const [transfers, setTransfers] = useState([]);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers([...players, { id: newId, name: '', buyIn: '', cashOut: '' }]);
  };

  const removePlayer = (id) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
    setShowResults(false);
  };

  const calculateTransfers = () => {
    setError('');
    setTransfers([]);
    setShowResults(false);

    const validPlayers = players.filter(p => p.name.trim() !== '');
    
    if (validPlayers.length < 2) {
      setError('נדרשים לפחות 2 שחקנים');
      return;
    }

    for (const p of validPlayers) {
      if (p.buyIn === '' || p.cashOut === '') {
        setError(`יש למלא את כל הסכומים עבור ${p.name}`);
        return;
      }
    }

    const balances = validPlayers.map(p => ({
      name: p.name.trim(),
      balance: parseFloat(p.cashOut) - parseFloat(p.buyIn)
    }));

    const totalBalance = balances.reduce((sum, p) => sum + p.balance, 0);
    if (Math.abs(totalBalance) > 0.01) {
      setError(`שימו לב: הסכומים לא מתאזנים (${totalBalance > 0 ? '+' : ''}${totalBalance.toFixed(2)}₪)`);
    }

    let debtors = balances.filter(p => p.balance < -0.01).map(p => ({ ...p, balance: -p.balance }));
    let creditors = balances.filter(p => p.balance > 0.01).map(p => ({ ...p }));

    debtors.sort((a, b) => b.balance - a.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    const result = [];
    
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const amount = Math.min(debtor.balance, creditor.balance);
      
      if (amount > 0.01) {
        result.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount
        });
      }
      
      debtor.balance -= amount;
      creditor.balance -= amount;
      
      if (debtor.balance < 0.01) debtors.shift();
      if (creditor.balance < 0.01) creditors.shift();
    }

    setTransfers(result);
    setShowResults(true);
  };

  const getProfit = (player) => {
    if (player.buyIn === '' || player.cashOut === '') return null;
    return parseFloat(player.cashOut) - parseFloat(player.buyIn);
  };

  const getTotals = () => {
    const validPlayers = players.filter(p => p.name.trim() !== '');
    const totalBuyIn = players.reduce((sum, p) => sum + (parseFloat(p.buyIn) || 0), 0);
    const totalCashOut = players.reduce((sum, p) => sum + (parseFloat(p.cashOut) || 0), 0);
    const totalPL = totalCashOut - totalBuyIn;
    return { count: validPlayers.length, buyIn: totalBuyIn, cashOut: totalCashOut, pl: totalPL };
  };

  const reset = () => {
    setPlayers([
      { id: 1, name: '', buyIn: '', cashOut: '' }
    ]);
    setTransfers([]);
    setError('');
    setShowResults(false);
  };

  const generateShareText = () => {
    if (transfers.length === 0) return '';
    
    let text = 'סיכום ערב פוקר\n\n';
    transfers.forEach((t, i) => {
      text += `${t.from} משלם ל${t.to} ₪${t.amount.toFixed(0)}\n`;
    });
    text += `\nסה״כ ${transfers.length} העברות`;
    return text;
  };

  const shareWhatsApp = () => {
    const text = generateShareText();
    window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    setShowShareMenu(false);
  };

  const shareEmail = () => {
    const text = generateShareText();
    const subject = 'סיכום ערב פוקר 🃏';
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareTelegram = () => {
    const text = generateShareText();
    window.location.href = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      alert('הועתק ללוח!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setShowShareMenu(false);
  };

  const nativeShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'סיכום ערב פוקר',
          text: text
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
    setShowShareMenu(false);
  };

  const totals = getTotals();

  const Logo = () => (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-emerald-500/30 rounded-3xl blur-2xl"></div>
      
      {/* Main container */}
      <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-3xl border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-amber-500/10"></div>
        
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Felt texture background */}
          <defs>
            <radialGradient id="feltGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#feltGlow)"/>
          
          {/* Four suit symbols in corners - diamond pattern */}
          <text x="20" y="25" fontSize="14" fill="#ef4444" opacity="0.6">♦</text>
          <text x="72" y="25" fontSize="14" fill="#0f172a" opacity="0.6">♠</text>
          <text x="20" y="85" fontSize="14" fill="#0f172a" opacity="0.6">♣</text>
          <text x="72" y="85" fontSize="14" fill="#ef4444" opacity="0.6">♥</text>
          
          {/* Central chip design */}
          <circle cx="50" cy="50" r="28" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
          <circle cx="50" cy="50" r="24" fill="#0f172a"/>
          <circle cx="50" cy="50" r="20" stroke="#fbbf24" strokeWidth="3" fill="none" strokeDasharray="8 4"/>
          <circle cx="50" cy="50" r="14" fill="#059669"/>
          <circle cx="50" cy="50" r="10" fill="#047857"/>
          
          {/* Chip value / Spade in center */}
          <path d="M50 42 C50 42 44 48 44 52 C44 54.5 45.5 56 48 56 C49 56 49.8 55.6 50 55 C50.2 55.6 51 56 52 56 C54.5 56 56 54.5 56 52 C56 48 50 42 50 42Z" fill="#fbbf24"/>
          <path d="M48.5 56 L50 60 L51.5 56" fill="#fbbf24"/>
          
          {/* Decorative dots on chip edge */}
          <circle cx="50" cy="24" r="2" fill="#fbbf24"/>
          <circle cx="50" cy="76" r="2" fill="#fbbf24"/>
          <circle cx="24" cy="50" r="2" fill="#fbbf24"/>
          <circle cx="76" cy="50" r="2" fill="#fbbf24"/>
        </svg>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-3 py-6 sm:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4 sm:mb-5">
            <Logo />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">מחשבון פוקר</h1>
          <p className="text-emerald-400/80 text-sm">סגירת חשבונות בסוף הערב</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border border-white/10">
          
          {/* Table Header - Desktop */}
          <div className="hidden sm:grid grid-cols-12 gap-3 text-emerald-300/70 text-sm font-medium mb-4 px-2">
            <div className="col-span-4">שחקן</div>
            <div className="col-span-3 text-center">קנייה</div>
            <div className="col-span-3 text-center">יציאה</div>
            <div className="col-span-2 text-center">רווח/הפסד</div>
          </div>

          {/* Player Rows */}
          <div className="space-y-3">
            {players.map((player, index) => {
              const profit = getProfit(player);
              return (
                <div key={player.id} className="group">
                  {/* Mobile Layout */}
                  <div className="sm:hidden bg-white/5 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="שם השחקן"
                        value={player.name}
                        onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg font-medium"
                      />
                      {players.length > 1 && (
                        <button
                          onClick={() => setDeleteConfirm(player.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all duration-300"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">קנייה</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={player.buyIn}
                          onChange={(e) => updatePlayer(player.id, 'buyIn', e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-center placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">יציאה</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={player.cashOut}
                          onChange={(e) => updatePlayer(player.id, 'cashOut', e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-center placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div className="w-20">
                        <label className="text-xs text-white/40 mb-1 block text-center">רווח/הפסד</label>
                        <div className={`h-10 flex items-center justify-center rounded-lg font-bold tabular-nums ${
                          profit === null ? 'text-white/30' : 
                          profit > 0 ? 'text-emerald-400 bg-emerald-500/10' : 
                          profit < 0 ? 'text-rose-400 bg-rose-500/10' : 'text-white/50'
                        }`}>
                          {profit === null ? '—' : (profit > 0 ? '+' : '') + profit.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="שם"
                        value={player.name}
                        onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={player.buyIn}
                        onChange={(e) => updatePlayer(player.id, 'buyIn', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={player.cashOut}
                        onChange={(e) => updatePlayer(player.id, 'cashOut', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <span className={`text-sm font-bold tabular-nums transition-colors duration-300 ${
                        profit === null ? 'text-white/30' : 
                        profit > 0 ? 'text-emerald-400' : 
                        profit < 0 ? 'text-rose-400' : 'text-white/50'
                      }`}>
                        {profit === null ? '—' : (profit > 0 ? '+' : '') + profit.toFixed(0)}
                      </span>
                      {players.length > 1 && (
                        <button
                          onClick={() => setDeleteConfirm(player.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all duration-300"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Row */}
          <div className="mt-4 pt-4 border-t border-white/10">
            {/* Mobile Totals */}
            <div className="sm:hidden bg-emerald-500/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-300 font-bold">סה״כ</span>
                <span className="text-white/50 text-sm">{totals.count} שחקנים</span>
              </div>
              <div className="flex gap-2 text-center">
                <div className="flex-1 bg-white/5 rounded-lg p-2">
                  <div className="text-xs text-white/40 mb-1">קנייה</div>
                  <div className="text-white font-bold tabular-nums">{totals.buyIn.toFixed(0)}</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg p-2">
                  <div className="text-xs text-white/40 mb-1">יציאה</div>
                  <div className="text-white font-bold tabular-nums">{totals.cashOut.toFixed(0)}</div>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg p-2">
                  <div className="text-xs text-white/40 mb-1">הפרש</div>
                  <div className={`font-bold tabular-nums ${
                    Math.abs(totals.pl) < 0.01 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {totals.pl === 0 ? '0 ✓' : (totals.pl > 0 ? '+' : '') + totals.pl.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Totals */}
            <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
              <div className="col-span-4 px-4 py-3">
                <span className="text-emerald-300 font-bold">סה״כ ({totals.count} שחקנים)</span>
              </div>
              <div className="col-span-3">
                <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
                  <span className="text-white font-bold tabular-nums">{totals.buyIn.toFixed(0)}</span>
                </div>
              </div>
              <div className="col-span-3">
                <div className="bg-white/5 rounded-xl px-4 py-3 text-center">
                  <span className="text-white font-bold tabular-nums">{totals.cashOut.toFixed(0)}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className={`text-sm font-bold tabular-nums px-3 py-1 rounded-full ${
                  Math.abs(totals.pl) < 0.01 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {totals.pl === 0 ? '0 ✓' : (totals.pl > 0 ? '+' : '') + totals.pl.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Add Player Button */}
          <button
            onClick={addPlayer}
            className="w-full mt-5 sm:mt-6 py-3 border-2 border-dashed border-white/20 rounded-xl sm:rounded-2xl text-white/50 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-300 active:scale-[0.98]"
          >
            + הוסף שחקן
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 sm:mt-8">
            <button
              onClick={calculateTransfers}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-[0.98]"
            >
              חשב העברות
            </button>
            <button
              onClick={reset}
              className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl sm:rounded-2xl transition-all duration-300 border border-white/10 active:scale-[0.98]"
            >
              אפס
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl text-rose-300 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {showResults && transfers.length > 0 && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl sm:rounded-2xl border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">💸</span>
                  העברות
                </h2>
                
                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl text-white/80 hover:text-white transition-all duration-300 border border-white/10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"/>
                      <circle cx="6" cy="12" r="3"/>
                      <circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    <span className="text-sm font-medium hidden sm:inline">שתף</span>
                  </button>
                  
                  {/* Share Menu Dropdown */}
                  {showShareMenu && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setShowShareMenu(false)}></div>
                      <div className="absolute left-0 top-full mt-2 bg-slate-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10 min-w-44">
                        {typeof navigator !== 'undefined' && navigator.share && (
                          <button
                            onClick={nativeShare}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-right border-b border-white/10"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                              </svg>
                            </div>
                            <span>שתף...</span>
                          </button>
                        )}
                        <button
                          onClick={shareWhatsApp}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </div>
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={shareTelegram}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                          </div>
                          <span>Telegram</span>
                        </button>
                        <button
                          onClick={shareEmail}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-right"
                        >
                          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="4" width="20" height="16" rx="2"/>
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                            </svg>
                          </div>
                          <span>אימייל</span>
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-right border-t border-white/10"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                          </div>
                          <span>העתק</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {transfers.map((t, i) => (
                  <div 
                    key={i} 
                    className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-rose-300 bg-rose-500/15 px-3 py-1.5 rounded-lg">{t.from}</span>
                        <span className="text-white/50 text-sm font-medium">משלם ל</span>
                        <span className="font-medium text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-lg">{t.to}</span>
                      </div>
                      <span className="font-bold text-amber-400 text-xl tabular-nums">₪{t.amount.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-emerald-400/60 text-sm mt-4 sm:mt-5 text-center">
                {transfers.length === 1 ? 'העברה אחת בלבד' : `${transfers.length} העברות בלבד`} ✨
              </p>
            </div>
          )}

          {showResults && transfers.length === 0 && !error && (
            <div className="mt-6 sm:mt-8 p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl sm:rounded-2xl border border-emerald-500/20 text-center">
              <span className="text-4xl mb-3 block">🎉</span>
              <p className="text-emerald-300 font-medium">הכל מאוזן! אין צורך בהעברות</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-5 sm:mt-6 px-4">
          קנייה = סכום הכניסה למשחק • יציאה = סכום בסוף המשחק
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">מחיקת שחקן</h3>
            <p className="text-white/70 mb-6">האם אתה בטוח שברצונך למחוק את השחקן?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  removePlayer(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300"
              >
                מחק
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
