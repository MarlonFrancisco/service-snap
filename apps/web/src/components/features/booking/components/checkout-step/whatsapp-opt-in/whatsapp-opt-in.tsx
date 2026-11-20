'use client';

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
      <span>
        {text}
        <span className="mt-0.5 block text-[13px] text-[#5F5C6E]">
          Para deixar de receber, responda PARAR no WhatsApp.
        </span>
      </span>
    </label>
  );
}
