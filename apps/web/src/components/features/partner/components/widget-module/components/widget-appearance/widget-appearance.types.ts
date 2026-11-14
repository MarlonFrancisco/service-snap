import type { ChangeEvent } from 'react';
import type {
  TWidgetColor,
  TWidgetColorId,
  TWidgetPosition,
} from '../../widget-module.types';

export type TWidgetAppearanceConfig = {
  label: string;
  color: TWidgetColor;
  position: TWidgetPosition;
  onLabelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onColorChange: (colorId: TWidgetColorId) => void;
  onPositionChange: (position: TWidgetPosition) => void;
};
