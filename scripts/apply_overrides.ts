import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

async function run() {
    const raw = fs.readFileSync('c:/Users/Osbaldo Albornoz/.gemini/antigravity-ide/brain/cbc8fc37-2c94-4a3a-b977-25d6507ee195/scratch/overrides.json', 'utf8');
    const overrides = JSON.parse(raw);

    console.log("Resetting slugs...");
    const { data: allIds } = await supabase.from('products').select('id');
    for (const d of allIds!) {
        await supabase.from('products').update({ slug: d.id }).eq('id', d.id);
    }
    
    console.log("Updating customized clean_names and computing new slugs...");
    const slugs = new Set();
    
    for (const id of Object.keys(overrides)) {
        let cn = overrides[id];
        let slug = slugify(cn);
        let originalSlug = slug;
        let counter = 1;
        while(slugs.has(slug)) {
            slug = `${originalSlug}-${counter}`;
            counter++;
        }
        slugs.add(slug);

        await supabase.from('products').update({ clean_name: cn, slug: slug }).eq('id', id);
        process.stdout.write('.');
    }
    console.log("\nDone!");
}

run();
