// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TBookingFormData } from './booking.schema';
import { CheckoutStep } from './components/checkout-step';
import { DateTimeSelectionStep } from './components/date-time-selection-step';
import { ProfessionalSelectionStep } from './components/professional-selection-step';
import { ServiceSelectionStep } from './components/service-selection-step';

const { availability, createSchedule, toastError, store } = vi.hoisted(() => ({
  availability: vi.fn(),
  createSchedule: vi.fn(),
  toastError: vi.fn(),
  store: {
    id: 'store-1',
    currency: 'BRL',
    country: 'BR',
    services: [] as unknown[],
    storeMembers: [] as unknown[],
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('sonner', () => ({
  toast: { error: toastError, success: vi.fn(), info: vi.fn() },
}));
vi.mock('@repo/ui', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));
vi.mock('./booking.hook', () => ({ useGetStore: () => store }));
vi.mock('@/hooks/use-query/use-availability-query', () => ({
  useAvailabilityQuery: availability,
}));
vi.mock('./components/date-time-selection-step/booking-calendar', () => ({
  BookingCalendar: () => null,
}));
vi.mock('./components/date-time-selection-step/date-picker-horizontal', () => ({
  DatePickerHorizontal: () => null,
}));
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: createSchedule, isPending: false }),
}));
vi.mock('@/hooks/use-query/use-user-query', () => ({
  useUserQuery: () => ({
    user: { firstName: 'Ana', lastName: 'Lima', email: 'ana@example.com' },
    isLoggedIn: true,
  }),
}));

const SERVICE_A = {
  id: 'a',
  name: 'Corte',
  description: '',
  price: 50,
  duration: 30,
};
const SERVICE_B = { ...SERVICE_A, id: 'b', name: 'Barba' };

const makeMember = (id: string, services: (typeof SERVICE_A)[]) => ({
  id,
  role: 'professional',
  isActive: true,
  services,
  schedules: [],
  blockedTimes: [],
  user: { id: `user-${id}`, firstName: id, lastName: 'Silva' },
});

const withQuantity = (service: typeof SERVICE_A, quantity = 1) => ({
  ...service,
  quantity,
});

let form: UseFormReturn<TBookingFormData>;
let root: Root;

function Harness({
  defaults,
  children,
}: {
  defaults: Partial<TBookingFormData>;
  children: React.ReactNode;
}) {
  form = useForm<TBookingFormData>({
    defaultValues: {
      selectedServices: [],
      selectedProfessional: null,
      isAnyProfessional: false,
      selectedDate: undefined,
      selectedTime: null,
      ...defaults,
    },
  });
  // formState é um proxy: só atualiza os campos lidos durante o render.
  void form.formState.errors;
  return <FormProvider {...form}>{children}</FormProvider>;
}

const render = async (
  step: React.ReactNode,
  defaults: Partial<TBookingFormData>,
) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<Harness defaults={defaults}>{step}</Harness>);
  });
  return container;
};

const clickButton = async (container: HTMLElement, label: string) => {
  const button = Array.from(container.querySelectorAll('button')).find(
    (el) =>
      el.textContent?.includes(label) ||
      el.getAttribute('aria-label')?.includes(label),
  );
  await act(async () => {
    button!.click();
  });
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  store.services = [];
  store.storeMembers = [];
});

afterEach(() => {
  act(() => root.unmount());
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

describe('CheckoutStep', () => {
  const checkoutValues = {
    selectedServices: [withQuantity(SERVICE_A, 2)],
    selectedDate: new Date(2026, 10, 3),
    selectedTime: '10:00',
  };

  it('sends the professional assigned to the slot for "any professional"', async () => {
    const container = await render(<CheckoutStep onConfirmed={vi.fn()} />, {
      ...checkoutValues,
      isAnyProfessional: true,
      assignedProfessionalId: 'p1',
    });

    await clickButton(container, 'Confirmar agendamento');

    expect(createSchedule.mock.calls[0]![0]).toMatchObject({
      startTime: '10:00',
      endTime: '11:00',
      date: '2026-11-03',
      storeMember: { id: 'p1' },
    });
  });

  it('does not submit "any professional" without an assigned professional', async () => {
    const container = await render(<CheckoutStep onConfirmed={vi.fn()} />, {
      ...checkoutValues,
      isAnyProfessional: true,
    });

    await clickButton(container, 'Confirmar agendamento');

    expect(createSchedule).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });

  it('keeps the chosen professional and sends the real end time', async () => {
    const container = await render(<CheckoutStep onConfirmed={vi.fn()} />, {
      ...checkoutValues,
      selectedProfessional: makeMember('p2', [SERVICE_A]) as never,
    });

    await clickButton(container, 'Confirmar agendamento');

    const payload = createSchedule.mock.calls[0]![0];
    expect(payload.storeMember).toEqual({ id: 'p2' });
    expect(payload.endTime).toBe('11:00');
    expect(payload.endTime).not.toBe(payload.startTime);
  });
});

describe('DateTimeSelectionStep', () => {
  const dateValues = {
    selectedServices: [withQuantity(SERVICE_A, 2)],
    selectedDate: new Date(2026, 10, 3),
    isAnyProfessional: true,
  };

  const mockSlots = (slots: unknown[]) =>
    availability.mockReturnValue({
      slots,
      isLoadingSlots: false,
      isSlotsError: false,
    });

  it('asks the API for the date, one id per unit and the professional', async () => {
    mockSlots([]);
    await render(<DateTimeSelectionStep />, {
      ...dateValues,
      isAnyProfessional: false,
      selectedProfessional: makeMember('p2', [SERVICE_A]) as never,
    });

    expect(availability).toHaveBeenCalledWith({
      storeId: 'store-1',
      date: '2026-11-03',
      serviceIds: ['a', 'a'],
      memberId: 'p2',
    });
  });

  it('stores the time and the professional assigned to the slot', async () => {
    mockSlots([{ time: '10:00', available: true, storeMemberId: 'p1' }]);
    const container = await render(<DateTimeSelectionStep />, dateValues);

    await clickButton(container, 'Selecionar horário 10:00');

    expect(form.getValues('selectedTime')).toBe('10:00');
    expect(form.getValues('assignedProfessionalId')).toBe('p1');
  });

  it('clears a selected time that is no longer available', async () => {
    mockSlots([{ time: '10:00', available: false, storeMemberId: null }]);
    await render(<DateTimeSelectionStep />, {
      ...dateValues,
      selectedTime: '10:00',
      assignedProfessionalId: 'p1',
    });

    expect(form.getValues('selectedTime')).toBeNull();
    expect(form.getValues('assignedProfessionalId')).toBeNull();
  });

  it('shows an error when the slots cannot be loaded', async () => {
    availability.mockReturnValue({
      slots: undefined,
      isLoadingSlots: false,
      isSlotsError: true,
    });
    const container = await render(<DateTimeSelectionStep />, dateValues);

    expect(container.querySelector('[role=alert]')?.textContent).toContain(
      'Não foi possível carregar',
    );
  });
});

describe('ProfessionalSelectionStep', () => {
  const selectedServices = [withQuantity(SERVICE_A), withQuantity(SERVICE_B)];

  it('does not block when only partial professionals are available', async () => {
    store.storeMembers = [makeMember('p1', [SERVICE_A])];
    await render(<ProfessionalSelectionStep />, { selectedServices });

    expect(form.formState.errors.root).toBeUndefined();
  });

  it('blocks when no professional performs any selected service', async () => {
    store.storeMembers = [makeMember('p1', [])];
    await render(<ProfessionalSelectionStep />, { selectedServices });

    expect(form.formState.errors.root?.message).toContain(
      'não pode ser realizada',
    );
  });
});

describe('ServiceSelectionStep', () => {
  it('updates the quantity without mutating the current form objects', async () => {
    store.services = [SERVICE_A];
    const original = withQuantity(SERVICE_A);
    const container = await render(<ServiceSelectionStep />, {
      selectedServices: [original],
    });

    await clickButton(container, 'Adicionar mais um');

    expect(original.quantity).toBe(1);
    expect(form.getValues('selectedServices')[0]!.quantity).toBe(2);
    expect(form.getValues('selectedServices')[0]).not.toBe(original);
  });
});
