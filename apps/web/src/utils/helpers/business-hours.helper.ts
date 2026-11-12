/**
 * Formata as informações de horário de funcionamento de um serviço
 * @param openTime - Hora de abertura (ex: "09:00")
 * @param closeTime - Hora de fechamento (ex: "18:00")
 * @param businessDays - Objeto com dias da semana
 * @returns String formatada com o horário de funcionamento
 */
export const formatBusinessHours = (
  openTime: string,
  closeTime: string,
  businessDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  },
): string => {
  const dayNames = [
    { key: 'monday', short: 'Seg', full: 'Segunda' },
    { key: 'tuesday', short: 'Ter', full: 'Terça' },
    { key: 'wednesday', short: 'Qua', full: 'Quarta' },
    { key: 'thursday', short: 'Qui', full: 'Quinta' },
    { key: 'friday', short: 'Sex', full: 'Sexta' },
    { key: 'saturday', short: 'Sáb', full: 'Sábado' },
    { key: 'sunday', short: 'Dom', full: 'Domingo' },
  ];

  // Converter horários para formato 12h
  const formatTime = (time: string): string => {
    const [hours = '0', minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const m = minutes || '00';
    return `${h}h${m !== '00' ? m : ''}`;
  };

  const openFormatted = formatTime(openTime);
  const closeFormatted = formatTime(closeTime);

  // Encontrar os dias abertos
  const openDays = dayNames.filter(
    (day) => businessDays[day.key as keyof typeof businessDays],
  );

  if (openDays.length === 0) {
    return 'Fechado';
  }

  // Agrupar dias consecutivos
  const groups: string[][] = [];
  let currentGroup: string[] = [];

  openDays.forEach((day, index) => {
    const prevIndex = index - 1;
    const isDayAfterPrevious =
      prevIndex >= 0 &&
      dayNames.indexOf(openDays[prevIndex]!) === dayNames.indexOf(day) - 1;

    if (prevIndex === -1 || isDayAfterPrevious) {
      currentGroup.push(day.short);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [day.short];
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Formatar grupos de dias
  const formattedGroups = groups.map((group) => {
    if (group.length === 1) {
      return group[0];
    }
    return `${group[0]}-${group[group.length - 1]}`;
  });

  return `${formattedGroups.join(' | ')}: ${openFormatted} às ${closeFormatted}`;
};
