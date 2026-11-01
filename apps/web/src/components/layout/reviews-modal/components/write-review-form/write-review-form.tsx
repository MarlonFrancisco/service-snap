import { cn, Textarea } from '@repo/ui';
import {
  REVIEWS_PRIMARY_BUTTON_CLASS,
  REVIEWS_SECONDARY_BUTTON_CLASS,
} from '../../reviews-modal.styles';
import { InteractiveStarRating } from '../interactive-star-rating';
import { useWriteReviewForm } from './write-review-form.hook';

export const WriteReviewForm = () => {
  const {
    rating,
    comment,
    businessName,
    isCreatingReview,
    isFormValid,
    commentLength,
    handleRatingChange,
    handleCommentChange,
    handleSubmit,
    handleCancel,
  } = useWriteReviewForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-5 border-t border-[#EBE9F0] pt-6"
    >
      <div>
        <h3 className="text-xl font-extrabold tracking-[-0.03em]">
          Escrever uma avaliação
        </h3>
        <p className="mt-1.5 text-sm leading-[1.55] text-[#5F5C6E]">
          Compartilhe sua experiência com {businessName}
        </p>
      </div>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-[7px] p-0 text-sm font-semibold">
          Sua classificação
        </legend>
        <InteractiveStarRating rating={rating} onChange={handleRatingChange} />
      </fieldset>

      <div className="grid gap-[7px]">
        <label className="grid gap-[7px] text-sm font-semibold">
          Sua avaliação
          <Textarea
            placeholder="Descreva sua experiência com este estabelecimento..."
            value={comment}
            onChange={handleCommentChange}
            className="min-h-[120px] resize-none rounded-[14px] border-[#E3E1EA] bg-white px-4 py-3.5 text-base font-medium text-[#0B0B0F] shadow-none placeholder:text-[#6F6C7E] focus-visible:border-[#0B0B0F] focus-visible:ring-[#0B0B0F]/15 md:text-[15px]"
          />
        </label>
        <p className="text-[13px] text-[#5F5C6E]">
          Mínimo de 10 caracteres ({commentLength}/10)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:flex md:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCreatingReview}
          className={REVIEWS_SECONDARY_BUTTON_CLASS}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isCreatingReview || !isFormValid}
          className={cn(REVIEWS_PRIMARY_BUTTON_CLASS, 'px-4 md:px-[22px]')}
        >
          {isCreatingReview ? 'Enviando...' : 'Enviar avaliação'}
        </button>
      </div>
    </form>
  );
};
