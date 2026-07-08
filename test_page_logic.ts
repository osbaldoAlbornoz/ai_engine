
import { calculateAIScore } from "./src/utils/scoring";
const dbProducts = [
  { id: "1", name: "GPU", category: "gpus", specs: null, price: 1000 },
];
const mapped = dbProducts.map(dbProd => ({
          id: dbProd.id,
          title: dbProd.name,
          price: dbProd.price || 0,
          category: dbProd.category === "gpus" ? "GPU" : "Unknown",
          specs: typeof dbProd.specs === "object" && dbProd.specs !== null ? dbProd.specs : {},
}));
const scored = mapped.map(p => ({ ...p, aiScore: calculateAIScore(p) }));
console.log(scored);

