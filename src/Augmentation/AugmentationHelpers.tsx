import { Player } from "@player";

import { CONSTANTS } from "../Constants";
import { Factions, factionExists } from "../Faction/Factions";
import { FactionNames } from "../Faction/data/FactionNames";
import { mergeMultipliers } from "../PersonObjects/Multipliers";
import { prestigeAugmentation } from "../Prestige";
import { Router } from "../ui/GameRoot";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Page } from "../ui/Router";
import { Augmentation } from "./Augmentation";
import { PlayerOwnedAugmentation } from "./PlayerOwnedAugmentation";
import { StaticAugmentations } from "./StaticAugmentations";
import {
  initBladeburnerAugmentations,
  initChurchOfTheMachineGodAugmentations,
  initGeneralAugmentations,
  initNeuroFluxGovernor,
  initSoAAugmentations,
  initUnstableCircadianModulator,
} from "./data/AugmentationCreator";
import { AugmentationNames } from "./data/AugmentationNames";

export function AddToStaticAugmentations(aug: Augmentation): void {
  const name = aug.name;
  StaticAugmentations[name] = aug;
}

function createAugmentations(): void {
  [
    initNeuroFluxGovernor(),
    initUnstableCircadianModulator(),
    ...initGeneralAugmentations(),
    ...initSoAAugmentations(),
    ...(factionExists(FactionNames.Bladeburners) ? initBladeburnerAugmentations() : []),
    ...(factionExists(FactionNames.ChurchOfTheMachineGod) ? initChurchOfTheMachineGodAugmentations() : []),
  ].map(resetAugmentation);
}

function resetFactionAugmentations(): void {
  for (const faction of Object.values(Factions)) faction.augmentations = [];
}

function initAugmentations(): void {
  resetFactionAugmentations();
  for (const augName of Object.getOwnPropertyNames(StaticAugmentations)) delete StaticAugmentations[augName];
  createAugmentations();
  Player.reapplyAllAugmentations();
}

export function getBaseAugmentationPriceMultiplier(): number {
  return CONSTANTS.MultipleAugMultiplier * [1, 0.96, 0.94, 0.93][Player.sourceFileLvl(11)];
}
export function getGenericAugmentationPriceMultiplier(): number {
  return Math.pow(getBaseAugmentationPriceMultiplier(), Player.queuedAugmentations.length);
}

//Resets an Augmentation during (re-initialization)
function resetAugmentation(aug: Augmentation): void {
  aug.addToFactions(aug.factions);
  const name = aug.name;
  if (augmentationExists(name)) {
    delete StaticAugmentations[name];
  }
  AddToStaticAugmentations(aug);
}

function applyAugmentation(aug: PlayerOwnedAugmentation, reapply = false): void {
  const staticAugmentation = StaticAugmentations[aug.name];

  // Apply multipliers
  Player.mults = mergeMultipliers(Player.mults, staticAugmentation.mults);

  // Special logic for Congruity Implant
  if (aug.name === AugmentationNames.CongruityImplant && !reapply) {
    Player.entropy = 0;
    Player.applyEntropy(Player.entropy);
  }

  // Special logic for NeuroFlux Governor
  const ownedNfg = Player.augmentations.find((pAug) => pAug.name === AugmentationNames.NeuroFluxGovernor);
  if (aug.name === AugmentationNames.NeuroFluxGovernor && !reapply && ownedNfg) {
    ownedNfg.level = aug.level;
    return;
  }

  // Push onto Player's Augmentation list
  if (!reapply) {
    const ownedAug = new PlayerOwnedAugmentation(aug.name);

    Player.augmentations.push(ownedAug);
  }
}

function installAugmentations(force?: boolean): boolean {
  if (Player.queuedAugmentations.length == 0 && !force) {
    dialogBoxCreate("You have not purchased any Augmentations to install!");
    return false;
  }
  let augmentationList = "";
  let nfgIndex = -1;
  for (let i = Player.queuedAugmentations.length - 1; i >= 0; i--) {
    if (Player.queuedAugmentations[i].name === AugmentationNames.NeuroFluxGovernor) {
      nfgIndex = i;
      break;
    }
  }
  for (let i = 0; i < Player.queuedAugmentations.length; ++i) {
    const ownedAug = Player.queuedAugmentations[i];
    const aug = StaticAugmentations[ownedAug.name];
    if (aug == null) {
      console.error(`Invalid augmentation: ${ownedAug.name}`);
      continue;
    }

    applyAugmentation(Player.queuedAugmentations[i]);
    if (ownedAug.name === AugmentationNames.NeuroFluxGovernor && i !== nfgIndex) continue;

    let level = "";
    if (ownedAug.name === AugmentationNames.NeuroFluxGovernor) {
      level = ` - ${ownedAug.level}`;
    }
    augmentationList += aug.name + level + "\n";
  }
  Player.queuedAugmentations = [];
  if (!force) {
    dialogBoxCreate(
      "You slowly drift to sleep as scientists put you under in order " +
        "to install the following Augmentations:\n" +
        augmentationList +
        "\nYou wake up in your home...you feel different...",
    );
  }
  prestigeAugmentation();
  Router.toPage(Page.Terminal);
  return true;
}

function augmentationExists(name: string): boolean {
  return Object.hasOwn(StaticAugmentations, name);
}

export function isRepeatableAug(aug: Augmentation | string): boolean {
  const augName = typeof aug === "string" ? aug : aug.name;
  return augName === AugmentationNames.NeuroFluxGovernor;
}

export { installAugmentations, initAugmentations, applyAugmentation, augmentationExists };
