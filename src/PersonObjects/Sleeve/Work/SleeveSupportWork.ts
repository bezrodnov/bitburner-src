import { Player } from "@player";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../../../utils/JSONReviver";
import { Work, WorkType } from "./Work";

export const isSleeveSupportWork = (w: Work | null): w is SleeveSupportWork =>
  w !== null && w.type === WorkType.SUPPORT;

export class SleeveSupportWork extends Work {
  type: WorkType.SUPPORT = WorkType.SUPPORT;
  constructor() {
    super();
    Player.bladeburner?.sleeveSupport(true);
  }

  process() {
    return;
  }

  finish(): void {
    Player.bladeburner?.sleeveSupport(false);
  }

  APICopy() {
    return { type: WorkType.SUPPORT as "SUPPORT" };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("SleeveSupportWork", this);
  }

  /** Initializes a BladeburnerWork object from a JSON save state. */
  static fromJSON(value: IReviverValue): SleeveSupportWork {
    return Generic_fromJSON(SleeveSupportWork, value.data);
  }
}

constructorsForReviver.SleeveSupportWork = SleeveSupportWork;
