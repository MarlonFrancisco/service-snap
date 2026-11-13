export type TStorePublicPresenceConfig = {
  storeId: string;
  /** Link curto da loja; sem ele, o link usa o id. */
  slug?: string | null;
  instagram?: string | null;
};
