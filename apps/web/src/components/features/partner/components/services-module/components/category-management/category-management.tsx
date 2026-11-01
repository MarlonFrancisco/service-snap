import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { FormProvider } from 'react-hook-form';
import { ServicesModalFrame } from '../services-modal-frame';
import { CategoryForm } from './category-form/category-form';
import { CategoryList } from './category-list/category-list';
import { useCategoryManagement } from './category-management.hook';

const TAB_CLASS =
  'h-[42px] flex-1 rounded-full border-0 text-[13px] font-bold text-[#0B0B0F] data-[state=active]:bg-[#0B0B0F] data-[state=active]:text-white data-[state=active]:shadow-none focus-visible:ring-2 focus-visible:ring-[#0B0B0F] focus-visible:ring-offset-2';

export const CategoryManagementModal = () => {
  const {
    isCategoryModalOpen,
    isEditing,
    form,
    tab,
    isSaving,
    handleClose,
    handleBackToList,
    handleEdit,
    handleTabChange,
    handleSubmit,
  } = useCategoryManagement();

  return (
    <ServicesModalFrame
      isOpen={isCategoryModalOpen}
      title="Categorias de serviços"
      onClose={handleClose}
    >
      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="shrink-0 px-5 pb-3.5 sm:px-7">
          <TabsList className="flex h-auto w-full gap-1 rounded-full border border-[#E3E1EA] bg-white p-1">
            <TabsTrigger value="list" className={TAB_CLASS}>
              Categorias atuais
            </TabsTrigger>
            <TabsTrigger value="form" className={TAB_CLASS}>
              {isEditing ? 'Editar categoria' : 'Adicionar nova'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="list"
          className="mt-0 min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7"
        >
          <CategoryList onEdit={handleEdit} />
        </TabsContent>

        <TabsContent value="form" className="mt-0 flex min-h-0 flex-1 flex-col">
          <FormProvider {...form}>
            <CategoryForm
              isSaving={isSaving}
              onCancel={handleBackToList}
              onSubmit={handleSubmit}
            />
          </FormProvider>
        </TabsContent>
      </Tabs>
    </ServicesModalFrame>
  );
};
