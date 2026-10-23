'use client';

import { PUBLIC_CONTACT_EMAIL } from '@/utils/constants/contact.constants';
import { Button, Input, Textarea } from '@repo/ui';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const lines = [
      name && `Nome: ${name}`,
      email && `E-mail: ${email}`,
      phone && `Telefone: ${phone}`,
      '',
      message,
    ].filter((line) => line !== undefined);

    const mailto = new URL(`mailto:${PUBLIC_CONTACT_EMAIL}`);
    mailto.searchParams.set(
      'subject',
      subject.trim() || 'Contato via ssnap.io',
    );
    mailto.searchParams.set('body', lines.join('\n'));

    window.location.href = mailto.toString();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h1 className="text-4xl text-[#1a2b4c] mb-4">Entre em Contato</h1>
            <p className="text-gray-600 mb-8">
              Tem alguma dúvida, sugestão ou precisa de ajuda? Escreva para nós
              — abrimos seu cliente de e-mail com a mensagem pronta.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome completo
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Telefone{' '}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Digite seu telefone"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Assunto
                </label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Assunto da mensagem"
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#20b2aa] hover:bg-[#20b2aa]/90 text-white"
              >
                Abrir e-mail para enviar
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl text-[#1a2b4c] mb-6">
              Informações de Contato
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[#1a2b4c] mb-2">
                  Atendimento
                </h3>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>E-mail:</strong>{' '}
                    <a
                      href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                      className="text-[#20b2aa] hover:underline"
                    >
                      {PUBLIC_CONTACT_EMAIL}
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    Respondemos por e-mail em dias úteis. Telefone, WhatsApp e
                    endereço físico serão publicados quando estiverem
                    disponíveis — não usamos números placeholder.
                  </p>
                </div>
              </div>

              <div>
                <a
                  href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-[#20b2aa] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Enviar e-mail direto
                </a>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[#1a2b4c] mb-2">
                  Quer ser parceiro?
                </h3>
                <p className="text-gray-600 mb-3 text-sm">
                  Conheça os planos e cadastre seu negócio no ServiceSnap.
                </p>
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-[#20b2aa] hover:underline"
                >
                  Ver planos →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
