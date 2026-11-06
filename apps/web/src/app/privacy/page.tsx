import { TrackedLink } from '@/components/ui/tracked-link';
import {
  LegalDocument,
  LEGAL_NOTE_CLASS,
  LEGAL_PLAIN_LIST_CLASS,
  type TLegalSection,
} from '@/app/terms/components/legal-document';
import { PLATFORM_DESCRIPTION } from '@/utils/constants/platform.constants';
import { CONTACT_EMAIL } from '@/utils/constants/site.constants';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Política de Privacidade | ServiceSnap',
  description:
    'Saiba como o ServiceSnap coleta, usa, armazena e protege seus dados pessoais, quais são os seus direitos e como exercê-los, conforme a LGPD.',
  path: '/privacy',
});

const SECTIONS: TLegalSection[] = [
  {
    id: 'informacoes-gerais',
    title: '1. Informações Gerais',
    content: (
      <>
        <p>
          Esta Política de Privacidade descreve como o ServiceSnap, um{' '}
          {PLATFORM_DESCRIPTION}, coleta, usa, armazena e protege suas
          informações pessoais. Respeitamos sua privacidade e estamos
          comprometidos em proteger seus dados pessoais de acordo com a Lei
          Geral de Proteção de Dados (LGPD) e melhores práticas internacionais.
        </p>
      </>
    ),
  },
  {
    id: 'informacoes-que-coletamos',
    title: '2. Informações que Coletamos',
    content: (
      <>
        <h3>2.1 Informações Fornecidas por Você</h3>
        <ul>
          <li>
            <strong>Dados Pessoais:</strong> Nome, sobrenome, data de
            nascimento, endereço de e-mail e número de telefone
          </li>
          <li>
            <strong>Autenticação:</strong> Credenciais de login, códigos OTP
            (One-Time Password) de 6 dígitos via e-mail, tokens de acesso Google
            OAuth
          </li>
          <li>
            <strong>Perfil:</strong> Foto de perfil/avatar, preferências de
            serviços, lista de favoritos
          </li>
          <li>
            <strong>Dados Financeiros:</strong> ID de cliente Stripe para
            processamento de pagamentos, histórico de transações, informações de
            assinatura (para profissionais)
          </li>
          <li>
            <strong>Dados Profissionais (para prestadores):</strong> Nome do
            estabelecimento, descrição, endereço completo (rua, cidade, estado,
            CEP), horários de funcionamento, serviços oferecidos, preços, fotos
            do estabelecimento, documentos de verificação, links de redes
            sociais (Instagram, Facebook)
          </li>
          <li>
            <strong>Agendamentos:</strong> Data, horário, serviço selecionado,
            profissional escolhido, status do agendamento, observações
          </li>
          <li>
            <strong>Avaliações:</strong> Classificações (1-5 estrelas),
            comentários escritos sobre experiências de serviço
          </li>
        </ul>

        <h3>2.2 Informações Coletadas Automaticamente</h3>
        <ul>
          <li>
            <strong>Informações do Dispositivo:</strong> Endereço IP, tipo de
            navegador, sistema operacional, resolução de tela
          </li>
          <li>
            <strong>Dados de Uso:</strong> Páginas visitadas, tempo de
            permanência, cliques, padrões de navegação
          </li>
          <li>
            <strong>Cookies e Armazenamento Local:</strong> Tokens JWT (24h para
            acesso, 7 dias para refresh), preferências do usuário, sessões
          </li>
          <li>
            <strong>Localização:</strong> Dados de localização aproximada
            baseados em IP para exibir serviços próximos
          </li>
          <li>
            <strong>Logs do Sistema:</strong> Registros de atividades,
            timestamps, eventos de erro para diagnóstico técnico
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'como-usamos-suas-informacoes',
    title: '3. Como Usamos suas Informações',
    content: (
      <>
        <p>Utilizamos suas informações para as seguintes finalidades:</p>
        <ul>
          <li>
            <strong>Operação da Plataforma:</strong> Processar agendamentos,
            autenticar usuários via JWT/OAuth/OTP, conectar clientes e
            profissionais
          </li>
          <li>
            <strong>Processamento de Pagamentos:</strong> Cobrar e transferir
            valores através do Stripe, gerenciar assinaturas de profissionais
          </li>
          <li>
            <strong>Comunicações Essenciais:</strong> Enviar códigos OTP de
            verificação, confirmações de agendamento e lembretes automáticos por
            e-mail e, quando o estabelecimento ativar, por WhatsApp
          </li>
          <li>
            <strong>Melhorias do Serviço:</strong> Analisar padrões de uso,
            otimizar performance, desenvolver novos recursos
          </li>
          <li>
            <strong>Suporte ao Cliente:</strong> Responder dúvidas, resolver
            problemas técnicos, fornecer assistência
          </li>
          <li>
            <strong>Segurança e Prevenção:</strong> Detectar e prevenir fraudes,
            abuso da plataforma, atividades ilegais
          </li>
          <li>
            <strong>Conformidade Legal:</strong> Cumprir obrigações legais e
            regulatórias, responder solicitações de autoridades
          </li>
          <li>
            <strong>Marketing (com consentimento):</strong> Enviar atualizações
            sobre serviços, promoções, novidades da plataforma
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'compartilhamento-de-informacoes',
    title: '4. Compartilhamento de Informações',
    content: (
      <>
        <p>
          Não vendemos ou alugamos suas informações pessoais. Compartilhamos
          seus dados apenas nas seguintes situações específicas:
        </p>
        <ul>
          <li>
            <strong>Profissionais da Plataforma:</strong> Compartilhamos seu
            nome, telefone e detalhes do agendamento com o profissional
            escolhido para viabilizar o serviço
          </li>
          <li>
            <strong>Processador de Pagamentos (Stripe):</strong> Dados
            necessários para processar transações de forma segura e conforme PCI
            DSS
          </li>
          <li>
            <strong>Provedores de Infraestrutura:</strong> Supabase
            (armazenamento de dados e arquivos), Vercel (hospedagem), Resend
            (envio de e-mails)
          </li>
          <li>
            <strong>Autoridades Legais:</strong> Quando exigido por lei, ordem
            judicial ou para proteger direitos, segurança e propriedade
          </li>
          <li>
            <strong>Com Seu Consentimento:</strong> Em outras situações
            específicas mediante sua autorização explícita
          </li>
        </ul>
        <p className={LEGAL_NOTE_CLASS}>
          <strong>Importante:</strong> Todos os terceiros são contratualmente
          obrigados a proteger seus dados e usar apenas para as finalidades
          especificadas.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca-dos-dados',
    title: '5. Segurança dos Dados',
    content: (
      <>
        <p>
          Implementamos medidas de segurança técnicas, administrativas e físicas
          rigorosas para proteger suas informações:
        </p>
        <ul>
          <li>
            <strong>Criptografia:</strong> Comunicação HTTPS com TLS,
            criptografia de dados sensíveis em repouso via PostgreSQL/Supabase
          </li>
          <li>
            <strong>Autenticação Segura:</strong> Tokens JWT com expiração (24h
            acesso, 7 dias refresh), hashing de senhas, códigos OTP temporários
          </li>
          <li>
            <strong>Controle de Acesso:</strong> Sistema de roles e permissões
            (Owner/Manager/Profissional), autenticação obrigatória para
            operações sensíveis
          </li>
          <li>
            <strong>Infraestrutura Segura:</strong> Servidores em nuvem com
            certificações de segurança, backups automatizados, monitoramento
            24/7
          </li>
          <li>
            <strong>Processamento de Pagamentos:</strong> Totalmente gerenciado
            por Stripe com certificação PCI DSS Level 1 (mais alto nível de
            segurança)
          </li>
          <li>
            <strong>Auditoria e Logs:</strong> Registro de atividades para
            detecção de comportamentos suspeitos
          </li>
        </ul>
        <p>
          Apesar de todos os esforços, nenhum sistema é 100% seguro.
          Recomendamos que você proteja suas credenciais e nos notifique
          imediatamente sobre qualquer atividade suspeita.
        </p>
      </>
    ),
  },
  {
    id: 'seus-direitos-lgpd',
    title: '6. Seus Direitos (LGPD)',
    content: (
      <>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os
          seguintes direitos sobre seus dados pessoais:
        </p>
        <ul>
          <li>
            <strong>Confirmação e Acesso:</strong> Confirmar a existência de
            tratamento e acessar seus dados pessoais
          </li>
          <li>
            <strong>Correção:</strong> Corrigir dados incompletos, inexatos ou
            desatualizados através do seu perfil
          </li>
          <li>
            <strong>Anonimização ou Exclusão:</strong> Solicitar anonimização,
            bloqueio ou eliminação de dados desnecessários
          </li>
          <li>
            <strong>Portabilidade:</strong> Solicitar transferência de seus
            dados a outro fornecedor de serviço
          </li>
          <li>
            <strong>Revogação de Consentimento:</strong> Optar por não receber
            comunicações de marketing a qualquer momento
          </li>
          <li>
            <strong>Informação sobre Compartilhamento:</strong> Saber com quais
            entidades públicas e privadas compartilhamos seus dados
          </li>
          <li>
            <strong>Oposição:</strong> Opor-se ao tratamento de dados realizado
            com base em uma das hipóteses de dispensa de consentimento
          </li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato através do email:{' '}
          <TrackedLink
            href={`mailto:${CONTACT_EMAIL}`}
            event="contact_email_clicked"
            properties={{ page: 'privacy' }}
          >
            {CONTACT_EMAIL}
          </TrackedLink>
        </p>
      </>
    ),
  },
  {
    id: 'cookies-e-tecnologias-de-rastreamento',
    title: '7. Cookies e Tecnologias de Rastreamento',
    content: (
      <>
        <p>Utilizamos cookies e tecnologias similares para:</p>
        <ul>
          <li>
            <strong>Essenciais:</strong> Tokens JWT de autenticação (24h e 7
            dias), sessões de usuário, preferências de idioma
          </li>
          <li>
            <strong>Funcionalidade:</strong> Lembrar suas preferências, serviços
            favoritos, última localização pesquisada
          </li>
          <li>
            <strong>Analytics:</strong> Analisar padrões de uso, métricas de
            performance, comportamento de navegação
          </li>
          <li>
            <strong>Segurança:</strong> Detectar fraudes, prevenir abusos,
            proteger contra ataques
          </li>
        </ul>
        <p>
          Você pode gerenciar cookies através das configurações do seu
          navegador. Note que desabilitar cookies essenciais pode afetar a
          funcionalidade da plataforma, impedindo login e agendamentos.
        </p>
      </>
    ),
  },
  {
    id: 'retencao-de-dados',
    title: '8. Retenção de Dados',
    content: (
      <>
        <p>
          Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir
          as finalidades descritas nesta política, incluindo obrigações legais,
          contábeis e fiscais. Dados de agendamentos e transações são mantidos
          por no mínimo 5 anos conforme legislação tributária brasileira. Após
          esse período, os dados são anonimizados ou excluídos de forma segura.
        </p>
      </>
    ),
  },
  {
    id: 'contato',
    title: '9. Contato',
    content: (
      <>
        <p>
          Para exercer seus direitos, esclarecer dúvidas sobre esta Política de
          Privacidade ou reportar incidentes de segurança, entre em contato
          conosco:
        </p>
        <ul className={LEGAL_PLAIN_LIST_CLASS}>
          <li>
            <strong>E-mail:</strong>{' '}
            <TrackedLink
              href={`mailto:${CONTACT_EMAIL}`}
              event="contact_email_clicked"
              properties={{ page: 'privacy' }}
            >
              {CONTACT_EMAIL}
            </TrackedLink>
          </li>
        </ul>
        <p>
          Responderemos sua solicitação em até 15 dias conforme previsto pela
          LGPD.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      activeTab="privacy"
      title="Política de Privacidade"
      updatedAt="Última atualização: 3 de novembro de 2026"
      sections={SECTIONS}
    />
  );
}
