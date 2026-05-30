
import { useState, useEffect, useCallback } from 'react';
import { ResumeData, Customization, TemplateKey, ResumeVersion } from '../types';
import { versionService } from '../services/versionService';
import { auth } from '../services/firebase';
import { toast } from 'sonner';

export const useResumeVersions = () => {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVersions = useCallback(async () => {
        if (!auth.currentUser) {
            setVersions([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await versionService.getVersions();
            setVersions(data);
        } catch (error) {
            console.error("Error fetching versions:", error);
            toast.error("Failed to load versions.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const saveVersion = useCallback(async (name: string, data: ResumeData, customization: Customization, template: TemplateKey, jobDescription?: string) => {
        if (!auth.currentUser) {
            toast.error("Please sign in to save versions.");
            return;
        }

        setIsLoading(true);
        try {
            const resumeDataWithMeta = {
                ...data,
                // We store customization and template inside the data or as separate fields?
                // The versionService expects ResumeData. Let's wrap it if needed or adjust service.
            };
            
            // Actually, let's store customization and template as part of the document for easier retrieval
            // But the service currently takes ResumeData.
            // Let's modify the service to be more flexible or just include them in the data object for now.
            
            const fullData = {
                ...data,
                _customization: customization,
                _template: template,
                _jobDescription: jobDescription
            } as any;

            await versionService.saveVersion(name, fullData);
            toast.success(`Version "${name}" saved successfully!`);
            await fetchVersions();
        } catch (error) {
            console.error("Error saving version:", error);
            toast.error("Failed to save version.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchVersions]);

    const deleteVersion = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await versionService.deleteVersion(id);
            toast.info("Version deleted");
            await fetchVersions();
        } catch (error) {
            console.error("Error deleting version:", error);
            toast.error("Failed to delete version.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchVersions]);

    const renameVersion = useCallback(async (id: string, newName: string) => {
        setIsLoading(true);
        try {
            await versionService.updateVersion(id, { name: newName });
            toast.success("Version renamed");
            await fetchVersions();
        } catch (error) {
            console.error("Error renaming version:", error);
            toast.error("Failed to rename version.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchVersions]);

    return {
        versions,
        isLoading,
        saveVersion,
        deleteVersion,
        renameVersion,
        refreshVersions: fetchVersions
    };
};
