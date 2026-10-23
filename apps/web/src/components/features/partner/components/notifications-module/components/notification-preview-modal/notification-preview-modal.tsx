import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@repo/ui';
import { Mail, MessageSquare } from 'lucide-react';
import type { TNotificationPreviewModalConfig } from './notification-preview-modal.types';

export const NotificationPreviewModal = ({
  isOpen,
  type,
  customMessage,
  onClose,
}: TNotificationPreviewModalConfig) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'email' ? (
              <>
                <Mail className="h-5 w-5 text-[#1a2b4c]" />
                Preview: Template de E-mail
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 text-[#1a2b4c]" />
                Preview: Template de SMS
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {type === 'email' ? (
            <EmailTemplate customMessage={customMessage} />
          ) : (
            <SmsTemplate customMessage={customMessage} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EmailTemplate = ({ customMessage }: { customMessage: string }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a2b4c] text-white p-6 text-center">
        <div className="text-2xl mb-2">📅</div>
        <h1 className="text-xl">Sua Reserva está Confirmada!</h1>
        <p className="text-[#20b2aa] text-sm mt-1">ServiceSnap</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Olá <strong>João Silva</strong>, tudo pronto para seu atendimento!
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-[#20b2aa]/10 border border-[#20b2aa]/20 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Serviço:</p>
              <p className="text-[#1a2b4c]">Corte de Cabelo Masculino</p>
            </div>
            <div>
              <p className="text-gray-600">Profissional:</p>
              <p className="text-[#1a2b4c]">Carlos Mendes</p>
            </div>
            <div>
              <p className="text-gray-600">Data e Hora:</p>
              <p className="text-[#1a2b4c]">Quinta, 15 Nov - 14:30</p>
            </div>
            <div>
              <p className="text-gray-600">Valor:</p>
              <p className="text-[#1a2b4c]">R$ 45,00</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-gray-600 text-sm">Endereço:</p>
            <p className="text-[#1a2b4c] text-sm">
              Barbearia Silva - Unidade Centro
            </p>
            <p className="text-gray-500 text-sm">
              Rua das Flores, 123 - Centro, São Paulo
            </p>
          </div>
        </div>

        {/* Custom Message */}
        {customMessage && (
          <div className="text-center p-3 bg-[#20b2aa]/5 rounded border-l-4 border-[#20b2aa]">
            <p className="text-gray-700 italic">"{customMessage}"</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button className="bg-[#20b2aa] hover:bg-[#20b2aa]/90 text-white">
            📅 Adicionar ao Calendário
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700">
            🔄 Cancelar ou Reagendar
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Precisa de ajuda? Responda este e-mail ou ligue (11) 9999-9999</p>
          <p className="mt-1">
            © {new Date().getFullYear()} ServiceSnap - Agendamentos Inteligentes
          </p>
        </div>
      </div>
    </div>
  );
};

const SmsTemplate = ({ customMessage }: { customMessage: string }) => {
  const baseMessage =
    'Lembrete: Seu Corte de Cabelo com Barbearia Silva (Centro) é amanha as 14:30. Detalhes no email.';
  const linkMessage = ' Link: agenda.x/c/abc123';
  const fullMessage = customMessage
    ? `${baseMessage} ${customMessage}${linkMessage}`
    : `${baseMessage}${linkMessage}`;

  return (
    <div className="max-w-md mx-auto">
      {/* Phone Mockup */}
      <div className="bg-gray-800 rounded-3xl p-3 shadow-lg">
        <div className="bg-white rounded-2xl p-4 min-h-[200px]">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SMS • ServiceSnap</span>
          </div>

          <div className="bg-[#20b2aa] text-white p-3 rounded-lg rounded-bl-none inline-block max-w-[90%]">
            <p className="text-sm leading-relaxed">{fullMessage}</p>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Agora • {fullMessage.length}/160 caracteres
          </div>
        </div>
      </div>

      {/* Character Count Warning */}
      <div className="mt-4 text-center">
        {fullMessage.length > 160 ? (
          <p className="text-red-600 text-sm">
            ⚠️ Mensagem muito longa ({fullMessage.length} caracteres). Será
            enviada em {Math.ceil(fullMessage.length / 160)} partes.
          </p>
        ) : (
          <p className="text-green-600 text-sm">
            ✅ Mensagem dentro do limite ({fullMessage.length}/160 caracteres)
          </p>
        )}
      </div>
    </div>
  );
};
