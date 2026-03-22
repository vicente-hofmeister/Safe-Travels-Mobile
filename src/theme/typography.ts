import { colors } from "./colors";

export const typography = {
  title: {
    fontSize: 60,
    fontFamily: "Montserrat",
    fontWeight: "bold" as const,
    color: colors.primary_7,
    lineHeight: 50,
  },
  body: {
    fontSize: 16,
    fontFamily: "Montserrat",
    color: colors.primary_7,
  },
  caption: {
    fontSize: 12,
    fontFamily: "Montserrat",
    color: "#777",
  },
};
