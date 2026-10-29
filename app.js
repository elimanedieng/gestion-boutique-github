(() => {
  "use strict";
  const KEY = "gestionBoutiqueData_v1";
  const $ = (id) => document.getElementById(id);
  const today = () => new Date().toLocaleDateString("en-CA");
  const money = (n) => new Intl.NumberFormat("fr-FR", {maximumFractionDigits:0}).format(Number(n)||0) + " FCFA";
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateText = (s) => { if(!s) return "—"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; };
  const emptyData = () => ({version:1, products:[], sales:[], expenses:[]});
  const unitGroups = {mass:{kg:1000,g:1,mg:0.001},volume:{L:1000,cl:10,ml:1}};
  const unitGroup = unit => Object.keys(unitGroups).find(g => Object.prototype.hasOwnProperty.call(unitGroups[g],unit)) || null;
  const convertQty = (qty,from,to) => { if(from===to) return Number(qty); const g=unitGroup(from); if(!g || unitGroup(to)!==g) return null; return Number(qty)*unitGroups[g][from]/unitGroups[g][to]; };
  const unitOptions = unit => { const g=unitGroup(unit); return g==='mass'?['kg','g','mg']:g==='volume'?['L','cl','ml']:[unit||'pièce']; };
  const formatQty = n => Number(n||0).toLocaleString('fr-FR',{maximumFractionDigits:3});
  const defaultProducts = [['Riz','kg'],['Sucre','kg'],['Mil','kg'],['Maïs','kg'],['Farine','kg'],['Oignon','kg'],['Pomme de terre','kg'],['Tomate','kg'],['Carotte','kg'],['Huile','L'],['Lait','L'],['Eau minérale','bouteille'],['Jus','bouteille'],['Coca-Cola','bouteille'],['Pain','pièce'],['Œufs','pièce'],['Savon','pièce'],['Sucre en sachet','sachet'],['Lait en poudre','sachet'],['Spaghetti','paquet'],['Bouillon','boîte'],['Conserves','boîte'],['Eau de javel','L'],['Détergent','kg'],['Papier toilette','paquet'],['Ciment','sac']];
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || emptyData(); } catch { data = emptyData(); }
  if (!data || !Array.isArray(data.products) || !Array.isArray(data.sales) || !Array.isArray(data.expenses)) data = emptyData();
  let toastTimer;
  function save(){ localStorage.setItem(KEY, JSON.stringify(data)); renderAll(); }
  function toast(msg){ const el=$("toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600); }
  function go(page){ document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.page===page)); document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page)); window.scrollTo({top:0,behavior:"smooth"}); }
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
  document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.goto)));
  $("todayLabel").textContent = new Date().toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
  ["saleDate","expenseDate"].forEach(id=>$(id).value=today());

  function periodStart(period, dateStr=today()){
    const d=new Date(dateStr+"T12:00:00");
    if(period==="day") return dateStr;
    if(period==="week"){ const day=(d.getDay()+6)%7; d.setDate(d.getDate()-day); return d.toLocaleDateString("en-CA"); }
    if(period==="month") return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
    if(period==="semester") return `${d.getFullYear()}-${d.getMonth()<6?"01":"07"}-01`;
    if(period==="year") return `${d.getFullYear()}-01-01`;
    return "0000-01-01";
  }
  function inPeriod(date, period){ if(period==="all") return true; return date>=periodStart(period) && date<=today(); }
  function allOps(){
    const sales=data.sales.map(x=>({...x,type:"sale",label:x.productName,amount:Number(x.total)||0}));
    const expenses=data.expenses.map(x=>({...x,type:"expense",label:x.name,amount:Number(x.amount)||0}));
    return [...sales,...expenses].sort((a,b)=>(b.date||"").localeCompare(a.date||"") || (b.createdAt||0)-(a.createdAt||0));
  }
  function renderDashboard(){
    const p=$("periodFilter").value;
    const sales=data.sales.filter(x=>inPeriod(x.date,p)), expenses=data.expenses.filter(x=>inPeriod(x.date,p));
    const st=sales.reduce((s,x)=>s+Number(x.total||0),0), ex=expenses.reduce((s,x)=>s+Number(x.amount||0),0);
    $("statSales").textContent=money(st); $("statExpenses").textContent=money(ex); $("statResult").textContent=money(st-ex);
    $("statResult").style.color=st-ex<0?"#b42318":"#176b52";
    $("countSales").textContent=`${sales.length} vente${sales.length!==1?"s":""}`;
    $("countExpenses").textContent=`${expenses.length} dépense${expenses.length!==1?"s":""}`;
    const qty=data.products.reduce((s,x)=>s+Number(x.qty||0),0), value=data.products.reduce((s,x)=>s+Number(x.qty||0)*Number(x.cost||0),0);
    $("statStock").textContent=qty.toLocaleString("fr-FR"); $("stockValue").textContent=`Valeur d’achat : ${money(value)}`;
    const ops=allOps().slice(0,6);
    $("recentOperations").innerHTML=ops.length?ops.map(op=>`<div class="operation"><div><div class="operation-title">${esc(op.label)}</div><div class="operation-meta">${dateText(op.date)} · ${op.type==="sale"?"Vente":"Dépense"}</div></div><div class="amount ${op.type==="sale"?"income":"expense"}">${op.type==="sale"?"+":"−"} ${money(op.amount)}</div></div>`).join(""):'<div class="empty">Aucune opération pour le moment.</div>';
    const low=data.products.filter(x=>Number(x.qty)<=Number(x.alert)).sort((a,b)=>a.qty-b.qty);
    $("stockAlerts").innerHTML=low.length?low.map(x=>`<div class="operation"><div><div class="operation-title">${esc(x.name)}</div><div class="operation-meta">Seuil d’alerte : ${formatQty(x.alert)} ${esc(x.unit||"pièce")}</div></div><span class="pill low">${formatQty(x.qty)} ${esc(x.unit||"pièce")}</span></div>`).join(""):'<div class="empty">Aucune alerte de stock.</div>';
  }
  function renderProductOptions(){
    const old=$("saleProduct").value;
    $("saleProduct").innerHTML='<option value="">Choisir un produit</option>'+data.products.slice().sort((a,b)=>a.name.localeCompare(b.name,"fr")).map(p=>`<option value="${esc(p.id)}">${esc(p.name)} — stock ${formatQty(p.qty)} ${esc(p.unit||"pièce")} — ${money(p.price)}</option>`).join("");
    if(data.products.some(p=>p.id===old)) $("saleProduct").value=old;
    updateSaleUnitOptions();
  }
  function updateSaleUnitOptions(){
    const p=data.products.find(p=>p.id===$("saleProduct").value), current=$("saleUnit").value, opts=p?unitOptions(p.unit||'pièce'):[];
    $("saleUnit").innerHTML=opts.length?opts.map(u=>`<option value="${esc(u)}">${esc(u)}</option>`).join(""):'<option value="">Choisir une unité</option>';
    if(opts.includes(current)) $("saleUnit").value=current;
    updateSaleTotal();
  }
  function updateSaleTotal(){
    const p=data.products.find(p=>p.id===$("saleProduct").value);
    if(p){const u=$("saleUnit").value||p.unit||'pièce', factor=convertQty(1,u,p.unit||'pièce'); if(factor!==null) $("salePrice").value=Math.round((Number(p.price)||0)*factor*1000)/1000;}
    $("saleTotal").textContent=money((Number($("saleQty").value)||0)*(Number($("salePrice").value)||0));
  }
  $("saleProduct").addEventListener("change",updateSaleUnitOptions); $("saleUnit").addEventListener("change",updateSaleTotal); $("saleQty").addEventListener("input",updateSaleTotal); $("salePrice").addEventListener("input",()=>{$("saleTotal").textContent=money((Number($("saleQty").value)||0)*(Number($("salePrice").value)||0));});
  $("saleForm").addEventListener("submit",e=>{
    e.preventDefault();
    const product=data.products.find(p=>p.id===$("saleProduct").value), qty=Number($("saleQty").value), price=Number($("salePrice").value), saleUnit=$("saleUnit").value;
    if(!product){toast("Choisis un produit.");return;}
    if(!Number.isFinite(qty)||qty<=0){toast("La quantité doit être supérieure à zéro.");return;}
    const stockQty=convertQty(qty,saleUnit,product.unit||'pièce');
    if(stockQty===null){toast("Unité incompatible avec le stock du produit.");return;}
    if(stockQty>Number(product.qty)+1e-9){toast("Stock insuffisant. Réapprovisionne le produit.");return;}
    if(!Number.isFinite(price)||price<0){toast("Vérifie le prix de vente.");return;}
    const sale={id:uid(),productId:product.id,productName:product.name,qty,unit:saleUnit,stockQty,stockUnit:product.unit||'pièce',price,total:qty*price,payment:$("salePayment").value,date:$("saleDate").value||today(),note:$("saleNote").value.trim(),createdAt:Date.now()};
    product.qty=Math.max(0,Number(product.qty)-stockQty); data.sales.push(sale); save(); $("saleForm").reset(); $("saleQty").value=1; $("saleDate").value=today(); renderProductOptions(); toast("Vente enregistrée et stock mis à jour.");
  });
  $("expenseForm").addEventListener("submit",e=>{
    e.preventDefault(); const amount=Number($("expenseAmount").value);
    if(!Number.isFinite(amount)||amount<=0){toast("Saisis un montant supérieur à zéro.");return;}
    data.expenses.push({id:uid(),name:$("expenseName").value.trim(),category:$("expenseCategory").value,amount,payment:$("expensePayment").value,date:$("expenseDate").value||today(),note:$("expenseNote").value.trim(),createdAt:Date.now()});
    save(); $("expenseForm").reset(); $("expenseDate").value=today(); toast("Dépense enregistrée.");
  });
  function resetProductForm(){ $("productForm").reset(); $("productId").value=""; $("productUnit").value="kg"; $("productCost").value=0; $("productQty").value=0; $("productAlert").value=3; $("productFormTitle").textContent="Ajouter un produit"; $("saveProductBtn").textContent="Ajouter le produit"; $("cancelProductEdit").hidden=true; }
  $("cancelProductEdit").addEventListener("click",resetProductForm);
  $("productForm").addEventListener("submit",e=>{
    e.preventDefault();
    const id=$("productId").value, name=$("productName").value.trim(), sku=$("productSku").value.trim(), unit=$("productUnit").value, price=Number($("productPrice").value), cost=Number($("productCost").value), qty=Number($("productQty").value), alert=Number($("productAlert").value);
    if(!name||![price,cost,qty,alert].every(Number.isFinite)||price<0||cost<0||qty<0||alert<0){toast("Vérifie les prix et les quantités.");return;}
    if(data.products.some(p=>p.id!==id&&p.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast("Ce produit existe déjà.");return;}
    if(id){const p=data.products.find(p=>p.id===id);if(!p)return;p.name=name;p.sku=sku;p.price=price;p.cost=cost;p.qty=qty;p.alert=alert;p.unit=unit;toast("Produit modifié.");}
    else{data.products.push({id:uid(),name,sku,price,cost,qty,alert,unit,createdAt:Date.now()});toast("Produit ajouté.");}
    resetProductForm();save();
  });
  function renderStock(){
    const q=$("stockSearch").value.trim().toLocaleLowerCase();
    const products=data.products.filter(p=>(p.name+" "+(p.sku||"")).toLocaleLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,"fr"));
    $("stockTable").innerHTML=products.map(p=>`<tr><td><strong>${esc(p.name)}</strong>${p.sku?`<div class="muted">${esc(p.sku)}</div>`:""}</td><td>${money(p.price)}</td><td>${money(p.cost)}</td><td><span class="pill ${Number(p.qty)<=Number(p.alert)?"low":""}">${formatQty(p.qty)} ${esc(p.unit||"pièce")}</span></td><td>${money(Number(p.qty)*Number(p.cost))}</td><td><div class="table-actions"><button class="mini-btn" data-edit="${esc(p.id)}">Modifier</button><button class="mini-btn" data-restock="${esc(p.id)}">+ Stock</button><button class="mini-btn danger" data-delete-product="${esc(p.id)}">Supprimer</button></div></td></tr>`).join("");
    $("stockEmpty").hidden=products.length>0;
    $("stockTable").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>{const p=data.products.find(x=>x.id===b.dataset.edit);if(!p)return;$("productId").value=p.id;$("productName").value=p.name;$("productSku").value=p.sku||"";$("productPrice").value=p.price;$("productCost").value=p.cost;$("productQty").value=p.qty;$("productAlert").value=p.alert;$("productUnit").value=p.unit||"pièce";$("productFormTitle").textContent="Modifier le produit";$("saveProductBtn").textContent="Enregistrer les modifications";$("cancelProductEdit").hidden=false;window.scrollTo({top:0,behavior:"smooth"});}));
    $("stockTable").querySelectorAll("[data-restock]").forEach(b=>b.addEventListener("click",()=>{const p=data.products.find(x=>x.id===b.dataset.restock);if(!p)return;const amount=prompt(`Quantité à ajouter au stock de ${p.name} :`,"1");if(amount===null)return;const n=Number(amount);if(!Number.isFinite(n)||n<=0){toast("Saisis une quantité positive.");return;}p.qty=Number(p.qty)+n;save();toast("Stock réapprovisionné.");}));
    $("stockTable").querySelectorAll("[data-delete-product]").forEach(b=>b.addEventListener("click",()=>{const p=data.products.find(x=>x.id===b.dataset.deleteProduct);if(!p)return;if(!confirm(`Supprimer le produit « ${p.name} » ? Les anciennes ventes seront conservées.`))return;data.products=data.products.filter(x=>x.id!==p.id);save();toast("Produit supprimé.");}));
    renderProductOptions();
  }
  $("stockSearch").addEventListener("input",renderStock);
  $("loadDefaultsBtn").addEventListener("click",()=>{
    let added=0;
    for(const [name,unit] of defaultProducts){if(data.products.some(p=>p.name.toLocaleLowerCase()===name.toLocaleLowerCase()))continue;data.products.push({id:uid(),name,sku:"",price:0,cost:0,qty:0,alert:(unit==="kg"||unit==="L")?1:3,unit,createdAt:Date.now()});added++;}
    save();toast(added?`${added} produits courants ajoutés. Renseigne leurs prix et stocks.`:"Les produits courants sont déjà dans ton catalogue.");
  });
  function renderHistory(){
    const type=$("historyType").value, q=$("historySearch").value.trim().toLocaleLowerCase(), from=$("historyFrom").value, to=$("historyTo").value;
    const ops=allOps().filter(op=>(type==="all"||op.type===type)&&(!from||op.date>=from)&&(!to||op.date<=to)&&[op.label,op.note,op.category,op.payment].join(" ").toLocaleLowerCase().includes(q));
    $("historyTable").innerHTML=ops.map(op=>`<tr><td>${dateText(op.date)}</td><td><span class="pill">${op.type==="sale"?"Vente":"Dépense"}</span></td><td><strong>${esc(op.label)}</strong>${op.type==="sale"?`<div class="muted">${formatQty(op.qty)} ${esc(op.unit||op.stockUnit||"pièce")} × ${money(op.price)}</div>`:`<div class="muted">${esc(op.category||"")}</div>`}${op.note?`<div class="muted">${esc(op.note)}</div>`:""}</td><td>${esc(op.payment||"—")}</td><td class="amount ${op.type==="sale"?"income":"expense"}">${op.type==="sale"?"+":"−"} ${money(op.amount)}</td><td><button class="mini-btn danger" data-delete-op="${esc(op.id)}" data-op-type="${op.type}">Supprimer</button></td></tr>`).join("");
    $("historyEmpty").hidden=ops.length>0;
    $("historyTable").querySelectorAll("[data-delete-op]").forEach(b=>b.addEventListener("click",()=>{if(!confirm("Supprimer cette opération ? Cette action est irréversible."))return;const id=b.dataset.deleteOp;if(b.dataset.opType==="sale"){const s=data.sales.find(x=>x.id===id);if(s){const p=data.products.find(x=>x.id===s.productId);if(p)p.qty=Number(p.qty)+Number(s.qty);data.sales=data.sales.filter(x=>x.id!==id);}}else data.expenses=data.expenses.filter(x=>x.id!==id);save();toast("Opération supprimée.");}));
  }
  ["historyType","historySearch","historyFrom","historyTo"].forEach(id=>$(id).addEventListener("input",renderHistory));
  $("periodFilter").addEventListener("change",renderDashboard);
  function download(name, content, type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $("exportJsonBtn").addEventListener("click",()=>{download(`gestion-boutique-sauvegarde-${today()}.json`,JSON.stringify({...data,exportedAt:new Date().toISOString()},null,2),"application/json");toast("Sauvegarde exportée.");});
  $("importJsonInput").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const imported=JSON.parse(await file.text());if(!imported||!Array.isArray(imported.products)||!Array.isArray(imported.sales)||!Array.isArray(imported.expenses))throw new Error("Format incorrect");if(!confirm("L’import va remplacer les données de cet appareil. As-tu exporté une sauvegarde de sécurité ?"))return;data={version:1,products:imported.products,sales:imported.sales,expenses:imported.expenses};save();toast("Sauvegarde importée.");}catch(err){alert("Impossible d’importer ce fichier. Choisis une sauvegarde JSON Gestion Boutique valide.");}finally{e.target.value="";}});
  $("clearDataBtn").addEventListener("click",()=>{if(!confirm("Effacer toutes les ventes, dépenses et tous les produits de cet appareil ?"))return;if(!confirm("Dernière confirmation : cette action est irréversible sans sauvegarde."))return;data=emptyData();save();toast("Données effacées.");});
  $("exportCsvBtn").addEventListener("click",()=>{const rows=[["Date","Type","Détail","Catégorie","Quantité","Prix unitaire","Paiement","Montant FCFA","Note"],...allOps().map(o=>[o.date,o.type==="sale"?"Vente":"Dépense",o.label,o.category||"",o.type==="sale"?`${o.qty} ${o.unit||"pièce"}`:"",o.type==="sale"?o.price:"",o.payment||"",o.amount,o.note||""] )];const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\r\n");download(`gestion-boutique-historique-${today()}.csv`,"\ufeff"+csv,"text/csv;charset=utf-8");});
  function renderAll(){renderDashboard();renderProductOptions();renderStock();renderHistory();}
  renderAll();
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").hidden=false;});
  $("installBtn").addEventListener("click",async()=>{if(!deferredPrompt){toast("Dans le navigateur, utilise le menu puis « Installer » ou « Ajouter à l’écran d’accueil ».");return;}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("installBtn").hidden=true;});
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();