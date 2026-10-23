'use client';

import type { TWhatsappConnectionStatus } from '@/types/api/whatsapp.types';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
} from '@repo/ui';
import {
  CheckCircle2,
  Copy,
  History,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { WhatsappSettingsModuleSkeleton } from './whatsapp-settings-module-skeleton';
import { useWhatsappSettingsModule } from './whatsapp-settings-module.hook';

const statusBadge = (status?: TWhatsappConnectionStatus) => {
  switch (status) {
    case 'connected':
      return { label: 'Conectado', variant: 'default' as const };
    case 'inactive':
      return { label: 'Desativado', variant: 'secondary' as const };
    case 'error':
      return { label: 'Erro', variant: 'destructive' as const };
    default:
      return { label: 'Incompleto', variant: 'outline' as const };
  }
};

export const WhatsappSettingsModule = () => {
  const {
    isSaveConfigPending,
    isWhatsappPending,
    form,
    handleSubmit,
    whatsappStatus,
    isWhatsappStatusPending,
    refetchWhatsappStatus,
    whatsappTemplates,
    isWhatsappTemplatesPending,
    isWhatsappTemplatesError,
    whatsappTemplatesError,
    refetchWhatsappTemplates,
    testPhone,
    setTestPhone,
    handleSendTest,
    isSendTestPending,
  } = useWhatsappSettingsModule();

  if (isWhatsappPending) return <WhatsappSettingsModuleSkeleton />;

  const badge = statusBadge(whatsappStatus?.status);
  const templatesErrorMessage =
    whatsappTemplatesError instanceof Error
      ? whatsappTemplatesError.message
      : 'Não foi possível carregar os templates.';

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 mb-1">WhatsApp</h2>
          <p className="text-gray-600 text-sm">
            Veja o status da conexão, teste o envio, confira templates e o
            histórico — sem precisar abrir o painel da Meta a cada passo.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/partner/notifications/history">
            <History className="h-4 w-4" />
            Ver histórico de envios
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Status da conexão
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </CardTitle>
            <CardDescription>
              {whatsappStatus?.message ||
                'Validamos as credenciais com a Cloud API da Meta.'}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void refetchWhatsappStatus()}
            disabled={isWhatsappStatusPending}
            aria-label="Atualizar status"
          >
            <RefreshCw
              className={`h-4 w-4 ${isWhatsappStatusPending ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-gray-700">
          {whatsappStatus?.verifiedName && (
            <p>
              <strong>Nome verificado:</strong> {whatsappStatus.verifiedName}
            </p>
          )}
          {whatsappStatus?.displayPhoneNumber && (
            <p>
              <strong>Número:</strong> {whatsappStatus.displayPhoneNumber}
            </p>
          )}
          {whatsappStatus?.qualityRating && (
            <p>
              <strong>Qualidade:</strong> {whatsappStatus.qualityRating}
            </p>
          )}
          {whatsappStatus?.status === 'connected' ? (
            <p className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Pronto para lembretes e mensagens do ServiceSnap.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-amber-700">
              <TriangleAlert className="h-4 w-4" />
              Complete e salve as credenciais abaixo, depois atualize o status.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Teste de envio
          </CardTitle>
          <CardDescription>
            Envia uma mensagem de texto de teste para o número informado (com
            DDI, ex.: 5511999999999).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Input
            value={testPhone}
            onChange={(event) => setTestPhone(event.target.value)}
            placeholder="5511999999999"
            className="sm:max-w-xs"
          />
          <Button
            type="button"
            onClick={handleSendTest}
            disabled={isSendTestPending || !testPhone.trim()}
          >
            {isSendTestPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar teste'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              Templates (Meta)
            </CardTitle>
            <CardDescription>
              Lista os message templates da conta Business. Útil para saber o
              que já está aprovado para lembretes.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void refetchWhatsappTemplates()}
            disabled={
              isWhatsappTemplatesPending ||
              whatsappStatus?.status !== 'connected'
            }
            aria-label="Atualizar templates"
          >
            <RefreshCw
              className={`h-4 w-4 ${isWhatsappTemplatesPending ? 'animate-spin' : ''}`}
            />
          </Button>
        </CardHeader>
        <CardContent>
          {whatsappStatus?.status !== 'connected' && (
            <p className="text-sm text-gray-600">
              Conecte o WhatsApp para carregar os templates.
            </p>
          )}
          {whatsappStatus?.status === 'connected' &&
            isWhatsappTemplatesPending && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando templates...
              </p>
            )}
          {whatsappStatus?.status === 'connected' &&
            isWhatsappTemplatesError && (
              <p className="text-sm text-red-600">
                {Array.isArray(templatesErrorMessage)
                  ? templatesErrorMessage.join(', ')
                  : templatesErrorMessage}
              </p>
            )}
          {whatsappStatus?.status === 'connected' &&
            !isWhatsappTemplatesPending &&
            !isWhatsappTemplatesError &&
            (whatsappTemplates?.length ? (
              <ul className="divide-y rounded-md border">
                {whatsappTemplates.map((template) => (
                  <li
                    key={`${template.name}-${template.language}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {template.name}
                    </span>
                    <span className="text-gray-600">
                      {template.language} · {template.status}
                      {template.category ? ` · ${template.category}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">
                Nenhum template encontrado nesta conta.
              </p>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais da API (Meta)</CardTitle>
          <CardDescription>
            Dados técnicos do WhatsApp Cloud API. Depois de salvar, use o status
            e o teste acima para validar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Ativar WhatsApp
                        </FormLabel>
                        <FormDescription>
                          Ative ou desative a integração com o WhatsApp Business
                          API.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 105956..." {...field} />
                      </FormControl>
                      <FormDescription>
                        O ID do número de telefone encontrado no painel do
                        WhatsApp API.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Account ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 105956..." {...field} />
                      </FormControl>
                      <FormDescription>
                        O ID da conta empresarial do WhatsApp.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Token</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="off"
                          placeholder="Access Token"
                        />
                      </FormControl>
                      <FormDescription>
                        Token de acesso permanente gerado para o usuário do
                        sistema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Webhook Verify Token</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted text-muted-foreground flex-1 rounded-md border px-3 py-2 text-sm font-mono tracking-wide">
                      {maskToken(form.watch('webhookVerifyToken'))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const token = form.getValues('webhookVerifyToken');
                        if (!token) return;
                        void navigator.clipboard.writeText(token);
                        toast.success(
                          'Token copiado para a área de transferência!',
                        );
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Use este token ao configurar o webhook no painel da Meta
                    (valor completo só ao copiar).
                  </FormDescription>
                </FormItem>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaveConfigPending}>
                  {isSaveConfigPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

function maskToken(token?: string) {
  if (!token) return '—';
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}
