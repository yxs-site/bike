export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: string;
  isNew?: boolean;
  details?: string;
}

export interface NonFunctionalRequirement {
  id: string;
  category: string;
  description: string;
}

export const functionalRequirements: Requirement[] = [
  // 1.1 Módulo de Usuários
  {
    id: "RF 1.1",
    title: "Cadastro de Cliente",
    description: "Permitir o cadastro de clientes com Nome, Gmail, Telefone, CPF e Foto.",
    category: "Usuários",
    details: "Validação de unicidade de CPF e Gmail. Foto obrigatória para segurança."
  },
  {
    id: "RF 1.2",
    title: "Cadastro de Funcionário",
    description: "Permitir o cadastro de funcionários com Nome, Gmail, Telefone e CPF.",
    category: "Usuários",
    details: "Controle interno e segurança."
  },
  {
    id: "RF 1.3",
    title: "Login e Gestão de Perfil",
    description: "Login e gestão completa de perfil para clientes e funcionários.",
    category: "Usuários",
    details: "Alteração de dados pessoais e senhas."
  },
  {
    id: "RF 1.4",
    title: "Histórico de Transações",
    description: "Exibir histórico de aluguéis, compras e manutenções.",
    category: "Usuários",
    details: "Detalhado para todas as operações."
  },
  {
    id: "RF 1.5",
    title: "Gestão de Endereços",
    description: "Cadastrar, editar e selecionar múltiplos endereços de entrega.",
    category: "Usuários",
    isNew: true,
    details: "Campos: CEP, Rua, Número, Bairro, Cidade, Estado, Complemento."
  },

  // 1.2 Módulo de Vendas
  {
    id: "RF 2.1",
    title: "Catálogo de Produtos",
    description: "Gerenciar catálogo com nome, descrição, fotos, preço e categoria.",
    category: "Vendas",
    details: "Categorias: peças, acessórios, veículos."
  },
  {
    id: "RF 2.2",
    title: "Gestão de Estoque",
    description: "Gerenciar estoque físico (Pedreira Lomas) e online com alertas.",
    category: "Vendas",
    details: "Sincronização entre canais."
  },
  {
    id: "RF 2.3",
    title: "Checkout Online",
    description: "Processo de compra com seleção de endereço ou retirada.",
    category: "Vendas",
    details: "Integração com RF 1.5 para endereços."
  },
  {
    id: "RF 2.4",
    title: "Cálculo de Frete",
    description: "Integração logística para cálculo baseado em CEP e dimensões.",
    category: "Vendas",
    details: "Correios e transportadoras."
  },
  {
    id: "RF 2.5",
    title: "Emissão de Pedidos e Notas",
    description: "Gerar pedidos e emitir NF-e via sistema fiscal.",
    category: "Vendas",
    details: "Automação fiscal."
  },
  {
    id: "RF 2.6",
    title: "Venda em Loja Física (PDV)",
    description: "Interface PDV para funcionários registrarem vendas.",
    category: "Vendas",
    isNew: true,
    details: "Busca de cliente e registro para garantia."
  },

  // 1.3 Módulo de Aluguel
  {
    id: "RF 3.1",
    title: "Mapa Interativo e Geofence",
    description: "Mapa com estações e limite geográfico (Utinga).",
    category: "Aluguel",
    details: "Visualização clara das zonas permitidas."
  },
  {
    id: "RF 3.2",
    title: "Disponibilidade Real-time",
    description: "Exibir quantidade e tipo de veículos por estação.",
    category: "Aluguel",
    details: "Atualização em tempo real."
  },
  {
    id: "RF 3.3",
    title: "Opção de Seguro",
    description: "Oferta de seguro (R$ 2,00) com descrição de cobertura.",
    category: "Aluguel",
    details: "Opcional no início do aluguel."
  },
  {
    id: "RF 3.4",
    title: "Comunicação IoT",
    description: "Comandos remotos de travamento e destravamento via MQTT.",
    category: "Aluguel",
    details: "Integração de hardware."
  },
  {
    id: "RF 3.5",
    title: "Monitoramento Geográfico",
    description: "Travamento remoto ao sair da zona permitida.",
    category: "Aluguel",
    details: "Segurança ativa da frota."
  },
  {
    id: "RF 3.6",
    title: "Cálculo de Aluguel",
    description: "Cálculo automático de duração e custo total.",
    category: "Aluguel",
    details: "Inclusão de seguro se selecionado."
  },

  // 1.4 Manutenção
  {
    id: "RF 4.1",
    title: "Visualização de Agenda",
    description: "Slots de 1 hora disponíveis para manutenção.",
    category: "Manutenção",
    details: "Calendário interativo."
  },
  {
    id: "RF 4.2",
    title: "Agendamento",
    description: "Seleção de slot, tipo de veículo e problema.",
    category: "Manutenção",
    details: "Confirmação pelo usuário."
  },
  {
    id: "RF 4.3",
    title: "Orçamento e Aprovação",
    description: "Fluxo de envio, aprovação e rejeição de orçamentos.",
    category: "Manutenção",
    details: "Histórico de comunicação."
  },

  // 1.5 Financeiro
  {
    id: "RF 5.1",
    title: "Pagamentos e Recargas",
    description: "Gateway para Pix, Crédito e Débito.",
    category: "Financeiro",
    details: "Processamento seguro."
  },
  {
    id: "RF 5.2",
    title: "Uso de Saldo",
    description: "Pagamento com saldo de carteira digital.",
    category: "Financeiro",
    details: "Flexibilidade de pagamento."
  },
  {
    id: "RF 5.3",
    title: "Gestão de Estornos",
    description: "Processo de estorno e devoluções com registro.",
    category: "Financeiro",
    isNew: true,
    details: "Controle financeiro reverso."
  },

  // 1.6 Administração
  {
    id: "RF 6.1",
    title: "Gestão de Frota",
    description: "CRUD de veículos e definição de status.",
    category: "Admin",
    details: "Ativo, Inativo, Manutenção."
  },
  {
    id: "RF 6.2",
    title: "Painel de Controle",
    description: "Dashboard de monitoramento geral.",
    category: "Admin",
    details: "Frota, vendas, agenda, financeiro."
  },
  {
    id: "RF 6.3",
    title: "Configuração Geofence",
    description: "Ajuste do raio limite de Utinga.",
    category: "Admin",
    details: "Gestão geográfica."
  },
  {
    id: "RF 6.4",
    title: "Configuração de Tarifas",
    description: "Definição de preços por minuto e tipo.",
    category: "Admin",
    details: "Precificação dinâmica."
  },
  {
    id: "RF 6.5",
    title: "Gestão de Estações",
    description: "Cadastro de novos pontos de aluguel.",
    category: "Admin",
    details: "Expansão da rede."
  }
];

export const nonFunctionalRequirements: NonFunctionalRequirement[] = [
  {
    id: "RNF 1",
    category: "Performance",
    description: "Tempo de resposta < 3s para operações críticas (aluguel, travamento, checkout)."
  },
  {
    id: "RNF 2",
    category: "Segurança",
    description: "Conformidade LGPD para dados sensíveis (CPF, Foto, Endereços)."
  },
  {
    id: "RNF 3",
    category: "Disponibilidade",
    description: "99.9% de uptime para aluguel, agendamento e e-commerce."
  },
  {
    id: "RNF 4",
    category: "Escalabilidade",
    description: "Suporte a crescimento de usuários, expansão geográfica e volume de vendas."
  },
  {
    id: "RNF 5",
    category: "Usabilidade",
    description: "Interface intuitiva com foco em navegação de catálogo e checkout."
  }
];

export const categories = [
  "Todos",
  "Usuários",
  "Vendas",
  "Aluguel",
  "Manutenção",
  "Financeiro",
  "Admin"
];
