// Replay challenges (ECON-04): optional modifiers for a planet already conquered. Each makes the
// attempt harder and adds bonus matter to the replay reward, and each one beaten is recorded on
// the planet. Plain data and rules: battle.mjs applies them and campaign.mjs pays for them.
export const replayBase = 0.3; // a replay pays this share of the conquest reward
export const alertFloor = 30; // On alert: the public never calms below this
export const replayModifiers = Object.freeze({
  threat: Object.freeze({ id: "threat", name: "Raised threat", bonus: 0.5, defenders: true,
    text: "The planet plays one threat level higher: more and tougher defenders, faster militia, harder artillery." }),
  weather: Object.freeze({ id: "weather", name: "Wild weather", bonus: 0.35, defenders: false, calm: 0.65, severity: 1.3,
    text: "Hazards come about a third sooner and hit 30% harder." }),
  alert: Object.freeze({ id: "alert", name: "On alert", bonus: 0.35, defenders: true,
    text: `The public never calms below ${alertFloor}: militia gather from the start, and no town surrenders.` }),
});
export const modifierOrder = Object.freeze(["threat", "weather", "alert"]);

// Raised threat and On alert need defenders, and nobody lives on the practice planet.
export const modifiersFor = (planet) => (planet?.frontier ? [] : modifierOrder.filter(id => !replayModifiers[id].defenders || (planet?.society || 0) > 0));
// Known modifiers this planet offers, once each, in the usual order.
export const cleanModifiers = (planet, ids) => (Array.isArray(ids) ? modifiersFor(planet).filter(id => ids.includes(id)) : []);
export const replayShare = (ids) => replayBase + ids.reduce((sum, id) => sum + (replayModifiers[id]?.bonus || 0), 0);
export const replayReward = (planet, ids) => Math.round(planet.reward.matter * replayShare(cleanModifiers(planet, ids)));
export const modifierNames = (ids) => ids.map(id => replayModifiers[id]?.name).filter(Boolean).join(", ");
