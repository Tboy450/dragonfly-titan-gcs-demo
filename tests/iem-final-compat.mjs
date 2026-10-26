import {reroutedIds} from '../research/iem-final-columns-2026-10-25/audit.mjs';
import {iemFinalServiceFittings} from '../dist/iem-final-service-routes.mjs';
// Historical baseline tests defer only this explicitly tested, owner-approved refit.
export const finalRefitMesh=o=>reroutedIds.includes(o.userData.wireId)||(
 reroutedIds.includes(o.userData.connectionId)&&(['iem-harness-cable','iem-harness-label'].includes(o.name)||
 (o.userData.connectionId==='iem-local-lead-4'&&o.name.startsWith('iem-service-'))));
export const finalFit=id=>iemFinalServiceFittings[id];
