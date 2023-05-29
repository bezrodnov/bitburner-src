/**
 * This is a central class for storing and managing the player's hashes,
 * which are generated by Hacknet Servers
 *
 * It is also used to keep track of what upgrades the player has bought with
 * his hashes, and contains method for grabbing the data/multipliers from
 * those upgrades
 */
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { HashUpgrade } from "./HashUpgrade";
import { HashUpgrades } from "./HashUpgrades";

export class HashManager {
  // Max number of hashes this can hold. Equal to the sum of capacities of
  // all Hacknet Servers
  capacity = 0;

  // Number of hashes currently in storage
  hashes = 0;

  // Map of Hash Upgrade Name -> levels in that upgrade
  upgrades: Record<string, number> = {};

  constructor() {
    for (const name of Object.keys(HashUpgrades)) {
      this.upgrades[name] = 0;
    }
  }

  /** Generic helper function for getting a multiplier from a HashUpgrade */
  getMult(upgName: string): number {
    const upg = HashUpgrades[upgName];
    const currLevel = this.upgrades[upgName];
    if (upg == null || currLevel == null) {
      console.error(`Could not find Hash Study upgrade`);
      return 1;
    }

    return 1 + (upg.value * currLevel) / 100;
  }

  /** One of the Hash upgrades improves studying. This returns that multiplier */
  getStudyMult(): number {
    const upgName = "Improve Studying";

    return this.getMult(upgName);
  }

  /** One of the Hash upgrades improves gym training. This returns that multiplier */
  getTrainingMult(): number {
    const upgName = "Improve Gym Training";

    return this.getMult(upgName);
  }

  getUpgrade(upgName: string): HashUpgrade | null {
    const upg = HashUpgrades[upgName];
    if (!upg) {
      console.error(`Invalid Upgrade Name given to HashManager.getUpgrade(): ${upgName}`);
      return null;
    }
    return upg;
  }

  /** Get the cost (in hashes) of an upgrade */
  getUpgradeCost(upgName: string, count = 1): number {
    const upg = this.getUpgrade(upgName);
    const currLevel = this.upgrades[upgName];
    if (upg == null || currLevel == null) {
      console.error(`Invalid Upgrade Name given to HashManager.getUpgradeCost(): ${upgName}`);
      return Infinity;
    }

    return upg.getCost(currLevel, count);
  }

  prestige(): void {
    for (const name of Object.keys(HashUpgrades)) {
      this.upgrades[name] = 0;
    }
    this.hashes = 0;

    // When prestiging, player's hacknet nodes are always reset. So capacity = 0
    this.updateCapacity(0);
  }

  /** Reverts an upgrade and refunds the hashes used to buy it */
  refundUpgrade(upgName: string, count = 1): void {
    const upg = HashUpgrades[upgName];

    // Reduce the level first, so we get the right cost
    this.upgrades[upgName] -= count;

    const currLevel = this.upgrades[upgName];
    if (upg == null || currLevel == null || currLevel < 0) {
      console.error(`Invalid Upgrade Name given to HashManager.upgrade(): ${upgName}`);
      return;
    }

    const cost = upg.getCost(currLevel, count);
    this.hashes += cost;
  }

  /**
   * Stores the given hashes, capping at capacity
   * @param numHashes The number of hashes to increment
   * @returns The number of wasted hashes (over capacity)
   */
  storeHashes(numHashes: number): number {
    this.hashes += numHashes;
    let wastedHashes = this.hashes;
    this.hashes = Math.min(this.hashes, this.capacity);
    wastedHashes -= this.hashes;
    return wastedHashes;
  }

  updateCapacity(newCap: number): void {
    if (newCap < 0) {
      this.capacity = 0;
    }
    this.capacity = Math.max(newCap, 0);
  }

  /**
   * Returns boolean indicating whether or not the upgrade was successfully purchased
   * Note that this does NOT actually implement the effect
   */
  upgrade(upgName: string, count = 1): boolean {
    const upg = HashUpgrades[upgName];
    if (upg == null) {
      console.error(`Invalid Upgrade Name given to HashManager.upgrade(): ${upgName}`);
      return false;
    }

    const cost = this.getUpgradeCost(upgName, count);

    if (this.hashes < cost) {
      return false;
    }

    this.hashes -= cost;
    this.upgrades[upgName] += count;

    return true;
  }

  //Serialize the current object to a JSON save state.
  toJSON(): IReviverValue {
    return Generic_toJSON("HashManager", this);
  }

  // Initializes a HashManager object from a JSON save state.
  static fromJSON(value: IReviverValue): HashManager {
    return Generic_fromJSON(HashManager, value.data);
  }
}

constructorsForReviver.HashManager = HashManager;
