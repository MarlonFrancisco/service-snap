import { PUBLIC_CONTACT_EMAIL } from '@/utils/constants/contact.constants';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui';
import { MapPin, UserPlus } from 'lucide-react';
import Link from 'next/link';

export const EmptyRecommendations = () => {
  const indicateMailto = new URL(`mailto:${PUBLIC_CONTACT_EMAIL}`);
  indicateMailto.searchParams.set(
    'subject',
    'Indicação de profissional — ServiceSnap',
  );
  indicateMailto.searchParams.set(
    'body',
    [
      'Olá! Gostaria de indicar um profissional ou negócio para o ServiceSnap.',
      '',
      'Nome do negócio:',
      'Categoria (ex.: barbearia, estética):',
      'Bairro / cidade:',
      'Instagram ou WhatsApp (se souber):',
      '',
    ].join('\n'),
  );

  const waitlistMailto = new URL(`mailto:${PUBLIC_CONTACT_EMAIL}`);
  waitlistMailto.searchParams.set(
    'subject',
    'Lista de espera — ServiceSnap',
  );
  waitlistMailto.searchParams.set(
    'body',
    [
      'Olá! Quero ser avisado quando houver profissionais na minha região.',
      '',
      'Bairro / cidade:',
      'Categoria de serviço que busco:',
      '',
    ].join('\n'),
  );

  return (
    <div className="flex flex-col gap-20 mb-10">
      <section className="px-4 w-full max-w-7xl md:px-6 mx-auto">
        <Empty className="py-16 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 mb-4">
              <MapPin className="size-8" />
            </EmptyMedia>
            <EmptyTitle>Estamos montando a rede na sua região</EmptyTitle>
            <EmptyDescription>
              Ainda não há profissionais em destaque aqui. Indique alguém do seu
              bairro, entre na lista de espera ou cadastre seu negócio.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href={indicateMailto.toString()}>
                <UserPlus className="size-4" />
                Indicar profissional
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={waitlistMailto.toString()}>Entrar na lista de espera</a>
            </Button>
            <Button asChild>
              <Link href="/pricing">Seja um parceiro</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                document
                  .getElementById('categories-grid')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explorar categorias
            </Button>
          </EmptyContent>
        </Empty>
      </section>
    </div>
  );
};
