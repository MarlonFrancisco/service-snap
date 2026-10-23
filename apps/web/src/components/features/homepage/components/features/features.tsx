import { Clock, Shield, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const Features = () => {
  return (
    <section className="py-20 px-6" id="service-snap-features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
            Por que usar o ServiceSnap?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            A plataforma que conecta você aos melhores profissionais com total
            segurança e praticidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div className="feature-item text-center group">
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Agendamento instantâneo
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Reserve seus horários em segundos, com confirmação automática e
              lembretes inteligentes.
            </p>
          </motion.div>

          <motion.div className="feature-item text-center group">
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-purple-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-purple-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Profissionais verificados
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Todos os prestadores passam por verificação rigorosa de documentos
              e qualificações.
            </p>
          </motion.div>

          <motion.div className="feature-item text-center group">
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
                <Star className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Qualidade garantida
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sistema de avaliações transparente para você escolher com base em
              experiências reais de outros clientes.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
