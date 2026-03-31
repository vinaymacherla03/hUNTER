
import { useState, useEffect, useCallback } from 'react';
import { ResumeVersion, ResumeData, Customization, TemplateKey } from '../types';
import { toast } from 'sonner';

const VERSIONS_STORAGE_KEY = 'aiResumeBuilderVersions';

export const useResumeVersions = () => {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(VERSIONS_STORAGE_KEY);
        if (saved) {
            try {
                setVersions(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse versions", e);
            }
        }
    }, []);

    const saveVersion = useCallback((name: string, data: ResumeData, customization: Customization, template: TemplateKey, jobDescription?: string) => {
        const newVersion: ResumeVersion = {
            id: crypto.randomUUID(),
            name,
            timestamp: Date.now(),
            data,
            customization,
            template,
            jobDescription
        };

        const updated = [newVersion, ...versions];
        setVersions(updated);
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
        toast.success(`Version "${name}" saved successfully!`);
        return newVersion;
    }, [versions]);

    const deleteVersion = useCallback((id: string) => {
        const updated = versions.filter(v => v.id !== id);
        setVersions(updated);
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
        toast.info("Version deleted");
    }, [versions]);

    const renameVersion = useCallback((id: string, newName: string) => {
        const updated = versions.map(v => v.id === id ? { ...v, name: newName } : v);
        setVersions(updated);
        localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(updated));
        toast.success("Version renamed");
    }, [versions]);

    return {
        versions,
        saveVersion,
        deleteVersion,
        renameVersion
    };
};
