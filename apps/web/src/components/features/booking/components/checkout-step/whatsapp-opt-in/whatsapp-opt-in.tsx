'use client';

const LINK_CLASS =
  'cursor-pointer font-semibold text-[#0B0B0F] underline disabled:cursor-default disabled:opacity-60';

type TWhatsappOptInProps = {
  text: string;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Caixa desmarcada: o "sim" tem de ser do cliente (#37). */
export function WhatsappOptIn({
  text,
  isChecked,
  onCheckedChange,
}: TWhatsappOptInProps) {
  return (
    <label className="mt-5 flex max-w-[420px] cursor-pointer items-start gap-3 text-sm leading-[1.5] text-[#0B0B0F]">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-[3px] size-[18px] shrink-0 cursor-pointer accent-[#0B0B0F]"
      />
      {/* O texto da API já diz como sair: é o mesmo que fica guardado */}
      <span>{text}</span>
    </label>
  );
}

type TWhatsappOptInGrantedProps = {
  isRevoking: boolean;
  onRevoke: () => void;
};

/** Quem já aceitou retira no mesmo sítio onde aceitou. */
export function WhatsappOptInGranted({
  isRevoking,
  onRevoke,
}: TWhatsappOptInGrantedProps) {
  return (
    <p className="mt-5 max-w-[420px] text-sm leading-[1.5] text-[#5F5C6E]">
      Já recebe lembretes por WhatsApp.{' '}
      <button
        type="button"
        onClick={onRevoke}
        disabled={isRevoking}
        className={LINK_CLASS}
      >
        {isRevoking ? 'Retirando…' : 'Deixar de receber'}
      </button>
    </p>
  );
}
