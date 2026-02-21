import { darkLuxe } from "./dark-luxe";
import { techGradient } from "./tech-gradient";
import { cleanCorporate } from "./clean-corporate";
import { boldStatement } from "./bold-statement";
import { warmMinimal } from "./warm-minimal";
import { SlideTheme } from "../types";

export const themes: Record<string, SlideTheme> = {
  "dark-luxe": darkLuxe,
  "tech-gradient": techGradient,
  "clean-corporate": cleanCorporate,
  "bold-statement": boldStatement,
  "warm-minimal": warmMinimal,
};

export function getTheme(name: string): SlideTheme {
  return themes[name] || darkLuxe;
}

export { darkLuxe, techGradient, cleanCorporate, boldStatement, warmMinimal };
