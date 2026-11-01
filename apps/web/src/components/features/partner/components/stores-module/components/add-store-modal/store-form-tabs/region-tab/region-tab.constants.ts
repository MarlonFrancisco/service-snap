export const TIMEZONE_GROUPS = [
  {
    label: 'Américas',
    options: [
      { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
      {
        value: 'America/Argentina/Buenos_Aires',
        label: 'Buenos Aires (GMT-3)',
      },
      { value: 'America/Santiago', label: 'Santiago (GMT-4)' },
      { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
      { value: 'America/Lima', label: 'Lima (GMT-5)' },
      { value: 'America/Mexico_City', label: 'Cidade do México (GMT-6)' },
      { value: 'America/New_York', label: 'Nova York (GMT-5)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
    ],
  },
  {
    label: 'Europa',
    options: [
      { value: 'Europe/Lisbon', label: 'Lisboa (GMT+0)' },
      { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
      { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
      { value: 'Europe/Berlin', label: 'Berlim (GMT+1)' },
      { value: 'Europe/Rome', label: 'Roma (GMT+1)' },
      { value: 'Europe/Amsterdam', label: 'Amsterdã (GMT+1)' },
      { value: 'Europe/London', label: 'Londres (GMT+0)' },
      { value: 'Europe/Dublin', label: 'Dublin (GMT+0)' },
      { value: 'Europe/Brussels', label: 'Bruxelas (GMT+1)' },
      { value: 'Europe/Vienna', label: 'Viena (GMT+1)' },
    ],
  },
] as const;
