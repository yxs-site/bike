import { RequirementCard } from "@/components/RequirementCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, functionalRequirements, nonFunctionalRequirements } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, Download, FileText, Filter, LayoutGrid, Search, Share2 } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReqs = functionalRequirements.filter((req) => {
    const matchesCategory = selectedCategory === "Todos" || req.category === selectedCategory;
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: functionalRequirements.length,
    new: functionalRequirements.filter(r => r.isNew).length,
    rnf: nonFunctionalRequirements.length
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header com efeito de vidro */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight">Requisitos<span className="text-primary">Viewer</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                v1.2 Revisada
              </span>
            </div>
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-secondary/30 to-background p-8 md:p-12">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <Badge variant="secondary" className="mb-2">Documentação de Projeto</Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              Sistema de Gestão Integrada
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore os requisitos funcionais e não funcionais do ecossistema de e-commerce, loja física e mobilidade urbana.
              Visualize tendências, filtre por módulos e compreenda o escopo completo do projeto.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-sm">
                <FileText className="h-5 w-5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Funcionais</span>
                  <span className="font-bold">{stats.total} Requisitos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-sm">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Não Funcionais</span>
                  <span className="font-bold">{stats.rnf} Requisitos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50 shadow-sm">
                <Filter className="h-5 w-5 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Novos/Revisados</span>
                  <span className="font-bold text-emerald-400">+{stats.new} Itens</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controls & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-border/40">
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar requisitos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-full bg-secondary/30 border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        {/* Content Grid */}
        <Tabs defaultValue="funcionais" className="space-y-8">
          <TabsList className="bg-secondary/30 p-1 rounded-xl border border-border/40">
            <TabsTrigger value="funcionais" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Requisitos Funcionais</TabsTrigger>
            <TabsTrigger value="nao-funcionais" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Não Funcionais (RNF)</TabsTrigger>
          </TabsList>

          <TabsContent value="funcionais" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
              {filteredReqs.map((req, index) => (
                <RequirementCard key={req.id} req={req} index={index} />
              ))}
            </div>
            {filteredReqs.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p>Nenhum requisito encontrado para os filtros selecionados.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nao-funcionais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nonFunctionalRequirements.map((rnf, index) => (
                <motion.div
                  key={rnf.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border">
                    <span className="font-bold text-primary">{rnf.id.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{rnf.category}</h3>
                    <p className="text-muted-foreground leading-relaxed">{rnf.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-secondary/20 py-12 mt-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p>© 2024 RequisitosViewer. Documentação confidencial.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
