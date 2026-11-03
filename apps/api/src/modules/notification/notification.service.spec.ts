import { describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service';

const makeService = () => {
  const service = new NotificationService(
    { get: vi.fn().mockReturnValue('re_test') } as never,
    {} as never,
  );
  const sendEmail = vi
    .spyOn(service, 'sendEmail')
    .mockResolvedValue(undefined as never);

  return { service, sendEmail };
};

describe('NotificationService codes', () => {
  it('sends the login code inside the ServiceSnap layout', async () => {
    const { service, sendEmail } = makeService();

    await service.sendEmailOTP('ana@gmail.com', '482913');

    const [to, subject, html] = sendEmail.mock.calls[0]!;
    expect(to).toBe('ana@gmail.com');
    expect(subject).toBe('Seu código de acesso ao ServiceSnap');
    expect(html).toContain('servicesnap<span');
    expect(html).toContain('Confirme sua identidade');
    expect(html).toContain('>482913</td>');
    expect(html).toContain('vale por 20 minutos');
    expect(html).toContain('Nunca pedimos este código');
  });

  it('sends the WhatsApp e-mail code naming the store', async () => {
    const { service, sendEmail } = makeService();

    await service.sendEmailConfirmationCode('ana@gmail.com', {
      code: '004211',
      storeName: 'Barbearia <Central>',
      minutes: 10,
    });

    const [, subject, html] = sendEmail.mock.calls[0]!;
    expect(subject).toBe('Seu código para confirmar o e-mail');
    expect(html).toContain('Confirme seu e-mail');
    expect(html).toContain('>004211</td>');
    expect(html).toContain('na conversa com Barbearia &lt;Central&gt;');
    expect(html).toContain('vale por 10 minutos');
  });
});
