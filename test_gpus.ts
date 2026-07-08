import { calculateAIScore } from "./src/utils/scoring";
const gpus = [
  {
    "name": "MSI GeForce RTX 4090 SUPRIM Liquid X 24G, 24GB GDDR6X, 384-Bit, 21 Gbps, PCIe 4.0, 1x HDMI 2.1a, 3x DisplayPort 1.4a, Ada Lovelace Architecture, Liquid Cooled",
    "category": "GPU",
    "specs": {
      "ASIN": "B09YD4FJ5R",
      "Brand": "msi",
      "Model Name": "GEFORCE RTX 4090 SUPRIM LIQUID X 24",
      "Graphics Card Ram": "24 GB",
      "Graphics Ram Type": "GDDR6X",
    }
  },
  {
    "name": "GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card, 12GB 192-bit GDDR7, PCIe 5.0, WINDFORCE Cooling System, GV-N5070WF3OC-12GD Video Card",
    "category": "GPU",
    "specs": {
      "UPC": "889523048191",
      "ASIN": "B0DTQMLX4F",
      "Graphics Card Ram": "12 GB"
    }
  }
];

for (const p of gpus) {
  console.log(p.name.substring(0, 30), "->", calculateAIScore(p));
}
