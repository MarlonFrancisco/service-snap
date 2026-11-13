'use client';

import { cn, Skeleton } from '@repo/ui';
import { Percent } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../notifications-module/components/module-state';
import {
  MANAGEMENT_BUTTON_CLASS,
  MANAGEMENT_CAPTION_CLASS,
  MANAGEMENT_CELL_CLASS,
  MANAGEMENT_HEAD_CELL_CLASS,
  MANAGEMENT_LEAD_CLASS,
  MANAGEMENT_NUMBER_CLASS,
  MANAGEMENT_SMALL_BUTTON_CLASS,
  MANAGEMENT_TABLE_CLASS,
  MANAGEMENT_TABLE_WRAPPER_CLASS,
  MANAGEMENT_TITLE_CLASS,
} from '../../../cash-module/cash-module.styles';
import { CommissionsKpis } from '../commissions-kpis';
import { CommissionsLines } from '../commissions-lines';
import { CommissionsPeriod } from '../commissions-period';
import { useCommissionsReport } from './commissions-report.hook';

const SELECTED_BUTTON_CLASS =
  'border-[#0B0B0F] bg-[#0B0B0F] text-white hover:bg-[#2B2B2B]';

export const CommissionsReport = () => {
  const {
    periodState,
    kpis,
    professionalRows,
    selectedName,
    lineRows,
    handleSelectMember,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
  } = useCommissionsReport();

  const hasPeriod = !periodState.periodError;

  const renderTables = () => {
    if (!hasPeriod) return null;
    if (isError) {
      return <ModuleErrorState headingLevel="h3" onRetry={handleRetry} />;
    }
    if (isLoading) {
      return (
        <Skeleton
          role="status"
          aria-label="Carregando comissões"
          className="h-48 rounded-[20px] bg-[#F0EEF4]"
        />
      );
    }
    if (professionalRows.length === 0) {
      return (
        <ModuleStatePanel
          icon={Percent}
          headingLevel="h3"
          title="Nenhum atendimento concluído no período"
          description="Os atendimentos concluídos pela equipe aparecem aqui com a comissão de cada um."
        />
      );
    }

    return (
      <>
        <div
          role="region"
          aria-label="Comissões por profissional"
          aria-busy={isRefreshing || undefined}
          tabIndex={0}
          className={cn(
            MANAGEMENT_TABLE_WRAPPER_CLASS,
            isRefreshing && 'opacity-70',
          )}
        >
          <table className={cn(MANAGEMENT_TABLE_CLASS, 'min-w-[620px]')}>
            <thead>
              <tr>
                <th scope="col" className={MANAGEMENT_HEAD_CELL_CLASS}>
                  Profissional
                </th>
                <th
                  scope="col"
                  className={cn(MANAGEMENT_HEAD_CELL_CLASS, 'text-right')}
                >
                  Atendimentos
                </th>
                <th
                  scope="col"
                  className={cn(MANAGEMENT_HEAD_CELL_CLASS, 'text-right')}
                >
                  Base
                </th>
                <th
                  scope="col"
                  className={cn(MANAGEMENT_HEAD_CELL_CLASS, 'text-right')}
                >
                  Comissão
                </th>
                <th scope="col" className={MANAGEMENT_HEAD_CELL_CLASS}>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {professionalRows.map((row) => (
                <tr key={row.storeMemberId} className="group">
                  <th
                    scope="row"
                    className={cn(MANAGEMENT_CELL_CLASS, 'text-left font-bold')}
                  >
                    {row.name}
                  </th>
                  <td
                    className={cn(
                      MANAGEMENT_CELL_CLASS,
                      MANAGEMENT_NUMBER_CLASS,
                    )}
                  >
                    {row.attendances}
                  </td>
                  <td
                    className={cn(
                      MANAGEMENT_CELL_CLASS,
                      MANAGEMENT_NUMBER_CLASS,
                    )}
                  >
                    {row.base}
                  </td>
                  <td
                    className={cn(
                      MANAGEMENT_CELL_CLASS,
                      MANAGEMENT_NUMBER_CLASS,
                      'font-bold',
                    )}
                  >
                    {row.commission}
                  </td>
                  <td className={cn(MANAGEMENT_CELL_CLASS, 'text-right')}>
                    <button
                      type="button"
                      aria-pressed={row.isSelected}
                      aria-controls="commission-lines"
                      aria-label={`Ver atendimentos de ${row.name}`}
                      onClick={() => handleSelectMember(row.storeMemberId)}
                      className={cn(
                        MANAGEMENT_BUTTON_CLASS,
                        MANAGEMENT_SMALL_BUTTON_CLASS,
                        row.isSelected && SELECTED_BUTTON_CLASS,
                      )}
                    >
                      Ver atendimentos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div id="commission-lines" className="grid gap-3">
          <h3 className={cn(MANAGEMENT_CAPTION_CLASS, 'mt-2')}>
            Atendimentos de {selectedName}
          </h3>
          <CommissionsLines
            rows={lineRows}
            label={`Atendimentos de ${selectedName}`}
            isRefreshing={isRefreshing}
          />
        </div>
      </>
    );
  };

  return (
    <section
      aria-labelledby="commissions-title"
      className="grid content-start gap-[18px]"
    >
      <div>
        <h2 id="commissions-title" className={MANAGEMENT_TITLE_CLASS}>
          Comissões
        </h2>
        <p className={MANAGEMENT_LEAD_CLASS}>
          Só atendimentos concluídos. A base é o que a loja recebeu no
          fechamento; sem fechamento, o preço reservado.
        </p>
      </div>

      <CommissionsPeriod {...periodState} />

      <CommissionsKpis kpis={kpis} isLoading={isLoading && hasPeriod} />

      {renderTables()}
    </section>
  );
};
