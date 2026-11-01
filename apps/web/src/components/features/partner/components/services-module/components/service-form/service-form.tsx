import { FormProvider } from 'react-hook-form';
import { ServicesModalFrame } from '../services-modal-frame';
import { ServiceFormContent } from './service-form-content';
import { useServiceForm } from './service-form.hook';

export const ServiceFormModal = () => {
  const { form, isEditing, serviceName, isServiceModalOpen, handleClose } =
    useServiceForm();

  return (
    <FormProvider {...form}>
      <ServicesModalFrame
        isOpen={isServiceModalOpen}
        title={isEditing ? 'Editar serviço' : 'Novo serviço'}
        description={isEditing ? serviceName : undefined}
        onClose={handleClose}
      >
        <ServiceFormContent />
      </ServicesModalFrame>
    </FormProvider>
  );
};
