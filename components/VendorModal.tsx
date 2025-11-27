import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
import { Vendor, CategoryType, AiExtractionResponse } from '../types';
import { extractVendorInfo } from '../services/geminiService';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
  initialData?: Vendor | null;
}

const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>(CategoryType.PHOTOGRAPHER);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<'$' | '$$' | '$$$' | '$$$$'>('$$');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setLocation(initialData.location);
      setPriceRange(initialData.priceRange);
      setContact(initialData.contact);
      setDescription(initialData.description);
      setTags(initialData.tags.join(', '));
      setRawText(initialData.details || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setName('');
    setCategory(CategoryType.PHOTOGRAPHER);
    setLocation('');
    setPriceRange('$$');
    setContact('');
    setDescription('');
    setTags('');
    setRawText('');
  };

  const handleAiExtract = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    try {
      const data = await extractVendorInfo(rawText);
      if (data) {
        setName(data.name || '');
        setCategory(data.category as CategoryType);
        setLocation(data.location || '');
        setPriceRange(data.priceRange || '$$');
        setContact(data.contact || '');
        setDescription(data.description || '');
        setTags(data.tags ? data.tags.join(', ') : '');
      }
    } catch (e) {
      alert("Errore durante l'analisi AI. Assicurati che il testo sia chiaro.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVendor: Vendor = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      category,
      location,
      priceRange,
      contact,
      description,
      details: rawText,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: initialData ? initialData.createdAt : Date.now(),
    };
    onSave(newVendor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialData ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* AI Extraction Section */}
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <label className="block text-sm font-medium text-indigo-900 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              Importa da testo/PDF (AI Magic)
            </label>
            <p className="text-xs text-indigo-700 mb-3">
              Copia e incolla qui il testo dal preventivo o PDF. L'AI estrarrà i dati per te.
            </p>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Incolla qui le informazioni disordinate del fornitore..."
              className="w-full p-3 text-sm border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={loading || !rawText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? 'Analizzando...' : 'Estrai Dati'}
              </button>
            </div>
          </div>

          <form id="vendorForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fornitore</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value as CategoryType)} className="w-full p-2 border rounded-md">
                  {Object.values(CategoryType).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo</label>
                <div className="flex gap-2">
                  {['$', '$$', '$$$', '$$$$'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceRange(p as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${priceRange === p ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Località</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded-md" placeholder="es. Roma, Lago di Como" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contatti</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Email, Telefono o Sito Web" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note / Descrizione</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded-md min-h-[80px]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separati da virgola)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 border rounded-md" placeholder="es. Moderno, Vegano, Luxury" />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 sticky bottom-0 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md">Annulla</button>
          <button type="submit" form="vendorForm" className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-lg">
            <Save size={18} />
            Salva Fornitore
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
