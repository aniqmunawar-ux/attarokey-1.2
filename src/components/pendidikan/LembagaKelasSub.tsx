import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, Plus, Trash2, Edit, Users, BookOpen, ChevronRight, 
  ArrowLeft, Search, GraduationCap, ArrowLeftRight, Check, CheckCircle2, UserCheck, AlertCircle, X, MoreVertical
} from 'lucide-react';
import { Lembaga, Kelas, Santri, KategoriRombel, KelompokRombel, RombelAssignment } from '../../types';
import SantriDetailModal from '../sekretaris/SantriDetailModal';
import { PUTRA_AVATAR, PUTRI_AVATAR } from '../SekretarisHelper';
import RombelSub from './RombelSub';

interface LembagaKelasSubProps {
  lembagasList: Lembaga[];
  kelasList: Kelas[];
  santriList: Santri[];
  onAddLembaga: (newLem: Lembaga) => any;
  onUpdateLembaga: (upLem: Lembaga) => any;
  onDeleteLembaga: (id: string) => any;
  onAddKelas: (newKel: Kelas) => any;
  onUpdateKelas: (upKel: Kelas) => any;
  onDeleteKelas: (id: string) => any;
  onUpdateSantriClass: (santriId: string, classText: string, lembagaId?: string) => void;
  genderFilter?: 'Putra' | 'Putri';
  canViewPutra?: boolean;
  canViewPutri?: boolean;
  canWritePutra?: boolean;
  canWritePutri?: boolean;
  
  initialTab?: 'Formal' | 'Internal' | 'Rombel';
  onTabChange?: (tab: 'Formal' | 'Internal' | 'Rombel') => void;

  // Rombel props
  categoriesList?: KategoriRombel[];
  groupsList?: KelompokRombel[];
  assignmentsList?: RombelAssignment[];
  onAddCategory?: (cat: KategoriRombel) => any;
  onUpdateCategory?: (cat: KategoriRombel) => any;
  onDeleteCategory?: (id: string) => any;
  onAddGroup?: (grp: KelompokRombel) => any;
  onUpdateGroup?: (grp: KelompokRombel) => any;
  onDeleteGroup?: (id: string) => any;
  onAddAssignment?: (newAss: RombelAssignment) => any;
  onRemoveAssignment?: (santriId: string, kelompokId: string) => any;
}

export default function LembagaKelasSub({
  lembagasList,
  kelasList,
  santriList,
  onAddLembaga,
  onUpdateLembaga,
  onDeleteLembaga,
  onAddKelas,
  onUpdateKelas,
  onDeleteKelas,
  onUpdateSantriClass,
  genderFilter = 'Putra',
  canViewPutra = true,
  canViewPutri = true,
  canWritePutra = true,
  canWritePutri = true,
  
  initialTab = 'Formal',
  onTabChange,
  
  // Rombel Props
  categoriesList = [],
  groupsList = [],
  assignmentsList = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddAssignment,
  onRemoveAssignment
}: LembagaKelasSubProps) {

  // --- Core State ---
  const [selectedGender, setSelectedGender] = useState<'Putra' | 'Putri'>(genderFilter);
  const [activeTab, setActiveTab] = useState<'Formal' | 'Internal' | 'Rombel'>(initialTab);
  const [selectedLembaga, setSelectedLembaga] = useState<Lembaga | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  
  // Dropdown Menu States
  const [activeMenuLembagaId, setActiveMenuLembagaId] = useState<string | null>(null);
  const [activeMenuKelasId, setActiveMenuKelasId] = useState<string | null>(null);
  
  // Modal & Detail States
  const [selectedSantriForDetail, setSelectedSantriForDetail] = useState<Santri | null>(null);
  
  // Create / Edit Lembaga Modal States
  const [isLembagaModalOpen, setIsLembagaModalOpen] = useState(false);
  const [editingLembaga, setEditingLembaga] = useState<Lembaga | null>(null);
  const [lemNama, setLemNama] = useState('');
  const [lemLogo, setLemLogo] = useState('');

  // Create / Edit Kelas Modal States
  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [kelNama, setKelNama] = useState('');
  const [kelWali, setKelWali] = useState('');
  const [kelTingkat, setKelTingkat] = useState<'Ula' | 'Wustho' | 'Ulya' | 'Lainnya'>('Lainnya');
  const [kelKapasitas, setKelKapasitas] = useState<number>(40);

  // Sync gender filter prop
  useEffect(() => {
    if (genderFilter) {
      setSelectedGender(genderFilter);
      setSelectedLembaga(null);
      setSelectedKelas(null);
    }
  }, [genderFilter]);

  // Sync initialTab prop changes
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
      setSelectedLembaga(null);
      setSelectedKelas(null);
    }
  }, [initialTab]);

  // Sync tab change
  const handleTabChange = (tab: 'Formal' | 'Internal' | 'Rombel') => {
    setActiveTab(tab);
    setSelectedLembaga(null);
    setSelectedKelas(null);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Helper: Resolve Lembaga type (fallback if undefined)
  const getLembagaJenis = (l: Lembaga): 'Formal' | 'Internal' => {
    if (l.jenis) return l.jenis;
    const lower = l.nama.toLowerCase();
    if (
      lower.includes('madin') || 
      lower.includes('diniyah') || 
      lower.includes('tpq') || 
      lower.includes('tahfidz') || 
      lower.includes('pondok') || 
      lower.includes('kitab') || 
      lower.includes('internal') ||
      (l.kode && l.kode.toLowerCase().includes('madin')) ||
      (l.kode && l.kode.toLowerCase().includes('tahf'))
    ) {
      return 'Internal';
    }
    return 'Formal';
  };

  // Filtered Lembaga
  const filteredLembagas = lembagasList.filter(l => 
    getLembagaJenis(l) === activeTab && l.gender === selectedGender
  );

  // Helper: Get classes for a specific institution
  const getClassesOfLembaga = (lembagaId: string) => {
    return kelasList.filter(k => k.lembagaId === lembagaId);
  };

  // Helper: Get students belonging to a specific class in an institution
  const getStudentsInClass = (c: Kelas, l: Lembaga) => {
    return santriList.filter(s => {
      if (s.gender !== selectedGender) return false;

      const sClasses = s.kelas ? s.kelas.split(',').map(x => x.trim().toLowerCase()) : [];
      
      if (c.nama.toLowerCase() === 'calon pelajar') {
        const isFormal = s.pendidikanFormal === l.id;
        const isInternal = s.pendidikanInternal ? s.pendidikanInternal.split(',').map(x => x.trim()).includes(l.id) : false;
        if (!isFormal && !isInternal) return false;

        const otherClassesOfL = getClassesOfLembaga(l.id).filter(x => x.nama.toLowerCase() !== 'calon pelajar');
        const inOtherClass = otherClassesOfL.some(oc => sClasses.includes(oc.nama.toLowerCase()));
        return !inOtherClass;
      } else {
        return sClasses.includes(c.nama.toLowerCase());
      }
    });
  };

  // Helper: Get total students following an institution
  const getLembagaStudentCount = (l: Lembaga) => {
    return santriList.filter(s => {
      if (s.gender !== selectedGender) return false;
      const isFormal = s.pendidikanFormal === l.id;
      const isInternal = s.pendidikanInternal ? s.pendidikanInternal.split(',').map(x => x.trim()).includes(l.id) : false;
      return isFormal || isInternal;
    }).length;
  };

  // --- Actions ---
  const handleOpenLembagaModal = (lem: Lembaga | null = null) => {
    if (lem) {
      setEditingLembaga(lem);
      setLemNama(lem.nama);
      setLemLogo(lem.logo || '');
    } else {
      setEditingLembaga(null);
      setLemNama('');
      setLemLogo('');
    }
    setIsLembagaModalOpen(true);
  };

  const handleSaveLembaga = async () => {
    if (!lemNama.trim()) return;

    const generateInitials = (name: string) => {
      const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
      const parts = clean.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return parts.map(p => p[0]).join('').toUpperCase().slice(0, 5);
      }
      return clean.slice(0, 3).toUpperCase();
    };

    if (editingLembaga) {
      await onUpdateLembaga({
        ...editingLembaga,
        nama: lemNama,
        logo: lemLogo || undefined
      });
    } else {
      const newLembagaId = 'L-' + Date.now();
      let autoKode = generateInitials(lemNama) || 'LEM';
      
      // Make autoKode unique for this gender to avoid UNIQUE constraint violation on (kode, gender)
      let baseKode = autoKode;
      let counter = 1;
      while (lembagasList.some(l => l.kode === autoKode && l.gender === selectedGender)) {
        autoKode = `${baseKode}${counter}`;
        counter++;
      }

      const savedLem = await onAddLembaga({
        id: newLembagaId,
        nama: lemNama,
        kode: autoKode,
        gender: selectedGender,
        jenis: activeTab,
        logo: lemLogo || undefined
      });

      const actualLembagaId = savedLem?.id || newLembagaId;

      // Automatically create a default class named "Calon Pelajar"
      await onAddKelas({
        id: 'K-' + Date.now() + '-default',
        lembagaId: actualLembagaId,
        nama: 'Calon Pelajar',
        waliKelas: '-',
        tingkatan: 'Lainnya',
        kapasitas: 999
      });
    }

    setIsLembagaModalOpen(false);
  };

  const handleDeleteLembagaClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lembaga "${name}" beserta semua kelas di dalamnya?`)) {
      onDeleteLembaga(id);
      if (selectedLembaga?.id === id) {
        setSelectedLembaga(null);
        setSelectedKelas(null);
      }
    }
  };

  const handleOpenKelasModal = (kel: Kelas | null = null) => {
    if (!selectedLembaga) return;
    if (kel) {
      setEditingKelas(kel);
      setKelNama(kel.nama);
      setKelWali(kel.waliKelas || '');
      setKelTingkat(kel.tingkatan as any || 'Lainnya');
      setKelKapasitas(kel.kapasitas || 40);
    } else {
      setEditingKelas(null);
      setKelNama('');
      setKelWali('');
      setKelTingkat('Lainnya');
      setKelKapasitas(40);
    }
    setIsKelasModalOpen(true);
  };

  const handleSaveKelas = () => {
    if (!selectedLembaga || !kelNama.trim()) return;

    if (editingKelas) {
      onUpdateKelas({
        ...editingKelas,
        nama: kelNama,
        waliKelas: kelWali || '-',
        tingkatan: kelTingkat,
        kapasitas: Number(kelKapasitas)
      });
      if (selectedKelas?.id === editingKelas.id) {
        setSelectedKelas({
          ...selectedKelas,
          nama: kelNama,
          waliKelas: kelWali || '-',
          tingkatan: kelTingkat,
          kapasitas: Number(kelKapasitas)
        });
      }
    } else {
      onAddKelas({
        id: 'K-' + Date.now(),
        lembagaId: selectedLembaga.id,
        nama: kelNama,
        waliKelas: kelWali || '-',
        tingkatan: kelTingkat,
        kapasitas: Number(kelKapasitas)
      });
    }

    setIsKelasModalOpen(false);
  };

  const handleDeleteKelasClick = (id: string, name: string) => {
    if (id.endsWith('-default') || name.toLowerCase() === 'calon pelajar') {
      alert('Kelas ini adalah kelas wajib bawaan lembaga dan tidak dapat dihapus.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus kelas "${name}"?`)) {
      onDeleteKelas(id);
      if (selectedKelas?.id === id) {
        setSelectedKelas(null);
      }
    }
  };

  const handleMoveStudent = (s: Santri, l: Lembaga, newClass: string) => {
    onUpdateSantriClass(s.id, newClass, l.id);
  };

  // Render Student table avatars safely
  const renderStudentAvatar = (s: Santri) => {
    const fallback = s.gender === 'Putri' ? PUTRI_AVATAR : PUTRA_AVATAR;
    const src = s.filePasFoto && s.filePasFoto.trim() !== '' ? s.filePasFoto : fallback;
    return (
      <img 
        src={src} 
        alt={s.nama} 
        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-sm"
        referrerPolicy="no-referrer"
      />
    );
  };

  const canWriteCurrent = selectedGender === 'Putra' ? canWritePutra : canWritePutri;

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Title & Gender Toggle Switcher (Persis UI/UX Data Induk Santri tanpa kotak kontainer) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex flex-wrap items-center gap-x-2">
            <span>Aktivitas Akademik</span>
            <span 
              onClick={() => {
                setSelectedGender(selectedGender === 'Putra' ? 'Putri' : 'Putra');
                setSelectedLembaga(null);
                setSelectedKelas(null);
              }}
              className={`inline-flex items-center gap-1.5 transition-all duration-200 select-none cursor-pointer active:scale-95 ${
                selectedGender === 'Putra' 
                  ? 'text-indigo-600 hover:text-indigo-700' 
                  : 'text-rose-600 hover:text-rose-700'
              }`}
              title="Klik untuk mengubah filter gender (Putra ⇄ Putri)"
            >
              <span>
                {selectedGender === 'Putra' ? 'Santri Putra' : 'Santri Putri'}
              </span>
              <ArrowLeftRight className="h-5 w-5 mt-0.5 shrink-0" />
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan Satuan Pendidikan Formal, Internal, dan Rombongan Belajar Santri secara terpadu.
          </p>
        </div>
      </div>

      {/* 2. Full Width Horizontal Tab Bar */}
      {!selectedKelas && (
        <div className="w-full border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange('Formal')}
              className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                activeTab === 'Formal'
                  ? 'border-emerald-600 text-emerald-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Pendidikan Formal
            </button>
            <button
              onClick={() => handleTabChange('Internal')}
              className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                activeTab === 'Internal'
                  ? 'border-emerald-600 text-emerald-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Pendidikan Internal Pondok
            </button>
            <button
              onClick={() => handleTabChange('Rombel')}
              className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                activeTab === 'Rombel'
                  ? 'border-emerald-600 text-emerald-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Rombongan Belajar
            </button>
          </div>

          {!selectedLembaga && activeTab !== 'Rombel' && canWriteCurrent && (
            <button
              onClick={() => handleOpenLembagaModal()}
              className="mb-3 sm:mb-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Buat Lembaga
            </button>
          )}
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <AnimatePresence mode="wait">
        {activeTab === 'Rombel' ? (
          <motion.div
            key="rombel-sub-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <RombelSub
              categoriesList={categoriesList}
              groupsList={groupsList}
              assignmentsList={assignmentsList}
              santriList={santriList}
              onAddCategory={onAddCategory!}
              onUpdateCategory={onUpdateCategory!}
              onDeleteCategory={onDeleteCategory!}
              onAddGroup={onAddGroup!}
              onUpdateGroup={onUpdateGroup!}
              onDeleteGroup={onDeleteGroup!}
              onAddAssignment={onAddAssignment!}
              onRemoveAssignment={onRemoveAssignment!}
              genderFilter={selectedGender}
              canViewPutra={canViewPutra}
              canViewPutri={canViewPutri}
              canWritePutra={canWritePutra}
              canWritePutri={canWritePutri}
              hideTitle={true}
            />
          </motion.div>
        ) : !selectedLembaga ? (
          <motion.div
            key="lembaga-grid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Cards Grid */}
            {filteredLembagas.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <School className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Lembaga</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Belum ada lembaga pendidikan kategori {activeTab} yang terdaftar untuk Santri {selectedGender}. Silakan buat lembaga baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLembagas.map((l) => {
                  const instClasses = getClassesOfLembaga(l.id);
                  const instStudentsCount = getLembagaStudentCount(l);

                  return (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLembaga(l)}
                      className="group relative bg-white border border-slate-100 rounded-2xl cursor-pointer transition-all hover:border-slate-300 hover:shadow-md flex h-32 overflow-hidden"
                    >
                      {/* Logo on the left, full height of card */}
                      <div className="w-32 bg-slate-50 flex items-center justify-center shrink-0 border-r border-slate-100 relative overflow-hidden">
                        {l.logo ? (
                          <img
                            src={l.logo}
                            alt={l.nama}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-slate-300 text-center">
                            <School className="h-8 w-8 text-slate-300" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 mt-1">
                              {l.kode.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content on the right */}
                      <div className="flex-1 p-4 pt-6 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base md:text-lg font-black text-slate-800 leading-snug group-hover:text-emerald-700 transition-colors truncate">
                              {l.nama}
                            </h3>

                            {/* Three-dot Dropdown */}
                            {canWriteCurrent && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuLembagaId(activeMenuLembagaId === l.id ? null : l.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                  title="Menu"
                                >
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </button>
                                {activeMenuLembagaId === l.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuLembagaId(null);
                                      }}
                                    />
                                    <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-25 py-1 text-xs font-bold text-slate-700">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuLembagaId(null);
                                          handleOpenLembagaModal(l);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuLembagaId(null);
                                          handleDeleteLembagaClick(l.id, l.nama);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors"
                                      >
                                        Hapus
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats counters */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-auto">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{instClasses.length} Kelas</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{instStudentsCount} Santri</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : !selectedKelas ? (
          <motion.div
            key={`classes-of-${selectedLembaga.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-6"
          >
            {/* Back Button to return to Lembaga list */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedLembaga(null)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer transition-all bg-white hover:bg-slate-50 border border-slate-200/70 px-3 py-2 rounded-xl shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                KEMBALI KE DAFTAR LEMBAGA
              </button>
            </div>

            {/* Institution Header Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-xl flex items-center justify-center border border-emerald-100 shadow-sm shrink-0 overflow-hidden">
                {selectedLembaga.logo ? (
                  <img src={selectedLembaga.logo} alt={selectedLembaga.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <School className="h-7 w-7" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 leading-tight">{selectedLembaga.nama}</h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Kategori: <span className="text-emerald-600 uppercase">{activeTab}</span> | Santri: <span className="text-slate-600 uppercase">{selectedGender}</span>
                </p>
              </div>
            </div>

            {/* List of Classes */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800">Daftar Kelas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Silakan pilih kelas untuk melihat detail nama anggota dan status administrasinya.
                  </p>
                </div>

                {canWriteCurrent && (
                  <button
                    onClick={() => handleOpenKelasModal()}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 self-start sm:self-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Kelas
                  </button>
                )}
              </div>

              {getClassesOfLembaga(selectedLembaga.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">
                  Belum ada kelas terdaftar di lembaga ini.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {getClassesOfLembaga(selectedLembaga.id).map(c => {
                    const studs = getStudentsInClass(c, selectedLembaga);
                    const isDefault = c.id.endsWith('-default') || c.nama.toLowerCase() === 'calon pelajar';

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedKelas(c)}
                        className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-emerald-300 rounded-2xl p-4 cursor-pointer transition-all shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition-all flex items-center gap-1.5">
                              <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>{c.nama}</span>
                            </h4>

                            {/* Three-dot Dropdown */}
                            {canWriteCurrent && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuKelasId(activeMenuKelasId === c.id ? null : c.id);
                                  }}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
                                  title="Menu Kelas"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {activeMenuKelasId === c.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuKelasId(null);
                                      }}
                                    />
                                    <div className="absolute right-0 mt-1 w-24 bg-white border border-slate-250 rounded-lg shadow-md z-20 py-1 text-[11px] font-bold text-slate-700">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuKelasId(null);
                                          handleOpenKelasModal(c);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                      >
                                        Edit
                                      </button>
                                      {!isDefault && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuKelasId(null);
                                            handleDeleteKelasClick(c.id, c.nama);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors"
                                        >
                                          Hapus
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400">
                            Wali Kelas: <span className="font-semibold text-slate-600">{c.waliKelas}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1 tracking-wider">
                            Tingkatan: {c.tingkatan}
                          </p>
                        </div>

                        <div className="border-t border-slate-100/80 pt-2.5 mt-4 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-500">
                            Kapasitas: <span className="font-mono text-slate-700">{c.kapasitas}</span>
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                            <Users className="h-3 w-3 shrink-0" />
                            <span>{studs.length} Santri</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* 3. Detailed Class Broad View ("halaman tampilan luas") */
          <motion.div
            key="detailed-class-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => setSelectedKelas(null)}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer transition-colors bg-white hover:bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              KEMBALI KE DAFTAR KELAS
            </button>

            {/* Class Info Box */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-emerald-650 font-black uppercase tracking-wider">
                  {selectedLembaga?.nama} ({selectedLembaga?.kode})
                </div>
                <h2 className="text-xl font-black text-slate-800 mt-1 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-emerald-600 shrink-0" />
                  <span>Kelas: {selectedKelas.nama}</span>
                </h2>
                
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-3 text-xs text-slate-500">
                  <p>
                    Wali Kelas: <span className="font-semibold text-slate-700">{selectedKelas.waliKelas}</span>
                  </p>
                  <p>
                    Tingkatan: <span className="font-mono font-semibold text-slate-700">{selectedKelas.tingkatan}</span>
                  </p>
                  <p>
                    Kapasitas: <span className="font-mono font-semibold text-slate-700">{selectedKelas.kapasitas}</span>
                  </p>
                </div>
              </div>

              {/* Class Members Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shrink-0 self-start md:self-center">
                <Users className="h-8 w-8 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">TOTAL ANGGOTA</div>
                  <div className="text-lg font-black text-slate-800 leading-tight">
                    {getStudentsInClass(selectedKelas, selectedLembaga!).length} Santri
                  </div>
                </div>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  Tabel Anggota Kelas
                </h3>
              </div>

              <div className="overflow-x-auto select-text">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-5 w-12 text-center">No</th>
                      <th className="py-4 px-5">Nama Lengkap</th>
                      <th className="py-4 px-5">NISM</th>
                      <th className="py-4 px-5">NISN</th>
                      <th className="py-4 px-5">Status EMIS</th>
                      <th className="py-4 px-5">Status Verval</th>
                      {canWriteCurrent && <th className="py-4 px-5 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs text-slate-700 font-medium">
                    {getStudentsInClass(selectedKelas, selectedLembaga!).length === 0 ? (
                      <tr>
                        <td colSpan={canWriteCurrent ? 7 : 6} className="py-12 text-center text-slate-400 italic font-medium">
                          Belum ada santri terdaftar di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      getStudentsInClass(selectedKelas, selectedLembaga!).map((s, idx) => {
                        // Verval status logic:
                        // 'Terverifikasi' if NISN is present, otherwise 'Proses'
                        const isNisnValid = s.nisn && s.nisn.trim() !== '';
                        const isNismValid = s.nism && s.nism.trim() !== '';
                        const isEmisTerdaftar = s.statusEmis === 'Terdaftar';

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/30 transition-all">
                            <td className="py-4 px-5 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            
                            {/* Nama Lengkap with Avatar, NIS and Alamat */}
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                {renderStudentAvatar(s)}
                                <div className="min-w-0">
                                  {/* Clicking full name opens detailed biodata */}
                                  <div
                                    onClick={() => setSelectedSantriForDetail(s)}
                                    className="font-bold text-slate-800 hover:text-emerald-700 hover:underline cursor-pointer transition-colors max-w-xs truncate"
                                    title="Lihat Biodata Lengkap"
                                  >
                                    {s.nama}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                    NIS: {s.nis || '-'}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 font-normal">
                                    {s.alamat || '-'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5 font-mono text-slate-600">
                              {s.nism || '-'}
                            </td>

                            <td className="py-4 px-5 font-mono text-slate-600">
                              {s.nisn || '-'}
                            </td>

                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isEmisTerdaftar
                                  ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                                  : 'bg-amber-50 border-amber-200/60 text-amber-700'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isEmisTerdaftar ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                {s.statusEmis || 'Belum'}
                              </span>
                            </td>

                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isNisnValid
                                  ? 'bg-blue-50 border-blue-200/60 text-blue-700'
                                  : 'bg-rose-50 border-rose-200/60 text-rose-700'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isNisnValid ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                {isNisnValid ? 'Terverifikasi' : 'Proses'}
                              </span>
                            </td>

                            {canWriteCurrent && (
                              <td className="py-3 px-5 text-center">
                                <div className="inline-flex items-center">
                                  {/* Dropdown list to re-assign class */}
                                  <select
                                    value={selectedKelas.nama}
                                    onChange={(e) => handleMoveStudent(s, selectedLembaga!, e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 focus:border-emerald-500 outline-none cursor-pointer"
                                  >
                                    {getClassesOfLembaga(selectedLembaga!.id).map(cls => (
                                      <option key={cls.id} value={cls.nama}>
                                        Pindah ke: {cls.nama}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4. MODALS (Popups)
          ========================================================================= */}

      {/* A. LEMBAGA CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isLembagaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {editingLembaga ? 'Edit Lembaga' : 'Buat Lembaga Baru'}
                </h3>
                <button
                  onClick={() => setIsLembagaModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Lembaga
                  </label>
                  <input
                    type="text"
                    value={lemNama}
                    onChange={(e) => setLemNama(e.target.value)}
                    placeholder="Contoh: Madrasah Aliyah"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    Logo Lembaga (Opsional)
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {lemLogo ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm bg-white">
                        <img src={lemLogo} alt="Logo preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setLemLogo('')}
                          className="absolute inset-0 bg-black/65 hover:bg-black/80 flex items-center justify-center text-white text-[10px] font-black tracking-wider transition-colors"
                        >
                          HAPUS
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-white text-slate-300 shrink-0">
                        <School className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setLemLogo(evt.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="logo-upload-input"
                      />
                      <label
                        htmlFor="logo-upload-input"
                        className="inline-block bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors border border-slate-200 shadow-sm"
                      >
                        PILIH GAMBAR
                      </label>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">PNG, JPG, maks. 2MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLembagaModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleSaveLembaga}
                  disabled={!lemNama.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  SIMPAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. KELAS CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isKelasModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
                </h3>
                <button
                  onClick={() => setIsKelasModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={kelNama}
                    onChange={(e) => setKelNama(e.target.value)}
                    placeholder="Contoh: Kelas 10-A"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    Nama Wali Kelas
                  </label>
                  <input
                    type="text"
                    value={kelWali}
                    onChange={(e) => setKelWali(e.target.value)}
                    placeholder="Nama lengkap ustadz / ustadzah dsb."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Tingkatan
                    </label>
                    <select
                      value={kelTingkat}
                      onChange={(e) => setKelTingkat(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-bold text-slate-600 focus:border-emerald-500 outline-none"
                    >
                      <option value="Ula">Ula</option>
                      <option value="Wustho">Wustho</option>
                      <option value="Ulya">Ulya</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Kapasitas Maksimal
                    </label>
                    <input
                      type="number"
                      value={kelKapasitas}
                      onChange={(e) => setKelKapasitas(Number(e.target.value))}
                      placeholder="40"
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-mono text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsKelasModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleSaveKelas}
                  disabled={!kelNama.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  SIMPAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. SANTRI DETAIL BIODATA MODAL */}
      {selectedSantriForDetail && (
        <SantriDetailModal
          selectedSantri={selectedSantriForDetail}
          onClose={() => setSelectedSantriForDetail(null)}
        />
      )}

    </div>
  );
}
