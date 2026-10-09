// Archived 2026-10-08: the Internal layer's air-flow arrows as they were (dist/vehicle-research.mjs at
// commit c6a7f07). One closed loop, 26 identical orange cones at a fixed speed. See README.md.

  // Circulation loop (ICES-2023 p2-p3): MMRTG -> fan -> under-floor duct forward -> into the body
  // below the nose -> aft through the bay -> back into the MMRTG. Arrows move along it.
  const airPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.05, 1.6), new THREE.Vector3(0, -0.1, 1.24), new THREE.Vector3(0, -0.3, 1.1),
    new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0, -0.3, -1.3), new THREE.Vector3(0, -0.18, -1.47),
    new THREE.Vector3(0, -0.02, -1.25), new THREE.Vector3(0.05, -0.02, -0.5), new THREE.Vector3(0.05, 0.04, 0.3),
    new THREE.Vector3(0, 0.045, 0.95), new THREE.Vector3(0, 0.08, 1.3),
  ], true, "catmullrom", 0.2);
  subsystem("airflow", "warm-duct");
  subsystems.airflow.userData.layer = "interior";
  const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffa64d });
  const airArrows = Array.from({ length: 26 }, () => mesh(new THREE.ConeGeometry(0.03, 0.08, 8), arrowMaterial, [0, 0, 0]));
  const arrowTangent = new THREE.Vector3();
  function poseAirflow(time) {
    airArrows.forEach((arrow, index) => {
      const u = (index / airArrows.length + time * 0.05) % 1;
      airPath.getPointAt(u, arrow.position);
      airPath.getTangentAt(u, arrowTangent);
      arrow.quaternion.setFromUnitVectors(upAxis, arrowTangent);
    });
  }
