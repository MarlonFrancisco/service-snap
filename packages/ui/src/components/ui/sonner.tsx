import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      richColors
      duration={4000}
      gap={12}
      style={
        {
          '--normal-bg': 'var(--ss-white)',
          '--normal-text': 'var(--ss-ink)',
          '--normal-border': 'var(--ss-line)',
          '--normal-color': 'var(--ss-ink)',
          '--success-bg': 'var(--ss-success-bg)',
          '--success-text': 'var(--ss-success)',
          '--success-border': 'var(--ss-success-bg)',
          '--success-color': 'var(--ss-success)',
          '--error-bg': 'var(--ss-error-bg)',
          '--error-text': 'var(--ss-error)',
          '--error-border': 'var(--ss-error-line)',
          '--error-color': 'var(--ss-error)',
          '--warning-bg': 'var(--ss-warning-bg)',
          '--warning-text': 'var(--ss-warning)',
          '--warning-border': 'var(--ss-warning-line)',
          '--warning-color': 'var(--ss-warning)',
          '--info-bg': 'var(--ss-info-bg)',
          '--info-text': 'var(--ss-info)',
          '--info-border': 'var(--ss-info-bg)',
          '--info-color': 'var(--ss-info)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
