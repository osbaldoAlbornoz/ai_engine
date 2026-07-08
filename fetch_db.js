async function run() {
  const url = "https://kqxfaxpfthgxdowmmzzw.supabase.co/rest/v1/products?select=*";
  const res = await fetch(url, { headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeGZheHBmdGhneGRvd21tenp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDYzOTcsImV4cCI6MjA5ODcyMjM5N30.Ry8u8Z9-9eHdhE9d12jzSmMbPX5pdpG799hs77QW9WU" }});
  const data = await res.json();
  console.log(JSON.stringify(data.filter(p => p.category === "gpus").map(p => ({name: p.name, specs: p.specs})), null, 2));
}
run();
