import { samplingElectronics, samplingConnectionSources, samplingConnectionLimits } from "../sampling-connections.mjs?v=dev";

export function renderConnectionCoverage(container, onInspect, {rows,sources,limits}) {
  const intro = document.createElement("p"); intro.className = "rest-status";
  intro.textContent = limits.scope;
  const list = document.createElement("dl"); list.className = "connection-coverage-list";
  for (const row of rows) {
    const item = document.createElement("div"), title = document.createElement("dt");
    title.textContent = row.name; item.dataset.connectionEvidence = row.id;
    if (row.inspect) {
      const button = document.createElement("button"); button.type = "button";
      button.className = "connection-inspect"; button.setAttribute("aria-label", `Inspect ${row.name}`);
      button.title = `Inspect ${row.name}`;
      const icon = document.createElement("img"); icon.alt = ""; icon.src = "./vendor/lucide/focus.svg?v=dev";
      button.append(icon); button.addEventListener("click", () => onInspect(row)); title.append(button);
    }
    const description = document.createElement("dd"), role = document.createElement("p"), modeled = document.createElement("p");
    role.textContent = row.role; modeled.textContent = row.modeled; modeled.className = "rest-status";
    const link = document.createElement("a"), source = sources[row.source];
    link.textContent = source.label; link.href = source.url; link.target = "_blank"; link.rel = "noopener noreferrer";
    description.append(role, modeled, link); item.append(title, description); list.append(item);
  }
  const naming = document.createElement("p"), boundary = document.createElement("p");
  naming.className = boundary.className = "rest-status";
  naming.textContent = limits.naming; boundary.textContent = limits.boundary;
  container.replaceChildren(intro, list, naming, boundary);
}
export function renderSamplingConnections(container,onInspect){
  return renderConnectionCoverage(container,onInspect,{rows:samplingElectronics,sources:samplingConnectionSources,limits:samplingConnectionLimits});
}
