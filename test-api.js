const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('1. Checking database for alerts...');
  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('notified', false);
    
  if (error) {
    console.error('Error fetching alerts:', error);
    return;
  }
  
  console.log(`Found ${alerts.length} active alerts.`);
  console.log(alerts);

  console.log('\n2. Testing RapidAPI...');
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const asin = 'B07ZPKN6YR';
  const url = `https://real-time-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=US`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
    }
  };

  try {
    const res = await fetch(url, options);
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Response:', JSON.stringify(json, null, 2).substring(0, 500) + '...');
    
    const priceString = json.data?.product_price;
    console.log('Parsed Price String:', priceString);
    if (priceString) {
       const parsedPrice = parseFloat(priceString.replace(/[^0-9.]/g, ''));
       console.log('Mathematical Price:', parsedPrice);
    }
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

test();
