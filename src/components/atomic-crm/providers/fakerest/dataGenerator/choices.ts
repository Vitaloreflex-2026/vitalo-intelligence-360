import type { Choice } from "../../../types";
import type { Db } from "./types";

/** Seeded option lists, mirroring supabase/migrations (`choices` table). */
export const choiceLabels: Record<string, string[]> = {
  company_sector: [
    "Services de communication",
    "Consommation discrétionnaire",
    "Consommation de base",
    "Énergie",
    "Finance",
    "Santé",
    "Industrie",
    "Technologies de l'information",
    "Matériaux",
    "Immobilier",
    "Services aux collectivités",
  ],
  deal_origin: [
    "Préventica",
    "Solutions CSE",
    "Site internet",
    "Prospection",
    "Linkedin",
    "Recommandation",
    "Partenaire",
  ],
  deal_objective: [
    "Sensibiliser",
    "Former",
    "Structurer une démarche",
    "Réduire les RPS",
    "Accompagner les managers",
    "Répondre à une obligation",
  ],
  rdv_mode: ["Présentiel", "Visioconférence", "Téléphone", "Salon"],
  user_document_type: [
    "Certificat d'immatriculation de - de 3 mois",
    "CV professionnel",
    "Attestation URSSAF (à jour des cotisations)",
    "Attestation d'assurance en cours de validité",
    "CNI recto/verso",
    "IBAN professionnel",
  ],
  rdv_type: [
    "Premier contact",
    "Rendez-vous découverte",
    "Rendez-vous de suivi",
    "Restitution",
    "Bilan annuel",
    "Préparation d'une proposition",
    "Lancement de mission",
  ],
};

/**
 * Document types whose paper expires one year after it was filed. None of the
 * papers expected from a network member does: each is replaced on demand rather
 * than on a yearly timer. The list stays here because an administrator can flag
 * a type as renewable from the settings page.
 */
const RENEWABLE_DOCUMENT_LABELS: string[] = [];

export const generateChoices = (_?: Db): Choice[] => {
  let id = 0;
  return Object.entries(choiceLabels).flatMap(([category, labels]) =>
    labels.map((label) => ({
      id: id++,
      category,
      label,
      requires_renewal: RENEWABLE_DOCUMENT_LABELS.includes(label),
    })),
  );
};
