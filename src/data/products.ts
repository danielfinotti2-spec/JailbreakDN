// Produtos (prompts pagos). Enquanto a lista estiver vazia, a loja mostra o
// estado vazio e a rota /produtos continua válida (sem redirecionamento).
//
// Para publicar um produto, copie o modelo abaixo para dentro da lista:
//
// {
//   slug: "persona-exemplo",
//   title: "Persona Exemplo — pacote completo",
//   price: 29.9,
//   tags: ["Claude", "Persona"],
//   desc: "Descrição do que o comprador recebe.",
//   preview: "Trecho de amostra (opcional).",
//   buy: "https://wa.me/55DDDNUMERO?text=Quero%20o%20pacote",
//   rating: 4.9,
// },

export interface Product {
  slug: string;
  title: string;
  price: number;
  tags?: string[];
  desc: string;
  preview?: string;
  buy: string;
  rating?: number;
}

export const PRODUCTS: Product[] = [];
