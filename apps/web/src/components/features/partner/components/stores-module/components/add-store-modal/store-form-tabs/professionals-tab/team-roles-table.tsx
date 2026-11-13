import { TEAM_ROLE_PERMISSIONS } from '../../../../utils/stores-module.constants';

const TITLE_ID = 'team-roles-table-title';
const ROLE_COLUMNS = [
  { key: 'owner', label: 'Dono' },
  { key: 'manager', label: 'Gerente' },
  { key: 'professional', label: 'Profissional' },
] as const;

const VALUE_CLASS: Record<string, string> = {
  Sim: 'font-semibold text-[#0A5536]',
  Não: 'text-[#5F5C6E]',
};

/** Resumo fixo do que a API libera para cada papel da equipe. */
export const TeamRolesTable = () => (
  <section
    aria-labelledby={TITLE_ID}
    className="grid gap-2.5 rounded-[24px] border border-[#EBE9F0] p-5"
  >
    <h3 id={TITLE_ID} className="text-[17px] font-bold">
      O que cada papel pode fazer
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-xs font-bold tracking-[0.04em] text-[#5F5C6E] uppercase">
            <th scope="col" className="py-2 pr-3 font-bold">
              Permissão
            </th>
            {ROLE_COLUMNS.map((column) => (
              <th key={column.key} scope="col" className="px-2 py-2 text-center font-bold">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TEAM_ROLE_PERMISSIONS.map((row) => (
            <tr key={row.permission} className="border-t border-[#F0EEF4]">
              <th scope="row" className="py-2.5 pr-3 font-semibold">
                {row.permission}
              </th>
              {ROLE_COLUMNS.map((column) => {
                const value = row[column.key];

                return (
                  <td key={column.key} className="px-2 py-2.5 text-center">
                    {VALUE_CLASS[value] ? (
                      <span className={VALUE_CLASS[value]}>{value}</span>
                    ) : (
                      <span className="inline-block rounded-full bg-[#F4F3F7] px-2 py-0.5 text-xs font-semibold">
                        {value}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
