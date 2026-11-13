'use client';

import { getDataExportFilename, PrivacyService } from '@/service/privacy';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { downloadJsonFile } from '../../privacy.helpers';

export const usePrivacySection = () => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [hasSubscriptionConflict, setHasSubscriptionConflict] = useState(false);

  // O arquivo vai direto para o download: nada de guardar no cache
  const exportMutation = useMutation({
    mutationFn: () => PrivacyService.exportData(),
    gcTime: 0,
  });

  const handleDownload = useCallback(() => {
    exportMutation.mutate(undefined, {
      onSuccess: (data) => {
        downloadJsonFile(getDataExportFilename(), data);
        exportMutation.reset();
        toast.success('Arquivo baixado');
      },
      onError: () => toast.error('Não foi possível gerar o arquivo'),
    });
  }, [exportMutation]);

  const openDelete = useCallback(() => {
    setHasSubscriptionConflict(false);
    setIsDeleteOpen(true);
  }, []);

  return {
    handleDownload,
    isDownloading: exportMutation.isPending,
    isDeleteOpen,
    setIsDeleteOpen,
    openDelete,
    hasSubscriptionConflict,
    handleSubscriptionConflict: () => setHasSubscriptionConflict(true),
  };
};
