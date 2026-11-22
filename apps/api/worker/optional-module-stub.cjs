// Pacotes opcionais que o Nest/Terminus tentam carregar com require() dentro
// de try/catch. Não estão instalados; no bundle do Worker o require falha
// igual a "módulo ausente" no Node.
throw new Error('Optional module not available in the Worker bundle');
