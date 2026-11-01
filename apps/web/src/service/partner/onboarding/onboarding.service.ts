import type {
  TAddServicePayload,
  TOnboardingChecklist,
  TOnboardingResult,
  TOnboardingState,
  TOnboardingStep,
  TSaveHoursPayload,
  TSaveSpacePayload,
} from '@/types/api/onboarding.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

const BASE_PATH = '/partner/onboarding';

export class OnboardingService {
  static readonly apiClient: HttpClientService = apiClient;

  static async getState(headers?: HeadersInit) {
    return await this.apiClient.get<TOnboardingState>(BASE_PATH, { headers });
  }

  static async saveSpace(payload: TSaveSpacePayload) {
    return await this.apiClient.put<TOnboardingState>(
      `${BASE_PATH}/space`,
      payload,
    );
  }

  static async saveHours(payload: TSaveHoursPayload) {
    return await this.apiClient.put<TOnboardingState>(
      `${BASE_PATH}/hours`,
      payload,
    );
  }

  static async addService(payload: TAddServicePayload) {
    return await this.apiClient.post<TOnboardingState>(
      `${BASE_PATH}/services`,
      payload,
    );
  }

  static async removeService(serviceId: string) {
    return await this.apiClient.delete<TOnboardingState>(
      `${BASE_PATH}/services/${serviceId}`,
    );
  }

  static async setStep(step: TOnboardingStep) {
    return await this.apiClient.put<TOnboardingState>(`${BASE_PATH}/step`, {
      step,
    });
  }

  static async saveOwner(payload: { enabled: boolean; serviceIds: string[] }) {
    return await this.apiClient.put<TOnboardingState>(
      `${BASE_PATH}/team/owner`,
      payload,
    );
  }

  static async addMember(payload: { email: string; serviceIds: string[] }) {
    return await this.apiClient.post<TOnboardingState>(
      `${BASE_PATH}/team/members`,
      payload,
    );
  }

  static async removeMember(memberId: string) {
    return await this.apiClient.delete<TOnboardingState>(
      `${BASE_PATH}/team/members/${memberId}`,
    );
  }

  static async complete() {
    return await this.apiClient.post<TOnboardingResult>(
      `${BASE_PATH}/complete`,
      {},
    );
  }

  static async getChecklist(storeId: string) {
    return await this.apiClient.get<TOnboardingChecklist>(
      `${BASE_PATH}/stores/${storeId}/checklist`,
    );
  }

  static async markLinkShared(storeId: string) {
    return await this.apiClient.post<TOnboardingChecklist>(
      `${BASE_PATH}/stores/${storeId}/link-shared`,
      {},
    );
  }

  static async dismissChecklist(storeId: string) {
    return await this.apiClient.post<TOnboardingChecklist>(
      `${BASE_PATH}/stores/${storeId}/checklist/dismiss`,
      {},
    );
  }

  static async setMonthlyGoal(storeId: string, monthlyGoal: number) {
    return await this.apiClient.put<TOnboardingChecklist>(
      `${BASE_PATH}/stores/${storeId}/monthly-goal`,
      { monthlyGoal },
    );
  }
}
