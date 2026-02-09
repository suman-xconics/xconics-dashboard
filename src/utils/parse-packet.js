export const parseNormalPacket = (rawPacket) => {
  const p = rawPacket.split("|");

  return {
    packet_type: p[0],      // index 0
    imei: p[1],             // index 1
    main_power: p[3] === "1" ? true : false, // index 3
    latitude: parseFloat(p[5]),  // index 5
    longitude: parseFloat(p[6]), // index 6
    packet: rawPacket,
  };
};