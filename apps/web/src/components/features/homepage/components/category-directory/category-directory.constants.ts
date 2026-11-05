/** Grupos da seção "Explore por categoria" da home. Todo slug tem página em `CATEGORY_GUIDES`. */
export type TCategoryDirectoryGroup = {
  title: string;
  items: { slug: string; label: string }[];
};

export const CATEGORY_DIRECTORY_GROUPS: TCategoryDirectoryGroup[] = [
  {
    title: 'Beleza',
    items: [
      { slug: 'barbearia', label: 'Barbearia' },
      { slug: 'salao-de-beleza', label: 'Salão de Beleza' },
      { slug: 'manicure', label: 'Manicure' },
      { slug: 'estetica', label: 'Estética' },
      { slug: 'spa-massagem', label: 'Spa e massagem' },
      { slug: 'tatuagem', label: 'Tatuagem' },
    ],
  },
  {
    title: 'Saúde',
    items: [
      { slug: 'odontologia', label: 'Odontologia' },
      { slug: 'dermatologia', label: 'Dermatologia' },
      { slug: 'psicologia', label: 'Psicologia' },
      { slug: 'nutricao', label: 'Nutrição' },
      { slug: 'fisioterapia', label: 'Fisioterapia' },
    ],
  },
  {
    title: 'Esporte e bem-estar',
    items: [
      { slug: 'academia', label: 'Academia' },
      { slug: 'personal-trainer', label: 'Personal trainer' },
      { slug: 'pilates', label: 'Pilates' },
      { slug: 'yoga', label: 'Yoga' },
    ],
  },
  {
    title: 'Casa e veículos',
    items: [
      { slug: 'limpeza', label: 'Limpeza' },
      { slug: 'eletricista', label: 'Eletricista' },
      { slug: 'encanador', label: 'Encanador' },
      { slug: 'pintura', label: 'Pintura' },
      { slug: 'carpintaria', label: 'Carpintaria' },
      { slug: 'jardinagem', label: 'Jardinagem' },
      { slug: 'mecanica', label: 'Mecânica' },
    ],
  },
  {
    title: 'Serviços profissionais',
    items: [
      { slug: 'advocacia', label: 'Advocacia' },
      { slug: 'contabilidade', label: 'Contabilidade' },
      { slug: 'consultoria', label: 'Consultoria' },
      { slug: 'design', label: 'Design' },
      { slug: 'marketing', label: 'Marketing' },
      { slug: 'fotografia', label: 'Fotografia' },
    ],
  },
  {
    title: 'Pets',
    items: [
      { slug: 'pet-shop', label: 'Pet shop' },
      { slug: 'veterinario', label: 'Veterinário' },
    ],
  },
];
