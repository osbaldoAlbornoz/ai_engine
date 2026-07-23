import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanName(name: string) {
    let clean = name.split(',')[0].split('|')[0].split('—')[0].split('–')[0].split('- ')[0];
    
    const removeRegexes = [
        /\b\d+(\.\d+)?\s*[GM]Hz\b/gi,
        /\b\d+\s*(GB|TB|MB)\b/gi,
        /\bL?DDR\d[X]?\b/gi,
        /\bNVMe\b/gi,
        /\bSSD\b/gi,
        /\bHDD\b/gi,
        /\bPCIe\s*\d(\.\d)?\b/gi,
        /\bWIFI\s*\d*[E]?\b/gi,
        /\bWi-Fi\s*\d*[E]?\b/gi,
        /\b\d+\s*W(att)?\b/gi,
        /\b\d+-Core\b/gi,
        /\bLiquid Cooled\b/gi,
        /\bWater Cooled\b/gi,
        /\bGaming Desktop Computer PC\b/gi,
        /\bGaming Desktop\b/gi,
        /\bDesktop Computer\b/gi,
        /\bComputer PC\b/gi,
        /\bGaming Laptop\b/gi,
        /\bDesktop Processor\b/gi,
        /\bMobile Workstation\b/gi,
        /\bBarebone Desktop Computer\b/gi,
        /\bVideo Card\b/gi,
        /\bGraphics Card\b/gi,
        /\bOC Edition\b/gi,
        /\bTriple Fan\b/gi,
        /\bDual Edition\b/gi,
        /\bSolid CORE\b/gi,
        /\bFounders Edition\b/gi,
        /\bCopilot\+ PC\b/gi,
        /\bGaming AI Laptop\b/gi,
        /\bGaming AI\b/gi,
        /\bAI Copilot\b/gi,
        /\bMotherboard\b/gi,
        /\bWindows 11\b/gi,
        /\bWin 11\b/gi,
        /\bBluetooth\b/gi,
        /\bATX\b/gi,
        /\b(X870E?|X670E?|B650E?|B550|Z790|Z690|Z890)\b/gi,
        /\bPrime\b/gi,
        /\(.*\)/g,
        /™/g,
        /®/g,
        /\bGeForce\b/gi,
        /\bRadeon\b/gi,
        /\bNVIDIA\b/gi,
        /\bNVD\b/gi,
        /\bAMD\b/gi,
        /\bIntel\b/gi,
    ];
    
    for (const r of removeRegexes) {
        clean = clean.replace(r, '');
    }

    // Insert `/` before GPU if it exists to separate CPU and GPU nicely
    clean = clean.replace(/\b(RTX\s*[A-Za-z]*\s*\d{3,4}[A-Za-z]*)\b/i, '/ $1');
    clean = clean.replace(/\b(RX\s*\d{4}[A-Za-z]*)\b/i, '/ $1');

    clean = clean.replace(/\s+/g, ' ').trim();
    clean = clean.replace(/^\/\s*/, ''); // Remove if it starts with /
    clean = clean.replace(/\s+\/\s+/g, ' / '); // Normalize spaces around slash

    // Remove any trailing non-alphanumeric characters
    clean = clean.replace(/[^a-zA-Z0-9]+$/, '').trim();
    
    return clean;
}

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

async function run() {
  const { data: products, error } = await supabase.from('products').select('id, name');
  if (error) throw error;

  console.log(`Found ${products.length} products to update.`);
  let slugs = new Set();
  let updatedCount = 0;

  for (const p of products) {
    let cn = cleanName(p.name);
    if (!cn) cn = p.name.substring(0, 30);
    
    let slug = slugify(cn);
    let originalSlug = slug;
    let counter = 1;
    while(slugs.has(slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }
    slugs.add(slug);

    const { error: updateError } = await supabase
        .from('products')
        .update({ clean_name: cn, slug: slug })
        .eq('id', p.id);
    
    if (updateError) {
        console.error(`Failed to update ${p.id}:`, updateError);
    } else {
        updatedCount++;
        process.stdout.write('.');
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} products.`);
}

run().catch(console.error);
