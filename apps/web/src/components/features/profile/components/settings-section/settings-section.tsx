'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  Separator,
} from '@repo/ui';
import { ChevronRight, Loader2, Shield, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useSettingsSection } from './settings-section.hook';

export const SettingsSection = () => {
  const {
    isOpenDisabledAccountAlert,
    setIsOpenDisabledAccountAlert,
    handleDeleteAccount,
    isDeletingUser,
  } = useSettingsSection();

  return (
    <>
      <motion.div
        key="settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="border-gray-200 py-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Privacidade e dados</h3>
                <p className="text-gray-600">
                  Gerencie suas informações pessoais
                </p>
              </div>
            </div>

            <Separator className="mb-8" />

            <div className="space-y-3">
              <button
                onClick={() => setIsOpenDisabledAccountAlert(true)}
                className="w-full flex items-center justify-between p-5 hover:bg-red-50 rounded-xl transition-all group border border-transparent hover:border-red-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-red-600 mb-1">Desativar conta</div>
                    <div className="text-gray-600">
                      Desativar sua conta e dados
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 mb-2">
                    Seus dados estão seguros
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    Protegemos suas informações com criptografia de ponta a
                    ponta e nunca as compartilhamos sem sua permissão.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={isOpenDisabledAccountAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar conta</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja desativar sua conta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsOpenDisabledAccountAlert(false)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingUser}
            >
              {isDeletingUser ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Desativar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
