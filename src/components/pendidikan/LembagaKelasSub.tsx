import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  School, Plus, Trash2, Edit, Users, BookOpen, ChevronRight, 
  ArrowLeft, Search, GraduationCap, ArrowLeftRight, Check, CheckCircle2, 
  UserCheck, AlertCircle, X, MoreVertical, Award, ShieldAlert, UserMinus, ArrowRightLeft
} from 'lucide-react';
import { Lembaga, Kelas, Santri, KategoriRombel, KelompokRombel, RombelAssignment } from '../../types';
import SantriDetailModal from '../sekretaris/SantriDetailModal';
import { PUTRA_AVATAR, PUTRI_AVATAR } from '../SekretarisHelper';

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
  
  // selectedLembaga can represent either a real Lembaga (Formal/Internal) or a KategoriRombel (Rombel)
  const [selectedLembaga, setSelectedLembaga] = useState<any | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<any | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionStudentId, setActiveActionStudentId] = useState<string | null>(null);
  
  // Modal Trigger States
  const [selectedSantriForDetail, setSelectedSantriForDetail] = useState<Santri | null>(null);
  const [transferStudent, setTransferStudent] = useState<Santri | null>(null);
  const [destClassId, setDestClassId] = useState<string>('');
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Dropdowns
  const [activeMenuLembagaId, setActiveMenuLembagaId] = useState<string | null>(null);
  const [activeMenuKelasId, setActiveMenuKelasId] = useState<string | null>(null);
  
  // Create / Edit Lembaga (or Kategori Rombel) Modal States
  const [isLembagaModalOpen, setIsLembagaModalOpen] = useState(false);
  const [editingLembaga, setEditingLembaga] = useState<any | null>(null);
  const [lemNama, setLemNama] = useState('');
  const [lemLogo, setLemLogo] = useState('');
  const [lemDeskripsi, setLemDeskripsi] = useState('');

  // Create / Edit Kelas (or Kelompok Rombel) Modal States
  const [isKelasModalOpen, setIsKelasModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<any | null>(null);
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

  // Helper: Resolve Lembaga type
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

  // --- Dynamic Unified Institutions Builder ---
  const getCurrentInstitutions = () => {
    if (activeTab === 'Rombel') {
      return categoriesList.map(c => {
        const groups = groupsList.filter(g => g.kategoriId === c.id);
        const studentCount = groups.reduce((sum, g) => {
          const assignedIds = assignmentsList
            .filter(a => a.kelompokId === g.id)
            .map(a => a.santriId);
          const members = santriList.filter(s => assignedIds.includes(s.id) && s.gender === selectedGender);
          return sum + members.length;
        }, 0);

        return {
          id: c.id,
          nama: c.nama,
          kode: 'ROMBEL',
          deskripsi: c.deskripsi || 'Kategori Rombongan Belajar',
          logo: '',
          gender: selectedGender,
          jenis: 'Rombel',
          classesCount: groups.length,
          studentsCount: studentCount
        };
      });
    } else {
      return filteredLembagas.map(l => {
        const classes = getClassesOfLembaga(l.id);
        const studentsCount = getLembagaStudentCount(l);
        return {
          id: l.id,
          nama: l.nama,
          kode: l.kode,
          deskripsi: l.deskripsi || '',
          logo: l.logo || '',
          gender: l.gender,
          jenis: getLembagaJenis(l),
          classesCount: classes.length,
          studentsCount: studentsCount
        };
      });
    }
  };

  const institutions = getCurrentInstitutions();

  // --- Dynamic Unified Classes Builder ---
  const getSubClassesOfSelected = () => {
    if (!selectedLembaga) return [];
    if (activeTab === 'Rombel') {
      return groupsList
        .filter(g => g.kategoriId === selectedLembaga.id)
        .map(g => ({
          id: g.id,
          nama: g.nama,
          waliKelas: g.pembimbing,
          tingkatan: 'Lainnya',
          kapasitas: g.kuota || 20,
          lembagaId: selectedLembaga.id
        }));
    } else {
      return getClassesOfLembaga(selectedLembaga.id);
    }
  };

  const subClasses = getSubClassesOfSelected();

  // --- Dynamic Unified Students Getter ---
  const getStudentsInSelectedClass = () => {
    if (!selectedKelas) return [];
    if (activeTab === 'Rombel') {
      const assignedIds = assignmentsList
        .filter(a => a.kelompokId === selectedKelas.id)
        .map(a => a.santriId);
      return santriList.filter(s => assignedIds.includes(s.id) && s.gender === selectedGender);
    } else {
      return getStudentsInClass(selectedKelas, selectedLembaga);
    }
  };

  const currentClassStudents = getStudentsInSelectedClass();

  // Filtered students by search query
  const filteredStudents = currentClassStudents.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.nama.toLowerCase().includes(q) ||
      (s.nis && s.nis.toLowerCase().includes(q)) ||
      (s.nisn && s.nisn.toLowerCase().includes(q)) ||
      (s.nism && s.nism.toLowerCase().includes(q))
    );
  });

  // --- Automatical Selection of Topmost Class ---
  useEffect(() => {
    if (selectedLembaga) {
      const classes = getSubClassesOfSelected();
      if (classes.length > 0) {
        // Find if selectedKelas is already in this new list, otherwise fallback to the first
        const stillExists = classes.find(c => c.id === selectedKelas?.id);
        if (!stillExists) {
          setSelectedKelas(classes[0]);
        }
      } else {
        setSelectedKelas(null);
      }
    } else {
      setSelectedKelas(null);
    }
    setSearchQuery('');
    setActiveActionStudentId(null);
  }, [selectedLembaga, activeTab]);

  // --- CRUD Handlers ---
  const handleOpenLembagaModal = (lem: any = null) => {
    if (lem) {
      setEditingLembaga(lem);
      setLemNama(lem.nama);
      setLemLogo(lem.logo || '');
      setLemDeskripsi(lem.deskripsi || '');
    } else {
      setEditingLembaga(null);
      setLemNama('');
      setLemLogo('');
      setLemDeskripsi('');
    }
    setIsLembagaModalOpen(true);
  };

  const handleSaveLembaga = async () => {
    if (!lemNama.trim()) return;

    if (activeTab === 'Rombel') {
      if (editingLembaga) {
        if (onUpdateCategory) {
          await onUpdateCategory({
            id: editingLembaga.id,
            nama: lemNama.trim(),
            deskripsi: lemDeskripsi.trim()
          });
          showToast('Kategori rombel berhasil diperbarui.');
          // Update selectedLembaga reference if active
          if (selectedLembaga?.id === editingLembaga.id) {
            setSelectedLembaga({
              ...selectedLembaga,
              nama: lemNama.trim(),
              deskripsi: lemDeskripsi.trim()
            });
          }
        }
      } else {
        if (onAddCategory) {
          const newId = 'R-' + Date.now();
          await onAddCategory({
            id: newId,
            nama: lemNama.trim(),
            deskripsi: lemDeskripsi.trim()
          });
          showToast('Kategori rombel baru berhasil dibuat.');
        }
      }
    } else {
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
          nama: lemNama.trim(),
          logo: lemLogo || undefined,
          deskripsi: lemDeskripsi.trim()
        });
        showToast('Lembaga berhasil diperbarui.');
        if (selectedLembaga?.id === editingLembaga.id) {
          setSelectedLembaga({
            ...selectedLembaga,
            nama: lemNama.trim(),
            logo: lemLogo || undefined,
            deskripsi: lemDeskripsi.trim()
          });
        }
      } else {
        const newLembagaId = 'L-' + Date.now();
        let autoKode = generateInitials(lemNama) || 'LEM';
        
        let baseKode = autoKode;
        let counter = 1;
        while (lembagasList.some(l => l.kode === autoKode && l.gender === selectedGender)) {
          autoKode = `${baseKode}${counter}`;
          counter++;
        }

        const savedLem = await onAddLembaga({
          id: newLembagaId,
          nama: lemNama.trim(),
          kode: autoKode,
          gender: selectedGender,
          jenis: activeTab,
          logo: lemLogo || undefined,
          deskripsi: lemDeskripsi.trim()
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

        showToast('Lembaga baru berhasil dibuat beserta kelas default.');
      }
    }

    setIsLembagaModalOpen(false);
  };

  const handleDeleteLembagaClick = (id: string, name: string) => {
    const isRombel = activeTab === 'Rombel';
    const typeLabel = isRombel ? 'kategori rombel' : 'lembaga';
    if (confirm(`Apakah Anda yakin ingin menghapus ${typeLabel} "${name}" beserta seluruh kelas/kelompok di dalamnya?`)) {
      if (isRombel) {
        if (onDeleteCategory) {
          onDeleteCategory(id);
          showToast('Kategori rombel berhasil dihapus.');
        }
      } else {
        onDeleteLembaga(id);
        showToast('Lembaga berhasil dihapus.');
      }
      if (selectedLembaga?.id === id) {
        setSelectedLembaga(null);
        setSelectedKelas(null);
      }
    }
  };

  const handleOpenKelasModal = (kel: any = null) => {
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

    if (activeTab === 'Rombel') {
      if (editingKelas) {
        if (onUpdateGroup) {
          onUpdateGroup({
            id: editingKelas.id,
            kategoriId: selectedLembaga.id,
            nama: kelNama.trim(),
            pembimbing: kelWali.trim() || '-',
            kuota: Number(kelKapasitas)
          });
          showToast('Kelompok rombel berhasil diperbarui.');
          if (selectedKelas?.id === editingKelas.id) {
            setSelectedKelas({
              ...selectedKelas,
              nama: kelNama.trim(),
              waliKelas: kelWali.trim() || '-',
              kapasitas: Number(kelKapasitas)
            });
          }
        }
      } else {
        if (onAddGroup) {
          onAddGroup({
            id: 'G-' + Date.now(),
            kategoriId: selectedLembaga.id,
            nama: kelNama.trim(),
            pembimbing: kelWali.trim() || '-',
            kuota: Number(kelKapasitas)
          });
          showToast('Kelompok rombel baru berhasil ditambahkan.');
        }
      }
    } else {
      if (editingKelas) {
        onUpdateKelas({
          ...editingKelas,
          nama: kelNama.trim(),
          waliKelas: kelWali.trim() || '-',
          tingkatan: kelTingkat,
          kapasitas: Number(kelKapasitas)
        });
        showToast('Kelas berhasil diperbarui.');
        if (selectedKelas?.id === editingKelas.id) {
          setSelectedKelas({
            ...selectedKelas,
            nama: kelNama.trim(),
            waliKelas: kelWali.trim() || '-',
            tingkatan: kelTingkat,
            kapasitas: Number(kelKapasitas)
          });
        }
      } else {
        onAddKelas({
          id: 'K-' + Date.now(),
          lembagaId: selectedLembaga.id,
          nama: kelNama.trim(),
          waliKelas: kelWali.trim() || '-',
          tingkatan: kelTingkat,
          kapasitas: Number(kelKapasitas)
        });
        showToast('Kelas baru berhasil ditambahkan.');
      }
    }

    setIsKelasModalOpen(false);
  };

  const handleDeleteKelasClick = (id: string, name: string) => {
    if (activeTab !== 'Rombel' && (id.endsWith('-default') || name.toLowerCase() === 'calon pelajar')) {
      alert('Kelas ini adalah kelas wajib bawaan lembaga dan tidak dapat dihapus.');
      return;
    }
    const label = activeTab === 'Rombel' ? 'kelompok rombel' : 'kelas';
    if (confirm(`Apakah Anda yakin ingin menghapus ${label} "${name}"?`)) {
      if (activeTab === 'Rombel') {
        if (onDeleteGroup) {
          onDeleteGroup(id);
          showToast('Kelompok rombel berhasil dihapus.');
        }
      } else {
        onDeleteKelas(id);
        showToast('Kelas berhasil dihapus.');
      }
      if (selectedKelas?.id === id) {
        setSelectedKelas(null);
      }
    }
  };

  // --- Student Assignment Actions ---
  const handleRemoveStudentFromClass = (student: Santri) => {
    if (!selectedKelas) return;
    const label = activeTab === 'Rombel' ? 'kelompok' : 'kelas';
    if (confirm(`Apakah Anda yakin ingin mengeluarkan ${student.nama} dari ${label} "${selectedKelas.nama}"?`)) {
      if (activeTab === 'Rombel') {
        if (onRemoveAssignment) {
          onRemoveAssignment(student.id, selectedKelas.id);
          showToast(`${student.nama} dikeluarkan dari kelompok.`);
        }
      } else {
        // Move to default class "Calon Pelajar"
        onUpdateSantriClass(student.id, 'Calon Pelajar', selectedLembaga.id);
        showToast(`${student.nama} dipindahkan ke kelas Calon Pelajar.`);
      }
    }
  };

  const handleExecuteTransfer = () => {
    if (!transferStudent || !destClassId || !selectedKelas) return;
    
    if (activeTab === 'Rombel') {
      if (onRemoveAssignment && onAddAssignment) {
        // Remove from current
        onRemoveAssignment(transferStudent.id, selectedKelas.id);
        // Add to dest
        onAddAssignment({
          id: 'RA-' + Date.now(),
          santriId: transferStudent.id,
          kelompokId: destClassId,
          kategoriId: selectedLembaga.id
        });
        showToast(`${transferStudent.nama} berhasil dipindahkan.`);
      }
    } else {
      const destClassObj = subClasses.find(c => c.id === destClassId);
      if (destClassObj) {
        onUpdateSantriClass(transferStudent.id, destClassObj.nama, selectedLembaga.id);
        showToast(`${transferStudent.nama} dipindahkan ke kelas ${destClassObj.nama}.`);
      }
    }
    setTransferStudent(null);
    setDestClassId('');
  };

  // Get active students eligible to be added to this Class/Group
  const getEligibleStudentsForAdd = () => {
    if (!selectedKelas) return [];
    if (activeTab === 'Rombel') {
      // Students who are NOT already in this Rombel Group
      const alreadyAssignedIds = assignmentsList
        .filter(a => a.kelompokId === selectedKelas.id)
        .map(a => a.santriId);
      return santriList.filter(s => s.gender === selectedGender && s.statusKeanggotaan === 'Aktif' && !alreadyAssignedIds.includes(s.id));
    } else {
      // Students assigned to this institution, but currently in "Calon Pelajar" or unassigned
      const otherClasses = subClasses.filter(c => c.id !== selectedKelas.id);
      return santriList.filter(s => {
        if (s.gender !== selectedGender || s.statusKeanggotaan !== 'Aktif') return false;
        
        // Must belong to this institution
        const isFormal = s.pendidikanFormal === selectedLembaga.id;
        const isInternal = s.pendidikanInternal ? s.pendidikanInternal.split(',').map(x => x.trim()).includes(selectedLembaga.id) : false;
        if (!isFormal && !isInternal) return false;

        // Must not be in any other class of this institution
        const sClasses = s.kelas ? s.kelas.split(',').map(x => x.trim().toLowerCase()) : [];
        const inOtherClass = otherClasses.some(oc => sClasses.includes(oc.nama.toLowerCase()));
        
        return !inOtherClass && (sClasses.includes('calon pelajar') || !s.kelas);
      });
    }
  };

  const eligibleStudents = getEligibleStudentsForAdd();
  const searchedEligibleStudents = eligibleStudents.filter(s => 
    s.nama.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
    (s.nis && s.nis.toLowerCase().includes(addMemberSearch.toLowerCase()))
  );

  const handleAddMember = (student: Santri) => {
    if (!selectedKelas) return;
    if (activeTab === 'Rombel') {
      if (onAddAssignment) {
        onAddAssignment({
          id: 'RA-' + Date.now(),
          santriId: student.id,
          kelompokId: selectedKelas.id,
          kategoriId: selectedLembaga.id
        });
        showToast(`${student.nama} ditambahkan ke kelompok.`);
      }
    } else {
      onUpdateSantriClass(student.id, selectedKelas.nama, selectedLembaga.id);
      showToast(`${student.nama} dimasukkan ke kelas ${selectedKelas.nama}.`);
    }
  };

  // Render Student table avatars safely
  const renderStudentAvatar = (s: Santri) => {
    const fallback = s.gender === 'Putri' ? PUTRI_AVATAR : PUTRA_AVATAR;
    const src = s.filePasFoto && s.filePasFoto.trim() !== '' ? s.filePasFoto : fallback;
    return (
      <img 
        src={src} 
        alt={s.nama} 
        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
        referrerPolicy="no-referrer"
      />
    );
  };

  const canWriteCurrent = selectedGender === 'Putra' ? canWritePutra : canWritePutri;

  // Compute Verval stats
  const totalStudents = currentClassStudents.length;
  const verifiedCount = currentClassStudents.filter(s => s.nisn && s.nisn.trim() !== '').length;
  const pendingCount = totalStudents - verifiedCount;
  const verifiedPercent = totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* LOCAL TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {toast.type === 'success' ? (
                <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">!</div>
              )}
              <span className="text-xs font-bold">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header with Title & Gender Toggle Switcher (HIDDEN WHEN IN split-view) */}
      {!selectedLembaga && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
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
      )}

      {/* 2. Full Width Horizontal Tab Bar (HIDDEN WHEN IN split-view) */}
      {!selectedLembaga && (
        <div className="w-full border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
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

          {canWriteCurrent && (
            <button
              onClick={() => handleOpenLembagaModal()}
              className="mb-3 sm:mb-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{activeTab === 'Rombel' ? 'Buat Kategori Rombel' : 'Buat Lembaga'}</span>
            </button>
          )}
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <AnimatePresence mode="wait">
        
        {/* GRID OF CARDS (Formal, Internal, Rombel categories) when no institution/category selected */}
        {!selectedLembaga ? (
          <motion.div
            key="lembaga-grid-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {institutions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <School className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Belum Ada Satuan Data</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Belum ada data terdaftar untuk gender {selectedGender}. Silakan buat data baru untuk memulai penataan kelas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {institutions.map((l: any) => {
                  return (
                    <div
                      key={l.id}
                      onClick={() => setSelectedLembaga(l)}
                      className="group relative bg-white border border-slate-100 rounded-2xl cursor-pointer transition-all hover:border-slate-300 hover:shadow-md flex h-32 overflow-hidden"
                    >
                      {/* Logo or placeholder icon on the left */}
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
                            {activeTab === 'Rombel' ? (
                              <Award className="h-8 w-8 text-slate-300" />
                            ) : (
                              <School className="h-8 w-8 text-slate-300" />
                            )}
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                              {l.kode.slice(0, 5).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Content on the right */}
                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-base font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors truncate">
                                {l.nama}
                              </h3>
                              {l.deskripsi && (
                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                  {l.deskripsi}
                                </p>
                              )}
                            </div>

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
                                        className="w-full text-left px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuLembagaId(null);
                                          handleDeleteLembagaClick(l.id, l.nama);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
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
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{l.classesCount} {activeTab === 'Rombel' ? 'Kelompok' : 'Kelas'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{l.studentsCount} Santri</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
                 /* 3. WIDESCREEN 30/70 SPLIT LAYOUT (Halaman tampilan luas yang memanfaatkan seluruh lebar layar) */
          <motion.div
            key="split-view-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs animate-fade-in"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
              
              {/* LEFT COLUMN (30% Width - col-span-4) - Styled as a beautiful nested card inside the master wrapper */}
              <div className="lg:col-span-4 bg-slate-50/70 border border-slate-200/60 rounded-3xl p-5 flex flex-col relative min-h-[580px] overflow-hidden">
                
                {/* Top-Left Back Button */}
                <button
                  onClick={() => {
                    setSelectedLembaga(null);
                    setSelectedKelas(null);
                  }}
                  className="absolute top-4 left-4 w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
                  title="Kembali ke Daftar Unit"
                >
                  <ArrowLeft className="h-4.5 w-4.5 text-slate-600" />
                </button>

                {/* Center Logo & Name Header */}
                <div className="flex flex-col items-center text-center mt-5 mb-5">
                  {/* Circle Logo Container (No Outline) */}
                  <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-emerald-50 mb-3 shadow-3xs">
                    {selectedLembaga.logo ? (
                      <img 
                        src={selectedLembaga.logo} 
                        alt={selectedLembaga.nama} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : activeTab === 'Rombel' ? (
                      <Award className="h-10 w-10 text-emerald-600" />
                    ) : (
                      <School className="h-10 w-10 text-emerald-600" />
                    )}
                  </div>

                  {/* Institution Name */}
                  <h2 className="text-xl font-black text-slate-800 tracking-tight leading-tight uppercase px-4 truncate w-full">
                    {selectedLembaga.nama}
                  </h2>
                  
                  {/* Stats */}
                  <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wide">
                    {subClasses.length} {activeTab === 'Rombel' ? 'Kelompok' : 'Kelas'} &bull; {institutions.find(x => x.id === selectedLembaga.id)?.studentsCount || 0} Santri
                  </p>
                </div>

                {/* Nested Daftar Kelas Panel - Adjusted to full-width matching the parent card */}
                <div className="flex-1 bg-white/70 border-t border-slate-200/60 -mx-5 -mb-5 p-5 rounded-b-3xl flex flex-col min-h-[300px]">
                  {/* Centered Title */}
                  <div className="text-center pb-3 border-b border-slate-200/50 mb-4.5 flex items-center justify-between">
                    <div className="w-6" /> {/* spacer for balance */}
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                      Daftar {activeTab === 'Rombel' ? 'Rombel' : 'Kelas'}
                    </span>
                    {canWriteCurrent ? (
                      <button
                        onClick={() => handleOpenKelasModal()}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105 cursor-pointer shadow-xs"
                        title={activeTab === 'Rombel' ? 'Tambah Kelompok Rombel' : 'Tambah Kelas'}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="w-6" />
                    )}
                  </div>

                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1 scrollbar-thin">
                    {subClasses.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs font-medium italic">
                        Belum ada {activeTab === 'Rombel' ? 'kelompok' : 'kelas'} terdaftar.
                      </div>
                    ) : (
                      subClasses.map((c: any) => {
                        const isSelected = selectedKelas?.id === c.id;
                        const isDefault = activeTab !== 'Rombel' && (c.id.endsWith('-default') || c.nama.toLowerCase() === 'calon pelajar');
                        
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedKelas(c)}
                            className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between relative select-none ${
                              isSelected 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/50 shadow-2xs'
                            }`}
                          >
                            <span className="text-xs font-extrabold truncate uppercase pr-2">
                              {c.nama}
                            </span>

                            {/* Ellipsis menu button on the right */}
                            {canWriteCurrent && (
                              <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setActiveMenuKelasId(activeMenuKelasId === c.id ? null : c.id)}
                                  className={`p-1 rounded-md transition-colors ${
                                    isSelected 
                                      ? 'hover:bg-emerald-700 text-emerald-100' 
                                      : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                                  }`}
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {activeMenuKelasId === c.id && (
                                  <>
                                    <div className="fixed inset-0 z-20" onClick={() => setActiveMenuKelasId(null)} />
                                    <div className="absolute right-0 mt-1 w-24 bg-white border border-slate-200 rounded-lg shadow-md z-30 py-1 text-[10px] font-bold text-slate-700">
                                      <button
                                        onClick={() => {
                                          setActiveMenuKelasId(null);
                                          handleOpenKelasModal(c);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      {!isDefault && (
                                        <button
                                          onClick={() => {
                                            setActiveMenuKelasId(null);
                                            handleDeleteKelasClick(c.id, c.nama);
                                          }}
                                          className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 cursor-pointer"
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
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (70% Width - col-span-8) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {!selectedKelas ? (
                  <div className="flex-1 bg-transparent p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                    <GraduationCap className="h-16 w-16 text-slate-300 mb-4 animate-pulse" />
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Silakan Pilih Kelas</h3>
                    <p className="text-xs text-slate-400 max-w-xs mt-2 font-medium">
                      Pilih salah satu kelas di bawah naungan {selectedLembaga.nama} pada panel kiri untuk melihat daftar anggotanya.
                    </p>
                  </div>
                ) : (
                  <div className="bg-transparent p-0 flex flex-col flex-1 min-h-[500px]">
                    
                    {/* 1. Detail Kelas Card Top Section */}
                    <div className="flex items-start justify-between pb-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Detail Kelas</span>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase mt-1">
                          {selectedKelas.nama}
                        </h2>
                      </div>

                      {/* Class actions three-dot menu button */}
                      {canWriteCurrent && (
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setActiveMenuKelasId(activeMenuKelasId === `top-${selectedKelas.id}` ? null : `top-${selectedKelas.id}`)}
                            className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-3xs"
                            title="Menu Aksi Kelas"
                          >
                            <MoreVertical className="h-4.5 w-4.5" />
                          </button>
                          {activeMenuKelasId === `top-${selectedKelas.id}` && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveMenuKelasId(null)} />
                              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-bold text-slate-700">
                                <button
                                  onClick={() => {
                                    setActiveMenuKelasId(null);
                                    handleOpenKelasModal(selectedKelas);
                                  }}
                                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 cursor-pointer"
                                >
                                  Edit Kelas
                                </button>
                                {activeTab === 'Rombel' ? null : (
                                  <button
                                    onClick={() => {
                                      setActiveMenuKelasId(null);
                                      setAddMemberSearch('');
                                      setIsAddMemberModalOpen(true);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-emerald-600 cursor-pointer"
                                  >
                                    Tambah Anggota
                                  </button>
                                )}
                                {!(activeTab !== 'Rombel' && (selectedKelas.id.endsWith('-default') || selectedKelas.nama.toLowerCase() === 'calon pelajar')) && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuKelasId(null);
                                      handleDeleteKelasClick(selectedKelas.id, selectedKelas.nama);
                                    }}
                                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                  >
                                    Hapus Kelas
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Thin Horizontal Metadata Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-3 border-y border-slate-200 text-xs font-bold text-slate-500 mb-6 shrink-0 bg-slate-50/30 px-2 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase shrink-0">Wali Kelas:</span>
                        <span className="text-slate-800 truncate">{selectedKelas.waliKelas || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-center">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase shrink-0">Jumlah Anggota:</span>
                        <span className="text-slate-800 font-mono">{totalStudents} Santri</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-center">
                        <span className="text-emerald-600 font-mono">{verifiedCount} Sukses Verval</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className="text-rose-600 font-mono">{pendingCount} Proses Verval</span>
                      </div>
                    </div>

                    {/* 3. TABLE CONTAINER (Header + Detail Anggota scroll section) */}
                    <div className="flex-1 flex flex-col min-h-[300px] border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-3xs">
                      
                      {/* Header Tabel Box */}
                      <div className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0 px-4 py-3">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-1 text-center">No</div>
                          <div className="col-span-4">Nama Lengkap / NIS</div>
                          <div className="col-span-2">NISN</div>
                          <div className="col-span-2">NISM</div>
                          <div className="col-span-2">Keanggotaan</div>
                          <div className="col-span-1 text-center">Aksi</div>
                        </div>
                      </div>

                      {/* Detail Anggota List Area */}
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[360px] pr-1">
                        {filteredStudents.length === 0 ? (
                          <div className="py-16 text-center text-slate-400 font-medium italic text-xs">
                            Belum ada santri terdaftar di kelas/kelompok ini.
                          </div>
                        ) : (
                          filteredStudents.map((s, idx) => {
                            const isNisnValid = s.nisn && s.nisn.trim() !== '';
                            const isNismValid = s.nism && s.nism.trim() !== '';

                            return (
                              <div key={s.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs text-slate-700 font-semibold hover:bg-slate-50/40 transition-colors">
                                {/* No */}
                                <div className="col-span-1 text-center font-mono text-slate-400">
                                  {idx + 1}
                                </div>

                                {/* Nama Lengkap with Avatar & NIS */}
                                <div className="col-span-4 flex items-center gap-3 min-w-0">
                                  {renderStudentAvatar(s)}
                                  <div className="min-w-0">
                                    <div
                                      onClick={() => setSelectedSantriForDetail(s)}
                                      className="font-extrabold text-slate-800 hover:text-emerald-700 hover:underline cursor-pointer transition-colors truncate"
                                      title="Lihat Biodata Lengkap"
                                    >
                                      {s.nama}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                      NIS: {s.nis || '-'}
                                    </div>
                                  </div>
                                </div>

                                {/* NISN */}
                                <div className="col-span-2 font-mono text-slate-600 truncate">
                                  {s.nisn || <span className="text-slate-300">-</span>}
                                </div>

                                {/* NISM */}
                                <div className="col-span-2 font-mono text-slate-600 truncate">
                                  {s.nism || <span className="text-slate-300">-</span>}
                                </div>

                                {/* Keanggotaan & Verval (combining into clean tags) */}
                                <div className="col-span-2 flex flex-col gap-1 items-start">
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${
                                    s.statusKeanggotaan === 'Aktif'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                      : 'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}>
                                    {s.statusKeanggotaan}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${
                                    isNisnValid
                                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                                      : 'bg-rose-50 border-rose-200 text-rose-700'
                                  }`}>
                                    {isNisnValid ? 'Verified' : 'Proses'}
                                  </span>
                                </div>

                                {/* Row Actions menu */}
                                <div className="col-span-1 text-center">
                                  {canWriteCurrent && (
                                    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => setActiveActionStudentId(activeActionStudentId === s.id ? null : s.id)}
                                        className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                        title="Opsi Aksi"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {activeActionStudentId === s.id && (
                                          <>
                                            <div className="fixed inset-0 z-35" onClick={() => setActiveActionStudentId(null)} />
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.95 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              exit={{ opacity: 0, scale: 0.95 }}
                                              className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-1 text-[11px] font-bold text-slate-700 text-left"
                                            >
                                              <button
                                                onClick={() => {
                                                  setSelectedSantriForDetail(s);
                                                  setActiveActionStudentId(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                                              >
                                                <UserCheck className="h-3.5 w-3.5" />
                                                <span>Pilih</span>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setTransferStudent(s);
                                                  setDestClassId('');
                                                  setActiveActionStudentId(null);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                                              >
                                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                                <span>Pindah</span>
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setActiveActionStudentId(null);
                                                  handleRemoveStudentFromClass(s);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer text-rose-600 border-t border-slate-50 mt-1"
                                              >
                                                <UserMinus className="h-3.5 w-3.5" />
                                                <span>Keluarkan</span>
                                              </button>
                                            </motion.div>
                                          </>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                    </div>

                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          4. MODALS (Popups)
          ========================================================================= */}

      {/* A. LEMBAGA / KATEGORI CREATE / EDIT MODAL */}
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
                  {activeTab === 'Rombel' 
                    ? (editingLembaga ? 'Edit Kategori Rombel' : 'Buat Kategori Rombel Baru')
                    : (editingLembaga ? 'Edit Lembaga' : 'Buat Lembaga Baru')
                  }
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
                    {activeTab === 'Rombel' ? 'Nama Kategori Rombel' : 'Nama Lembaga'}
                  </label>
                  <input
                    type="text"
                    value={lemNama}
                    onChange={(e) => setLemNama(e.target.value)}
                    placeholder={activeTab === 'Rombel' ? "Contoh: Halaqah Tahfidz Qur'an" : "Contoh: Madrasah Aliyah"}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-semibold text-slate-700"
                  />
                </div>

                {activeTab === 'Rombel' ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      Deskripsi Kategori
                    </label>
                    <textarea
                      value={lemDeskripsi}
                      onChange={(e) => setLemDeskripsi(e.target.value)}
                      placeholder="Tuliskan deskripsi singkat tujuan kelompok rombel ini..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-medium text-slate-750"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                        Deskripsi Lembaga (Opsional)
                      </label>
                      <input
                        type="text"
                        value={lemDeskripsi}
                        onChange={(e) => setLemDeskripsi(e.target.value)}
                        placeholder="Contoh: Unit Satuan Pendidikan Menengah Formal"
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
                              className="absolute inset-0 bg-black/65 hover:bg-black/80 flex items-center justify-center text-white text-[10px] font-black tracking-wider transition-colors cursor-pointer"
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
                  </>
                )}
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

      {/* B. KELAS / KELOMPOK CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isKelasModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {activeTab === 'Rombel'
                    ? (editingKelas ? 'Edit Kelompok Rombel' : 'Tambah Kelompok Rombel Baru')
                    : (editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru')
                  }
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
                    {activeTab === 'Rombel' ? 'Nama Kelompok Rombel' : 'Nama Kelas'}
                  </label>
                  <input
                    type="text"
                    value={kelNama}
                    onChange={(e) => setKelNama(e.target.value)}
                    placeholder={activeTab === 'Rombel' ? "Contoh: Halaqah A-1" : "Contoh: Kelas 10-A"}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 outline-none font-semibold text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    {activeTab === 'Rombel' ? 'Nama Pembimbing / Guru' : 'Nama Wali Kelas'}
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
                  {activeTab !== 'Rombel' && (
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
                  )}

                  <div className={activeTab === 'Rombel' ? "col-span-2" : ""}>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                      {activeTab === 'Rombel' ? 'Kuota Kelompok' : 'Kapasitas Maksimal'}
                    </label>
                    <input
                      type="number"
                      value={kelKapasitas}
                      onChange={(e) => setKelKapasitas(Number(e.target.value))}
                      placeholder="20"
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

      {/* C. PINDAH KELAS / TRANSFER STUDENT MODAL */}
      <AnimatePresence>
        {transferStudent && selectedKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  Pindahkan Santri
                </h3>
                <button onClick={() => setTransferStudent(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs font-medium text-slate-600">
                <p>
                  Pindahkan <strong className="text-slate-800 font-extrabold">{transferStudent.nama}</strong> dari kelas/kelompok <strong className="text-emerald-700 font-extrabold">"{selectedKelas.nama}"</strong> ke:
                </p>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Pilih Kelas Tujuan</label>
                  <select
                    value={destClassId}
                    onChange={(e) => setDestClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-750 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {subClasses
                      .filter(c => c.id !== selectedKelas.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nama} ({c.waliKelas})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                <button
                  onClick={() => setTransferStudent(null)}
                  className="px-3 py-1.5 border border-slate-250 text-slate-500 rounded-lg text-xs font-bold cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  onClick={handleExecuteTransfer}
                  disabled={!destClassId}
                  className="px-4.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  PINDAHKAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. TAMBAH ANGGOTA / MULTI ADD MEMBER MODAL */}
      <AnimatePresence>
        {isAddMemberModalOpen && selectedKelas && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    Tambah Anggota
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Memasukkan santri ke dalam {selectedKelas.nama}</p>
                </div>
                <button onClick={() => setIsAddMemberModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Inside Add Member Modal */}
              <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama santri eligible..."
                    value={addMemberSearch}
                    onChange={(e) => setAddMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-7 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/30 focus:border-emerald-500 focus:bg-white outline-none font-medium"
                  />
                  {addMemberSearch && (
                    <button onClick={() => setAddMemberSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scroll list of eligible candidates */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[250px]">
                {searchedEligibleStudents.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs italic">
                    {addMemberSearch ? 'Tidak ada santri yang cocok.' : 'Semua santri yang eligible telah terdaftar di kelas/kelompok ini.'}
                  </div>
                ) : (
                  searchedEligibleStudents.map(student => {
                    return (
                      <div key={student.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 flex items-center justify-between gap-3 text-xs transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderStudentAvatar(student)}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{student.nama}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIS: {student.nis || '-'} | Kamar: {student.kamar || '-'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddMember(student)}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg shadow-xs hover:bg-emerald-700 shrink-0 cursor-pointer"
                        >
                          TAMBAH
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-sm"
                >
                  SELESAI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. SANTRI DETAIL BIODATA MODAL */}
      {selectedSantriForDetail && (
        <SantriDetailModal
          selectedSantri={selectedSantriForDetail}
          onClose={() => setSelectedSantriForDetail(null)}
        />
      )}

    </div>
  );
}
