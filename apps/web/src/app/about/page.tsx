import { Footer } from '@/components/layout';
import { Header } from '@/components/layout/header/header';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Sobre nós | ServiceSnap',
  description:
    'Conheça o ServiceSnap: a plataforma que conecta pessoas a profissionais de serviços no Brasil.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <Header>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl text-[#1a2b4c] mb-4">Sobre Nós</h1>
            <p className="text-gray-600">
              Conectando pessoas aos melhores profissionais de serviços locais
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">Nossa História</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O ServiceSnap nasceu da visão de simplificar a forma como as
                pessoas encontram e agendam serviços locais no Brasil — de
                beleza e saúde a oficinas, consultorias e outros. Percebemos que
                profissionais qualificados perdiam tempo valioso gerenciando
                agendamentos manualmente, enquanto clientes enfrentavam
                dificuldades para encontrar e agendar serviços de qualidade de
                forma rápida e confiável.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Fundada em 2024, criamos uma plataforma completa que conecta
                clientes a profissionais verificados através de tecnologia
                moderna, agendamento instantâneo 24/7 e ferramentas
                profissionais de gestão que economizam mais de 15 horas semanais
                de trabalho administrativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">Nossa Missão</h2>
              <p className="text-gray-700 leading-relaxed">
                Transformar a experiência de agendamento de serviços no Brasil,
                eliminando barreiras entre clientes e profissionais através de
                tecnologia inteligente. Acreditamos que todo mundo merece acesso
                fácil a serviços de qualidade, e que os profissionais merecem
                ferramentas modernas para gerenciar seus negócios, reduzir
                no-shows em até 80% através de lembretes automáticos, e escalar
                suas operações com eficiência.
              </p>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">O Que Fazemos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O ServiceSnap é um marketplace completo de agendamento de
                serviços que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                <li>
                  <strong>Para Clientes:</strong> Busca e descoberta de serviços
                  por categoria, agendamento online em 4 etapas simples (serviço
                  → profissional → data/hora → checkout), pagamento seguro via
                  Stripe, sistema de avaliações e comentários com estrelas,
                  lembretes automáticos por SMS e email, histórico de
                  agendamentos e gerenciamento de favoritos
                </li>
                <li>
                  <strong>Para Profissionais:</strong> Dashboard completo com
                  métricas de vendas, receita e clientes; agenda visual com
                  arrastar e soltar; gestão de equipe com controle de funções
                  (Owner/Manager/Profissional); cadastro de serviços com preços
                  e durações; bloqueio de horários; notificações configuráveis
                  por SMS/Email via AWS; planos de assinatura gerenciados via
                  Stripe; e verificação profissional com selo de confiança
                </li>
                <li>
                  <strong>Para o Mercado:</strong> Redução de no-shows em até
                  80% através de lembretes inteligentes; economia de 15+ horas
                  semanais em gestão administrativa; padronização de qualidade
                  através de avaliações verificadas; e democratização do acesso
                  a serviços profissionais em todo o Brasil
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">Nossos Valores</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl text-[#1a2b4c] mb-2">Transparência</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Acreditamos em comunicação clara e honesta. Preços
                    transparentes, avaliações reais e informações completas para
                    decisões informadas.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-[#1a2b4c] mb-2">Qualidade</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Trabalhamos apenas com profissionais verificados e
                    comprometidos em oferecer serviços de excelência. A
                    satisfação dos nossos usuários é nossa prioridade.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-[#1a2b4c] mb-2">Inovação</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Estamos sempre buscando novas formas de melhorar a
                    experiência dos nossos usuários através de tecnologia e
                    design centrado no usuário.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl text-[#1a2b4c] mb-2">Comunidade</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Construímos mais do que uma plataforma - criamos uma
                    comunidade onde clientes e profissionais crescem juntos,
                    baseada em respeito e confiança mútua.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                Por Que Escolher o ServiceSnap
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Profissionais Verificados:</strong> Sistema de
                  verificação com documentação obrigatória e selo de confiança
                  para todos os prestadores
                </li>
                <li>
                  <strong>Agendamento Instantâneo 24/7:</strong> Reserve em 4
                  etapas simples, a qualquer hora, com confirmação imediata
                </li>
                <li>
                  <strong>Redução de No-Shows:</strong> Lembretes automáticos
                  inteligentes via SMS e email reduzem faltas em até 80%
                </li>
                <li>
                  <strong>Avaliações Autênticas:</strong> Sistema de 1-5
                  estrelas com comentários reais de clientes verificados
                </li>
                <li>
                  <strong>Pagamento 100% Seguro:</strong> Transações protegidas
                  por Stripe, certificado PCI DSS, com criptografia de ponta a
                  ponta
                </li>
                <li>
                  <strong>Autenticação Flexível:</strong> Login via Google OAuth
                  ou código OTP por SMS/email em 6 dígitos
                </li>
                <li>
                  <strong>Gestão Automatizada:</strong> Profissionais economizam
                  15+ horas semanais com dashboard, métricas e notificações
                  automáticas
                </li>
                <li>
                  <strong>Multiplataforma:</strong> Experiência responsiva
                  otimizada para desktop, tablet e mobile
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </Header>
  );
}
