import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Badge, Button, Spinner, TabsContent } from '@repo/ui';
import {
  Calendar,
  Edit,
  Mail,
  Pause,
  Phone,
  Play,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  getRoleColor,
  getRoleIcon,
  getRoleLabel,
} from '../../../../utils/stores-module.helpers';
import { useProfessionalTab } from './professional-tab.hook';

export const ProfessionalTab = () => {
  const {
    professionals,
    isLoadingProfessionals,
    isErrorProfessionals,
    refetchProfessionals,
    professionalsUsage,
    handleAddProfessional,
    handleUpgrade,
    handleDeleteProfessional,
    handleToggleProfessionalStatus,
  } = useProfessionalTab();

  const isAddDisabled =
    isLoadingProfessionals ||
    isErrorProfessionals ||
    !!professionalsUsage?.isAtLimit;

  return (
    <TabsContent value="staff" className="space-y-4 mt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm text-gray-900">Equipe da Loja</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isLoadingProfessionals
              ? 'Carregando colaboradores...'
              : isErrorProfessionals
                ? 'Não foi possível carregar a equipe'
                : `${professionals.length} ${
                    professionals.length === 1 ? 'colaborador' : 'colaboradores'
                  } nesta loja`}
            {professionalsUsage && !isLoadingProfessionals
              ? ` · ${professionalsUsage.label}`
              : null}
          </p>
        </div>
        {professionalsUsage?.isAtLimit ? (
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="bg-gray-900 hover:bg-gray-800 text-white min-h-[44px] sm:min-h-[36px] w-full sm:w-auto"
          >
            Fazer upgrade
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => handleAddProfessional()}
            disabled={isAddDisabled}
            className="bg-gray-900 hover:bg-gray-800 text-white min-h-[44px] sm:min-h-[36px] w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Colaborador
          </Button>
        )}
      </div>

      {professionalsUsage?.isAtLimit ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            Limite de profissionais do plano atingido (
            {professionalsUsage.current}/{professionalsUsage.limit}). Faça
            upgrade para adicionar mais colaboradores.
          </p>
        </div>
      ) : null}

      {isLoadingProfessionals ? (
        <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Spinner />
        </div>
      ) : isErrorProfessionals ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <Users className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-600">
            Erro ao carregar colaboradores desta loja
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchProfessionals()}
            className="border-gray-200"
          >
            Tentar novamente
          </Button>
        </div>
      ) : professionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professionals.map((professional) => {
            const RoleIcon = getRoleIcon(professional.role);
            const hasFullData =
              professional.user.firstName &&
              professional.user.lastName &&
              professional.user.telephone;

            return (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 ${
                  !professional.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Status Indicator */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    professional.isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gray-300'
                  }`}
                />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    {professional.user.avatar ? (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 ring-2 ring-gray-100">
                        <ImageWithFallback
                          src={professional.user.avatar}
                          alt={professional.user.firstName}
                          fill
                          sizes="(min-width: 728px) 48px, 32px"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                          professional.isActive
                            ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <RoleIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm text-gray-900 truncate">
                          {professional.user.firstName ||
                            'Aguardando sincronização...'}
                        </h4>
                        <Badge
                          className={`${getRoleColor(professional.role)} shrink-0 text-xs px-2 py-0.5`}
                        >
                          {getRoleLabel(professional.role)}
                        </Badge>
                      </div>

                      {/* {professional.specialty && (
                        <p className="text-xs text-gray-600 truncate mb-1">
                          {professional.specialty}
                        </p>
                      )} */}

                      {!hasFullData && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-xs text-amber-600">
                            Dados pendentes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">
                        {professional.user.email}
                      </span>
                    </div>

                    {professional.user.telephone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>{professional.user.telephone}</span>
                      </div>
                    )}

                    {professional.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>
                          Desde{' '}
                          {new Date(professional.createdAt).toLocaleDateString(
                            'pt-BR',
                            {
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddProfessional(professional)}
                      className="text-xs h-8 flex-1 border-gray-200 hover:bg-gray-50"
                    >
                      <Edit className="h-3 w-3 mr-1.5" />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleToggleProfessionalStatus(professional)
                      }
                      className={`text-xs h-8 px-3 border-gray-200 ${
                        professional.isActive
                          ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-200'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-200'
                      }`}
                    >
                      {professional.isActive ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProfessional(professional.id)}
                      className="text-xs h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-gray-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Nenhum colaborador cadastrado
          </p>
          <p className="text-xs text-gray-500">
            Adicione membros da equipe desta loja
          </p>
        </div>
      )}
    </TabsContent>
  );
};
