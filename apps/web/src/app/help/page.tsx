'use client';

import { Footer, Header } from '@/components/layout';

export default function HelpPage() {
  return (
    <Header>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl text-[#1a2b4c] mb-4">Central de Ajuda</h1>
            <p className="text-gray-600">
              Encontre respostas para suas dúvidas sobre o ServiceSnap
            </p>
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl text-[#1a2b4c] mb-4">
                Perguntas Frequentes
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-[#1a2b4c] mb-2">
                    Como funciona o agendamento?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    O agendamento é simples: escolha o serviço desejado,
                    selecione um profissional disponível, escolha data e
                    horário, e confirme seu agendamento. Você receberá uma
                    confirmação por e-mail e SMS.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg text-[#1a2b4c] mb-2">
                    Como posso cancelar um agendamento?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Você pode cancelar seu agendamento diretamente pelo app ou
                    site até 24 horas antes do horário marcado. Cancelamentos de
                    última hora podem estar sujeitos a taxas conforme política
                    do prestador.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg text-[#1a2b4c] mb-2">
                    Como funciona o sistema de avaliações?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Após cada serviço realizado, você pode avaliar o
                    profissional com uma nota de 1 a 5 estrelas e deixar um
                    comentário. Sua avaliação ajuda outros usuários e
                    profissionais da plataforma.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg text-[#1a2b4c] mb-2">
                    Como posso me tornar um prestador de serviços?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Para se tornar um prestador, acesse a seção "Anunciar
                    Serviços" no menu, preencha seu cadastro profissional, envie
                    os documentos necessários para verificação e aguarde a
                    aprovação da nossa equipe.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </Header>
  );
}
