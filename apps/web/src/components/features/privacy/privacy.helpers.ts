/** Palavra que a pessoa digita para liberar a exclusão da conta. */
export const DELETE_ACCOUNT_CONFIRM_WORD = 'EXCLUIR';

export const PLAN_HREF = '/partner/plans/me';

/** Sem diferenciar maiúsculas nem espaços nas pontas. */
export const isDeleteConfirmed = (value: string) =>
  value.trim().toUpperCase() === DELETE_ACCOUNT_CONFIRM_WORD;

/** Salva um JSON como arquivo, sem passar por URL nem guardar no navegador. */
export const downloadJsonFile = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
