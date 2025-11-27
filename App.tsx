import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, MessageSquare, ArrowLeft, Trash2, Edit2, MapPin, Phone, DollarSign, FolderOpen } from 'lucide-react';
import { CATEGORIES } from './constants';
import { CategoryType, Vendor } from './types';
import VendorModal from './components/VendorModal';
import { chatWithVendors } from './services/geminiService';

const App: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // AI Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('event_vendors');
    if (saved) {
      try {
        setVendors(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse vendors", e);
      }
    }
  }, []);

  // Save to local storage whenever vendors change
  useEffect(() => {
    localStorage.setItem('event_vendors', JSON.stringify(vendors));
  }, [vendors]);

  const handleSaveVendor = (vendor: Vendor) => {
    if (editingVendor) {
      setVendors(prev => prev.map(v => v.id === vendor.id ? vendor : v));
    } else {
      setVendors(prev => [...prev, vendor]);
    }
    setEditingVendor(null);
  };

  const handleDeleteVendor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      setVendors(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleEditVendor = (vendor: Vendor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    
    setIsChatLoading(true);
    setChatResponse('');
    
    const response = await chatWithVendors(chatQuery, vendors);
    
    setChatResponse(response);
    setIsChatLoading(false);
  };

  // Derived state for dashboard counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    vendors.forEach(v => {
      counts[v.category] = (counts[v.category] || 0) + 1;
    });
    return counts;
  }, [vendors]);

  // Filter vendors for the current view
  const displayedVendors = useMemo(() => {
    let filtered = vendors;
    
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.location.toLowerCase().includes(q) || 
        v.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [vendors, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedCategory(null)}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">EventPlanner<span className="text-indigo-600">AI</span></h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${showChat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} />
            <span className="hidden md:inline">Assistente AI</span>
          </button>
          <button 
            onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all shadow-md"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Aggiungi</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* AI Chat Interface (Collapsible) */}
        {showChat && (
          <div className="mb-8 bg-white rounded-2xl border border-indigo-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-800 font-medium">
                <SparklesIcon />
                Chiedi ai tuoi dati
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={16} className="rotate-90" /></button>
            </div>
            <div className="p-6">
              {chatResponse && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {chatResponse}
                </div>
              )}
              
              <form onSubmit={handleAiChat} className="relative">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Es. 'Qual è il fioraio più economico a Roma?' o 'Mostrami le ville con piscina'..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatQuery.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isChatLoading ? <LoaderIcon /> : <ArrowRightIcon />}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Breadcrumbs / Back Button */}
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Torna alle Categorie
          </button>
        )}

        {/* Main Content Area */}
        {!selectedCategory ? (
          // Dashboard View
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Le tue Cartelle</h2>
              <p className="text-slate-500">Seleziona una categoria per vedere i fornitori o aggiungine di nuovi.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const count = categoryCounts[cat.id] || 0;
                
                return (
                  <div 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{cat.label}</h3>
                        <p className="text-sm text-slate-500">{count} {count === 1 ? 'fornitore' : 'fornitori'}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                         <ArrowRightIcon size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Category List View
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{selectedCategory}</h2>
                <p className="text-slate-500">Gestisci i tuoi {selectedCategory.toLowerCase()}.</p>
              </div>
              <div className="relative w-full md:w-auto min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cerca fornitore..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {displayedVendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <FolderOpen size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Nessun fornitore qui</h3>
                <p className="text-slate-500 mb-6">Non hai ancora aggiunto fornitori in questa categoria.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={18} />
                  Aggiungi Fornitore
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedVendors.map((vendor) => (
                  <div key={vendor.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 mb-3">
                            {vendor.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">{tag}</span>
                            ))}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={(e) => handleEditVendor(vendor, e)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={(e) => handleDeleteVendor(vendor.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{vendor.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{vendor.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={16} className="text-slate-400" />
                          {vendor.location || 'Nessuna posizione'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DollarSign size={16} className="text-slate-400" />
                          <span className={vendor.priceRange === '$$$$' ? 'text-red-600 font-medium' : vendor.priceRange === '$' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                            {vendor.priceRange}
                          </span>
                        </div>
                        {vendor.contact && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={16} className="text-slate-400" />
                            <span className="truncate">{vendor.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <VendorModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingVendor(null); }} 
        onSave={handleSaveVendor}
        initialData={editingVendor}
      />

    </div>
  );
};

// Simple Icon Wrappers to keep App.tsx cleanish but fully functional without extra files for tiny icons
const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);
const LoaderIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
const ArrowRightIcon = ({ size = 18 }: {size?: number}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default App;
