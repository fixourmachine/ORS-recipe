export const APP_VERSION = '1.3.0';
export const SPECIES = ['sodium','potassium','chloride','glucose','sucrose','citrate','bicarbonate','carbonate','calcium','magnesium','lactate','zinc'];
const ingredient = (name,mw,ions,note='') => ({name,mw,ions,note,unit:'g'});
export const INGREDIENTS = {
  nacl: ingredient('Table salt',58.44277,{sodium:1,chloride:1},'Sodium chloride; assumed pure NaCl.'),
  kcl: ingredient('Potassium chloride',74.5513,{potassium:1,chloride:1},'Pure KCl; not a mixed salt substitute.'),
  bicarb: ingredient('Bicarbonate of soda',84.0066,{sodium:1,bicarbonate:1},'Sodium bicarbonate; not baking powder.'),
  citrate2: ingredient('Trisodium citrate dihydrate',294.10,{sodium:3,citrate:1},'Check the exact salt and hydration form on the label.'),
  citrate0: ingredient('Trisodium citrate anhydrous',258.07,{sodium:3,citrate:1},'Different mass per mmol from the dihydrate.'),
  disodium0: ingredient('Disodium hydrogen citrate · anhydrous',236.09,{sodium:2,citrate:1}),
  disodium15: ingredient('Disodium hydrogen citrate · sesquihydrate',263.11,{sodium:2,citrate:1}),
  glucose0: ingredient('Glucose · anhydrous',180.156,{glucose:1},'Pure glucose, without additives.'),
  glucose1: ingredient('Glucose · monohydrate',198.171,{glucose:1},'Mass-adjusted when substituted for anhydrous glucose.'),
  sugar: ingredient('Table sugar',342.2965,{sucrose:1},'Sucrose is not glucose. Not an automatic ORS substitution.'),
  calciumLactate5: ingredient('Calcium lactate pentahydrate',308.30,{calcium:1,lactate:2},'Use the pentahydrate form; other hydration forms require a different mass.'),
  magnesiumCarbonate: ingredient('Magnesium carbonate · anhydrous',84.313,{magnesium:1,carbonate:1},'Use anhydrous MgCO₃; hydrated or basic magnesium carbonate requires a different mass.'),
  losaltLabel: {name:'LoSalt Original · supplied UK label',unit:'g',note:'133 mg sodium and 346 mg potassium per gram. Chloride is inferred from Na/K as chloride salts; anticaking ingredients are not fully modelled.'},
  rice: {name:'Pre-cooked rice powder',unit:'g',note:'Starch and protein mixture, not pure glucose. Molecular distribution and free glucose are not specified.'},
  reliefCitrate: {name:'Sodium citrate · Relief specification',unit:'g',note:'Use the exact product specification; raw-powder equivalence is not established.'},
  pedialyte: {name:'Pedialyte unflavoured · ready-to-use',unit:'mL',note:'US oral electrolyte solution, 59 mL presentation. Individual manufacturing amounts are not disclosed.'},
  clinova: {name:'Clinova O.R.S hydration tablets',unit:'tablets',note:'Fixed commercial-product regimen; do not substitute raw powders for the tablet.'},
  losalt: {name:'LoSalt',unit:'g',note:'Composition varies by product. Enter the NaCl and KCl mass percentages from your label; other components are unmodelled.'},
  pectin: {name:'Pectin',unit:'g',note:'Polymer and formulation vary. Electrolyte and osmotic contributions are unknown.'},
  flavour: {name:'Flavour drops',unit:'drops',note:'Drop size, acids, sugars and electrolytes are product dependent; contributions are unknown.'},
  productGlucose:{name:'Glucose · product specification',unit:'g',note:'The cited Dioralyte SmPC does not specify the hydration form; do not assume a household powder is equivalent.'},
  productCitrate:{name:'Disodium hydrogen citrate · product specification',unit:'g',note:'Not interchangeable with trisodium citrate. Exact hydration form is not specified in the cited SmPC.'}
};
export const BASE_INGREDIENTS = ['citrate2','bicarb'];
export const GLUCOSE_INGREDIENTS = ['glucose0','glucose1'];
export const SALT_CHOICES = ['kcl','losalt'];
const replaceIngredient = (recipe,current,replacement,amount,note) => ({
 ...recipe,
 ingredients:recipe.ingredients.map(row=>row.id===current?{id:replacement,amount}:row),
 spoons:current===replacement?recipe.spoons:undefined,
 substituted:current!==replacement||recipe.substituted,
 variantNotes:[...(recipe.variantNotes||[]),...(note?[note]:[])]
});
export function defaultBaseChoice(recipe){return recipe.defaultBase||Object.keys(recipe.baseOptions||{})[0]||null;}
export function withBase(recipe,choice){
 const option=recipe.baseOptions?.[choice];
 if(!option||!BASE_INGREDIENTS.includes(option.ingredient))throw Error('This formula has no verified base substitution.');
 const current=recipe.ingredients.find(row=>BASE_INGREDIENTS.includes(row.id));
 if(!current)throw Error('This formula has no replaceable base ingredient.');
 return replaceIngredient(recipe,current.id,option.ingredient,option.amount,option.note||'');
}
export function withGlucose(recipe,replacement){
 if(!GLUCOSE_INGREDIENTS.includes(replacement))throw Error('Unsupported glucose form.');
 const current=recipe.ingredients.find(row=>GLUCOSE_INGREDIENTS.includes(row.id));
 if(!current)throw Error('This formula has no explicit glucose form to substitute.');
 const amount=current.amount*INGREDIENTS[replacement].mw/INGREDIENTS[current.id].mw;
 const note=`${INGREDIENTS[replacement].name} is mass-adjusted to preserve ${format(current.amount*1000/INGREDIENTS[current.id].mw,4)} mmol/L glucose. Follow the recipe’s stated water basis.`;
 return replaceIngredient(recipe,current.id,replacement,amount,note);
}
export function withLoSalt(recipe){
 const k=recipe.ingredients.find(x=>x.id==='kcl'),salt=recipe.ingredients.find(x=>x.id==='nacl');
 if(!k||!salt||k.amount<=0||recipe.ingredients.some(x=>['losalt','losaltLabel'].includes(x.id)))throw Error('This formula cannot use the LoSalt substitution.');
 const blend=k.amount/74.5513*39.0983*1000/346;
 const remaining=salt.amount-blend*133/22.98976928*58.44277/1000;
 if(remaining<0)throw Error('LoSalt supplies more sodium than this formula allows.');
 return {...recipe,ingredients:recipe.ingredients.filter(x=>x.id!=='kcl').map(x=>x.id==='nacl'?{...x,amount:remaining}:x).concat({id:'losaltLabel',amount:blend}),spoons:undefined,substituted:true,variantNotes:[...(recipe.variantNotes||[]),'LoSalt is calculated from the supplied UK label and the separate table-salt mass is adjusted to preserve sodium and potassium targets.']};
}
export function validVolume(value){return Number.isFinite(value)&&value>=50&&value<=5000;}
export function scaleRows(recipe,volume){if(!validVolume(volume))throw Error('Volume must be 50–5000 mL.');return recipe.ingredients.map(row=>({...row,amount:row.amount*volume/1000}));}
export function calculate(recipe){
 const values=Object.fromEntries(SPECIES.map(x=>[x,0]));const unknown=[];
 for(const row of recipe.ingredients){const def=INGREDIENTS[row.id];if(!def)throw Error('Unknown ingredient');if(!row.amount)continue;
  if(row.id==='losaltLabel'){
   const na=row.amount*133/22.98976928,k=row.amount*346/39.0983;values.sodium+=na;values.potassium+=k;values.chloride+=na+k;unknown.push('LoSalt anticaking ingredients; chloride inferred');
  }else if(row.id==='losalt'){
   if(!Number.isFinite(row.naclPercent)||!Number.isFinite(row.kclPercent)){unknown.push(def.name);continue;}
   const na=row.amount*row.naclPercent/100*1000/58.44277,k=row.amount*row.kclPercent/100*1000/74.5513;
   values.sodium+=na;values.potassium+=k;values.chloride+=na+k;if(row.naclPercent+row.kclPercent<100)unknown.push('LoSalt other ingredients');
  }else if(def.mw){const mmol=row.amount*1000/def.mw;for(const [key,mult]of Object.entries(def.ions))values[key]+=mmol*mult;}
  else unknown.push(def.name);
 }
 return {values,unknown,osmolarity:unknown.length?null:Object.values(values).reduce((a,b)=>a+b,0)};
}
export function spoonMeasure(recipe,row,volume){
 if(!recipe.spoons||!recipe.spoons[row.id])return null;
 const s=recipe.spoons[row.id],factor=volume/1000;
 if(s.heaped&&!Number.isInteger(s.count*factor))return null;
 return {count:s.count*factor,size:s.size,heaped:!!s.heaped};
}
function validateBaseOptions(r){
 if(r.baseOptions===undefined)return;
 if(!r.baseOptions||typeof r.baseOptions!=='object'||Array.isArray(r.baseOptions)||!Object.keys(r.baseOptions).length)throw Error('Invalid base options');
 for(const [key,x]of Object.entries(r.baseOptions))if(!/^[a-z0-9-]{1,40}$/.test(key)||!x||!BASE_INGREDIENTS.includes(x.ingredient)||!Number.isFinite(x.amount)||x.amount<=0||x.amount>1000||typeof x.label!=='string'||!x.label||x.label.length>140||x.note!==undefined&&(typeof x.note!=='string'||x.note.length>500))throw Error('Invalid base option');
 if(!r.baseOptions[r.defaultBase])throw Error('Invalid default base');
}
export function validateRecipe(r){
 if(!r||typeof r.id!=='string'||!/^[a-z0-9-]{1,80}$/.test(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>100||typeof r.version!=='string'||r.version.length>40||!Array.isArray(r.ingredients)||!r.ingredients.length||r.ingredients.length>20)throw Error('Invalid recipe');
 const seen=new Set();for(const x of r.ingredients){if(!INGREDIENTS[x.id]||seen.has(x.id)||!Number.isFinite(x.amount)||x.amount<0||x.amount>1000)throw Error('Invalid ingredient amount');seen.add(x.id);if(x.id==='losalt'){for(const key of ['naclPercent','kclPercent'])if(x[key]!==undefined&&(!Number.isFinite(x[key])||x[key]<0||x[key]>100))throw Error('Invalid LoSalt percentage');if((x.naclPercent??0)+(x.kclPercent??0)>100)throw Error('Salt percentages exceed 100%');}}
 if(r.spoons)for(const [id,x]of Object.entries(r.spoons)){if(!seen.has(id)||!Number.isFinite(x.count)||x.count<=0||!Number.isFinite(x.size)||x.size<=0||x.size>15)throw Error('Invalid spoon measure');}
 if(r.published)for(const [key,val]of Object.entries(r.published))if(!SPECIES.includes(key)||!Number.isFinite(val)||val<0||val>5000)throw Error('Invalid composition');
 if(r.compositionMode!==undefined&&!['calculated','published'].includes(r.compositionMode))throw Error('Invalid composition mode');
 if(r.volumeBasis!==undefined&&!['water','final','ready'].includes(r.volumeBasis))throw Error('Invalid volume basis');
 if(r.compositionMode==='published'&&!r.published)throw Error('Missing reference composition');
 if(r.waterPerSachet!==undefined&&(!Number.isFinite(r.waterPerSachet)||r.waterPerSachet<=0))throw Error('Invalid sachet volume');
 if(r.wholeUnit!==undefined&&(!r.wholeUnit||!seen.has(r.wholeUnit.ingredient)||!Number.isFinite(r.wholeUnit.volumePerUnit)||r.wholeUnit.volumePerUnit<=0||typeof r.wholeUnit.singular!=='string'||typeof r.wholeUnit.plural!=='string'))throw Error('Invalid whole unit');
 if(r.carbohydrateGL!==undefined&&(!Number.isFinite(r.carbohydrateGL)||r.carbohydrateGL<0))throw Error('Invalid carbohydrate amount');
 validateBaseOptions(r);
 if(r.osmotic!==undefined&&(!r.osmotic||!Number.isFinite(r.osmotic.value)||r.osmotic.value<0||r.osmotic.value>5000||!['mOsm/L','mOsm/kg'].includes(r.osmotic.unit)||typeof r.osmotic.kind!=='string'||!r.osmotic.kind||r.osmotic.kind.length>100))throw Error('Invalid osmotic value');
 if(r.osmoticAppliesToBase!==undefined&&!r.baseOptions?.[r.osmoticAppliesToBase])throw Error('Invalid osmotic base');
 for(const key of ['description','warning','method','storage','basis','category','carbohydrateForm'])if(r[key]!==undefined&&(typeof r[key]!=='string'||r[key].length>3000))throw Error('Invalid text');
 if(!Array.isArray(r.sources))throw Error('Missing sources');for(const s of r.sources){if(typeof s.title!=='string'||!s.title||s.title.length>200||typeof s.url!=='string'||!s.url.startsWith('https://'))throw Error('Invalid source');new URL(s.url);}
 return r;
}
export function validatePack(p){if(!p||p.schemaVersion!==3||typeof p.version!=='string'||!/^\d+\.\d+\.\d+$/.test(p.version)||!/^\d{4}-\d{2}-\d{2}$/.test(p.reviewed)||!Array.isArray(p.recipes)||!p.recipes.length||p.recipes.length>100)throw Error('Unsupported recipe pack');const ids=new Set();for(const r of p.recipes){validateRecipe(r);if(ids.has(r.id))throw Error('Duplicate recipe');ids.add(r.id);}return p;}
export function compareVersions(a,b){const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++){if(aa[i]!==bb[i])return aa[i]>bb[i]?1:-1;}return 0;}
export const format = (n,digits=2)=>new Intl.NumberFormat('en-GB',{maximumFractionDigits:digits}).format(n);
function base64UrlEncode(value){const bytes=new TextEncoder().encode(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function base64UrlDecode(value){const padded=value.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-value.length%4)%4);const binary=atob(padded),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes);}
export function encodeShareState(state){return base64UrlEncode(JSON.stringify(state));}
export function decodeShareState(token){if(typeof token!=='string'||!token||token.length>16000)throw Error('Invalid shared recipe');const state=JSON.parse(base64UrlDecode(token));if(!state||typeof state!=='object'||!validVolume(state.v)||!['weight','spoons'].includes(state.m)||!SALT_CHOICES.includes(state.s))throw Error('Invalid shared recipe');if(state.custom){validateRecipe(state.custom);if(state.custom.ingredients.some(x=>['pedialyte','clinova'].includes(x.id)||x.id.startsWith('product')))throw Error('Unsupported shared recipe');}else if(typeof state.r!=='string'||!/^[a-z0-9-]{1,80}$/.test(state.r))throw Error('Invalid shared recipe');if(state.b!==null&&state.b!==undefined&&(typeof state.b!=='string'||!/^[a-z0-9-]{1,40}$/.test(state.b)))throw Error('Invalid shared recipe');if(state.g!==null&&state.g!==undefined&&!GLUCOSE_INGREDIENTS.includes(state.g))throw Error('Invalid shared recipe');return state;}
