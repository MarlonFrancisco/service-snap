import {
  LegalDocument,
  LEGAL_NOTE_CLASS,
  LEGAL_PLAIN_LIST_CLASS,
  type TLegalSection,
} from '@/app/terms/components/legal-document';
import {
  PLATFORM_DESCRIPTION,
  PLATFORM_SCOPE_SHORT,
} from '@/utils/constants/platform.constants';
import { CONTACT_EMAIL } from '@/utils/constants/site.constants';

const SECTIONS: TLegalSection[] = [
  {
    id: 'aceitacao-dos-termos',
    title: '1. Aceitação dos Termos',
    content: (
      <>
        <p>
          Ao acessar e usar a plataforma ServiceSnap, você concorda em cumprir e
          estar vinculado a estes Termos de Serviço. Se você não concordar com
          qualquer parte destes termos, não deve usar nossos serviços.
        </p>
        <p>
          Estes termos se aplicam a todos os usuários da plataforma, incluindo
          clientes que buscam serviços e prestadores que oferecem serviços
          através da nossa plataforma.
        </p>
      </>
    ),
  },
  {
    id: 'descricao-do-servico',
    title: '2. Descrição do Serviço',
    content: (
      <>
        <p>
          O ServiceSnap é um {PLATFORM_DESCRIPTION}. Nossa plataforma oferece:
        </p>
        <ul>
          <li>
            <strong>Para Clientes:</strong> Descoberta e busca de profissionais
            por categoria, agendamento online em 4 etapas (serviço →
            profissional → data/hora → checkout), pagamento seguro via Stripe,
            sistema de avaliações com 1-5 estrelas, lembretes automáticos por
            e-mail e WhatsApp, histórico de agendamentos e favoritos
          </li>
          <li>
            <strong>Para Profissionais:</strong> Dashboard com métricas
            analíticas (vendas, receita, clientes), agenda visual interativa,
            gestão de equipe com roles (Owner/Manager/Profissional), cadastro de
            serviços e preços, bloqueio de horários, notificações configuráveis,
            planos de assinatura via Stripe
          </li>
          <li>
            <strong>Comunicações Automatizadas:</strong> Confirmações e
            lembretes de agendamento por e-mail e, quando o estabelecimento
            ativar, por WhatsApp
          </li>
          <li>
            <strong>Autenticação:</strong> Login via Google OAuth ou código OTP
            de 6 dígitos por e-mail
          </li>
          <li>
            <strong>Verificação Profissional:</strong> Sistema de validação de
            documentos e selo de confiança
          </li>
        </ul>
        <p className={LEGAL_NOTE_CLASS}>
          <strong>Importante:</strong> O ServiceSnap atua exclusivamente como
          intermediário tecnológico. Não prestamos os serviços agendados na
          plataforma — estes são fornecidos pelos profissionais e negócios
          cadastrados ({PLATFORM_SCOPE_SHORT}).
        </p>
      </>
    ),
  },
  {
    id: 'cadastro-e-conta-de-usuario',
    title: '3. Cadastro e Conta de Usuário',
    content: (
      <>
        <h3>3.1 Elegibilidade</h3>
        <p>Para usar nossa plataforma, você deve:</p>
        <ul>
          <li>Ter pelo menos 18 anos de idade</li>
          <li>
            Fornecer informações verdadeiras, precisas e completas durante o
            cadastro (nome, email, telefone, data de nascimento)
          </li>
          <li>
            Possuir um endereço de e-mail válido para receber códigos OTP de
            verificação
          </li>
          <li>
            Para profissionais: apresentar documentação válida para verificação
            e aprovar termos adicionais de prestador de serviços
          </li>
        </ul>

        <h3>3.2 Métodos de Autenticação</h3>
        <p>Oferecemos os seguintes métodos de login:</p>
        <ul>
          <li>
            <strong>Google OAuth:</strong> Login social via sua conta Google
          </li>
          <li>
            <strong>OTP via e-mail:</strong> Código de 6 dígitos enviado para o
            seu e-mail registrado
          </li>
        </ul>
        <p>
          Tokens de autenticação JWT são válidos por 24 horas (acesso) e 7 dias
          (refresh).
        </p>

        <h3>3.3 Responsabilidades da Conta</h3>
        <p>Você é responsável por:</p>
        <ul>
          <li>
            Manter a confidencialidade de suas credenciais de login e tokens de
            acesso
          </li>
          <li>
            Todas as atividades que ocorrem em sua conta, incluindo agendamentos
            e pagamentos
          </li>
          <li>
            Notificar-nos imediatamente através de{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> sobre
            qualquer uso não autorizado
          </li>
          <li>Manter suas informações de perfil atualizadas e precisas</li>
        </ul>
      </>
    ),
  },
  {
    id: 'uso-da-plataforma',
    title: '4. Uso da Plataforma',
    content: (
      <>
        <h3>4.1 Uso Permitido</h3>
        <p>
          Você pode usar nossa plataforma apenas para fins legais e de acordo
          com estes termos. É proibido usar a plataforma para:
        </p>
        <ul>
          <li>Violar qualquer lei local, estadual ou federal</li>
          <li>Transmitir material difamatório, abusivo ou prejudicial</li>
          <li>Interferir no funcionamento da plataforma</li>
          <li>Coletar informações de outros usuários sem consentimento</li>
          <li>Criar contas falsas ou enganosas</li>
        </ul>
      </>
    ),
  },
  {
    id: 'agendamentos-e-pagamentos',
    title: '5. Agendamentos e Pagamentos',
    content: (
      <>
        <h3>5.1 Processo de Agendamento</h3>
        <p>O agendamento online segue 4 etapas simples:</p>
        <ol>
          <li>
            <strong>Seleção de Serviço(s):</strong> Escolha um ou mais serviços
            com duração e preço definidos
          </li>
          <li>
            <strong>Seleção de Profissional:</strong> Escolha um profissional
            específico ou "qualquer profissional"
          </li>
          <li>
            <strong>Data e Horário:</strong> Selecione data e horário disponível
            baseado na agenda do profissional
          </li>
          <li>
            <strong>Checkout:</strong> Revise e confirme o agendamento com
            pagamento via Stripe
          </li>
        </ol>
        <p className={LEGAL_NOTE_CLASS}>
          <strong>Importante:</strong> Os agendamentos constituem um acordo
          direto entre você e o prestador de serviços. O ServiceSnap atua apenas
          como intermediário tecnológico, facilitando a conexão, processamento
          de pagamento e envio de confirmações/lembretes automáticos.
        </p>

        <h3>5.2 Política de Cancelamento</h3>
        <p>
          <strong>Cancelamentos pelo Cliente:</strong>
        </p>
        <ul>
          <li>Devem ser feitos com pelo menos 24 horas de antecedência</li>
          <li>
            Cancelamentos com menos de 24h podem estar sujeitos a taxas conforme
            política do profissional
          </li>
          <li>
            No-shows (não comparecimento sem aviso) podem resultar em cobrança
            total do serviço
          </li>
        </ul>
        <p>
          <strong>Sistema de Lembretes:</strong> Para reduzir no-shows, enviamos
          lembretes automáticos por e-mail e WhatsApp antes do agendamento.
          Esses lembretes reduziram faltas em até 80%.
        </p>

        <h3>5.3 Pagamentos e Taxas</h3>
        <p>
          <strong>Para Clientes:</strong>
        </p>
        <ul>
          <li>
            Pagamentos processados exclusivamente via Stripe (PCI DSS Level 1)
          </li>
          <li>Preços exibidos em Real Brasileiro (BRL)</li>
          <li>Confirmação instantânea após processamento bem-sucedido</li>
          <li>Histórico de transações disponível no perfil do usuário</li>
        </ul>
        <p>
          <strong>Para Profissionais:</strong>
        </p>
        <ul>
          <li>
            Modelo de assinatura via planos Stripe para acesso à plataforma
          </li>
          <li>
            Planos com features diferenciadas (verificados dinamicamente via
            metadata do Stripe)
          </li>
          <li>
            Gestão de assinatura: upgrade, downgrade e cancelamento disponíveis
            no dashboard
          </li>
          <li>
            Dashboard com métricas de vendas, receita e performance em tempo
            real
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'avaliacoes-e-comentarios',
    title: '6. Avaliações e Comentários',
    content: (
      <>
        <p>
          Nosso sistema de avaliações permite que clientes avaliem experiências
          reais:
        </p>
        <ul>
          <li>
            <strong>Classificação:</strong> Sistema de 1-5 estrelas para avaliar
            o serviço prestado
          </li>
          <li>
            <strong>Comentários:</strong> Espaço para feedback escrito detalhado
            sobre a experiência
          </li>
          <li>
            <strong>Autenticidade:</strong> Apenas clientes que efetivamente
            utilizaram o serviço podem avaliar
          </li>
          <li>
            <strong>Visibilidade Pública:</strong> Avaliações são exibidas
            publicamente no perfil do profissional
          </li>
        </ul>
        <p>
          <strong>Proibido:</strong> Avaliações falsas, enganosas, difamatórias,
          abusivas, com conteúdo discriminatório ou que violem direitos de
          terceiros. Violações podem resultar em suspensão permanente da conta.
        </p>
        <p>
          <strong>Moderação:</strong> Reservamo-nos o direito de moderar, editar
          ou remover avaliações que violem estas diretrizes ou nossa política de
          comunidade, sem aviso prévio.
        </p>
      </>
    ),
  },
  {
    id: 'verificacao-de-profissionais',
    title: '7. Verificação de Profissionais',
    content: (
      <>
        <p>
          Todos os profissionais cadastrados passam por processo de verificação:
        </p>
        <ul>
          <li>Validação de documentação obrigatória</li>
          <li>Verificação de informações de contato e endereço</li>
          <li>Aprovação manual pela equipe ServiceSnap antes de ativação</li>
          <li>
            Profissionais verificados recebem selo de confiança visível no
            perfil
          </li>
        </ul>
        <p className={LEGAL_NOTE_CLASS}>
          <strong>Importante:</strong> A verificação confirma identidade e
          documentação, mas não garante qualidade do serviço. Consulte sempre as
          avaliações de outros clientes.
        </p>
      </>
    ),
  },
  {
    id: 'limitacao-de-responsabilidade',
    title: '8. Limitação de Responsabilidade',
    content: (
      <>
        <p>
          <strong>Papel da Plataforma:</strong> O ServiceSnap atua
          exclusivamente como intermediário tecnológico. NÃO prestamos os
          serviços agendados na plataforma diretamente.
        </p>
        <p>
          <strong>Responsabilidades Limitadas:</strong>
        </p>
        <ul>
          <li>
            <strong>Qualidade do Serviço:</strong> Não nos responsabilizamos
            pela qualidade, resultado, pontualidade ou conduta dos
            profissionais. A responsabilidade é exclusiva do prestador de
            serviços.
          </li>
          <li>
            <strong>Disputas:</strong> Conflitos entre clientes e profissionais
            devem ser resolvidos diretamente entre as partes
          </li>
          <li>
            <strong>Danos:</strong> Não seremos responsáveis por danos diretos,
            indiretos, incidentais, especiais, consequenciais ou punitivos
            decorrentes do uso da plataforma ou serviços prestados
          </li>
          <li>
            <strong>Disponibilidade:</strong> Não garantimos que a plataforma
            estará disponível ininterruptamente ou livre de erros
          </li>
          <li>
            <strong>Terceiros:</strong> Não nos responsabilizamos por ações de
            terceiros (Stripe, AWS, Supabase, Vercel)
          </li>
        </ul>
        <p>
          <strong>Responsabilidade Máxima:</strong> Nossa responsabilidade
          total, se houver, não excederá o valor pago pelo serviço específico
          objeto da reclamação nos últimos 12 meses.
        </p>
      </>
    ),
  },
  {
    id: 'propriedade-intelectual',
    title: '9. Propriedade Intelectual',
    content: (
      <>
        <p>
          Todo conteúdo da plataforma ServiceSnap (código, design, logotipos,
          textos, gráficos, interface) é protegido por direitos autorais e
          propriedade intelectual do ServiceSnap e seus licenciadores.
        </p>
        <p>
          É proibido copiar, modificar, distribuir, vender ou explorar
          comercialmente qualquer parte da plataforma sem autorização expressa
          por escrito.
        </p>
      </>
    ),
  },
  {
    id: 'modificacoes-dos-termos',
    title: '10. Modificações dos Termos',
    content: (
      <>
        <p>
          Reservamo-nos o direito de modificar estes Termos de Serviço a
          qualquer momento. Notificaremos sobre mudanças significativas através
          de:
        </p>
        <ul>
          <li>E-mail para o endereço cadastrado</li>
          <li>Aviso destacado na plataforma</li>
          <li>
            Atualização da data "Última atualização" no topo deste documento
          </li>
        </ul>
        <p>
          É sua responsabilidade revisar periodicamente estes termos. O uso
          continuado da plataforma após as modificações constitui aceitação dos
          novos termos. Caso não concorde com as mudanças, você deve encerrar o
          uso da plataforma.
        </p>
      </>
    ),
  },
  {
    id: 'lei-aplicavel-e-foro',
    title: '11. Lei Aplicável e Foro',
    content: (
      <>
        <p>
          Estes Termos de Serviço são regidos pelas leis da República Federativa
          do Brasil, especialmente:
        </p>
        <ul>
          <li>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</li>
          <li>Marco Civil da Internet (Lei 12.965/2014)</li>
          <li>Código de Defesa do Consumidor (Lei 8.078/1990)</li>
          <li>Código Civil Brasileiro (Lei 10.406/2002)</li>
        </ul>
        <p>
          Fica eleito o foro da comarca de [CIDADE], Brasil, para dirimir
          quaisquer controvérsias decorrentes destes termos, com renúncia
          expressa a qualquer outro, por mais privilegiado que seja.
        </p>
      </>
    ),
  },
  {
    id: 'contato',
    title: '12. Contato',
    content: (
      <>
        <p>
          Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato
          conosco:
        </p>
        <ul className={LEGAL_PLAIN_LIST_CLASS}>
          <li>
            <strong>E-mail Geral:</strong>{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </li>
          <li>
            <strong>Suporte:</strong> Através da central de ajuda em{' '}
            <a href="/help">/help</a>
          </li>
        </ul>
        <p>Responderemos sua solicitação em até 5 dias úteis.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      activeTab="terms"
      title="Termos de Serviço"
      updatedAt="Última atualização: 3 de novembro de 2026"
      sections={SECTIONS}
    />
  );
}
