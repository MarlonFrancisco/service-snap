import { cn } from '@repo/ui/lib/utils';

interface CountryFlagProps {
  code: string;
  className?: string;
}

function CountryFlag({ code, className }: CountryFlagProps) {
  const iso = code.trim().toLowerCase();

  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      className={cn(
        'inline-block h-3.5 w-5 shrink-0 rounded-[3px] object-cover',
        className,
      )}
    />
  );
}

export { CountryFlag };
