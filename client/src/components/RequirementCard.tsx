import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Requirement } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, CreditCard, MapPin, Settings, ShoppingCart, Users, Wrench } from "lucide-react";

interface RequirementCardProps {
  req: Requirement;
  index: number;
}

const categoryIcons: Record<string, any> = {
  "Usuários": Users,
  "Vendas": ShoppingCart,
  "Aluguel": MapPin,
  "Manutenção": Wrench,
  "Financeiro": CreditCard,
  "Admin": Settings,
};

const categoryColors: Record<string, string> = {
  "Usuários": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Vendas": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Aluguel": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Manutenção": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Financeiro": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Admin": "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

export function RequirementCard({ req, index }: RequirementCardProps) {
  const Icon = categoryIcons[req.category] || CheckCircle2;
  const colorClass = categoryColors[req.category] || "text-primary bg-primary/10 border-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.3)] transition-all duration-300 group relative">
        {/* Spotlight effect gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className={cn("p-2 rounded-lg border", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex gap-2">
              {req.isNew && (
                <Badge variant="destructive" className="animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                  NOVO
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground bg-background/50">
                {req.id}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-lg font-medium leading-tight group-hover:text-primary transition-colors">
            {req.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {req.description}
          </p>
          {req.details && (
            <div className="mt-auto pt-4 border-t border-border/30">
              <div className="flex items-start gap-2 text-xs text-muted-foreground/80">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{req.details}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
