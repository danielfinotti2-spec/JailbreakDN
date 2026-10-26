// Produtos (prompts pagos). Enquanto a lista estiver vazia, a aba "Produtos"
// fica escondida do menu e a página /produtos não aparece.
//
// Para postar um produto, copie o modelo abaixo para dentro da lista:
//
// {
//   slug: "persona-vant",                 // vira o endereço: /produtos/persona-vant
//   title: "Persona VANT — pacote completo",
//   price: 29.9,                          // 0 = "Grátis"
//   tags: ["Claude", "Persona", "Longo", "Novo"],
//   desc: "Descrição do que o comprador recebe.",
//   preview: "Trecho de amostra do prompt (opcional).",
//   buy: "https://wa.me/55DDDNUMERO?text=Quero%20o%20VANT",  // link de pagamento ou WhatsApp
//   rating: 4.9,                          // opcional
// },
export const PRODUCTS = [];
