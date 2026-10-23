import { formatPriceByCountry } from '@repo/shared/formatters';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  useIsMobile,
} from '@repo/ui';
import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { useAppointmentDetails } from './appointment-details.hook';

export function AppointmentDetailsResponsive() {
  const isMobile = useIsMobile();
  const {
    detailsAppointment,
    isOpen,
    statusBadge,
    duration,
    isUpdatingStatus,
    handleClose,
    handleStatusChange,
  } = useAppointmentDetails();

  const content = (
    <div className={isMobile ? 'space-y-5' : 'space-y-4'}>
      <div className={isMobile ? 'space-y-4' : 'space-y-3'}>
        <div className="flex items-center gap-3">
          <div
            className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            <User
              className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
            >
              Cliente
            </p>
            <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
              {detailsAppointment.user.firstName}{' '}
              {detailsAppointment.user.lastName}
            </p>
          </div>
        </div>

        {detailsAppointment.user.telephone ? (
          <div className="flex items-center gap-3">
            <div
              className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
            >
              <Phone
                className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
              >
                Telefone
              </p>
              <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
                {detailsAppointment.user.telephone}
              </p>
            </div>
          </div>
        ) : null}

        {detailsAppointment.user.email ? (
          <div className="flex items-center gap-3">
            <div
              className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
            >
              <Mail
                className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
              >
                E-mail
              </p>
              <p
                className={`text-gray-900 truncate ${isMobile ? 'text-base' : ''}`}
              >
                {detailsAppointment.user.email}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={`border-t border-gray-200 pt-4 ${isMobile ? 'space-y-4' : 'space-y-3'}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            <Calendar
              className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
            >
              Serviço
            </p>
            <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
              {detailsAppointment.service.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            <User
              className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
            >
              Profissional
            </p>
            <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
              {detailsAppointment.storeMember.user.firstName}{' '}
              {detailsAppointment.storeMember.user.lastName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            <Clock
              className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
            >
              Horário e Duração
            </p>
            <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
              {new Date(detailsAppointment.date).toLocaleDateString('pt-BR')} às{' '}
              {detailsAppointment.startTime}
            </p>
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mt-1' : 'text-sm'}`}
            >
              Duração: {duration}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
          >
            <DollarSign
              className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
            >
              Preço
            </p>
            <p className={`text-gray-900 ${isMobile ? 'text-base' : ''}`}>
              {formatPriceByCountry(detailsAppointment.service.price)}
            </p>
          </div>
        </div>
      </div>

      {detailsAppointment.notes ? (
        <div className="space-y-2 border-t border-gray-200 pt-4">
          <p
            className={`text-gray-600 ${isMobile ? 'text-sm mb-1' : 'text-sm'}`}
          >
            Observações
          </p>
          <p
            className={`text-gray-900 bg-gray-50 p-3 rounded-lg ${isMobile ? 'text-base' : 'text-sm'}`}
          >
            {detailsAppointment.notes}
          </p>
        </div>
      ) : null}

      <div
        className={`border-t border-gray-200 pt-4 ${isMobile ? 'space-y-3' : 'space-y-2'}`}
      >
        {detailsAppointment.status === 'scheduled' ? (
          <>
            <Button
              onClick={() =>
                handleStatusChange(detailsAppointment.id, 'completed')
              }
              disabled={isUpdatingStatus}
              className={`w-full bg-green-600 hover:bg-green-700 text-white ${isMobile ? 'h-11' : ''}`}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Concluído
            </Button>
            <Button
              onClick={() =>
                handleStatusChange(detailsAppointment.id, 'no-show')
              }
              disabled={isUpdatingStatus}
              variant="outline"
              className={`w-full border-orange-200 text-orange-700 hover:bg-orange-50 ${isMobile ? 'h-11' : ''}`}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Cliente Não Compareceu
            </Button>
          </>
        ) : null}

        {detailsAppointment.status !== 'cancelled' ? (
          <Button
            onClick={() =>
              handleStatusChange(detailsAppointment.id, 'cancelled')
            }
            disabled={isUpdatingStatus}
            variant="outline"
            className={`w-full border-red-200 text-red-700 hover:bg-red-50 ${isMobile ? 'h-11' : ''}`}
          >
            <Ban className="h-4 w-4 mr-2" />
            Cancelar Agendamento
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg">
                Detalhes do Agendamento
              </DrawerTitle>
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            </div>
          </DrawerHeader>
          <div className="px-4 py-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Agendamento</span>
            <Badge variant="outline" className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
