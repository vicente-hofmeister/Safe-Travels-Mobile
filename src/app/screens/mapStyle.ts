import { MapStyleElement } from "react-native-maps";
import { colors } from "../../theme/colors";

export const mapStyle: MapStyleElement[] = [
  // Base background
  { featureType: "all", elementType: "geometry.fill", stylers: [{ color: colors.neutral_2 }] },

  // Land base
  { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: colors.neutral_2 }] },
  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: colors.neutral_2 }] },

  // Buildings (man_made structures)
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: colors.auxiliary_3 }] },

  // Roads
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: colors.neutral_1 }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: colors.neutral_2 }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: colors.neutral_1 }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: colors.neutral_2 }] },

  // Water
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: colors.tertiary_2 }] },

  // POI — mantém apenas parques visíveis, oculta ícones e labels de todos os outros
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: colors.auxiliary_2 }] },
  { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: colors.auxiliary_2 }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.place_of_worship", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.school", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.sports_complex", elementType: "labels", stylers: [{ visibility: "off" }] },

  // Labels
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: colors.neutral_7 }] },
  { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: colors.white }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: colors.tertiary_6 }] },
];
