import { SITE_URL } from '@/utils/constants/site.constants';
import {
  WIDGET_DEFAULT_LABEL,
  WIDGET_SCRIPT_PATH,
} from './widget-module.constants';
import type { TWidgetSnippetInput } from './widget-module.types';

/** Com a env definida o snippet aponta para o domínio oficial; senão, para onde o painel roda. */
const CONFIGURED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ? SITE_URL : null;

export const getServerWidgetOrigin = (): string =>
  CONFIGURED_ORIGIN ?? SITE_URL;

export const getBrowserWidgetOrigin = (): string =>
  CONFIGURED_ORIGIN ?? window.location.origin;

/** O texto do botão vai dentro de um atributo HTML entre aspas duplas. */
export const escapeHtmlAttribute = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const resolveWidgetLabel = (label: string): string =>
  label.trim() || WIDGET_DEFAULT_LABEL;

export const buildWidgetSnippet = ({
  origin,
  storeId,
  label,
  color,
  position,
}: TWidgetSnippetInput): string =>
  `<script src="${origin}${WIDGET_SCRIPT_PATH}" data-store="${escapeHtmlAttribute(storeId)}" data-label="${escapeHtmlAttribute(resolveWidgetLabel(label))}" data-color="${color}" data-position="${position}" async></script>`;

export const buildBookingLink = (origin: string, storeId: string): string =>
  `${origin}/booking/${storeId}`;
