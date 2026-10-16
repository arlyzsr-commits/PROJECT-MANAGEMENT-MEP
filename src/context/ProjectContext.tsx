import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  AuditLog,
  Building,
  DailyProgress,
  GlobalFilter,
  Issue,
  Language,
  PhotoDocument,
  Project,
  WorkItem,
} from '../types';
import {
  INITIAL_BUILDINGS,
  INITIAL_DAILY_PROGRESS,
  INITIAL_ISSUES,
  INITIAL_PHOTOS,
  INITIAL_PROJECT,
  INITIAL_WORK_ITEMS,
} from '../lib/initialData';
import { translations } from '../lib/i18n';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

interface ProjectContextType {
  project: Project;
  buildings: Building[];
  workItems: WorkItem[];
  dailyProgressLogs: DailyProgress[];
  photoDocuments: PhotoDocument[];
  issues: Issue[];
  auditLogs: AuditLog[];
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  filters: GlobalFilter;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilter>>;
  loading: boolean;
  isManager: boolean;
  isSupervisor: boolean;
  isViewer: boolean;
  
  // Actions
  addBuilding: (building: Omit<Building, 'id' | 'projectId'>) => Promise<void>;
  updateBuilding: (id: string, updates: Partial<Building>) => Promise<void>;
  deleteBuilding: (id: string) => Promise<void>;

  addWorkItem: (item: Omit<WorkItem, 'id' | 'projectId'>) => Promise<void>;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => Promise<void>;
  deleteWorkItem: (id: string) => Promise<void>;

  addDailyProgress: (progress: Omit<DailyProgress, 'id' | 'projectId'>) => Promise<void>;
  updateDailyProgress: (id: string, updates: Partial<DailyProgress>) => Promise<void>;
  deleteDailyProgress: (id: string) => Promise<void>;
  approveDailyProgress: (id: string, approved: boolean) => Promise<void>;

  addPhotoDocument: (photo: Omit<PhotoDocument, 'id' | 'projectId'>) => Promise<void>;
  deletePhotoDocument: (id: string) => Promise<void>;

  addIssue: (issue: Omit<Issue, 'id' | 'projectId'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;

  logAuditAction: (actionType: AuditLog['actionType'], collectionName: string, docId: string, details: string, before?: any, after?: any) => Promise<void>;
  seedInitialDataIfEmpty: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, role, isManager, isSupervisor, isViewer } = useAuth();
  const [project, setProject] = useState<Project>(INITIAL_PROJECT);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [workItems, setWorkItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [dailyProgressLogs, setDailyProgressLogs] = useState<DailyProgress[]>(INITIAL_DAILY_PROGRESS);
  const [photoDocuments, setPhotoDocuments] = useState<PhotoDocument[]>(INITIAL_PHOTOS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<GlobalFilter>({});

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations.en[key] || String(key);
  };

  // Seed Firestore if empty
  const seedInitialDataIfEmpty = async () => {
    if (!currentUser) return;
    try {
      const bldSnap = await getDocs(collection(db, 'buildings'));
      if (bldSnap.empty) {
        console.log('Bootstrapping Balak Resort Firestore Collections...');
        const batch = writeBatch(db);
        
        // Project
        batch.set(doc(db, 'projects', INITIAL_PROJECT.id), INITIAL_PROJECT);
        
        // Buildings
        INITIAL_BUILDINGS.forEach((b) => {
          batch.set(doc(db, 'buildings', b.id), b);
        });

        // Work Items
        INITIAL_WORK_ITEMS.forEach((w) => {
          batch.set(doc(db, 'workItems', w.id), w);
        });

        // Daily Progress
        INITIAL_DAILY_PROGRESS.forEach((dp) => {
          batch.set(doc(db, 'dailyProgress', dp.id), dp);
        });

        // Photos
        INITIAL_PHOTOS.forEach((p) => {
          batch.set(doc(db, 'photoDocuments', p.id), p);
        });

        // Issues
        INITIAL_ISSUES.forEach((iss) => {
          batch.set(doc(db, 'issues', iss.id), iss);
        });

        await batch.commit();
        console.log('Balak Resort Firestore seed completed.');
      }
    } catch (err) {
      console.warn('Seed operation caught error (likely rules or offline):', err);
    }
  };

  // Attach Firestore listeners
  useEffect(() => {
    if (!currentUser) {
      // In offline / guest view, use cached initial data
      setLoading(false);
      return;
    }

    seedInitialDataIfEmpty();

    const unsubBuildings = onSnapshot(
      collection(db, 'buildings'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Building));
          setBuildings(list);
        }
      },
      (error) => {
        console.warn('Buildings snapshot notice (using local cache):', error.message);
      }
    );

    const unsubWorkItems = onSnapshot(
      collection(db, 'workItems'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as WorkItem));
          setWorkItems(list);
        }
      },
      (error) => {
        console.warn('WorkItems snapshot notice:', error.message);
      }
    );

    const unsubDaily = onSnapshot(
      collection(db, 'dailyProgress'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as DailyProgress));
          setDailyProgressLogs(list);
        }
      },
      (error) => {
        console.warn('DailyProgress snapshot notice:', error.message);
      }
    );

    const unsubPhotos = onSnapshot(
      collection(db, 'photoDocuments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as PhotoDocument));
          setPhotoDocuments(list);
        }
      },
      (error) => {
        console.warn('PhotoDocuments snapshot notice:', error.message);
      }
    );

    const unsubIssues = onSnapshot(
      collection(db, 'issues'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Issue));
          setIssues(list);
        }
      },
      (error) => {
        console.warn('Issues snapshot notice:', error.message);
      }
    );

    const unsubAudit = onSnapshot(
      collection(db, 'auditLogs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as AuditLog));
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setAuditLogs(list);
        }
      },
      (error) => {
        console.warn('AuditLogs snapshot notice:', error.message);
      }
    );

    setLoading(false);

    return () => {
      unsubBuildings();
      unsubWorkItems();
      unsubDaily();
      unsubPhotos();
      unsubIssues();
      unsubAudit();
    };
  }, [currentUser]);

  // Audit Log helper
  const logAuditAction = async (
    actionType: AuditLog['actionType'],
    collectionName: string,
    docId: string,
    details: string,
    beforeData?: any,
    afterData?: any
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId: project.id,
      userId: currentUser?.uid || 'system-offline',
      userEmail: currentUser?.email || 'user@balakresort.com',
      timestamp: new Date().toISOString(),
      actionType,
      collection: collectionName,
      documentId: docId,
      beforeData: beforeData ? JSON.stringify(beforeData) : undefined,
      afterData: afterData ? JSON.stringify(afterData) : undefined,
      details,
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
    } catch (err) {
      console.warn('Audit log write saved locally:', err);
    }
  };

  // Building Actions
  const addBuilding = async (data: Omit<Building, 'id' | 'projectId'>) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const id = `bld-${Date.now().toString(36)}`;
    const newBuilding: Building = {
      ...data,
      id,
      projectId: project.id,
      createdAt: new Date().toISOString(),
    };
    setBuildings((prev) => [...prev, newBuilding]);
    await logAuditAction('CREATE', 'buildings', id, `Added building ${newBuilding.name}`, null, newBuilding);
    try {
      await setDoc(doc(db, 'buildings', id), newBuilding);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `buildings/${id}`);
    }
  };

  const updateBuilding = async (id: string, updates: Partial<Building>) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = buildings.find((b) => b.id === id);
    setBuildings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    await logAuditAction('UPDATE', 'buildings', id, `Updated building ${before?.name || id}`, before, updates);
    try {
      await updateDoc(doc(db, 'buildings', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `buildings/${id}`);
    }
  };

  const deleteBuilding = async (id: string) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = buildings.find((b) => b.id === id);
    setBuildings((prev) => prev.filter((b) => b.id !== id));
    await logAuditAction('DELETE', 'buildings', id, `Deleted building ${before?.name || id}`, before, null);
    try {
      await deleteDoc(doc(db, 'buildings', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `buildings/${id}`);
    }
  };

  // Work Item Actions
  const addWorkItem = async (data: Omit<WorkItem, 'id' | 'projectId'>) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const id = `wi-${Date.now().toString(36)}`;
    const newItem: WorkItem = {
      ...data,
      id,
      projectId: project.id,
      completedQuantity: data.completedQuantity || 0,
      progressPercentage: data.progressPercentage || 0,
      createdAt: new Date().toISOString(),
    };
    setWorkItems((prev) => [...prev, newItem]);
    await logAuditAction('CREATE', 'workItems', id, `Added work item ${newItem.subcategory} at ${newItem.buildingName}`, null, newItem);
    try {
      await setDoc(doc(db, 'workItems', id), newItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `workItems/${id}`);
    }
  };

  const updateWorkItem = async (id: string, updates: Partial<WorkItem>) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = workItems.find((w) => w.id === id);
    setWorkItems((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    await logAuditAction('UPDATE', 'workItems', id, `Updated work item ${before?.subcategory || id}`, before, updates);
    try {
      await updateDoc(doc(db, 'workItems', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `workItems/${id}`);
    }
  };

  const deleteWorkItem = async (id: string) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = workItems.find((w) => w.id === id);
    setWorkItems((prev) => prev.filter((w) => w.id !== id));
    await logAuditAction('DELETE', 'workItems', id, `Deleted work item ${before?.subcategory || id}`, before, null);
    try {
      await deleteDoc(doc(db, 'workItems', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `workItems/${id}`);
    }
  };

  // Daily Progress Actions
  const addDailyProgress = async (data: Omit<DailyProgress, 'id' | 'projectId'>) => {
    if (!isManager && !isSupervisor) throw new Error(t('access_restricted'));
    const id = `dp-${Date.now().toString(36)}`;
    
    // Auto status: Manager creates Approved, Supervisor creates Submitted (workflow requirement)
    const status: DailyProgress['status'] = isManager ? (data.status || 'Approved') : 'Submitted';

    const newLog: DailyProgress = {
      ...data,
      id,
      projectId: project.id,
      status,
      submittedBy: currentUser?.displayName || currentUser?.email || 'Supervisor',
      approvedBy: isManager ? currentUser?.displayName || 'Manager' : undefined,
      createdAt: new Date().toISOString(),
    };

    setDailyProgressLogs((prev) => [newLog, ...prev]);

    // If approved immediately by manager, update work item cumulative quantity and percentage
    if (status === 'Approved') {
      const item = workItems.find((w) => w.id === newLog.workItemId);
      if (item) {
        const newCompleted = Math.min(item.boqQuantity, newLog.currentCumulativeQuantity);
        const newPct = Number(((newCompleted / item.boqQuantity) * 100).toFixed(1));
        const newStatus = newPct >= 100 ? 'Completed' : 'In Progress';
        updateWorkItem(item.id, {
          completedQuantity: newCompleted,
          progressPercentage: newPct,
          status: newStatus,
        });
      }
    }

    await logAuditAction('CREATE', 'dailyProgress', id, `Logged daily progress for ${newLog.subcategory} (${newLog.dailyCompletedQuantity})`, null, newLog);

    try {
      await setDoc(doc(db, 'dailyProgress', id), newLog);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `dailyProgress/${id}`);
    }
  };

  const updateDailyProgress = async (id: string, updates: Partial<DailyProgress>) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = dailyProgressLogs.find((d) => d.id === id);
    setDailyProgressLogs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    await logAuditAction('UPDATE', 'dailyProgress', id, `Modified progress log ${before?.reportId || id}`, before, updates);
    try {
      await updateDoc(doc(db, 'dailyProgress', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `dailyProgress/${id}`);
    }
  };

  const deleteDailyProgress = async (id: string) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = dailyProgressLogs.find((d) => d.id === id);
    setDailyProgressLogs((prev) => prev.filter((d) => d.id !== id));
    await logAuditAction('DELETE', 'dailyProgress', id, `Deleted progress log ${before?.reportId || id}`, before, null);
    try {
      await deleteDoc(doc(db, 'dailyProgress', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `dailyProgress/${id}`);
    }
  };

  const approveDailyProgress = async (id: string, approved: boolean) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const log = dailyProgressLogs.find((d) => d.id === id);
    if (!log) return;

    const newStatus: DailyProgress['status'] = approved ? 'Approved' : 'Rejected';
    const updates = {
      status: newStatus,
      approvedBy: currentUser?.displayName || currentUser?.email || 'Manager',
    };

    setDailyProgressLogs((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    if (approved) {
      const item = workItems.find((w) => w.id === log.workItemId);
      if (item) {
        const newCompleted = Math.min(item.boqQuantity, log.currentCumulativeQuantity);
        const newPct = Number(((newCompleted / item.boqQuantity) * 100).toFixed(1));
        const newStatus = newPct >= 100 ? 'Completed' : 'In Progress';
        updateWorkItem(item.id, {
          completedQuantity: newCompleted,
          progressPercentage: newPct,
          status: newStatus,
        });
      }
    }

    await logAuditAction(approved ? 'APPROVE' : 'REJECT', 'dailyProgress', id, `${approved ? 'Approved' : 'Rejected'} submission ${log.reportId}`);
    try {
      await updateDoc(doc(db, 'dailyProgress', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `dailyProgress/${id}`);
    }
  };

  // Photo Document Actions
  const addPhotoDocument = async (photo: Omit<PhotoDocument, 'id' | 'projectId'>) => {
    if (!isManager && !isSupervisor) throw new Error(t('access_restricted'));
    const id = `photo-${Date.now().toString(36)}`;
    const newDoc: PhotoDocument = {
      ...photo,
      id,
      projectId: project.id,
      createdAt: new Date().toISOString(),
    };
    setPhotoDocuments((prev) => [newDoc, ...prev]);
    await logAuditAction('CREATE', 'photoDocuments', id, `Added photo for ${newDoc.buildingName} - ${newDoc.category}`, null, newDoc);
    try {
      await setDoc(doc(db, 'photoDocuments', id), newDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `photoDocuments/${id}`);
    }
  };

  const deletePhotoDocument = async (id: string) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = photoDocuments.find((p) => p.id === id);
    setPhotoDocuments((prev) => prev.filter((p) => p.id !== id));
    await logAuditAction('DELETE', 'photoDocuments', id, `Deleted photo document ${id}`, before, null);
    try {
      await deleteDoc(doc(db, 'photoDocuments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `photoDocuments/${id}`);
    }
  };

  // Issue Actions
  const addIssue = async (data: Omit<Issue, 'id' | 'projectId'>) => {
    if (!isManager && !isSupervisor) throw new Error(t('access_restricted'));
    const id = `iss-${Date.now().toString(36)}`;
    const newIssue: Issue = {
      ...data,
      id,
      projectId: project.id,
      createdAt: new Date().toISOString(),
    };
    setIssues((prev) => [newIssue, ...prev]);
    await logAuditAction('CREATE', 'issues', id, `Logged issue: ${newIssue.description.substring(0, 40)}`, null, newIssue);
    try {
      await setDoc(doc(db, 'issues', id), newIssue);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${id}`);
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    if (!isManager && !isSupervisor) throw new Error(t('access_restricted'));
    const before = issues.find((i) => i.id === id);
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    await logAuditAction('UPDATE', 'issues', id, `Updated issue ${id} to status ${updates.status || before?.status}`, before, updates);
    try {
      await updateDoc(doc(db, 'issues', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `issues/${id}`);
    }
  };

  const deleteIssue = async (id: string) => {
    if (!isManager) throw new Error(t('access_restricted'));
    const before = issues.find((i) => i.id === id);
    setIssues((prev) => prev.filter((i) => i.id !== id));
    await logAuditAction('DELETE', 'issues', id, `Deleted issue ${id}`, before, null);
    try {
      await deleteDoc(doc(db, 'issues', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `issues/${id}`);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        project,
        buildings,
        workItems,
        dailyProgressLogs,
        photoDocuments,
        issues,
        auditLogs,
        language,
        setLanguage,
        t,
        filters,
        setFilters,
        loading,
        isManager,
        isSupervisor,
        isViewer,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addWorkItem,
        updateWorkItem,
        deleteWorkItem,
        addDailyProgress,
        updateDailyProgress,
        deleteDailyProgress,
        approveDailyProgress,
        addPhotoDocument,
        deletePhotoDocument,
        addIssue,
        updateIssue,
        deleteIssue,
        logAuditAction,
        seedInitialDataIfEmpty,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
