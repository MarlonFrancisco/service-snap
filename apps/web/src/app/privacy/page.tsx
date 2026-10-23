import { Footer } from '@/components/layout';
import { Header } from '@/components/layout/header/header';
import { CONTACT_EMAIL } from '@/utils/constants/site.constants';

export default function PrivacyPage() {
  return (
    <Header>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl text-[#1a2b4c] mb-4">
              Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: 15 de dezembro de 2024
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                1. Informações Gerais
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Esta Política de Privacidade descreve como o ServiceSnap, uma
                plataforma brasileira de agendamento de serviços de beleza,
                bem-estar e cuidados pessoais, coleta, usa, armazena e protege
                suas informações pessoais. Respeitamos sua privacidade e estamos
                comprometidos em proteger seus dados pessoais de acordo com a
                Lei Geral de Proteção de Dados (LGPD) e melhores práticas
                internacionais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                2. Informações que Coletamos
              </h2>
              <h3 className="text-xl text-[#1a2b4c] mb-3">
                2.1 Informações Fornecidas por Você
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>
                  <strong>Dados Pessoais:</strong> Nome, sobrenome, data de
                  nascimento, endereço de e-mail e número de telefone
                </li>
                <li>
                  <strong>Autenticação:</strong> Credenciais de login, códigos
                  OTP (One-Time Password) de 6 dígitos via SMS/email, tokens de
                  acesso Google OAuth
                </li>
                <li>
                  <strong>Perfil:</strong> Foto de perfil/avatar, preferências
                  de serviços, lista de favoritos
                </li>
                <li>
                  <strong>Dados Financeiros:</strong> ID de cliente Stripe para
                  processamento de pagamentos, histórico de transações,
                  informações de assinatura (para profissionais)
                </li>
                <li>
                  <strong>Dados Profissionais (para prestadores):</strong> Nome
                  do estabelecimento, descrição, endereço completo (rua, cidade,
                  estado, CEP), horários de funcionamento, serviços oferecidos,
                  preços, fotos do estabelecimento, documentos de verificação,
                  links de redes sociais (Instagram, Facebook)
                </li>
                <li>
                  <strong>Agendamentos:</strong> Data, horário, serviço
                  selecionado, profissional escolhido, status do agendamento,
                  observações
                </li>
                <li>
                  <strong>Avaliações:</strong> Classificações (1-5 estrelas),
                  comentários escritos sobre experiências de serviço
                </li>
              </ul>

              <h3 className="text-xl text-[#1a2b4c] mb-3">
                2.2 Informações Coletadas Automaticamente
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Informações do Dispositivo:</strong> Endereço IP, tipo
                  de navegador, sistema operacional, resolução de tela
                </li>
                <li>
                  <strong>Dados de Uso:</strong> Páginas visitadas, tempo de
                  permanência, cliques, padrões de navegação
                </li>
                <li>
                  <strong>Cookies e Armazenamento Local:</strong> Tokens JWT
                  (24h para acesso, 7 dias para refresh), preferências do
                  usuário, sessões
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
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                3. Como Usamos suas Informações
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos suas informações para as seguintes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Operação da Plataforma:</strong> Processar
                  agendamentos, autenticar usuários via JWT/OAuth/OTP, conectar
                  clientes e profissionais
                </li>
                <li>
                  <strong>Processamento de Pagamentos:</strong> Cobrar e
                  transferir valores através do Stripe, gerenciar assinaturas de
                  profissionais
                </li>
                <li>
                  <strong>Comunicações Essenciais:</strong> Enviar códigos OTP
                  de verificação, confirmações de agendamento, lembretes
                  automáticos via SMS (AWS SNS) e email (AWS SES)
                </li>
                <li>
                  <strong>Melhorias do Serviço:</strong> Analisar padrões de
                  uso, otimizar performance, desenvolver novos recursos
                </li>
                <li>
                  <strong>Suporte ao Cliente:</strong> Responder dúvidas,
                  resolver problemas técnicos, fornecer assistência
                </li>
                <li>
                  <strong>Segurança e Prevenção:</strong> Detectar e prevenir
                  fraudes, abuso da plataforma, atividades ilegais
                </li>
                <li>
                  <strong>Conformidade Legal:</strong> Cumprir obrigações legais
                  e regulatórias, responder solicitações de autoridades
                </li>
                <li>
                  <strong>Marketing (com consentimento):</strong> Enviar
                  atualizações sobre serviços, promoções, novidades da
                  plataforma
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                4. Compartilhamento de Informações
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Não vendemos ou alugamos suas informações pessoais.
                Compartilhamos seus dados apenas nas seguintes situações
                específicas:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Profissionais da Plataforma:</strong> Compartilhamos
                  seu nome, telefone e detalhes do agendamento com o
                  profissional escolhido para viabilizar o serviço
                </li>
                <li>
                  <strong>Processador de Pagamentos (Stripe):</strong> Dados
                  necessários para processar transações de forma segura e
                  conforme PCI DSS
                </li>
                <li>
                  <strong>Provedores de Infraestrutura:</strong> Supabase
                  (armazenamento de dados e arquivos), Vercel (hospedagem), AWS
                  (notificações via SES/SNS)
                </li>
                <li>
                  <strong>Autoridades Legais:</strong> Quando exigido por lei,
                  ordem judicial ou para proteger direitos, segurança e
                  propriedade
                </li>
                <li>
                  <strong>Com Seu Consentimento:</strong> Em outras situações
                  específicas mediante sua autorização explícita
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Importante:</strong> Todos os terceiros são
                contratualmente obrigados a proteger seus dados e usar apenas
                para as finalidades especificadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Implementamos medidas de segurança técnicas, administrativas e
                físicas rigorosas para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Criptografia:</strong> Comunicação HTTPS com TLS,
                  criptografia de dados sensíveis em repouso via
                  PostgreSQL/Supabase
                </li>
                <li>
                  <strong>Autenticação Segura:</strong> Tokens JWT com expiração
                  (24h acesso, 7 dias refresh), hashing de senhas, códigos OTP
                  temporários
                </li>
                <li>
                  <strong>Controle de Acesso:</strong> Sistema de roles e
                  permissões (Owner/Manager/Profissional), autenticação
                  obrigatória para operações sensíveis
                </li>
                <li>
                  <strong>Infraestrutura Segura:</strong> Servidores em nuvem
                  com certificações de segurança, backups automatizados,
                  monitoramento 24/7
                </li>
                <li>
                  <strong>Processamento de Pagamentos:</strong> Totalmente
                  gerenciado por Stripe com certificação PCI DSS Level 1 (mais
                  alto nível de segurança)
                </li>
                <li>
                  <strong>Auditoria e Logs:</strong> Registro de atividades para
                  detecção de comportamentos suspeitos
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Apesar de todos os esforços, nenhum sistema é 100% seguro.
                Recomendamos que você proteja suas credenciais e nos notifique
                imediatamente sobre qualquer atividade suspeita.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                6. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem
                os seguintes direitos sobre seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Confirmação e Acesso:</strong> Confirmar a existência
                  de tratamento e acessar seus dados pessoais
                </li>
                <li>
                  <strong>Correção:</strong> Corrigir dados incompletos,
                  inexatos ou desatualizados através do seu perfil
                </li>
                <li>
                  <strong>Anonimização ou Exclusão:</strong> Solicitar
                  anonimização, bloqueio ou eliminação de dados desnecessários
                </li>
                <li>
                  <strong>Portabilidade:</strong> Solicitar transferência de
                  seus dados a outro fornecedor de serviço
                </li>
                <li>
                  <strong>Revogação de Consentimento:</strong> Optar por não
                  receber comunicações de marketing a qualquer momento
                </li>
                <li>
                  <strong>Informação sobre Compartilhamento:</strong> Saber com
                  quais entidades públicas e privadas compartilhamos seus dados
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se ao tratamento de dados
                  realizado com base em uma das hipóteses de dispensa de
                  consentimento
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato através do email:{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[#20b2aa] hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                7. Cookies e Tecnologias de Rastreamento
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>
                  <strong>Essenciais:</strong> Tokens JWT de autenticação (24h e
                  7 dias), sessões de usuário, preferências de idioma
                </li>
                <li>
                  <strong>Funcionalidade:</strong> Lembrar suas preferências,
                  serviços favoritos, última localização pesquisada
                </li>
                <li>
                  <strong>Analytics:</strong> Analisar padrões de uso, métricas
                  de performance, comportamento de navegação
                </li>
                <li>
                  <strong>Segurança:</strong> Detectar fraudes, prevenir abusos,
                  proteger contra ataques
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Você pode gerenciar cookies através das configurações do seu
                navegador. Note que desabilitar cookies essenciais pode afetar a
                funcionalidade da plataforma, impedindo login e agendamentos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                8. Retenção de Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos seus dados pessoais apenas pelo tempo necessário para
                cumprir as finalidades descritas nesta política, incluindo
                obrigações legais, contábeis e fiscais. Dados de agendamentos e
                transações são mantidos por no mínimo 5 anos conforme legislação
                tributária brasileira. Após esse período, os dados são
                anonimizados ou excluídos de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">9. Contato</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para exercer seus direitos, esclarecer dúvidas sobre esta
                Política de Privacidade ou reportar incidentes de segurança,
                entre em contato conosco:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li>
                  <strong>E-mail:</strong>{' '}
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Responderemos sua solicitação em até 15 dias conforme previsto
                pela LGPD.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </Header>
  );
}
