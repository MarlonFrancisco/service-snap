import { ICategory } from '@/types/api/service.types';
import { cn } from '@repo/ui';
import { PARTNER_MUTED_TEXT_CLASS } from '../../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_DANGER_OUTLINE_BUTTON_CLASS,
} from '../../../services-module.styles';
import { getCategoryColor } from '../../../utils/colors';
import { formatServiceCount } from '../../../utils/services-sections';
import { ServicesConfirmDialog } from '../../services-confirm-dialog';
import { useCategoryList } from './category-list.hook';

type TCategoryListConfig = {
  onEdit: (category: ICategory) => void;
};

export const CategoryList = ({ onEdit }: TCategoryListConfig) => {
  const {
    categories,
    deleteDialog,
    isDeleteDialogOpen,
    isDeletingCategory,
    setIsDeleteDialogOpen,
    handleRequestDelete,
    handleConfirmDelete,
  } = useCategoryList();

  return (
    <>
      {categories.length === 0 ? (
        <div className="py-8 text-center">
          <h3 className="text-base font-extrabold">Nenhuma categoria criada</h3>
          <p className={cn('mt-1 text-sm', PARTNER_MUTED_TEXT_CLASS)}>
            Adicione a primeira na aba ao lado.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-2.5 rounded-[14px] border border-[#EBE9F0] px-3.5 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'size-2.5 shrink-0 rounded-full',
                      getCategoryColor(category.color).swatchClass,
                    )}
                  />
                  <span className="min-w-0 break-words">{category.name}</span>
                </p>
                <p className={cn('text-[13px]', PARTNER_MUTED_TEXT_CLASS)}>
                  {formatServiceCount(category.services.length)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  aria-label={`Editar ${category.name}`}
                  onClick={() => onEdit(category)}
                  className={cn(SERVICES_BUTTON_CLASS, 'px-3.5')}
                >
                  Editar
                </button>
                <button
                  type="button"
                  aria-label={`Excluir ${category.name}`}
                  onClick={() => handleRequestDelete(category)}
                  className={cn(
                    SERVICES_DANGER_OUTLINE_BUTTON_CLASS,
                    'px-3.5',
                  )}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ServicesConfirmDialog
        isOpen={isDeleteDialogOpen}
        title={deleteDialog.title}
        description={deleteDialog.description}
        cancelLabel={deleteDialog.cancelLabel}
        confirmLabel={deleteDialog.confirmLabel}
        isPending={isDeletingCategory}
        onConfirm={handleConfirmDelete}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
};
