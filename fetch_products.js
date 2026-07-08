const url = "https://kqxfaxpfthgxdowmmzzw.supabase.co/rest/v1/products?category=eq.gpus&limit=3";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeGZheHBmdGhneGRvd21tenp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDYzOTcsImV4cCI6MjA5ODcyMjM5N30.Ry8u8Z9-9eHdhE9d12jzSmMbPX5pdpG799hs77QW9WU";

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': 'Bearer ' + key
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
