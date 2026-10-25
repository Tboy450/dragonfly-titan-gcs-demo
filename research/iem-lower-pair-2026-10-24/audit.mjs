import {iemLeadAudit} from '../iem-service-bends-2026-10-24/audit.mjs';
export function iemLowerPairAudit(){
 const report=iemLeadAudit();
 return {...report,rows:report.rows.map((r,i)=>({...r,installationReview:i<2?'prior-upper-pair':i<4?'current-lower-pair':'legacy-unreviewed'}))};
}
if(process.argv.includes('--write')){
 const{writeFile}=await import('node:fs/promises');
 const report=iemLowerPairAudit();
 await writeFile(new URL('endpoints.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({leads:report.rows.length,currentLower:report.rows.filter(r=>r.installationReview==='current-lower-pair').length,remaining:report.rows.filter(r=>!r.servicePair).length}));
}
